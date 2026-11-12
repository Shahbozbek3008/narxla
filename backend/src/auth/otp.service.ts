import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiError } from '../common/api-error.js';
import { AppConfigService } from '../config/app-config.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { generateOtp, hashOtp, safeEqualHex } from './domain/secrets.js';
import { SmsSender } from './sms/sms-sender.js';

const HOUR_MS = 60 * 60 * 1000;
const SECOND_MS = 1000;

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsSender,
    private readonly config: AppConfigService,
  ) {}

  async request(phone: string) {
    const { otpTtlSeconds, otpResendSeconds, otpHourlyLimit, secret, fixedOtpCode } = this.config.auth;
    const now = Date.now();

    const recent = await this.prisma.otpChallenge.findMany({
      where: { phone, createdAt: { gte: new Date(now - HOUR_MS) } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    const [latest] = recent;
    const resendIn = latest ? Math.ceil((latest.createdAt.getTime() + otpResendSeconds * SECOND_MS - now) / SECOND_MS) : 0;
    if (resendIn > 0) {
      throw new ApiError(HttpStatus.TOO_MANY_REQUESTS, 'OTP_COOLDOWN', 'Wait before requesting another code', { retryAfter: resendIn });
    }
    if (recent.length >= otpHourlyLimit) {
      throw new ApiError(HttpStatus.TOO_MANY_REQUESTS, 'OTP_HOURLY_LIMIT', 'Too many codes requested for this number');
    }

    const code = fixedOtpCode ?? generateOtp();
    await this.prisma.otpChallenge.create({
      data: { phone, codeHash: hashOtp(secret, phone, code), expiresAt: new Date(now + otpTtlSeconds * SECOND_MS) },
    });
    await this.sms.send(phone, `Smetachi: kirish kodi ${code}. Kodni hech kimga bermang.`);

    return { expiresIn: otpTtlSeconds, resendIn: otpResendSeconds };
  }

  async verify(phone: string, code: string) {
    const { otpMaxAttempts, secret } = this.config.auth;
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) throw new ApiError(HttpStatus.BAD_REQUEST, 'OTP_EXPIRED', 'The code has expired, request a new one');
    if (challenge.attempts >= otpMaxAttempts) {
      throw new ApiError(HttpStatus.TOO_MANY_REQUESTS, 'OTP_LOCKED', 'Too many wrong attempts, request a new code');
    }

    if (!safeEqualHex(challenge.codeHash, hashOtp(secret, phone, code))) {
      await this.prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
      throw new ApiError(HttpStatus.BAD_REQUEST, 'OTP_INVALID', 'The code is incorrect', {
        attemptsLeft: Math.max(0, otpMaxAttempts - challenge.attempts - 1),
      });
    }

    const { count } = await this.prisma.otpChallenge.updateMany({
      where: { id: challenge.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (count === 0) throw new ApiError(HttpStatus.BAD_REQUEST, 'OTP_EXPIRED', 'The code has already been used');
  }

  purgeExpired(before: Date) {
    return this.prisma.otpChallenge.deleteMany({ where: { expiresAt: { lt: before } } });
  }
}
