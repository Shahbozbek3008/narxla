import type { Plan } from '../../generated/prisma/enums.js';
import { effectivePlan } from './plan.js';

export type PlanState = { plan: Plan; planExpiresAt: Date | null };

const RANK: Record<Plan, number> = { free: 0, project: 1, pro: 2 };

export function strongerPlan(first: PlanState, second: PlanState, now: Date): PlanState {
  const a = effectivePlan(first.plan, first.planExpiresAt, now);
  const b = effectivePlan(second.plan, second.planExpiresAt, now);
  if (a === 'free' && b === 'free') return { plan: 'free', planExpiresAt: null };
  const winner =
    RANK[a] !== RANK[b]
      ? RANK[a] > RANK[b]
        ? first
        : second
      : (first.planExpiresAt?.getTime() ?? 0) >= (second.planExpiresAt?.getTime() ?? 0)
        ? first
        : second;
  return { plan: winner.plan, planExpiresAt: winner.planExpiresAt };
}

export type Identity = {
  phone: string | null;
  telegramId: bigint | null;
  googleId: string | null;
  email: string | null;
  name: string;
};

export function mergedIdentity(target: Identity, source: Identity): Identity {
  return {
    phone: target.phone ?? source.phone,
    telegramId: target.telegramId ?? source.telegramId,
    googleId: target.googleId ?? source.googleId,
    email: target.email ?? source.email,
    name: target.name.trim() || source.name,
  };
}
