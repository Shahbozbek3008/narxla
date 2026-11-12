import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Res } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { clearSessionCookie } from '../auth/session-cookie.js';
import { Authenticated, CurrentUser } from '../auth/session.guard.js';
import { type AuthUser, SessionsService } from '../auth/sessions.service.js';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import { AppConfigService } from '../config/app-config.service.js';
import { type UpdateProfile, updateProfileSchema } from './users.schemas.js';
import { UsersService } from './users.service.js';

@ApiTags('me')
@Authenticated()
@Controller('me')
export class MeController {
  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
    private readonly config: AppConfigService,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'The signed-in user with plan and usage' })
  profile(@CurrentUser() user: AuthUser) {
    return this.users.profile(user.id);
  }

  @Patch()
  @ApiZodBody(updateProfileSchema)
  update(@CurrentUser() user: AuthUser, @Body({ schema: updateProfileSchema }) body: UpdateProfile) {
    return this.users.update(user.id, body);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Deletes the account with all estimates, sessions and payments' })
  async remove(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) response: Response) {
    await this.users.remove(user.id);
    clearSessionCookie(response, this.config.isProduction);
  }

  @Get('payments')
  payments(@CurrentUser() user: AuthUser) {
    return this.users.payments(user.id);
  }

  @Delete('sessions')
  @ApiOkResponse({ description: 'Signs out every other device' })
  async revokeOtherSessions(@CurrentUser() user: AuthUser) {
    return { revoked: await this.sessions.revokeOthers(user.id, user.sessionId) };
  }
}
