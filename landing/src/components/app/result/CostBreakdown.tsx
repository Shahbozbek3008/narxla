import { useTranslations } from 'next-intl';
import { WORK_IDS, type Estimate } from '@/lib/calc-engine';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { card } from '../common/styles';
import { CATEGORY_COLOR } from './categories';

type CostBreakdownProps = {
  result: Estimate;
  progress: number;
};

export function CostBreakdown({ result, progress }: CostBreakdownProps) {
  const t = useTranslations('app');
  const categories = WORK_IDS.flatMap((id) => {
    const amount = result.byCat[id];
    return amount ? [{ id, amount, share: amount / result.total }] : [];
  });

  return (
    <section className={cn(card, 'p-5')}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold">{t('result.breakdown')}</h2>
        <span className="text-[13px] text-fg-3 tabular-nums">{t('result.breakdownTotal', { value: fmt(result.total) })}</span>
      </div>
      <div className="mt-4 flex h-3 gap-[3px] overflow-hidden rounded-md" aria-hidden>
        {categories.map(({ id, share }) => (
          <span
            key={id}
            className="h-full transition-[width] duration-900 ease-(--ease-out-expo)"
            style={{ width: `${(share * 100 * progress).toFixed(2)}%`, background: CATEGORY_COLOR[id] }}
          />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,170px),1fr))] gap-x-6 gap-y-3 tabular-nums">
        {categories.map(({ id, amount, share }) => (
          <li key={id} className="flex items-start gap-2.5">
            <span className="mt-1.5 size-2 shrink-0 rounded-[2px]" style={{ background: CATEGORY_COLOR[id] }} />
            <span className="flex flex-col">
              <span className="text-[13px] text-fg-2">
                {t('result.breakdownShare', { name: t(`categories.${id}`), percent: Math.round(share * 100) })}
              </span>
              <span className="text-[15px] font-semibold">{t('money', { value: fmt(amount) })}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
