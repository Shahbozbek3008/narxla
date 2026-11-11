'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CALC_CATS, CALCULATORS, CAT_ICON, calculatorStatus } from '@/lib/calc-engine';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useCalc, type CalcFilter } from '@/store/calc';
import { usePriceBook } from '@/store/prices';
import { EmptyCard } from '../common/EmptyCard';
import { PageHeader } from '../common/PageHeader';
import { SearchInput } from '../common/SearchInput';
import { useEngineText } from '../common/useEngineText';
import { card, interactiveCard, sectionLabel } from '../common/styles';
import { PathIcon } from './PathIcon';
import { SourceBadge } from './SourceBadge';

const FILTERS: CalcFilter[] = ['all', ...CALC_CATS];

export function CalcCatalog() {
  const t = useTranslations('app.calcs');
  const { cat, query, setCat, setQuery } = useCalc();
  const book = usePriceBook();
  const { calcName, calcDesc } = useEngineText();

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
        actions={
          <SearchInput
            wrapperClassName="w-[340px] max-w-full min-w-[220px]"
            value={query}
            placeholder={t('search')}
            aria-label={t('search')}
            onChange={(event) => setQuery(event.target.value)}
          />
        }
      />

      <div className="grid items-start gap-8 md:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label={t('categoriesTitle')} className="sticky top-6 hidden flex-col gap-0.5 md:flex">
          <p className={cn(sectionLabel, 'px-2.5 pb-2')}>{t('categoriesTitle')}</p>
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={cat === filter}
              onClick={() => setCat(filter)}
              className="flex h-[38px] items-center gap-2.5 rounded-[9px] px-2.5 text-left text-sm font-medium text-fg-2 transition-colors duration-150 hover:bg-surface-2 hover:text-fg aria-pressed:bg-surface-3 aria-pressed:text-fg aria-pressed:shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <PathIcon path={CAT_ICON[filter]} size={16} />
              <span className="flex-1 truncate">{t(`categories.${filter}`)}</span>
              <span className="text-xs text-fg-3 tabular-nums">{countOf(filter)}</span>
            </button>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:hidden">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                aria-pressed={cat === filter}
                onClick={() => setCat(filter)}
                className="h-[34px] shrink-0 rounded-full border border-line-2 px-3 text-[13px] font-medium whitespace-nowrap text-fg-2 aria-pressed:border-fg-3 aria-pressed:bg-surface-3 aria-pressed:text-fg"
              >
                {t(`categories.${filter}`)}
                <span className="ml-1.5 text-fg-3">{countOf(filter)}</span>
              </button>
            ))}
          </div>

          {groups.map(({ id, items }) => (
            <section key={id} className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent-text">
                  <PathIcon path={CAT_ICON[id]} size={15} />
                </span>
                <h2 className="font-display text-[17px]/6 font-semibold tracking-[-0.01em]">{t(`categories.${id}`)}</h2>
                <span className="text-[13px] text-fg-3 tabular-nums">{items.length}</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-3">
                {items.map((calculator) => (
                  <Link
                    key={calculator.id}
                    href={routes.calc(calculator.id)}
                    className={cn(card, interactiveCard, 'flex min-h-37 flex-col gap-3.5 p-4 active:-translate-y-px')}
                  >
                    <span className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-xl border border-line-2 bg-surface-2 text-accent-text">
                        <PathIcon path={calculator.icon} size={22} />
                      </span>
                      <SourceBadge status={calculatorStatus(calculator, book)} />
                    </span>
                    <span className="mt-auto flex flex-col gap-1">
                      <span className="text-[15px]/5 font-semibold tracking-[-0.01em]">{calcName(calculator)}</span>
                      <span className="line-clamp-2 text-[13px]/[18px] text-fg-3">{calcDesc(calculator)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {groups.length === 0 && <EmptyCard dashed title={t('emptyTitle')} text={t('emptyText')} />}
        </div>
      </div>
    </div>
  );
}
