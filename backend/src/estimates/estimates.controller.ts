import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { Authenticated, CurrentUser } from '../auth/session.guard.js';
import type { AuthUser } from '../auth/sessions.service.js';
import { idSchema } from '../catalog/catalog.schemas.js';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import {
  type CreateEstimate,
  createEstimateSchema,
  shareTokenSchema,
  type UpdateEstimate,
  updateEstimateSchema,
} from './estimates.schemas.js';
import { EstimatesService } from './estimates.service.js';

@ApiTags('estimates')
@Authenticated()
@Controller('estimates')
export class EstimatesController {
  constructor(private readonly estimates: EstimatesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.estimates.list(user.id);
  }

  @Post()
  @ApiZodBody(createEstimateSchema)
  @ApiCreatedResponse({ description: 'Saved estimate' })
  @ApiForbiddenResponse({ description: 'The free plan limit was reached' })
  create(@CurrentUser() user: AuthUser, @Body({ schema: createEstimateSchema }) body: CreateEstimate) {
    return this.estimates.create(user.id, body);
  }

  @Get(':id')
  @ApiNotFoundResponse()
  get(@CurrentUser() user: AuthUser, @Param('id', { schema: idSchema }) id: string) {
    return this.estimates.get(user.id, id);
  }

  @Patch(':id')
  @ApiZodBody(updateEstimateSchema)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', { schema: idSchema }) id: string,
    @Body({ schema: updateEstimateSchema }) body: UpdateEstimate,
  ) {
    return this.estimates.update(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@CurrentUser() user: AuthUser, @Param('id', { schema: idSchema }) id: string) {
    return this.estimates.remove(user.id, id);
  }

  @Post(':id/share')
  @HttpCode(HttpStatus.OK)
  share(@CurrentUser() user: AuthUser, @Param('id', { schema: idSchema }) id: string) {
    return this.estimates.share(user.id, id);
  }

  @Delete(':id/share')
  unshare(@CurrentUser() user: AuthUser, @Param('id', { schema: idSchema }) id: string) {
    return this.estimates.unshare(user.id, id);
  }
}

@ApiTags('estimates')
@Controller('shared')
export class SharedEstimatesController {
  constructor(private readonly estimates: EstimatesService) {}

  @Get(':token')
  @ApiNotFoundResponse()
  get(@Param('token', { schema: shareTokenSchema }) token: string) {
    return this.estimates.shared(token);
  }
}
