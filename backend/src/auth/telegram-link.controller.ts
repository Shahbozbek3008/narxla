import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import { type TelegramAuth, telegramAuthSchema } from './auth.schemas.js';
import { AuthService } from './auth.service.js';
import { Authenticated, CurrentUser } from './session.guard.js';
import type { AuthUser } from './sessions.service.js';

const MINUTE_MS = 60_000;

@ApiTags('me')
@Authenticated()
@Controller('me/telegram')
export class TelegramLinkController {
  constructor(private readonly auth: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: MINUTE_MS } })
  @ApiZodBody(telegramAuthSchema)
  @ApiOkResponse({ description: 'Links a Telegram account and returns the updated profile' })
  @ApiConflictResponse({ description: 'The Telegram account already belongs to another profile' })
  link(@CurrentUser() user: AuthUser, @Body({ schema: telegramAuthSchema }) body: TelegramAuth) {
    return this.auth.linkTelegram(user.id, body);
  }

  @Delete()
  @ApiOkResponse({ description: 'Unlinks Telegram and returns the updated profile' })
  @ApiConflictResponse({ description: 'Telegram is the only sign-in method of this account' })
  unlink(@CurrentUser() user: AuthUser) {
    return this.auth.unlinkTelegram(user.id);
  }
}
