import { Skeleton } from '@/components/ui/skeleton';

const ROWS = 3;

export function SettingsSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-(--shadow-card)" aria-busy>
      <div className="flex flex-col gap-2 px-4 pt-5 pb-4 sm:px-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
      <div className="divide-y divide-line border-t border-line">
        {Array.from({ length: ROWS }, (_, index) => (
          <div key={index} className="grid items-center gap-x-8 gap-y-2.5 px-4 py-4 sm:px-6 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-10 w-full max-w-md rounded-[10px]" />
          </div>
        ))}
      </div>
    </section>
  );
}
