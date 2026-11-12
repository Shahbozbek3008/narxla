import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env.schema.js';

export type ScraperConfig = {
  enabled: boolean;
  cron: string;
  timezone: string;
  userAgent: string;
  requestTimeoutMs: number;
  defaultDelayMs: number;
};

export type AuthConfig = {
  secret: string;
  sessionTtlDays: number;
  otpTtlSeconds: number;
  otpResendSeconds: number;
  otpMaxAttempts: number;
  otpHourlyLimit: number;
  smsDriver: Env['SMS_DRIVER'];
  fixedOtpCode: string | undefined;
  telegramBotToken: string | undefined;
};

export type PricingConfig = {
  freshDays: number;
  minSources: number;
  reviewThreshold: number;
};

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  private get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }

  get isProduction() {
    return this.get('NODE_ENV') === 'production';
  }

  get port() {
    return this.get('PORT');
  }

  get databaseUrl() {
    return this.get('DATABASE_URL');
  }

  get corsOrigins() {
    return this.get('CORS_ORIGINS');
  }

  get adminApiKey() {
    return this.get('ADMIN_API_KEY');
  }

  get auth(): AuthConfig {
    return {
      secret: this.get('AUTH_SECRET'),
      sessionTtlDays: this.get('SESSION_TTL_DAYS'),
      otpTtlSeconds: this.get('OTP_TTL_SECONDS'),
      otpResendSeconds: this.get('OTP_RESEND_SECONDS'),
      otpMaxAttempts: this.get('OTP_MAX_ATTEMPTS'),
      otpHourlyLimit: this.get('OTP_HOURLY_LIMIT'),
      smsDriver: this.get('SMS_DRIVER'),
      fixedOtpCode: this.get('OTP_FIXED_CODE'),
      telegramBotToken: this.get('TELEGRAM_BOT_TOKEN'),
    };
  }

  get scraper(): ScraperConfig {
    return {
      enabled: this.get('SCRAPER_ENABLED'),
      cron: this.get('SCRAPER_CRON'),
      timezone: this.get('SCRAPER_TIMEZONE'),
      userAgent: this.get('SCRAPER_USER_AGENT'),
      requestTimeoutMs: this.get('SCRAPER_REQUEST_TIMEOUT_MS'),
      defaultDelayMs: this.get('SCRAPER_DEFAULT_DELAY_MS'),
    };
  }

  get pricing(): PricingConfig {
    return {
      freshDays: this.get('PRICE_FRESH_DAYS'),
      minSources: this.get('PRICE_MIN_SOURCES'),
      reviewThreshold: this.get('PRICE_REVIEW_THRESHOLD'),
    };
  }
}
