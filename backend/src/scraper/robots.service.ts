import { Injectable, Logger } from '@nestjs/common';
import { createRequire } from 'node:module';
import { AppConfigService } from '../config/app-config.service.js';
import { FetchError, HttpFetcher } from './http-fetcher.service.js';

type RobotsRules = {
  isAllowed(url: string, userAgent?: string): boolean | undefined;
  getCrawlDelay(userAgent?: string): number | undefined;
};

const robotsParser = createRequire(import.meta.url)('robots-parser') as (url: string, content: string) => RobotsRules;

type CachedRules = { rules: RobotsRules | 'allow-all' | 'deny-all'; expiresAt: number };

export type RobotsVerdict = { allowed: boolean; crawlDelayMs: number };

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class RobotsService {
  private readonly logger = new Logger(RobotsService.name);
  private readonly cache = new Map<string, CachedRules>();
  private readonly agentToken: string;

  constructor(
    private readonly fetcher: HttpFetcher,
    config: AppConfigService,
  ) {
    this.agentToken = config.scraper.userAgent.split('/')[0];
  }

  async check(url: string): Promise<RobotsVerdict> {
    const rules = await this.rulesFor(new URL(url).origin);
    if (rules === 'allow-all') return { allowed: true, crawlDelayMs: 0 };
    if (rules === 'deny-all') return { allowed: false, crawlDelayMs: 0 };
    return {
      allowed: rules.isAllowed(url, this.agentToken) !== false,
      crawlDelayMs: (rules.getCrawlDelay(this.agentToken) ?? 0) * 1000,
    };
  }

  private async rulesFor(origin: string) {
    const cached = this.cache.get(origin);
    if (cached && cached.expiresAt > Date.now()) return cached.rules;

    const rules = await this.load(origin);
    this.cache.set(origin, { rules, expiresAt: Date.now() + CACHE_TTL_MS });
    return rules;
  }

  private async load(origin: string): Promise<CachedRules['rules']> {
    const robotsUrl = `${origin}/robots.txt`;
    try {
      const { body } = await this.fetcher.fetchText(robotsUrl, 'text/plain');
      return robotsParser(robotsUrl, body);
    } catch (error) {
      if (error instanceof FetchError && error.status !== undefined && error.status >= 400 && error.status < 500) return 'allow-all';
      this.logger.warn(`robots.txt unreachable for ${origin}, treating as disallowed: ${String(error)}`);
      return 'deny-all';
    }
  }
}
