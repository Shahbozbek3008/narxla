import { useTranslations } from 'next-intl';
import type { Estimate } from '@/lib/calc-engine';
import { mln, rangeMln } from '@/lib/format';
import { cn } from '@/lib/utils';
import { card } from '../common/styles';

type KpiGridProps = {
  result: Estimate;
  progress: number;
};

const VALUE = 'mt-2 font-display text-[clamp(22px,2.2vw,28px)] leading-[1.2] font-semibold tracking-[-0.03em] whitespace-nowrap tabular-nums';

export function KpiGrid({ result, progress: k }: KpiGridProps) {
  const t = useTranslations('app.result.kpi');

  const items = [
    { label: t('materials'), value: mln(result.matTotal * k), note: t('materialsNote', { count: result.mats.length }) },
    { label: t('labour'), value: mln(result.labTotal * k), note: t('labourNote', { count: result.lab.length }) },
    {
      label: t('duration'),
      value: `${Math.round(result.dMin * k)}–${Math.round(result.dMax * k)}`,
      note: t('durationNote'),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <div className={cn(card, 'relative overflow-hidden border-line-2 p-[18px]')}>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-15 -right-10 h-40 w-45 bg-[radial-gradient(circle,var(--glow),transparent_70%)]"
        />
        <div className="relative text-[13px] text-fg-2">{t('total')}</div>
        <div className={cn(VALUE, 'relative text-accent-text')}>{rangeMln(result.low * k, result.high * k)}</div>
        <div className="relative mt-1.5 text-xs text-fg-3">{t('totalNote', { reserve: result.reserve })}</div>
      </div>
      {items.map((item) => (
        <div key={item.label} className={cn(card, 'p-[18px]')}>
          <div className="text-[13px] text-fg-2">{item.label}</div>
          <div className={VALUE}>{item.value}</div>
          <div className="mt-1.5 text-xs text-fg-3">{item.note}</div>
        </div>
      ))}
    </div>
  );
}
