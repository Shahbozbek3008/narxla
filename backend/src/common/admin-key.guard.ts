import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { AppConfigService } from '../config/app-config.service.js';

export const ADMIN_KEY_HEADER = 'x-admin-key';

const digest = (value: string) => createHash('sha256').update(value).digest();

@Injectable()
export class AdminKeyGuard implements CanActivate {
  private readonly expected: Buffer;

  constructor(config: AppConfigService) {
    this.expected = digest(config.adminApiKey);
  }

  canActivate(context: ExecutionContext) {
    const provided = context.switchToHttp().getRequest<Request>().header(ADMIN_KEY_HEADER);
    if (provided && timingSafeEqual(digest(provided), this.expected)) return true;
    throw new UnauthorizedException('Invalid admin key');
  }
}
