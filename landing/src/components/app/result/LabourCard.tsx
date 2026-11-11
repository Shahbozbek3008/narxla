import { useTranslations } from 'next-intl';
import { qtyLabel, type Line } from '@/lib/calc-engine';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { plainCard } from '../common/styles';
import { CATEGORY_COLOR } from './categories';

export function LabourCard({ lines, total }: { lines: Line[]; total: number }) {
  const t = useTranslations('app');

  return (
    <section className={cn(plainCard, 'overflow-hidden')}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold">{t('result.labour')}</h2>
        <span className="text-xs text-fg-3">{t('result.labourNote')}</span>
      </div>
      {lines.map((line) => (
        <div key={line.name} className="flex items-center gap-3 border-b border-line px-5 py-3 text-sm/5 tabular-nums">
          <span className="size-1.5 shrink-0 rounded-[2px]" style={{ background: CATEGORY_COLOR[line.cat] }} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span>{line.name}</span>
            <span className="text-xs/4 text-fg-3">
              {t('result.lineDetailSom', { qty: qtyLabel(line), price: fmt(line.price) })}
            </span>
          </span>
          <span className="font-semibold">{fmt(line.total)}</span>
        </div>
      ))}
      <div className="flex justify-between bg-surface-2 px-5 py-3.5 text-sm tabular-nums">
        <span className="text-fg-2">{t('result.labourTotal')}</span>
        <span className="font-semibold">{t('money', { value: fmt(total) })}</span>
      </div>
    </section>
  );
}
