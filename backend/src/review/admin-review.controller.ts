import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiConflictResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AdminOnly } from '../common/admin.decorator.js';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import { ObservationStatus } from '../generated/prisma/enums.js';
import { ReviewService } from './review.service.js';

const idSchema = z.cuid();

const listQuerySchema = z.object({
  status: z.enum(ObservationStatus).default('PENDING_REVIEW'),
  take: z.coerce.number().int().min(1).max(200).default(50),
});

const rejectSchema = z.object({ reason: z.string().trim().min(3).max(300).optional() });

@ApiTags('admin / review')
@AdminOnly()
@Controller('admin/observations')
export class AdminReviewController {
  constructor(private readonly review: ReviewService) {}

  @Get()
  list(@Query({ schema: listQuerySchema }) { status, take }: z.infer<typeof listQuerySchema>) {
    return this.review.list(status, take);
  }

  @Post(':id/approve')
  @ApiConflictResponse({ description: 'Observation is not pending review' })
  approve(@Param('id', { schema: idSchema }) id: string) {
    return this.review.approve(id);
  }

  @Post(':id/reject')
  @ApiZodBody(rejectSchema)
  @ApiConflictResponse({ description: 'Observation is not pending review' })
  reject(@Param('id', { schema: idSchema }) id: string, @Body({ schema: rejectSchema }) { reason }: z.infer<typeof rejectSchema>) {
    return this.review.reject(id, reason);
  }
}
