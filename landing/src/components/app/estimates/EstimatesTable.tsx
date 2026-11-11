import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../common/StatusBadge';
import { plainCard } from '../common/styles';
import type { ProjectRow } from './useProjectRows';

const GRID =
  'grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.1fr)] items-center gap-4 px-5';

export function EstimatesTable({ rows }: { rows: ProjectRow[] }) {
  const t = useTranslations('app.list.columns');

  return (
    <div className={cn(plainCard, 'overflow-hidden')}>
      <div className={cn(GRID, 'border-b border-line bg-surface-2 py-2.5 text-xs/4 text-fg-3')}>
        <span>{t('name')}</span>
        <span>{t('area')}</span>
        <span>{t('quality')}</span>
        <span className="text-right">{t('budget')}</span>
        <span className="text-right">{t('status')}</span>
      </div>
      {rows.map((row) => (
        <Link
          key={row.id}
          href={routes.estimate(row.id)}
          className={cn(
            GRID,
            'border-b border-line py-3.5 text-sm/5 tabular-nums transition-colors duration-150 last:border-b-0 hover:bg-surface-2 focus-visible:-outline-offset-2',
          )}
        >
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{row.name}</span>
            <span className="text-xs text-fg-3">{row.date}</span>
          </span>
          <span className="text-fg-2">{row.area}</span>
          <span className="text-fg-2">{row.quality}</span>
          <span className="text-right font-semibold">{row.range}</span>
          <span className="flex justify-end">
            <StatusBadge status={row.status} className="text-xs/[22px]" />
          </span>
        </Link>
      ))}
    </div>
  );
}
