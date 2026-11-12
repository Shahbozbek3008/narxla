import { createHash, createHmac } from 'node:crypto';
import { TELEGRAM_AUTH_MAX_AGE_SECONDS, telegramDisplayName, verifyTelegramAuth, type TelegramAuthPayload } from './telegram.js';

const BOT_TOKEN = '123456:telegram-test-bot-token';
const NOW = 1_800_000_000;

function sign(fields: Omit<TelegramAuthPayload, 'hash'>): TelegramAuthPayload {
  const dataCheckString = Object.entries(fields)
    .map(([key, value]) => `${key}=${String(value)}`)
    .sort()
    .join('\n');
  const secret = createHash('sha256').update(BOT_TOKEN).digest();
  return { ...fields, hash: createHmac('sha256', secret).update(dataCheckString).digest('hex') };
}

describe('verifyTelegramAuth', () => {
  const payload = sign({ id: 42, first_name: 'Dilshod', last_name: 'Rahimov', username: 'dilshod', auth_date: NOW - 60 });

  it('accepts a correctly signed fresh payload', () => {
    expect(verifyTelegramAuth(payload, BOT_TOKEN, NOW)).toBe(true);
  });

  it('rejects tampered fields', () => {
    expect(verifyTelegramAuth({ ...payload, id: 43 }, BOT_TOKEN, NOW)).toBe(false);
  });

  it('rejects a payload signed with another bot token', () => {
    expect(verifyTelegramAuth(payload, '999:another-bot-token-value', NOW)).toBe(false);
  });

  it('rejects stale payloads', () => {
    expect(verifyTelegramAuth(payload, BOT_TOKEN, NOW + TELEGRAM_AUTH_MAX_AGE_SECONDS + 1)).toBe(false);
  });

  it('builds a display name from the available fields', () => {
    expect(telegramDisplayName(payload)).toBe('Dilshod Rahimov');
    expect(telegramDisplayName({ id: 1, username: 'only', auth_date: NOW, hash: '' })).toBe('only');
  });
});
