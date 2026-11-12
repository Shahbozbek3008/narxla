import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { idSchema } from '../catalog/catalog.schemas.js';
import { AdminOnly } from '../common/admin.decorator.js';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import { type GrantPlan, grantPlanSchema, type ListUsersQuery, listUsersQuerySchema } from './users.schemas.js';
import { UsersService } from './users.service.js';

@ApiTags('admin / users')
@AdminOnly()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query({ schema: listUsersQuerySchema }) query: ListUsersQuery) {
    return this.users.list(query);
  }

  @Post(':id/plan')
  @ApiZodBody(grantPlanSchema)
  grantPlan(@Param('id', { schema: idSchema }) id: string, @Body({ schema: grantPlanSchema }) body: GrantPlan) {
    return this.users.grantPlan(id, body);
  }
}
