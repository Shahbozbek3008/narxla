import { type INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { SmsSender } from '../src/auth/sms/sms-sender.js';
import { PrismaExceptionFilter } from '../src/common/prisma-exception.filter.js';

export class CapturingSmsSender extends SmsSender {
  readonly messages: { phone: string; text: string }[] = [];

  send(phone: string, text: string) {
    this.messages.push({ phone, text });
    return Promise.resolve();
  }

  lastCodeFor(phone: string) {
    const message = this.messages.findLast((item) => item.phone === phone);
    return message?.text.match(/\d{6}/)?.[0] ?? '';
  }
}

const unlimitedThrottlerStorage: ThrottlerStorage = {
  increment: () => Promise.resolve({ totalHits: 1, timeToExpire: 0, isBlocked: false, timeToBlockExpire: 0 }),
};

export async function createTestApp() {
  process.env.SCRAPER_ENABLED = 'false';
  const sms = new CapturingSmsSender();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(SmsSender)
    .useValue(sms)
    .overrideProvider(ThrottlerStorage)
    .useValue(unlimitedThrottlerStorage)
    .compile();

  const app: INestApplication<App> = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.init();
  return { app, sms };
}
