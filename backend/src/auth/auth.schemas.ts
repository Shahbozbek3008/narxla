import { z } from 'zod';
import { normalizePhone } from './domain/phone.js';
import { OTP_LENGTH } from './domain/secrets.js';

const phoneSchema = z
  .string()
  .max(32)
  .transform((value, context) => {
    const phone = normalizePhone(value);
    if (!phone) {
      context.addIssue({ code: 'custom', message: 'Expected an Uzbek mobile number' });
      return z.NEVER;
    }
    return phone;
  });

export const requestOtpSchema = z.object({ phone: phoneSchema });

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Expected a ${OTP_LENGTH}-digit code`),
});

export const telegramAuthSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string().max(128).optional(),
  last_name: z.string().max(128).optional(),
  username: z.string().max(64).optional(),
  photo_url: z.url().max(512).optional(),
  auth_date: z.number().int().positive(),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
});

export type RequestOtp = z.infer<typeof requestOtpSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;
export type TelegramAuth = z.infer<typeof telegramAuthSchema>;
