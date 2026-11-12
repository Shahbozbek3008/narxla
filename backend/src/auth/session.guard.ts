import {
  applyDecorators,
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  HttpStatus,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { ApiError } from '../common/api-error.js';
import { SESSION_COOKIE } from './session-cookie.js';
import { type AuthUser, SessionsService } from './sessions.service.js';

type AuthenticatedRequest = Request & { authUser?: AuthUser };

export const sessionTokenOf = (request: Request): string | undefined => {
  const value: unknown = request.cookies?.[SESSION_COOKIE];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionsService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = sessionTokenOf(request);
    const user = token ? await this.sessions.resolve(token) : null;
    if (!user) throw new ApiError(HttpStatus.UNAUTHORIZED, 'UNAUTHENTICATED', 'Sign in to continue');
    request.authUser = user;
    return true;
  }
}

export const Authenticated = () =>
  applyDecorators(UseGuards(SessionGuard), ApiCookieAuth(SESSION_COOKIE), ApiUnauthorizedResponse({ description: 'No valid session' }));

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): AuthUser => {
  const { authUser } = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!authUser) throw new ApiError(HttpStatus.UNAUTHORIZED, 'UNAUTHENTICATED', 'Sign in to continue');
  return authUser;
});
