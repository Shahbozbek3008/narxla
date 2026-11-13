import { isApiError } from '@/lib/api/client';

export type LoginErrorKey = 'cooldown' | 'hourlyLimit' | 'invalidCode' | 'expired' | 'locked' | 'telegram' | 'google' | 'network';

export type LoginError = { key: LoginErrorKey; values: Record<string, number> };

const BY_CODE: Record<string, LoginErrorKey> = {
  OTP_COOLDOWN: 'cooldown',
  OTP_HOURLY_LIMIT: 'hourlyLimit',
  OTP_INVALID: 'invalidCode',
  OTP_EXPIRED: 'expired',
  OTP_LOCKED: 'locked',
  TELEGRAM_INVALID: 'telegram',
  TELEGRAM_DISABLED: 'telegram',
  GOOGLE_INVALID: 'google',
  GOOGLE_DISABLED: 'google',
  GOOGLE_UNAVAILABLE: 'google',
};

const numberOf = (value: unknown) => (typeof value === 'number' ? value : 0);

export function loginErrorOf(error: unknown): LoginError {
  if (!isApiError(error) || !error.code || !BY_CODE[error.code]) return { key: 'network', values: {} };
  return {
    key: BY_CODE[error.code],
    values: { seconds: numberOf(error.details.retryAfter), attempts: numberOf(error.details.attemptsLeft) },
  };
}
