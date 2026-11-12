import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthMaintenance } from './auth.maintenance.js';
import { AuthService } from './auth.service.js';
import { OtpService } from './otp.service.js';
import { LogSmsSender, SmsSender } from './sms/sms-sender.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, OtpService, AuthMaintenance, { provide: SmsSender, useClass: LogSmsSender }],
})
export class AuthModule {}
