'use client';

import { useTranslations } from 'next-intl';
import { useDeferredValue, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPhone } from '@/lib/format';
import { cn } from '@/lib/utils';
import { SearchInput } from '../app/common/SearchInput';
import { plainCard } from '../app/common/styles';
import { PanelHeader, PanelState } from './PanelChrome';
import { formatDateTime, useAdminAction, useAdminResource } from './useAdmin';

const PAID_PLANS = ['project', 'pro'] as const;

export function UsersPanel() {
  const t = useTranslations('admin.users');
  const [search, setSearch] = useState('');
  const query = useDeferredValue(search.trim());
  const { data, error, loading, reload } = useAdminResource(`users:${query}`, (api) => api.users(query));
  const { run, pending } = useAdminAction();

  const grant = async (id: string, plan: (typeof PAID_PLANS)[number]) => {
    if (await run(id, (api) => api.grantPlan(id, plan), t('granted', { plan: t(`plans.${plan}`) }))) reload();
  };

  return (
    <section className="flex flex-col gap-4">
      <PanelHeader title={t('title')} lead={t('lead')} onRefresh={reload} />
      <SearchInput
        wrapperClassName="max-w-[360px]"
        value={search}
        placeholder={t('search')}
        aria-label={t('search')}
        onChange={(event) => setSearch(event.target.value)}
      />
      <PanelState loading={loading && !data} error={error}>
        {data?.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line-2 px-6 py-10 text-center text-sm text-fg-2">{t('empty')}</p>
        )}
        <div className="flex flex-col gap-2.5">
          {data?.map((user) => (
            <article key={user.id} className={cn(plainCard, 'flex flex-wrap items-center gap-4 p-4')}>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm/5 font-semibold">{user.name || (user.phone ? formatPhone(user.phone) : t('telegramUser'))}</span>
                <span className="text-xs text-fg-3 tabular-nums">
                  {[user.phone && formatPhone(user.phone), user.telegramLinked ? 'Telegram' : null, t('estimates', { count: user.usage.estimates })]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className="text-xs text-fg-3">{t('joined', { date: formatDateTime(user.createdAt) })}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge tone={user.plan.kind === 'free' ? 'neutral' : 'accent'} shape="status" dot>
                  {t(`plans.${user.plan.kind}`)}
                </Badge>
                {user.plan.expiresAt && (
                  <span className="text-[11px] text-fg-3">{t('until', { date: formatDateTime(user.plan.expiresAt) })}</span>
                )}
              </div>
              <div className="flex gap-1.5">
                {PAID_PLANS.map((plan) => (
                  <Button key={plan} size="xs" variant="secondary" disabled={pending === user.id} onClick={() => grant(user.id, plan)}>
                    {t('grant', { plan: t(`plans.${plan}`) })}
                  </Button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </PanelState>
    </section>
  );
}
