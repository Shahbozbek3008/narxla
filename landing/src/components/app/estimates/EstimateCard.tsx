import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../common/StatusBadge';
import { card, interactiveCard } from '../common/styles';
import type { ProjectRow } from './useProjectRows';

const MAX_PLAN_WIDTH = 80;
const PLAN_BASE = 56;

export function EstimateCard({ row }: { row: ProjectRow }) {
  const t = useTranslations('app.list');
  const width = Math.round(Math.min(MAX_PLAN_WIDTH, PLAN_BASE * Math.sqrt(row.ratio)));
  const height = Math.round(width / row.ratio);

  return (
    <Link
      href={routes.estimate(row.id)}
      className={cn(card, interactiveCard, 'flex flex-col overflow-hidden text-left')}
    >
      <div className="grid-bg relative grid h-26 place-items-center border-b border-line bg-surface-2 bg-size-[16px_16px]">
        <span className="rounded-[2px] border-[1.5px] border-fg-3 bg-surface" style={{ width, height }} aria-hidden />
        <StatusBadge status={row.status} className="absolute top-3 right-3" />
      </div>
      <div className="flex flex-col gap-0.5 p-4">
        <span className="text-[15px]/[22px] font-semibold">{row.name}</span>
        <span className="text-[13px]/5 text-fg-3">{t('meta', { area: row.area, quality: row.quality, date: row.date })}</span>
        <span className="mt-2.5 font-display text-xl/7 font-semibold tracking-[-0.02em] tabular-nums">{row.range}</span>
      </div>
    </Link>
  );
}
