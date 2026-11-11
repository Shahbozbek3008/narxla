import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiAcceptedResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { AdminOnly } from '../common/admin.decorator.js';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import {
  createReportSchema,
  listReportsQuerySchema,
  updateReportSchema,
  type CreateReport,
  type ListReportsQuery,
  type UpdateReport,
} from './reports.schemas.js';
import { ReportsService } from './reports.service.js';

const REPORTS_PER_MINUTE = 5;
const MINUTE_MS = 60_000;

@ApiTags('price reports')
@Controller('price-reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: REPORTS_PER_MINUTE, ttl: MINUTE_MS } })
  @ApiZodBody(createReportSchema)
  @ApiAcceptedResponse({ description: 'Report stored for review' })
  create(@Body({ schema: createReportSchema }) body: CreateReport) {
    return this.reports.create(body);
  }
}

@ApiTags('admin / price reports')
@AdminOnly()
@Controller('admin/price-reports')
export class AdminReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  list(@Query({ schema: listReportsQuerySchema }) query: ListReportsQuery) {
    return this.reports.list(query);
  }

  @Patch(':id')
  @ApiZodBody(updateReportSchema)
  update(@Param('id', { schema: z.cuid() }) id: string, @Body({ schema: updateReportSchema }) body: UpdateReport) {
    return this.reports.update(id, body);
  }
}
