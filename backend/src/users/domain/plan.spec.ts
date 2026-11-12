import { effectivePlan, estimateLimit, FREE_ESTIMATE_LIMIT, planPeriodEnd } from './plan.js';

const NOW = new Date('2026-11-12T10:00:00Z');

describe('plan policy', () => {
  it('falls back to free once a paid plan expires', () => {
    expect(effectivePlan('project', new Date('2027-01-01T00:00:00Z'), NOW)).toBe('project');
    expect(effectivePlan('pro', new Date('2026-11-01T00:00:00Z'), NOW)).toBe('free');
    expect(effectivePlan('pro', null, NOW)).toBe('free');
    expect(effectivePlan('free', null, NOW)).toBe('free');
  });

  it('limits only the free plan', () => {
    expect(estimateLimit('free')).toBe(FREE_ESTIMATE_LIMIT);
    expect(estimateLimit('project')).toBeNull();
    expect(estimateLimit('pro')).toBeNull();
  });

  it('starts a new period now or extends an active one', () => {
    expect(planPeriodEnd('project', null, NOW).toISOString()).toBe('2027-05-12T10:00:00.000Z');
    expect(planPeriodEnd('pro', new Date('2026-12-01T00:00:00Z'), NOW).toISOString()).toBe('2027-01-01T00:00:00.000Z');
    expect(planPeriodEnd('pro', new Date('2026-10-01T00:00:00Z'), NOW).toISOString()).toBe('2026-12-12T10:00:00.000Z');
  });
});
