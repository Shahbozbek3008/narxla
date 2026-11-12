import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiAcceptedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import { AppConfigService } from '../config/app-config.service.js';
import {
  type RequestOtp,
  requestOtpSchema,
  type TelegramAuth,
  telegramAuthSchema,
  type VerifyOtp,
  verifyOtpSchema,
} from './auth.schemas.js';
import { AuthService } from './auth.service.js';
import { clearSessionCookie, setSessionCookie } from './session-cookie.js';
import { sessionTokenOf } from './session.guard.js';
import { type SessionMeta, SessionsService } from './sessions.service.js';

const MINUTE_MS = 60_000;

const metaOf = (request: Request): SessionMeta => ({ userAgent: request.get('user-agent'), ip: request.ip });

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionsService,
    private readonly config: AppConfigService,
  ) {}

  @Post('otp')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: MINUTE_MS } })
  @ApiZodBody(requestOtpSchema)
  @ApiAcceptedResponse({ description: 'A one-time code was sent by SMS' })
  @ApiTooManyRequestsResponse({ description: 'Resend cooldown or hourly limit reached' })
  requestCode(@Body({ schema: requestOtpSchema }) { phone }: RequestOtp) {
    return this.auth.requestCode(phone);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: MINUTE_MS } })
  @ApiZodBody(verifyOtpSchema)
  @ApiOkResponse({ description: 'Signs in, sets the session cookie and returns the profile' })
  async verifyCode(
    @Body({ schema: verifyOtpSchema }) body: VerifyOtp,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, profile } = await this.auth.signInWithCode(body, metaOf(request));
    setSessionCookie(response, token, this.config.auth.sessionTtlDays, this.config.isProduction);
    return profile;
  }

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: MINUTE_MS } })
  @ApiZodBody(telegramAuthSchema)
  @ApiOkResponse({ description: 'Signs in with a Telegram Login Widget payload' })
  async telegram(
    @Body({ schema: telegramAuthSchema }) body: TelegramAuth,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, profile } = await this.auth.signInWithTelegram(body, metaOf(request));
    setSessionCookie(response, token, this.config.auth.sessionTtlDays, this.config.isProduction);
    return profile;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Ends the current session' })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = sessionTokenOf(request);
    const session = token ? await this.sessions.resolve(token) : null;
    if (session) await this.auth.signOut(session.sessionId);
    clearSessionCookie(response, this.config.isProduction);
  }
}
