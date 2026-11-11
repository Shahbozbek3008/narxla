import { ConflictException, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../config/app-config.service.js';
import { ScraperService } from './scraper.service.js';

const JOB_NAME = 'price-scraper';

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
