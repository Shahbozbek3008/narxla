import { Module } from '@nestjs/common';
import { PricesModule } from '../prices/prices.module.js';
import { AdminReviewController } from './admin-review.controller.js';
import { ReviewService } from './review.service.js';

@Module({
  imports: [PricesModule],
  controllers: [AdminReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
