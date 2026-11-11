import { Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { routes } from '@/lib/routes';
import { EmptyCard } from '../common/EmptyCard';

const SKELETON_COUNT = 6;

export function EstimatesSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <Skeleton className="h-26 rounded-none" />
          <div className="flex flex-col gap-2.5 p-4">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="mt-1.5 h-[22px] w-[70%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FloorPlanIllustration() {
  return (
    <div className="relative h-30 w-44" aria-hidden>
      <div className="absolute inset-2 rounded-[4px] border-[1.5px] border-fg-3 bg-surface" />
      <div className="absolute top-2 bottom-10 left-25 w-[1.5px] bg-fg-3" />
      <div className="absolute top-20 right-2 left-25 h-[1.5px] bg-fg-3" />
      <div className="absolute bottom-1.5 left-9 h-[5px] w-[30px] bg-surface" />
      <div className="absolute bottom-[9px] left-9 size-7 rounded-tr-[28px] border-t-[1.5px] border-r-[1.5px] border-dashed border-fg-3" />
      <div className="absolute top-1 left-13 h-2 w-9 border-[1.5px] border-fg-3 bg-surface" />
      <div className="absolute -top-1.5 -right-0.5 grid size-9 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_0_0_6px_var(--bg),0_8px_24px_-4px_var(--glow)]">
        <Plus size={18} strokeWidth={2} />
      </div>
    </div>
  );
}

export function EstimatesEmpty() {
  const t = useTranslations('app.list');

  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line-2 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,var(--accent-soft),transparent_70%)] px-6 py-[clamp(48px,8vw,80px)] text-center">
      <FloorPlanIllustration />
      <h2 className="mt-7 font-display text-2xl/8 font-semibold tracking-[-0.02em]">{t('emptyTitle')}</h2>
      <p className="mt-2 max-w-[400px] text-pretty text-fg-2">{t('emptyText')}</p>
      <Button asChild size="lg" className="mt-6 gap-2 px-[18px] shadow-[0_8px_24px_-8px_var(--glow)]">
        <Link href={routes.newEstimate}>{t('emptyCta')}</Link>
      </Button>
    </div>
  );
}

export function EstimatesNotFound({ onClear }: { onClear: () => void }) {
  const t = useTranslations('app.list');

  return (
    <EmptyCard
      icon={<Search size={18} strokeWidth={1.5} />}
      title={t('notFoundTitle')}
      text={t('notFoundText')}
      action={
        <Button variant="secondary" size="sm" onClick={onClear}>
          {t('clear')}
        </Button>
      }
    />
  );
}
