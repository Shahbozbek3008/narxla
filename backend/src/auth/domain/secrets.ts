import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export const OTP_LENGTH = 6;

const SESSION_TOKEN_BYTES = 32;

export const generateOtp = () => String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');

export const hashOtp = (secret: string, phone: string, code: string) =>
  createHmac('sha256', secret).update(`${phone}:${code}`).digest('hex');

export const generateSessionToken = () => randomBytes(SESSION_TOKEN_BYTES).toString('base64url');

export const hashSessionToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}
