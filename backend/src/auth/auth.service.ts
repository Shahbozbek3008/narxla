import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiError } from '../common/api-error.js';
import { AppConfigService } from '../config/app-config.service.js';
import { UsersService } from '../users/users.service.js';
import { maskPhone } from './domain/phone.js';
import { telegramDisplayName, verifyTelegramAuth } from './domain/telegram.js';
import type { TelegramAuth, VerifyOtp } from './auth.schemas.js';
import { OtpService } from './otp.service.js';
import { type SessionMeta, SessionsService } from './sessions.service.js';

const SECOND_MS = 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly otp: OtpService,
    private readonly sessions: SessionsService,
    private readonly users: UsersService,
    private readonly config: AppConfigService,
  ) {}

  async requestCode(phone: string) {
    const timing = await this.otp.request(phone);
    return { phone: maskPhone(phone), ...timing };
  }

  async signInWithCode({ phone, code }: VerifyOtp, meta: SessionMeta) {
    await this.otp.verify(phone, code);
    const user = await this.users.upsertByPhone(phone);
    return this.startSession(user.id, meta);
  }

  async signInWithTelegram(payload: TelegramAuth, meta: SessionMeta) {
    this.assertTelegram(payload);
    const user = await this.users.upsertByTelegram(BigInt(payload.id), telegramDisplayName(payload));
    return this.startSession(user.id, meta);
  }

  linkTelegram(userId: string, payload: TelegramAuth) {
    this.assertTelegram(payload);
    return this.users.linkTelegram(userId, BigInt(payload.id));
  }

  unlinkTelegram(userId: string) {
    return this.users.unlinkTelegram(userId);
  }

  signOut(sessionId: string) {
    return this.sessions.revoke(sessionId);
  }

  private assertTelegram(payload: TelegramAuth) {
    const { telegramBotToken } = this.config.auth;
    if (!telegramBotToken) {
      throw new ApiError(HttpStatus.SERVICE_UNAVAILABLE, 'TELEGRAM_DISABLED', 'Telegram sign-in is not configured');
    }
    if (!verifyTelegramAuth(payload, telegramBotToken, Math.floor(Date.now() / SECOND_MS))) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'TELEGRAM_INVALID', 'Telegram sign-in could not be verified');
    }
  }

  private async startSession(userId: string, meta: SessionMeta) {
    const token = await this.sessions.create(userId, meta);
    return { token, profile: await this.users.profile(userId) };
  }
}
