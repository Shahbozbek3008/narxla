'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { fetchPriceBook } from '@/lib/prices/api';
import type { MaterialCode } from '@/lib/prices/catalog';
import { cn } from '@/lib/utils';
import { SourceBadge } from '../app/calcs/SourceBadge';
import { SearchInput } from '../app/common/SearchInput';
import { plainCard } from '../app/common/styles';
import { MaterialListings } from './MaterialListings';
import { PanelHeader, PanelState } from './PanelChrome';
import { useAdminResource } from './useAdmin';

export function ListingsPanel() {
  const t = useTranslations('admin.listings');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const { data, error, loading, reload } = useAdminResource('catalog', async (api) => {
    const [materials, stores, book] = await Promise.all([api.materials(), api.stores(), fetchPriceBook()]);
    return { materials, stores, book };
  });

  const normalized = query.trim().toLowerCase();
  const materials = (data?.materials ?? []).filter(
    (material) => !normalized || `${material.code} ${material.name}`.toLowerCase().includes(normalized),
  );
  const current = data?.materials.find((material) => material.code === selected) ?? null;

  return (
    <section className="flex flex-col gap-4">
      <PanelHeader title={t('title')} lead={t('lead')} onRefresh={reload} />
      <PanelState loading={loading && !data} error={error}>
        <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className={cn(plainCard, 'flex flex-col overflow-hidden lg:sticky lg:top-4')}>
            <div className="border-b border-line p-3">
              <SearchInput
                size="sm"
                value={query}
                placeholder={t('search')}
                aria-label={t('search')}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <ul className="max-h-[70dvh] overflow-y-auto">
              {materials.map((material) => {
                const quote = data?.book.materials[material.code as MaterialCode];
                const active = material.code === selected;
                return (
                  <li key={material.code}>
                    <button
                      type="button"
                      aria-current={active}
                      onClick={() => setSelected(material.code)}
                      className={cn(
                        'flex w-full items-center gap-3 border-b border-line px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-surface-2',
                        active && 'bg-accent-soft hover:bg-accent-soft',
                      )}
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm/5 font-medium">{material.name}</span>
                        <span className="truncate font-mono text-[11px] text-fg-3">{material.code}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <SourceBadge status={quote?.status ?? 'estimated'} />
                        <span className="text-[11px] text-fg-3 tabular-nums">{t('count', { count: material._count.listings })}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {current && data ? (
            <MaterialListings key={current.code} material={current} stores={data.stores} onChange={reload} />
          ) : (
            <p className={cn(plainCard, 'px-6 py-16 text-center text-sm text-fg-2')}>{t('pick')}</p>
          )}
        </div>
      </PanelState>
    </section>
  );
}
