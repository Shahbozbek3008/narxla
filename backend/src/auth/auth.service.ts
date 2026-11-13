import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiError } from '../common/api-error.js';
import { AppConfigService } from '../config/app-config.service.js';
import { type LinkableIdentity, UsersService } from '../users/users.service.js';
import { maskPhone } from './domain/phone.js';
import { telegramDisplayName, verifyTelegramAuth } from './domain/telegram.js';
import type { GoogleAuth, TelegramAuth, VerifyOtp } from './auth.schemas.js';
import { GoogleVerifier } from './google-verifier.js';
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
    private readonly google: GoogleVerifier,
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

  async signInWithGoogle({ credential }: GoogleAuth, meta: SessionMeta) {
    const identity = await this.google.verify(credential);
    const user = await this.users.upsertByGoogle(identity.sub, identity.email, identity.name);
    return this.startSession(user.id, meta);
  }

  linkTelegram(userId: string, payload: TelegramAuth, merge: boolean) {
    this.assertTelegram(payload);
    return this.users.attachIdentity(userId, { kind: 'telegram', telegramId: BigInt(payload.id) }, merge);
  }

  async linkGoogle(userId: string, credential: string, merge: boolean) {
    const identity = await this.google.verify(credential);
    return this.users.attachIdentity(userId, { kind: 'google', googleId: identity.sub, email: identity.email }, merge);
  }

  async linkPhone(userId: string, { phone, code }: VerifyOtp, merge: boolean) {
    const owner = await this.users.ownerOf({ kind: 'phone', phone }, userId);
    if (owner && !merge) {
      throw new ApiError(HttpStatus.CONFLICT, 'ACCOUNT_EXISTS', 'This sign-in method belongs to another account', {
        method: 'phone',
        estimates: owner.estimates,
      });
    }
    await this.otp.verify(phone, code);
    return this.users.attachIdentity(userId, { kind: 'phone', phone }, true);
  }

  unlink(userId: string, kind: LinkableIdentity['kind']) {
    return this.users.detachIdentity(userId, kind);
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
