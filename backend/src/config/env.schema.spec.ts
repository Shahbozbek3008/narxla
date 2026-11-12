import { validateEnv } from './env.schema.js';

const BASE = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  ADMIN_API_KEY: 'a'.repeat(32),
  AUTH_SECRET: 'b'.repeat(32),
  SCRAPER_USER_AGENT: 'SmetachiBot/1.0',
};

describe('validateEnv', () => {
  it('accepts a fixed OTP code outside production', () => {
    expect(validateEnv({ ...BASE, NODE_ENV: 'development', OTP_FIXED_CODE: '123456' }).OTP_FIXED_CODE).toBe('123456');
  });

  it('treats an empty fixed OTP code as unset', () => {
    expect(validateEnv({ ...BASE, OTP_FIXED_CODE: '' }).OTP_FIXED_CODE).toBeUndefined();
  });

  it('rejects malformed fixed OTP codes', () => {
    expect(() => validateEnv({ ...BASE, OTP_FIXED_CODE: '12ab' })).toThrow(/OTP_FIXED_CODE/);
  });

  it('refuses a fixed OTP code in production', () => {
    expect(() => validateEnv({ ...BASE, NODE_ENV: 'production', OTP_FIXED_CODE: '123456' })).toThrow(/must not be set in production/);
  });
});
