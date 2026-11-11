import { Module } from '@nestjs/common';
import { PricesModule } from '../prices/prices.module.js';
import { AdminScraperController } from './admin-scraper.controller.js';
import { HttpFetcher } from './http-fetcher.service.js';
import { JobLockService } from './job-lock.service.js';
import { RobotsService } from './robots.service.js';
import { ScraperScheduler } from './scraper.scheduler.js';
import { ScraperService } from './scraper.service.js';

@Module({
  imports: [PricesModule],
  controllers: [AdminScraperController],
  providers: [HttpFetcher, RobotsService, JobLockService, ScraperService, ScraperScheduler],
})
export class ScraperModule {}
