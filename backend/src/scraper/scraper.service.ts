import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { setTimeout as sleep } from 'node:timers/promises';
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
const LOCK_LEASE_MS = 3 * 60 * 60 * 1000;
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
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

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

    const run = await this.prisma.scrapeRun.create({ data: {} });
    this.execute(run.id).catch((error: unknown) =>
      this.logger.error(`Scrape run ${run.id} crashed: ${error instanceof Error ? error.stack : String(error)}`),
    );
    return run;
  }

  private async execute(runId: string) {
    const tally: RunTally = { total: 0, accepted: 0, flagged: 0, failed: 0, blocked: 0 };
    try {
      const stores = await this.prisma.store.findMany({
        where: { active: true },
        include: { listings: { where: { active: true }, include: { store: { select: { priceSelector: true } } } } },
      });

      await forEachLimited(stores, STORE_CONCURRENCY, async (store) => {
        for (const listing of store.listings) {
          const result = await this.scrapeListing(listing);
          this.count(tally, result);
          await sleep(Math.max(store.crawlDelayMs, this.config.scraper.defaultDelayMs, result.crawlDelayMs));
        }
      });

      this.logger.log(`Scrape run ${runId} finished: ${JSON.stringify(tally)}`);
    } finally {
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
