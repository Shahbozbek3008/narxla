import { mergedIdentity, strongerPlan } from './merge.js';

const NOW = new Date('2026-11-13T12:00:00Z');
const future = (days: number) => new Date(NOW.getTime() + days * 86_400_000);
const past = new Date(NOW.getTime() - 86_400_000);

describe('strongerPlan', () => {
  it('keeps the higher active tier', () => {
    expect(strongerPlan({ plan: 'project', planExpiresAt: future(100) }, { plan: 'pro', planExpiresAt: future(5) }, NOW).plan).toBe('pro');
  });

  it('ignores expired plans', () => {
    const result = strongerPlan({ plan: 'pro', planExpiresAt: past }, { plan: 'project', planExpiresAt: future(30) }, NOW);
    expect(result).toEqual({ plan: 'project', planExpiresAt: future(30) });
  });

  it('keeps the longer period for the same tier', () => {
    expect(strongerPlan({ plan: 'pro', planExpiresAt: future(3) }, { plan: 'pro', planExpiresAt: future(20) }, NOW).planExpiresAt).toEqual(future(20));
  });

  it('falls back to free when nothing is active', () => {
    expect(strongerPlan({ plan: 'pro', planExpiresAt: past }, { plan: 'free', planExpiresAt: null }, NOW)).toEqual({ plan: 'free', planExpiresAt: null });
  });
});

describe('mergedIdentity', () => {
  it('fills only the gaps of the target', () => {
    const target = { phone: '+998901112233', telegramId: null, googleId: null, email: null, name: '' };
    const source = { phone: '+998900000000', telegramId: 42n, googleId: 'g-1', email: 'a@b.c', name: 'Ali' };
    expect(mergedIdentity(target, source)).toEqual({ phone: '+998901112233', telegramId: 42n, googleId: 'g-1', email: 'a@b.c', name: 'Ali' });
  });
});
