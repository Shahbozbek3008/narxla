import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { generateSessionToken, hashSessionToken } from './domain/secrets.js';

export type SessionMeta = { userAgent?: string; ip?: string };

export type AuthUser = { id: string; sessionId: string };

const DAY_MS = 24 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;
const USER_AGENT_LIMIT = 300;

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  private get ttlMs() {
    return this.config.auth.sessionTtlDays * DAY_MS;
  }

  async create(userId: string, { userAgent, ip }: SessionMeta) {
    const token = generateSessionToken();
    await this.prisma.session.create({
      data: {
        userId,
        tokenHash: hashSessionToken(token),
        userAgent: userAgent?.slice(0, USER_AGENT_LIMIT),
        ip,
        expiresAt: new Date(Date.now() + this.ttlMs),
      },
    });
    return token;
  }

  async resolve(token: string): Promise<AuthUser | null> {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      select: { id: true, userId: true, expiresAt: true, lastUsedAt: true },
    });
    const now = Date.now();
    if (!session || session.expiresAt.getTime() <= now) return null;

    if (now - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date(now), expiresAt: new Date(now + this.ttlMs) },
      });
    }
    return { id: session.userId, sessionId: session.id };
  }

  async revoke(sessionId: string) {
    await this.prisma.session.deleteMany({ where: { id: sessionId } });
  }

  async revokeOthers(userId: string, keepSessionId: string) {
    const { count } = await this.prisma.session.deleteMany({ where: { userId, id: { not: keepSessionId } } });
    return count;
  }

  purgeExpired(before: Date) {
    return this.prisma.session.deleteMany({ where: { expiresAt: { lt: before } } });
  }
}
