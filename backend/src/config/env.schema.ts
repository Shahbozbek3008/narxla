import { z } from 'zod';

const csv = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );

const flag = z
  .enum(['true', 'false'])
  .default('true')
  .transform((value) => value === 'true');

const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  CORS_ORIGINS: csv,
  ADMIN_API_KEY: z.string().min(32),

  AUTH_SECRET: z.string().min(32),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  OTP_RESEND_SECONDS: z.coerce.number().int().positive().default(60),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  OTP_HOURLY_LIMIT: z.coerce.number().int().positive().default(5),
  SMS_DRIVER: z.enum(['log']).default('log'),
  OTP_FIXED_CODE: optional(z.string().regex(/^\d{6}$/, 'Expected a 6-digit code')),
  TELEGRAM_BOT_TOKEN: optional(z.string().min(20)),
  YANDEX_SPEECHKIT_API_KEY: optional(z.string().min(20)),
  YANDEX_FOLDER_ID: optional(z.string().min(5)),
  GOOGLE_CLIENT_ID: optional(z.string().endsWith('.apps.googleusercontent.com')),

  SCRAPER_ENABLED: flag,
  SCRAPER_CRON: z.string().default('0 3 * * 1'),
  SCRAPER_TIMEZONE: z.string().default('Asia/Tashkent'),
  SCRAPER_USER_AGENT: z.string().min(1),
  SCRAPER_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  SCRAPER_DEFAULT_DELAY_MS: z.coerce.number().int().nonnegative().default(3000),

  PRICE_FRESH_DAYS: z.coerce.number().int().positive().default(45),
  PRICE_MIN_SOURCES: z.coerce.number().int().positive().default(3),
  PRICE_REVIEW_THRESHOLD: z.coerce.number().positive().max(1).default(0.3),
}).refine((env) => !(env.NODE_ENV === 'production' && env.OTP_FIXED_CODE), {
  message: 'OTP_FIXED_CODE must not be set in production',
  path: ['OTP_FIXED_CODE'],
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (result.success) return result.data;
  const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}
