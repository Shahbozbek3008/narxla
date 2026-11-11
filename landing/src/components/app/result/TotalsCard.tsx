import { useTranslations } from 'next-intl';
import type { Estimate } from '@/lib/calc-engine';
import { fmt, rangeMln } from '@/lib/format';
import { cn } from '@/lib/utils';
import { card } from '../common/styles';

export function TotalsCard({ result }: { result: Estimate }) {
  const t = useTranslations('app');
  const money = (value: number) => t('money', { value: fmt(value) });

  const rows = [
    { label: t('result.totals.materials'), value: money(result.matTotal) },
    { label: t('result.totals.labour'), value: money(result.labTotal) },
  ];

  return (
    <section className={cn(card, 'overflow-hidden')}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold">{t('result.summary')}</h2>
        <span className="text-xs text-fg-3">{t('result.summaryNote')}</span>
      </div>
      <dl className="flex flex-col tabular-nums">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4 border-b border-line px-5 py-3 text-sm/5">
            <dt className="text-fg-2">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 px-5 py-4">
          <dt className="text-base font-semibold">{t('result.totals.total')}</dt>
          <dd className="font-display text-xl font-semibold tracking-[-0.02em]">{money(result.total)}</dd>
        </div>
        <div className="mx-5 mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3">
          <dt className="text-sm font-semibold">{t('result.totals.range')}</dt>
          <dd className="font-display text-xl font-semibold tracking-[-0.02em] text-accent-text">
            {t('mlnSom', { value: rangeMln(result.low, result.high) })}
          </dd>
        </div>
      </dl>
    </section>
  );
}
