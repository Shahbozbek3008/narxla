'use client';

import { Check, ExternalLink, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EmptyCard } from '../app/common/EmptyCard';
import { plainCard } from '../app/common/styles';
import { PanelHeader, PanelState } from './PanelChrome';
import { formatDateTime, useAdminAction, useAdminResource } from './useAdmin';

export function ReviewPanel() {
  const t = useTranslations('admin');
  const { data, error, loading, reload } = useAdminResource('review', (api) => api.observations('PENDING_REVIEW'));
  const { run, pending } = useAdminAction();

  const resolve = async (id: string, approve: boolean) => {
    const done = await run(id, (api) => (approve ? api.approve(id) : api.reject(id)), t(approve ? 'review.approved' : 'review.rejected'));
    if (done !== null) reload();
  };

  return (
    <section className="flex flex-col gap-4">
      <PanelHeader title={t('review.title')} lead={t('review.lead')} onRefresh={reload} />
      <PanelState loading={loading && !data} error={error}>
        {data?.length === 0 && <EmptyCard dashed title={t('review.emptyTitle')} text={t('review.emptyText')} />}
        <div className="flex flex-col gap-3">
          {data?.map((item) => (
            <article key={item.id} className={cn(plainCard, 'flex flex-wrap items-center gap-4 p-4')}>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[15px]/5 font-semibold">{item.listing.material.name}</span>
                <a
                  href={item.listing.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-1 text-[13px] text-accent-text hover:underline"
                >
                  <span className="truncate">
                    {item.listing.store.name} · {item.listing.url}
                  </span>
                  <ExternalLink size={12} strokeWidth={1.5} className="shrink-0" aria-hidden />
                </a>
                <span className="text-xs text-fg-3">
                  {item.reason} · {formatDateTime(item.observedAt)}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-5 text-right tabular-nums">
                <dt className="text-xs text-fg-3">{t('review.price')}</dt>
                <dt className="text-xs text-fg-3">{t('review.reference')}</dt>
                <dd className="font-display text-lg font-semibold">{fmt(item.unitPrice)}</dd>
                <dd className="font-display text-lg text-fg-2">{fmt(item.listing.material.referencePrice)}</dd>
              </dl>
              <div className="flex gap-2">
                <Button size="sm" disabled={pending === item.id} onClick={() => resolve(item.id, true)}>
                  <Check size={16} strokeWidth={2} aria-hidden />
                  {t('review.approve')}
                </Button>
                <Button size="sm" variant="destructive-outline" disabled={pending === item.id} onClick={() => resolve(item.id, false)}>
                  <X size={16} strokeWidth={2} aria-hidden />
                  {t('review.reject')}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </PanelState>
    </section>
  );
}
