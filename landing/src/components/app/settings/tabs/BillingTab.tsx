'use client';

import { Check, Receipt } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, usePayments } from '@/lib/api/queries';
import { fmt } from '@/lib/format';
import { FEATURED_PLAN, FREE_ESTIMATE_LIMIT, PLAN_KINDS, type PlanKind } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { useFormatDate } from '../../common/useFormatDate';
import { useNotify } from '../../common/useNotify';
import { SettingsCard, SettingsFooter } from '../SettingsCard';

const HISTORY_GRID = 'grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)] items-center gap-4 px-4 sm:px-6';

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 px-4 sm:px-6 py-5">
      <span className="text-xs font-medium tracking-[0.04em] text-fg-3 uppercase">{label}</span>
      {children}
    </div>
  );
}

export function BillingTab() {
  const t = useTranslations('app.settings.billing');
  const tPricing = useTranslations('pricing');
  const tApp = useTranslations('app');
  const { user } = useAuth();
  const payments = usePayments(Boolean(user));
  const formatDate = useFormatDate();
  const notify = useNotify();

  if (!user) return null;

  const { plan, usage } = user;
  const paid = plan.kind !== 'free';
  const limit = usage.limit ?? FREE_ESTIMATE_LIMIT;
  const dateOf = (iso: string) => formatDate(iso.slice(0, 10), true);
  const requestPlan = () => notify('billing', 'info');

  return (
    <>
      <SettingsCard
        title={t('currentTitle')}
        description={t('currentLead')}
        aside={
          <Badge tone={paid ? 'success' : 'neutral'} shape="status" dot>
            {paid ? t('active') : t('freeStatus')}
          </Badge>
        }
        footer={
          <SettingsFooter note={t('manualNote')}>
            <Button size="sm" className="shadow-none" onClick={requestPlan}>
              {paid ? t('change') : t('upgrade')}
            </Button>
          </SettingsFooter>
        }
      >
        <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          <Stat label={t('planLabel')}>
            <span className="text-xl/7 font-semibold tracking-[-0.02em]">{tPricing(`plans.${plan.kind}.name`)}</span>
            <span className="text-[13px] text-fg-3">{tPricing(`plans.${plan.kind}.desc`)}</span>
          </Stat>
          <Stat label={t('usageLabel')}>
            {usage.limit === null ? (
              <>
                <span className="text-xl/7 font-semibold tabular-nums">{usage.estimates}</span>
                <span className="text-[13px] text-fg-3">{t('unlimited')}</span>
              </>
            ) : (
              <>
                <span className="text-xl/7 font-semibold tabular-nums">
                  {usage.estimates}
                  <span className="text-base font-medium text-fg-3"> / {limit}</span>
                </span>
                <span className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden>
                  <span
                    className={cn('block h-full rounded-full', usage.estimates >= limit ? 'bg-danger' : 'bg-accent')}
                    style={{ width: `${Math.min(100, (usage.estimates / limit) * 100)}%` }}
                  />
                </span>
              </>
            )}
          </Stat>
          <Stat label={t('periodLabel')}>
            <span className="text-xl/7 font-semibold tracking-[-0.02em]">
              {paid && plan.expiresAt ? dateOf(plan.expiresAt) : t('noExpiry')}
            </span>
            <span className="text-[13px] text-fg-3">{paid ? t(plan.kind === 'pro' ? 'monthly' : 'oneTime') : t('freeForever')}</span>
          </Stat>
        </div>
      </SettingsCard>

      <SettingsCard title={t('plansTitle')} description={t('plansLead')}>
        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
          {PLAN_KINDS.map((kind: PlanKind) => {
            const current = kind === plan.kind;
            const features = tPricing.raw(`plans.${kind}.features`) as string[];
            return (
              <div
                key={kind}
                className={cn(
                  'relative flex flex-col rounded-xl border p-5',
                  current ? 'border-accent shadow-[0_0_0_4px_var(--accent-soft)]' : 'border-line-2',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-semibold">{tPricing(`plans.${kind}.name`)}</span>
                  {current ? (
                    <Badge tone="accent" shape="square">
                      {t('current')}
                    </Badge>
                  ) : (
                    kind === FEATURED_PLAN && (
                      <Badge tone="outline" shape="square">
                        {tPricing('popular')}
                      </Badge>
                    )
                  )}
                </div>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-[28px]/8 font-semibold tracking-[-0.03em] tabular-nums">
                    {tPricing(`plans.${kind}.price`)}
                  </span>
                  <span className="text-[13px] text-fg-3">{tPricing(`plans.${kind}.unit`)}</span>
                </p>
                <p className="mt-1 text-[13px] text-fg-3">{tPricing(`plans.${kind}.note`)}</p>
                <ul className="mt-4 flex flex-1 flex-col gap-2 border-t border-line pt-4">
                  {features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-[13px]/5 text-fg-2">
                      <Check size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-success" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={current ? 'secondary' : kind === FEATURED_PLAN ? 'primary' : 'secondary'}
                  size="sm"
                  block
                  disabled={current || kind === 'free'}
                  className="mt-5 shadow-none"
                  onClick={requestPlan}
                >
                  {current ? t('current') : t('choose')}
                </Button>
              </div>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard title={t('historyTitle')} description={t('historyLead')}>
        <div>
          <div className={cn(HISTORY_GRID, 'h-10 bg-surface-2 text-xs font-medium text-fg-3 max-sm:hidden')}>
            <span>{t('columns.date')}</span>
            <span>{t('columns.plan')}</span>
            <span>{t('columns.period')}</span>
            <span className="text-right">{t('columns.amount')}</span>
          </div>
          {payments.isPending && (
            <div className="flex flex-col gap-3 px-4 sm:px-6 py-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          {payments.data?.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 sm:px-6 py-10 text-center">
              <span className="grid size-10 place-items-center rounded-xl border border-line-2 text-fg-3">
                <Receipt size={18} strokeWidth={1.5} aria-hidden />
              </span>
              <span className="text-sm font-medium">{t('historyEmpty')}</span>
              <span className="max-w-[320px] text-[13px] text-fg-3">{t('historyEmptyHint')}</span>
            </div>
          )}
          {payments.data?.map((payment) => (
            <div key={payment.id} className={cn(HISTORY_GRID, 'border-t border-line py-3.5 text-sm tabular-nums max-sm:grid-cols-2')}>
              <span>{dateOf(payment.paidAt)}</span>
              <span className="font-medium">{tPricing(`plans.${payment.plan}.name`)}</span>
              <span className="text-fg-3 max-sm:hidden">{payment.periodEnd ? t('until', { date: dateOf(payment.periodEnd) }) : '—'}</span>
              <span className="text-right font-semibold">{tApp('money', { value: fmt(payment.amount) })}</span>
            </div>
          ))}
        </div>
      </SettingsCard>
    </>
  );
}
