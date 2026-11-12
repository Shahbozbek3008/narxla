'use client';

import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CALC_CATS, CALCULATORS, CAT_ICON, calculatorStatus } from '@/lib/calc-engine';
import { cn } from '@/lib/utils';
import { useCalc, type CalcFilter } from '@/store/calc';
import { usePriceBook } from '@/store/prices';
import { EmptyCard } from '../common/EmptyCard';
import { FilterTabs } from '../common/FilterTabs';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { useEngineText } from '../common/useEngineText';
import { CalcTile } from './CalcTile';
import { PathIcon } from './PathIcon';

const FILTERS: CalcFilter[] = ['all', ...CALC_CATS];
const SEARCH_SHORTCUT = '/';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

function useSearchShortcut() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== SEARCH_SHORTCUT || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      event.preventDefault();
      ref.current?.focus();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return ref;
}

export function CalcCatalog() {
  const t = useTranslations('app.calcs');
  const { cat, query, setCat, setQuery } = useCalc();
  const book = usePriceBook();
  const { calcName, calcDesc } = useEngineText();
  const searchRef = useSearchShortcut();

  const normalized = query.trim().toLowerCase();
  const found = CALCULATORS.filter(
    (calculator) => !normalized || `${calcName(calculator)} ${calcDesc(calculator)}`.toLowerCase().includes(normalized),
  );
  const countOf = (filter: CalcFilter) =>
    filter === 'all' ? found.length : found.filter((calculator) => calculator.cat === filter).length;
  const groups = CALC_CATS.filter((id) => cat === 'all' || id === cat)
    .map((id) => ({ id, items: found.filter((calculator) => calculator.cat === id) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        title={t('title')}
        subtitle={t('lead', { count: CALCULATORS.length })}
        actionsClassName="max-sm:w-full"
        actions={
          <span className="relative block w-full sm:w-[360px]">
            <SearchInput
              ref={searchRef}
              wrapperClassName="w-full"
              className="sm:pr-10"
              value={query}
              placeholder={t('search')}
              aria-label={t('search')}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && setQuery('')}
            />
            {!query && (
              <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden h-5 -translate-y-1/2 place-items-center rounded-md border border-line-2 bg-surface-2 px-1.5 font-mono text-[11px] text-fg-3 sm:grid">
                {SEARCH_SHORTCUT}
              </kbd>
            )}
          </span>
        }
      />

      <FilterTabs
        id="calcs-category-filter"
        label={t('categoriesTitle')}
        value={cat}
        onChange={setCat}
        options={FILTERS.map((filter) => ({
          value: filter,
          label: t(`categories.${filter}`),
          count: countOf(filter),
          icon: <PathIcon path={CAT_ICON[filter]} size={16} />,
        }))}
      />

      {groups.map(({ id, items }) => (
        <section key={id} aria-labelledby={`calc-group-${id}`} className="flex flex-col gap-3">
          <div className={cn('flex items-center gap-2.5', cat !== 'all' && 'sr-only')}>
            <PathIcon path={CAT_ICON[id]} size={16} />
            <h2 id={`calc-group-${id}`} className="text-[15px]/6 font-semibold tracking-[-0.01em]">
              {t(`categories.${id}`)}
            </h2>
            <span className="rounded-md bg-surface-3 px-1.5 text-[11px]/[18px] font-semibold text-fg-3 tabular-nums">{items.length}</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((calculator) => (
              <CalcTile key={calculator.id} calculator={calculator} status={calculatorStatus(calculator, book)} query={normalized} />
            ))}
          </div>
        </section>
      ))}

      {groups.length === 0 && (
        <EmptyCard
          dashed
          icon={<SearchX size={18} strokeWidth={1.5} />}
          title={t('emptyTitle')}
          text={t('emptyText')}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery('');
                setCat('all');
              }}
            >
              {t('clearSearch')}
            </Button>
          }
        />
      )}
    </div>
  );
}
