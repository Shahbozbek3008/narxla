import { useTranslations } from 'next-intl';
import { FeatureCard, FeatureIntro } from './FeatureCard';
import { cn } from '@/lib/utils';

type Room = [name: string, area: string];

const ACTIVE_ROOM = 1;
const ROOM_STYLES = [
  'row-span-2 rounded-l-[7px] bg-surface-2',
  'bg-accent-soft text-accent-text shadow-[inset_0_0_0_1px_var(--accent)]',
  'rounded-tr-[7px] bg-surface-2',
  'bg-surface-2',
  'rounded-br-[7px] bg-surface-2',
];

export function PlanCard() {
  const t = useTranslations('features.plan');
  const rooms = t.raw('rooms') as Room[];

  return (
    <FeatureCard>
      <FeatureIntro title={t('title')} text={t('text')} />
      <div
        aria-hidden
        className="mt-auto grid grid-cols-[1.3fr_1fr_.8fr] grid-rows-[64px_48px] gap-[3px] rounded-[10px] bg-line-2 p-[3px] text-[11px]/[14px] tabular-nums"
      >
        {rooms.map(([name, area], index) => (
          <div key={name} className={cn('flex min-w-0 flex-col justify-between p-2', ROOM_STYLES[index])}>
            <span className={cn('truncate', index !== ACTIVE_ROOM && 'text-fg-2')}>{name}</span>
            <span className="font-semibold">{area}</span>
          </div>
        ))}
      </div>
    </FeatureCard>
  );
}
