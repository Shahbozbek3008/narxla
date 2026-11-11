'use client';

import { useTranslations } from 'next-intl';
import type { MaterialLine } from '@/lib/calc-engine';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useUi, type SortKey } from '@/store/ui';
import { SearchInput } from '../common/SearchInput';
import { useEngineText } from '../common/useEngineText';
import { plainCard } from '../common/styles';
import { CATEGORY_COLOR } from './categories';
import { LinePriceMark } from './PriceStatusBadge';

const GRID = 'grid grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] gap-4 px-5';
const COLUMNS: SortKey[] = ['name', 'qty', 'price', 'total'];

type NamedLine = MaterialLine & { name: string };

const compare = (key: SortKey) => (a: NamedLine, b: NamedLine) =>
  key === 'name' ? a.name.localeCompare(b.name) : a[key] - b[key];

export function MaterialsTable({ lines, total }: { lines: MaterialLine[]; total: number }) {
  const t = useTranslations('app.result');
  const tApp = useTranslations('app');
  const { materialQuery, sortKey, sortDir, setMaterialQuery, sortBy } = useUi();
  const { lineName, lineQty } = useEngineText();

  const query = materialQuery.trim().toLowerCase();
  const rows = lines
    .map((line) => ({ ...line, name: lineName(line) }))
    .filter((line) => line.name.toLowerCase().includes(query))
    .sort((a, b) => compare(sortKey)(a, b) * sortDir);

  return (
    <section className={cn(plainCard, 'overflow-hidden')}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <span className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold">{t('materials')}</h2>
          <span className="rounded-md bg-surface-3 px-[7px] text-xs/5 text-fg-2 tabular-nums">{rows.length}</span>
          <span className="text-xs text-fg-3">{t('reserveNote')}</span>
        </span>
        <SearchInput
          size="sm"
          wrapperClassName="flex-[0_1_240px]"
          value={materialQuery}
          placeholder={t('searchMaterials')}
          aria-label={t('searchMaterials')}
          onChange={(event) => setMaterialQuery(event.target.value)}
        />
      </div>

      <div className={cn(GRID, 'border-b border-line bg-surface-2 max-sm:hidden')}>
        {COLUMNS.map((key, index) => {
          const active = sortKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => sortBy(key)}
              className={cn(
                'flex h-9 items-center gap-1 text-xs font-medium transition-colors duration-150 hover:text-fg',
                index > 0 && 'justify-end',
                active ? 'text-fg' : 'text-fg-3',
              )}
            >
              {t(`columns.${key}`)}
              <span className="w-2 text-[11px]" aria-hidden>
                {active ? (sortDir > 0 ? '↑' : '↓') : ''}
              </span>
            </button>
          );
        })}
      </div>

      {rows.map((line) => (
        <div key={`${line.cat}-${line.code}`} className="border-b border-line tabular-nums">
          <div className={cn(GRID, 'items-center py-3 text-sm/5 transition-colors duration-150 hover:bg-surface-2 max-sm:hidden')}>
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="size-1.5 shrink-0 rounded-[2px]" style={{ background: CATEGORY_COLOR[line.cat] }} />
              <span className="truncate">{line.name}</span>
              <LinePriceMark line={line} />
            </span>
            <span className="text-right text-fg-2">{lineQty(line)}</span>
            <span className="text-right text-fg-2">{fmt(line.price)}</span>
            <span className="text-right font-semibold">{fmt(line.total)}</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 sm:hidden">
            <span className="size-1.5 shrink-0 rounded-[2px]" style={{ background: CATEGORY_COLOR[line.cat] }} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1.5 text-sm/5">
                {line.name}
                <LinePriceMark line={line} />
              </span>
              <span className="text-xs/4 text-fg-3">
                {t('lineDetail', { qty: lineQty(line), price: fmt(line.price) })}
              </span>
            </span>
            <span className="text-sm font-semibold">{fmt(line.total)}</span>
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <p className="border-b border-line px-5 py-8 text-center text-sm text-fg-3">{t('noMaterials', { query: materialQuery })}</p>
      )}

      <div className="flex justify-between bg-surface-2 px-5 py-3.5 text-sm tabular-nums">
        <span className="text-fg-2">{t('materialsTotal')}</span>
        <span className="font-semibold">{tApp('money', { value: fmt(total) })}</span>
      </div>
    </section>
  );
}
