'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LabourRate } from '@/lib/admin/types';
import { digitsOnly, fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { plainCard } from '../app/common/styles';
import { PanelHeader, PanelState } from './PanelChrome';
import { formatDateTime, useAdminAction, useAdminResource } from './useAdmin';

const FIELDS = ['minPrice', 'price', 'maxPrice'] as const;
type Field = (typeof FIELDS)[number];
type Draft = Record<Field, string>;

const MAX_DIGITS = 10;
const GRID = 'grid grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(96px,1fr))_96px] items-center gap-3 px-5';

const toDraft = (rate: LabourRate): Draft => ({
  minPrice: String(rate.minPrice),
  price: String(rate.price),
  maxPrice: String(rate.maxPrice),
});

function LabourRow({ rate, onSaved }: { rate: LabourRate; onSaved: () => void }) {
  const t = useTranslations('admin.labour');
  const { run, pending } = useAdminAction();
  const [draft, setDraft] = useState<Draft>(() => toDraft(rate));
  const values = { minPrice: Number(draft.minPrice), price: Number(draft.price), maxPrice: Number(draft.maxPrice) };
  const dirty = FIELDS.some((field) => values[field] !== rate[field]);
  const ordered = values.minPrice > 0 && values.minPrice <= values.price && values.price <= values.maxPrice;

  const save = async () => {
    if (await run(rate.code, (api) => api.updateLabour(rate.code, values), t('saved', { name: rate.name }))) onSaved();
  };

  return (
    <div className={cn(GRID, 'border-b border-line py-2.5')}>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm/5 font-medium">{rate.name}</span>
        <span className="text-[11px] text-fg-3">
          {rate.unit} · {formatDateTime(rate.updatedAt)}
        </span>
      </span>
      {FIELDS.map((field) => (
        <Input
          key={field}
          inputMode="numeric"
          aria-label={t(`columns.${field}`)}
          aria-invalid={dirty && !ordered}
          value={draft[field] ? fmt(Number(draft[field])) : ''}
          onChange={(event) => setDraft((current) => ({ ...current, [field]: digitsOnly(event.target.value, MAX_DIGITS) }))}
          className="h-9 text-right text-sm"
        />
      ))}
      <Button size="xs" disabled={!dirty || !ordered || pending !== null} onClick={save}>
        {t('save')}
      </Button>
    </div>
  );
}

export function LabourPanel() {
  const t = useTranslations('admin.labour');
  const { data, error, loading, reload } = useAdminResource('labour', (api) => api.labour());

  return (
    <section className="flex flex-col gap-4">
      <PanelHeader title={t('title')} lead={t('lead')} onRefresh={reload} />
      <PanelState loading={loading && !data} error={error}>
        <div className={cn(plainCard, 'overflow-x-auto')}>
          <div className="min-w-[680px]">
            <div className={cn(GRID, 'h-10 border-b border-line bg-surface-2 text-xs font-medium text-fg-3')}>
              <span>{t('columns.name')}</span>
              {FIELDS.map((field) => (
                <span key={field} className="text-right">
                  {t(`columns.${field}`)}
                </span>
              ))}
              <span />
            </div>
            {data?.map((rate) => (
              <LabourRow key={`${rate.code}-${rate.updatedAt}`} rate={rate} onSaved={reload} />
            ))}
          </div>
        </div>
      </PanelState>
    </section>
  );
}
