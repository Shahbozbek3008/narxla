import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { setTimeout as sleep } from 'node:timers/promises';
import { hostOf, sameHost } from '../common/url.js';
import { AppConfigService } from '../config/app-config.service.js';
import type { ObservationStatus, ScrapeOutcome } from '../generated/prisma/client.js';
import { PricesService } from '../prices/prices.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { extractPrice } from './domain/extract-price.js';
import { decideObservation, unitPriceOf } from './domain/observation-policy.js';
import { HttpFetcher } from './http-fetcher.service.js';
import { JobLockService } from './job-lock.service.js';
import { RobotsService } from './robots.service.js';

export type ListingResult =
  | { outcome: 'OK'; status: ObservationStatus; price: number; unitPrice: number; reason: string | null }
  | { outcome: Exclude<ScrapeOutcome, 'OK'>; error: string };

type RunTally = { total: number; accepted: number; flagged: number; failed: number; blocked: number };

type ScrapeTarget = {
  id: string;
  url: string;
  packSize: { toNumber(): number };
  materialId: string;
  store: { priceSelector: string | null };
};

const LOCK_NAME = 'price-scraper';
const LOCK_LEASE_MS = 2 * 60 * 1000;
const LOCK_HEARTBEAT_MS = 30 * 1000;
const STORE_CONCURRENCY = 3;
const MAX_CONSECUTIVE_FAILURES = 5;

async function forEachLimited<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) await task(item);
  });
  await Promise.all(workers);
}

@Injectable()
export class ScraperService implements OnApplicationShutdown {
  private readonly logger = new Logger(ScraperService.name);
  private running: Promise<void> | null = null;
  private stopping = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fetcher: HttpFetcher,
    private readonly robots: RobotsService,
    private readonly locks: JobLockService,
    private readonly prices: PricesService,
    private readonly config: AppConfigService,
  ) {}

  async start() {
    if (!(await this.locks.acquire(LOCK_NAME, LOCK_LEASE_MS))) throw new ConflictException('A scrape run is already in progress');

    const abandoned = await this.prisma.scrapeRun.updateMany({ where: { finishedAt: null }, data: { finishedAt: new Date() } });
    if (abandoned.count > 0) this.logger.warn(`Closed ${abandoned.count} abandoned scrape run(s)`);

    const run = await this.prisma.scrapeRun.create({ data: {} });
    this.running = this.execute(run.id)
      .catch((error: unknown) =>
        this.logger.error(`Scrape run ${run.id} crashed: ${error instanceof Error ? error.stack : String(error)}`),
      )
      .finally(() => {
        this.running = null;
      });
    return run;
  }

  async onApplicationShutdown() {
    this.stopping = true;
    await this.running;
  }

  private async execute(runId: string) {
    const tally: RunTally = { total: 0, accepted: 0, flagged: 0, failed: 0, blocked: 0 };
    const heartbeat = setInterval(() => {
      this.locks.renew(LOCK_NAME, LOCK_LEASE_MS).catch((error: unknown) =>
        this.logger.warn(`Could not renew the scraper lock: ${error instanceof Error ? error.message : String(error)}`),
      );
    }, LOCK_HEARTBEAT_MS);
    try {
      const stores = await this.prisma.store.findMany({
        where: { active: true },
        include: { listings: { where: { active: true }, include: { store: { select: { priceSelector: true } } } } },
      });

      await forEachLimited(stores, STORE_CONCURRENCY, async (store) => {
        for (const listing of store.listings) {
          if (this.stopping) return;
          const result = await this.scrapeListing(listing);
          this.count(tally, result);
          await sleep(Math.max(store.crawlDelayMs, this.config.scraper.defaultDelayMs, result.crawlDelayMs));
        }
      });

      this.logger.log(`Scrape run ${runId} ${this.stopping ? 'stopped early' : 'finished'}: ${JSON.stringify(tally)}`);
    } finally {
      clearInterval(heartbeat);
      await this.prisma.scrapeRun.update({ where: { id: runId }, data: { ...tally, finishedAt: new Date() } });
      this.prices.invalidate();
      await this.locks.release(LOCK_NAME);
    }
  }

  async checkListing(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { store: { select: { priceSelector: true } } },
    });
    if (!listing) throw new NotFoundException(`Listing ${listingId} not found`);

    const result = await this.scrapeListing(listing);
    this.prices.invalidate();
    return result;
  }

  async preview(storeCode: string, url: string) {
    const store = await this.prisma.store.findUniqueOrThrow({ where: { code: storeCode }, select: { baseUrl: true, priceSelector: true } });
    if (!sameHost(url, store.baseUrl)) throw new BadRequestException(`URL must belong to ${hostOf(store.baseUrl)}`);

    const verdict = await this.robots.check(url);
    if (!verdict.allowed) return { outcome: 'BLOCKED' as const, error: 'Disallowed by robots.txt' };

    try {
      const { body } = await this.fetcher.fetchText(url);
      const extracted = extractPrice(body, store.priceSelector);
      if (!extracted) return { outcome: 'FAILED' as const, error: 'No price found on the page' };
      return { outcome: 'OK' as const, ...extracted };
    } catch (error) {
      return { outcome: 'FAILED' as const, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async lastRunStartedAt() {
    const run = await this.prisma.scrapeRun.findFirst({ orderBy: { startedAt: 'desc' }, select: { startedAt: true } });
    return run?.startedAt ?? null;
  }

  listRuns(take = 20) {
    return this.prisma.scrapeRun.findMany({ orderBy: { startedAt: 'desc' }, take });
  }

  private async scrapeListing(listing: ScrapeTarget): Promise<ListingResult & { crawlDelayMs: number }> {
    const verdict = await this.robots.check(listing.url);
    if (!verdict.allowed) {
      const result = { outcome: 'BLOCKED' as const, error: 'Disallowed by robots.txt' };
      await this.recordFailure(listing.id, result.outcome, result.error);
      return { ...result, crawlDelayMs: verdict.crawlDelayMs };
    }

    try {
      const { body } = await this.fetcher.fetchText(listing.url);
      const extracted = extractPrice(body, listing.store.priceSelector);
      if (!extracted) throw new Error('No price found on the page');

      const unitPrice = unitPriceOf(extracted.price, listing.packSize.toNumber());
      const baseline = await this.prices.baselineFor(listing.id, listing.materialId);
      const decision = decideObservation({ unitPrice, baseline, threshold: this.config.pricing.reviewThreshold });

      await this.prisma.$transaction([
        this.prisma.priceObservation.create({
          data: {
            listingId: listing.id,
            price: extracted.price,
            unitPrice,
            status: decision.status,
            source: 'SCRAPER',
            reason: decision.reason ?? `Extracted via ${extracted.strategy}`,
          },
        }),
        this.prisma.listing.update({
          where: { id: listing.id },
          data: { lastCheckedAt: new Date(), lastOutcome: 'OK', lastError: null, failureCount: 0 },
        }),
      ]);

      return {
        outcome: 'OK',
        status: decision.status,
        price: extracted.price,
        unitPrice,
        reason: decision.reason,
        crawlDelayMs: verdict.crawlDelayMs,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.recordFailure(listing.id, 'FAILED', message);
      this.logger.warn(`Listing ${listing.id} failed: ${message}`);
      return { outcome: 'FAILED', error: message, crawlDelayMs: verdict.crawlDelayMs };
    }
  }

  private async recordFailure(listingId: string, outcome: Exclude<ScrapeOutcome, 'OK'>, error: string) {
    const listing = await this.prisma.listing.update({
      where: { id: listingId },
      data: { lastCheckedAt: new Date(), lastOutcome: outcome, lastError: error, failureCount: { increment: 1 } },
      select: { failureCount: true },
    });
    if (listing.failureCount >= MAX_CONSECUTIVE_FAILURES) {
      await this.prisma.listing.update({ where: { id: listingId }, data: { active: false } });
      this.logger.warn(`Listing ${listingId} deactivated after ${listing.failureCount} consecutive failures`);
    }
  }

  private count(tally: RunTally, result: ListingResult) {
    tally.total += 1;
    if (result.outcome !== 'OK') {
      if (result.outcome === 'BLOCKED') tally.blocked += 1;
      else tally.failed += 1;
      return;
    }
    if (result.status === 'ACCEPTED') tally.accepted += 1;
    else tally.flagged += 1;
  }
}
