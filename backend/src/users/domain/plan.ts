import type { Plan } from '../../generated/prisma/enums.js';

export const FREE_ESTIMATE_LIMIT = 3;

export const PLAN_PRICES: Record<Exclude<Plan, 'free'>, number> = {
  project: 49_000,
  pro: 129_000,
};

const PLAN_PERIOD_MONTHS: Record<Exclude<Plan, 'free'>, number> = {
  project: 6,
  pro: 1,
};

export function effectivePlan(plan: Plan, expiresAt: Date | null, now: Date): Plan {
  if (plan === 'free') return 'free';
  return expiresAt && expiresAt > now ? plan : 'free';
}

export const estimateLimit = (plan: Plan) => (plan === 'free' ? FREE_ESTIMATE_LIMIT : null);

export function planPeriodEnd(plan: Exclude<Plan, 'free'>, currentExpiry: Date | null, now: Date) {
  const start = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + PLAN_PERIOD_MONTHS[plan]);
  return end;
}
