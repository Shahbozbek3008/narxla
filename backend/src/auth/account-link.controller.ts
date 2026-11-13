import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import {
  googleAuthSchema,
  type RequestOtp,
  requestOtpSchema,
  telegramAuthSchema,
  verifyOtpSchema,
} from './auth.schemas.js';
import { AuthService } from './auth.service.js';
import { Authenticated, CurrentUser } from './session.guard.js';
import type { AuthUser } from './sessions.service.js';

const MINUTE_MS = 60_000;

const merge = { merge: z.boolean().default(false) };
const linkTelegramSchema = telegramAuthSchema.extend(merge);
const linkGoogleSchema = googleAuthSchema.extend(merge);
const linkPhoneSchema = verifyOtpSchema.extend(merge);
const methodSchema = z.enum(['phone', 'telegram', 'google']);

type LinkTelegram = z.infer<typeof linkTelegramSchema>;
type LinkGoogle = z.infer<typeof linkGoogleSchema>;
type LinkPhone = z.infer<typeof linkPhoneSchema>;

@ApiTags('me')
@Authenticated()
@Controller('me')
export class AccountLinkController {
  constructor(private readonly auth: AuthService) {}

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: MINUTE_MS } })
  @ApiZodBody(linkTelegramSchema)
  @ApiOkResponse({ description: 'Links a Telegram account, merging the other account when confirmed' })
  @ApiConflictResponse({ description: 'ACCOUNT_EXISTS — the Telegram account belongs to another profile' })
  linkTelegram(@CurrentUser() user: AuthUser, @Body({ schema: linkTelegramSchema }) { merge: confirmed, ...payload }: LinkTelegram) {
    return this.auth.linkTelegram(user.id, payload, confirmed);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: MINUTE_MS } })
  @ApiZodBody(linkGoogleSchema)
  @ApiOkResponse({ description: 'Links a Google account, merging the other account when confirmed' })
  @ApiConflictResponse({ description: 'ACCOUNT_EXISTS — the Google account belongs to another profile' })
  linkGoogle(@CurrentUser() user: AuthUser, @Body({ schema: linkGoogleSchema }) { credential, merge: confirmed }: LinkGoogle) {
    return this.auth.linkGoogle(user.id, credential, confirmed);
  }

  @Post('phone/otp')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: MINUTE_MS } })
  @ApiZodBody(requestOtpSchema)
  requestPhoneCode(@Body({ schema: requestOtpSchema }) { phone }: RequestOtp) {
    return this.auth.requestCode(phone);
  }

  @Post('phone')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: MINUTE_MS } })
  @ApiZodBody(linkPhoneSchema)
  @ApiOkResponse({ description: 'Links a verified phone number, merging the other account when confirmed' })
  @ApiConflictResponse({ description: 'ACCOUNT_EXISTS — the phone number belongs to another profile' })
  linkPhone(@CurrentUser() user: AuthUser, @Body({ schema: linkPhoneSchema }) { merge: confirmed, ...otp }: LinkPhone) {
    return this.auth.linkPhone(user.id, otp, confirmed);
  }

  @Delete(':method')
  @ApiOkResponse({ description: 'Unlinks a sign-in method unless it is the last one' })
  @ApiConflictResponse({ description: 'LAST_SIGN_IN_METHOD' })
  unlink(@CurrentUser() user: AuthUser, @Param('method', { schema: methodSchema }) method: z.infer<typeof methodSchema>) {
    return this.auth.unlink(user.id, method);
  }
}
