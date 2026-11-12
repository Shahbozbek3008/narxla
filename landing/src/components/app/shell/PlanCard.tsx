'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/api/queries';
import { FREE_ESTIMATE_LIMIT } from '@/lib/plans';
import { useFormatDate } from '../common/useFormatDate';
import { useNotify } from '../common/useNotify';

const CTA =
  'mt-3 h-8 w-full rounded-lg border border-line-2 text-[13px] font-medium transition-colors duration-150 hover:bg-surface-2';

export function PlanCard() {
  const t = useTranslations('app.plan');
  const { user } = useAuth();
  const formatDate = useFormatDate();
  const notify = useNotify();
  const showPro = () => notify('pro', 'info');

  if (!user) return null;

  const { plan, usage } = user;

  if (plan.kind === 'free') {
    const limit = usage.limit ?? FREE_ESTIMATE_LIMIT;
    const progress = Math.min(1, usage.estimates / limit);
    return (
      <div className="sheen rounded-[14px] border border-line bg-surface p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold">{t('freeTitle')}</span>
          <span className="text-xs text-fg-3 tabular-nums">{t('freeUsage', { used: Math.min(usage.estimates, limit), limit })}</span>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress * 100}%` }} />
        </div>
        <button type="button" className={CTA} onClick={() => notify('billing', 'info')}>
          {t('freeCta')}
        </button>
      </div>
    );
  }

  const until = plan.expiresAt ? formatDate(plan.expiresAt.slice(0, 10)) : '';

  return (
    <div className="sheen rounded-[14px] border border-line bg-surface p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">{t(plan.kind === 'pro' ? 'proTitle' : 'projectTitle')}</span>
        <Badge tone="accent" shape="square">
          {t('active')}
        </Badge>
      </div>
      <p className="mt-1 text-xs/4 text-fg-3">{t(plan.kind === 'pro' ? 'proNote' : 'projectNote', { date: until })}</p>
      {plan.kind === 'project' && (
        <button type="button" className={CTA} onClick={showPro}>
          {t('proCta')}
        </button>
      )}
    </div>
  );
}
