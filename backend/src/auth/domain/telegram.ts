import { createHash, createHmac } from 'node:crypto';
import { safeEqualHex } from './secrets.js';

export type TelegramAuthPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export const TELEGRAM_AUTH_MAX_AGE_SECONDS = 24 * 60 * 60;

export function verifyTelegramAuth(payload: TelegramAuthPayload, botToken: string, nowSeconds: number) {
  const { hash, ...fields } = payload;
  const dataCheckString = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${String(value)}`)
    .sort()
    .join('\n');
  const secret = createHash('sha256').update(botToken).digest();
  const expected = createHmac('sha256', secret).update(dataCheckString).digest('hex');

  const fresh = nowSeconds - payload.auth_date <= TELEGRAM_AUTH_MAX_AGE_SECONDS && payload.auth_date <= nowSeconds + 60;
  return fresh && /^[a-f0-9]{64}$/.test(hash) && safeEqualHex(hash, expected);
}

export const telegramDisplayName = ({ first_name, last_name, username }: TelegramAuthPayload) =>
  [first_name, last_name].filter(Boolean).join(' ').trim() || username || '';
