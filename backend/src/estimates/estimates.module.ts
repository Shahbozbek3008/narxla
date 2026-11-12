import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { EstimatesController, SharedEstimatesController } from './estimates.controller.js';
import { EstimatesService } from './estimates.service.js';

@Module({
  imports: [UsersModule],
  controllers: [EstimatesController, SharedEstimatesController],
  providers: [EstimatesService],
})
export class EstimatesModule {}
