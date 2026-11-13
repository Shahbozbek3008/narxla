import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiError } from '../common/api-error.js';
import type { User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { mergedIdentity, strongerPlan } from './domain/merge.js';
import { effectivePlan, estimateLimit, PLAN_PRICES, planPeriodEnd } from './domain/plan.js';
import type { GrantPlan, ListUsersQuery, UpdateProfile } from './users.schemas.js';

export type LinkableIdentity =
  | { kind: 'phone'; phone: string }
  | { kind: 'telegram'; telegramId: bigint }
  | { kind: 'google'; googleId: string; email: string };

const identityWhere = (identity: LinkableIdentity) =>
  identity.kind === 'phone'
    ? { phone: identity.phone }
    : identity.kind === 'telegram'
      ? { telegramId: identity.telegramId }
      : { googleId: identity.googleId };

const identityData = (identity: LinkableIdentity) =>
  identity.kind === 'google' ? { googleId: identity.googleId, email: identity.email } : identityWhere(identity);

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

  async upsertByGoogle(googleId: string, email: string, name: string) {
    return this.prisma.user.upsert({
      where: { googleId },
      create: { googleId, email, name },
      update: { email },
      select: { id: true },
    });
  }

  async ownerOf(identity: LinkableIdentity, exceptUserId: string) {
    const owner = await this.prisma.user.findUnique({
      where: identityWhere(identity),
      select: { id: true, _count: { select: { estimates: true } } },
    });
    return owner && owner.id !== exceptUserId ? { id: owner.id, estimates: owner._count.estimates } : null;
  }

  async attachIdentity(userId: string, identity: LinkableIdentity, merge: boolean) {
    const owner = await this.ownerOf(identity, userId);
    if (owner && !merge) {
      throw new ApiError(HttpStatus.CONFLICT, 'ACCOUNT_EXISTS', 'This sign-in method belongs to another account', {
        method: identity.kind,
        estimates: owner.estimates,
      });
    }
    if (owner) await this.merge(userId, owner.id);
    await this.prisma.user.update({ where: { id: userId }, data: identityData(identity) });
    return this.profile(userId);
  }

  async detachIdentity(userId: string, kind: LinkableIdentity['kind']) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { phone: true, telegramId: true, googleId: true } });
    const remaining = [user.phone && kind !== 'phone', user.telegramId !== null && kind !== 'telegram', user.googleId && kind !== 'google'];
    if (!remaining.some(Boolean)) {
      throw new ApiError(HttpStatus.CONFLICT, 'LAST_SIGN_IN_METHOD', 'This is the only way to sign in to this account');
    }
    const data =
      kind === 'telegram' ? { telegramId: null, notifyTelegram: false } : kind === 'google' ? { googleId: null } : { phone: null };
    await this.prisma.user.update({ where: { id: userId }, data });
    return this.profile(userId);
  }

  async merge(targetId: string, sourceId: string) {
    if (targetId === sourceId) throw new ApiError(HttpStatus.BAD_REQUEST, 'MERGE_SELF', 'Cannot merge an account into itself');
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const [target, source] = await Promise.all([
        tx.user.findUniqueOrThrow({ where: { id: targetId } }),
        tx.user.findUniqueOrThrow({ where: { id: sourceId } }),
      ]);
      await tx.estimate.updateMany({ where: { userId: sourceId }, data: { userId: targetId } });
      await tx.payment.updateMany({ where: { userId: sourceId }, data: { userId: targetId } });
      await tx.user.delete({ where: { id: sourceId } });
      await tx.user.update({
        where: { id: targetId },
        data: {
          ...mergedIdentity(target, source),
          ...strongerPlan(target, source, now),
          notifyTelegram: target.notifyTelegram || source.notifyTelegram,
        },
      });
    });
    return this.profile(targetId);
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
      googleLinked: user.googleId !== null,
      email: user.email,
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
