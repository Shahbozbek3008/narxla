import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { STATUS_LABEL, StatusBadge, useObservations, type ObservationStatus, type ReviewItem } from '@/entities/observation';
import { ReviewActions } from '@/features/review-observation';
import { cn, dateTime, fmt } from '@/shared/lib';
import { EmptyState, PageHeader, QueryState, Segmented } from '@/shared/ui';

const STATUSES: ObservationStatus[] = ['PENDING_REVIEW', 'ACCEPTED', 'REJECTED'];

function deviation(item: ReviewItem) {
  const reference = item.listing.material.referencePrice;
  return reference > 0 ? Math.round(((item.unitPrice - reference) / reference) * 100) : 0;
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const delta = deviation(item);
  return (
    <article className="card flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm/5 font-semibold">{item.listing.material.name}</span>
          <span className="text-[13px] text-fg-2">
            {item.listing.store.name} · {dateTime(item.observedAt)}
          </span>
          <a href={item.listing.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1 text-xs text-accent-text hover:underline">
            <span className="truncate">{item.listing.url}</span>
            <ExternalLink size={12} strokeWidth={1.5} className="shrink-0" aria-hidden />
          </a>
        </div>
        <div className="flex flex-col items-end gap-1 text-right tabular-nums">
          <span className="text-lg font-semibold">{fmt(item.unitPrice)}</span>
          <span className="text-xs text-fg-3">bazaviy: {fmt(item.listing.material.referencePrice)}</span>
          <span className={cn('text-xs font-semibold', delta > 0 ? 'text-danger' : 'text-success')}>
            {delta > 0 ? '+' : ''}
            {delta}%
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <span className="flex flex-wrap items-center gap-2 text-xs text-fg-3">
          <StatusBadge status={item.status} />
          {item.reason}
        </span>
        {item.status === 'PENDING_REVIEW' && <ReviewActions observationId={item.id} />}
      </div>
    </article>
  );
}

export function ReviewPage() {
  const [status, setStatus] = useState<ObservationStatus>('PENDING_REVIEW');
  const observations = useObservations(status);

  return (
    <>
      <PageHeader
        title="Narxlarni tekshirish"
        lead="Scraper bazaviy narxdan keskin farq qilgan narxlarni shu yerga yuboradi. Qabul qilingan narx smetalarda ishlatiladi."
        actions={<Segmented label="Holat" value={status} onChange={setStatus} options={STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] }))} />}
      />
      <QueryState loading={observations.isPending} error={observations.error}>
        {observations.data?.length === 0 ? (
          <EmptyState>Bu holatda narx yo‘q.</EmptyState>
        ) : (
          <div className="flex flex-col gap-2.5">
            {observations.data?.map((item) => (
              <ReviewCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}
