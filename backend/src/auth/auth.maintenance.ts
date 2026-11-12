import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OtpService } from './otp.service.js';
import { SessionsService } from './sessions.service.js';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthMaintenance {
  private readonly logger = new Logger(AuthMaintenance.name);

  constructor(
    private readonly sessions: SessionsService,
    private readonly otp: OtpService,
  ) {}

  @Cron('0 4 * * *', { name: 'auth-cleanup', timeZone: 'Asia/Tashkent' })
  async purge() {
    const now = new Date();
    const [sessions, challenges] = await Promise.all([
      this.sessions.purgeExpired(now),
      this.otp.purgeExpired(new Date(now.getTime() - DAY_MS)),
    ]);
    this.logger.log(`Purged ${sessions.count} expired sessions and ${challenges.count} OTP challenges`);
  }
}
