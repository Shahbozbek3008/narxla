import { Module } from '@nestjs/common';
import { AdminLabourController, LabourController } from './labour.controller.js';
import { LabourService } from './labour.service.js';

@Module({
  controllers: [LabourController, AdminLabourController],
  providers: [LabourService],
})
export class LabourModule {}
