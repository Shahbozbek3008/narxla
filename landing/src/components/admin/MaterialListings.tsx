'use client';

import { ExternalLink, Play, Power, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminMaterial, AdminStore, CheckResult, ObservationStatus } from '@/lib/admin/types';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { plainCard } from '../app/common/styles';
import { ListingForm } from './ListingForm';
import { PanelState } from './PanelChrome';
import { formatDateTime, useAdminAction, useAdminResource } from './useAdmin';

const STATUS_TONE: Record<ObservationStatus, BadgeTone> = {
  ACCEPTED: 'success',
  PENDING_REVIEW: 'accent',
  REJECTED: 'neutral',
};

type MaterialListingsProps = {
  material: AdminMaterial;
  stores: AdminStore[];
  onChange: () => void;
};

export function MaterialListings({ material, stores, onChange }: MaterialListingsProps) {
  const t = useTranslations('admin');
  const { data, error, loading, reload } = useAdminResource(`listings:${material.code}`, (api) => api.listings(material.code));
  const { run, pending } = useAdminAction();

  const refresh = () => {
    reload();
    onChange();
  };

  const checkMessage = (result: CheckResult) =>
    result.outcome === 'OK'
      ? t('listings.checked', { price: fmt(result.price), status: t(`status.${result.status}`) })
      : t('listings.checkFailed', { error: result.error });

  const check = async (id: string) => {
    if (await run(id, (api) => api.checkListing(id), checkMessage)) refresh();
  };

  const toggle = async (id: string, active: boolean) => {
    if (await run(id, (api) => api.setListingActive(id, active))) refresh();
  };

  const remove = async (id: string) => {
    if (!window.confirm(t('listings.confirmDelete'))) return;
    const done = await run(id, (api) => api.deleteListing(id).then(() => true), t('listings.deleted'));
    if (done) refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={cn(plainCard, 'flex flex-wrap items-center justify-between gap-3 px-5 py-4')}>
        <div className="min-w-0">
          <h2 className="text-lg/6 font-semibold">{material.name}</h2>
          <p className="font-mono text-xs text-fg-3">
            {material.code} · {material.unit}
          </p>
        </div>
        <span className="text-right tabular-nums">
          <span className="block text-xs text-fg-3">{t('listings.reference')}</span>
          <span className="font-display text-lg font-semibold">{t('money', { value: fmt(material.referencePrice) })}</span>
        </span>
      </div>

      <ListingForm material={material} stores={stores} onCreated={refresh} />

      <PanelState loading={loading && !data} error={error}>
        {data?.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line-2 px-6 py-10 text-center text-sm text-fg-2">{t('listings.empty')}</p>
        )}
        <div className="flex flex-col gap-2.5">
          {data?.map((listing) => {
            const [latest] = listing.observations;
            const busy = pending === listing.id;
            return (
              <article key={listing.id} className={cn(plainCard, 'flex flex-col gap-3 p-4', !listing.active && 'opacity-60')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-sm/5 font-semibold">
                      {listing.store.name}
                      {!listing.active && <Badge tone="outline">{t('listings.inactive')}</Badge>}
                    </span>
                    {listing.title && <span className="truncate text-[13px] text-fg-2">{listing.title}</span>}
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 items-center gap-1 text-xs text-accent-text hover:underline"
                    >
                      <span className="truncate">{listing.url}</span>
                      <ExternalLink size={12} strokeWidth={1.5} className="shrink-0" aria-hidden />
                    </a>
                  </div>
                  <div className="text-right tabular-nums">
                    {latest ? (
                      <>
                        <span className="block font-display text-lg font-semibold">{fmt(latest.unitPrice)}</span>
                        <Badge tone={STATUS_TONE[latest.status]} shape="status" dot>
                          {t(`status.${latest.status}`)}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-xs text-fg-3">{t('listings.noPrice')}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="text-xs text-fg-3 tabular-nums">
                    {t('listings.meta', { pack: listing.packSize, checked: formatDateTime(listing.lastCheckedAt) })}
                    {listing.lastError && <span className="text-danger"> · {listing.lastError}</span>}
                  </span>
                  <div className="flex gap-1.5">
                    <Button size="xs" variant="secondary" disabled={busy || !listing.active} onClick={() => check(listing.id)}>
                      <Play size={14} strokeWidth={1.75} aria-hidden />
                      {t('listings.check')}
                    </Button>
                    <Button size="xs" variant="ghost" disabled={busy} onClick={() => toggle(listing.id, !listing.active)}>
                      <Power size={14} strokeWidth={1.75} aria-hidden />
                      {listing.active ? t('listings.deactivate') : t('listings.activate')}
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      aria-label={t('listings.delete')}
                      disabled={busy}
                      onClick={() => remove(listing.id)}
                      className="text-danger hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </PanelState>
    </div>
  );
}
