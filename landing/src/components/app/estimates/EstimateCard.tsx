import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { WORK_IDS } from '@/lib/calc-engine';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../common/StatusBadge';
import { card, interactiveCard } from '../common/styles';
import { ROOM_ICONS, WORK_ICONS } from '../wizard/options';
import { FloorPlanThumb } from './FloorPlanThumb';
import type { ProjectRow } from './useProjectRows';

export function EstimateCard({ row }: { row: ProjectRow }) {
  const t = useTranslations('app');
  const RoomIcon = ROOM_ICONS[row.input.room];
  const works = WORK_IDS.filter((id) => row.input.works[id]);

  return (
    <Link href={routes.estimate(row.id)} className={cn(card, interactiveCard, 'group flex flex-col overflow-hidden text-left')}>
      <div className="relative border-b border-line bg-surface-2">
        <div
          aria-hidden
          className="grid-bg absolute inset-0 bg-size-[14px_14px] opacity-60 [mask-image:radial-gradient(ellipse_75%_80%_at_50%_50%,#000,transparent)]"
        />
        <FloorPlanThumb input={row.input} className="relative h-40 w-full" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/85 py-0.5 pr-2.5 pl-2 text-xs/5 font-medium text-fg-2 backdrop-blur-sm">
          <RoomIcon size={13} strokeWidth={1.75} aria-hidden />
          {row.roomName}
        </span>
        <StatusBadge status={row.status} className="absolute top-3 right-3" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[15px]/[22px] font-semibold">{row.name}</span>
            <span className="text-[13px]/5 text-fg-3">{t('list.meta', { area: row.area, quality: row.quality, date: row.date })}</span>
          </span>
          <ArrowUpRight
            size={18}
            strokeWidth={1.75}
            className="mt-0.5 shrink-0 text-fg-3 transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
            aria-hidden
          />
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3.5">
          <span className="flex min-w-0 flex-col">
            <span className="text-xs/4 text-fg-3">{t('list.columns.budget')}</span>
            <span className="font-display text-xl/7 font-semibold tracking-[-0.02em] whitespace-nowrap tabular-nums">{row.range}</span>
          </span>
          <ul className="flex shrink-0 gap-1" aria-label={t('wizard.steps.works')}>
            {works.map((id) => {
              const Icon = WORK_ICONS[id];
              return (
                <li
                  key={id}
                  title={t(`works.${id}.name`)}
                  className="grid size-7 place-items-center rounded-lg border border-line bg-surface-2 text-fg-2"
                >
                  <Icon size={14} strokeWidth={1.75} aria-hidden />
                  <span className="sr-only">{t(`works.${id}.name`)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Link>
  );
}
