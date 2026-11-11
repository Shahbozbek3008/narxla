import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { CatalogModule } from './catalog/catalog.module.js';
import { ADMIN_KEY_HEADER } from './common/admin-key.guard.js';
import { AppConfigModule } from './config/app-config.module.js';
import { AppConfigService } from './config/app-config.service.js';
import { HealthModule } from './health/health.module.js';
import { LabourModule } from './labour/labour.module.js';
import { PricesModule } from './prices/prices.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { ReviewModule } from './review/review.module.js';
import { ScraperModule } from './scraper/scraper.module.js';

const REQUESTS_PER_MINUTE = 120;
const MINUTE_MS = 60_000;

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.isProduction ? 'info' : 'debug',
          transport: config.isProduction ? undefined : { target: 'pino-pretty', options: { singleLine: true } },
          redact: [`req.headers["${ADMIN_KEY_HEADER}"]`, 'req.headers.cookie', 'req.headers.authorization'],
          autoLogging: { ignore: (request) => request.url === '/api/health' },
        },
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: MINUTE_MS, limit: REQUESTS_PER_MINUTE }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    PricesModule,
    CatalogModule,
    LabourModule,
    ReviewModule,
    ReportsModule,
    ScraperModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
