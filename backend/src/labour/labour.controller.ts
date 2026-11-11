import { Body, Controller, Get, Header, Param, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { codeSchema } from '../catalog/catalog.schemas.js';
import { AdminOnly } from '../common/admin.decorator.js';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import {
  createLabourRateSchema,
  updateLabourRateSchema,
  type CreateLabourRate,
  type UpdateLabourRate,
} from './labour.schemas.js';
import { LabourService } from './labour.service.js';

@ApiTags('labour')
@Controller('labour-rates')
export class LabourController {
  constructor(private readonly labour: LabourService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  @ApiOkResponse({ description: 'Market labour rates with their typical range' })
  async list() {
    return { generatedAt: new Date().toISOString(), items: await this.labour.rates() };
  }
}

@ApiTags('admin / labour')
@AdminOnly()
@Controller('admin/labour-rates')
export class AdminLabourController {
  constructor(private readonly labour: LabourService) {}

  @Get()
  list() {
    return this.labour.list();
  }

  @Post()
  @ApiZodBody(createLabourRateSchema)
  create(@Body({ schema: createLabourRateSchema }) body: CreateLabourRate) {
    return this.labour.create(body);
  }

  @Patch(':code')
  @ApiZodBody(updateLabourRateSchema)
  update(@Param('code', { schema: codeSchema }) code: string, @Body({ schema: updateLabourRateSchema }) body: UpdateLabourRate) {
    return this.labour.update(code, body);
  }
}
