import { ConflictException, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../config/app-config.service.js';
import { ScraperService } from './scraper.service.js';

const JOB_NAME = 'price-scraper';
const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class ScraperScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(ScraperScheduler.name);

  constructor(
    private readonly scraper: ScraperService,
    private readonly registry: SchedulerRegistry,
    private readonly config: AppConfigService,
  ) {}

  onApplicationBootstrap() {
    const { enabled, cron, timezone } = this.config.scraper;
    if (!enabled) {
      this.logger.log('Price scraper schedule is disabled');
      return;
    }

    const job = CronJob.from({ cronTime: cron, timeZone: timezone, onTick: () => this.trigger(), start: false });
    this.registry.addCronJob(JOB_NAME, job);
    job.start();
    this.logger.log(`Price scraper scheduled with "${cron}" (${timezone})`);
    void this.catchUp();
  }

  private async catchUp() {
    try {
      const lastRun = await this.scraper.lastRunStartedAt();
      if (lastRun && Date.now() - lastRun.getTime() < STALE_AFTER_MS) return;
      this.logger.log(lastRun ? 'Last scrape run is older than a week, starting a catch-up run' : 'No scrape run yet, starting the first one');
      this.trigger();
    } catch (error) {
      this.logger.error(`Catch-up check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  trigger() {
    this.scraper.start().catch((error: unknown) => {
      if (error instanceof ConflictException) {
        this.logger.warn(error.message);
        return;
      }
      this.logger.error(`Scrape run failed: ${error instanceof Error ? error.stack : String(error)}`);
    });
  }
}
