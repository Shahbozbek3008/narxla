'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { FREE_ESTIMATE_LIMIT } from '@/lib/plans';
import { useEstimates } from '@/store/estimates';
import { usePlan } from '@/store/plan';
import { useFormatDate } from '../common/useFormatDate';
import { useNotify } from '../common/useNotify';

const CTA =
  'mt-3 h-8 w-full rounded-lg border border-line-2 text-[13px] font-medium transition-colors duration-150 hover:bg-surface-2';

export function PlanCard() {
  const t = useTranslations('app.plan');
  const { kind, trackingUntil } = usePlan();
  const used = useEstimates((state) => state.projects.length);
  const formatDate = useFormatDate();
  const notify = useNotify();
  const showPro = () => notify('pro', 'info');

  if (kind === 'free') {
    const progress = Math.min(1, used / FREE_ESTIMATE_LIMIT);
    return (
      <div className="sheen rounded-[14px] border border-line bg-surface p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold">{t('freeTitle')}</span>
          <span className="text-xs text-fg-3 tabular-nums">
            {t('freeUsage', { used: Math.min(used, FREE_ESTIMATE_LIMIT), limit: FREE_ESTIMATE_LIMIT })}
          </span>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress * 100}%` }} />
        </div>
        <button type="button" className={CTA} onClick={showPro}>
          {t('freeCta')}
        </button>
      </div>
    );
  }

  return (
    <div className="sheen rounded-[14px] border border-line bg-surface p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">{t('projectTitle')}</span>
        <Badge tone="accent" shape="square">
          {t('active')}
        </Badge>
      </div>
      <p className="mt-1 text-xs/4 text-fg-3">{t('projectNote', { date: formatDate(trackingUntil) })}</p>
      <button type="button" className={CTA} onClick={showPro}>
        {t('proCta')}
      </button>
    </div>
  );
}
