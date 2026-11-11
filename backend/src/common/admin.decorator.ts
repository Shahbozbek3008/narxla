import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ADMIN_KEY_HEADER, AdminKeyGuard } from './admin-key.guard.js';

export const ADMIN_SECURITY = 'admin-key';

export function AdminOnly() {
  return applyDecorators(
    UseGuards(AdminKeyGuard),
    ApiSecurity(ADMIN_SECURITY),
    ApiHeader({ name: ADMIN_KEY_HEADER, required: true }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid admin key' }),
  );
}
