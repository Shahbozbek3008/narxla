import { Injectable } from '@nestjs/common';
import type { User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { effectivePlan, estimateLimit, PLAN_PRICES, planPeriodEnd } from './domain/plan.js';
import type { GrantPlan, ListUsersQuery, UpdateProfile } from './users.schemas.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  upsertByPhone(phone: string) {
    return this.prisma.user.upsert({ where: { phone }, create: { phone }, update: {}, select: { id: true } });
  }

  upsertByTelegram(telegramId: bigint, name: string) {
    return this.prisma.user.upsert({
      where: { telegramId },
      create: { telegramId, name, notifyTelegram: true },
      update: {},
      select: { id: true },
    });
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { _count: { select: { estimates: true } } },
    });
    return this.toProfile(user, user._count.estimates);
  }

  async update(userId: string, data: UpdateProfile) {
    await this.prisma.user.update({ where: { id: userId }, data });
    return this.profile(userId);
  }

  async remove(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  payments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { paidAt: 'desc' },
      select: { id: true, plan: true, amount: true, provider: true, periodEnd: true, paidAt: true },
    });
  }

  async planOf(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { plan: true, planExpiresAt: true } });
    return effectivePlan(user.plan, user.planExpiresAt, new Date());
  }

  async list({ query, take }: ListUsersQuery) {
    const users = await this.prisma.user.findMany({
      where: query
        ? { OR: [{ phone: { contains: query } }, { name: { contains: query, mode: 'insensitive' } }, { id: query }] }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      include: { _count: { select: { estimates: true } } },
    });
    return users.map((user) => this.toProfile(user, user._count.estimates));
  }

  async grantPlan(userId: string, { plan, amount, reference }: GrantPlan) {
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { plan: true, planExpiresAt: true } });
      const current = user.plan === plan ? user.planExpiresAt : null;
      const periodEnd = planPeriodEnd(plan, current, now);
      await tx.user.update({ where: { id: userId }, data: { plan, planExpiresAt: periodEnd } });
      await tx.payment.create({
        data: { userId, plan, amount: amount ?? PLAN_PRICES[plan], provider: 'manual', reference, periodEnd, paidAt: now },
      });
    });
    return this.profile(userId);
  }

  private toProfile(user: User, estimates: number) {
    const plan = effectivePlan(user.plan, user.planExpiresAt, new Date());
    return {
      id: user.id,
      phone: user.phone,
      telegramLinked: user.telegramId !== null,
      name: user.name,
      region: user.region,
      district: user.district,
      reserve: user.reserve,
      quality: user.quality,
      notifyPrice: user.notifyPrice,
      notifyTelegram: user.notifyTelegram,
      notifyNews: user.notifyNews,
      plan: { kind: plan, expiresAt: plan === 'free' ? null : user.planExpiresAt },
      usage: { estimates, limit: estimateLimit(plan) },
      createdAt: user.createdAt,
    };
  }
}

export type Profile = Awaited<ReturnType<UsersService['profile']>>;
