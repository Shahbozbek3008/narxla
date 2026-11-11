import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

const KPI_COUNT = 4;

export function ResultSkeleton() {
  const t = useTranslations('app.result');

  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: KPI_COUNT }, (_, index) => (
          <div key={index} className="flex h-29 flex-col gap-3 rounded-2xl border border-line bg-surface p-[18px]">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-[26px] w-4/5" />
            <Skeleton className="h-2.5 w-2/5" />
          </div>
        ))}
      </div>
      <Skeleton className="h-35 rounded-2xl border border-line" />
      <Skeleton className="h-90 rounded-2xl border border-line" />
      <p className="text-center text-sm text-fg-3">{t('loading')}</p>
    </div>
  );
}
