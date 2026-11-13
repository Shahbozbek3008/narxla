import { useLabourRates } from '@/entities/labour-rate';
import { LabourRateEditor } from '@/features/edit-labour-rate';
import { date } from '@/shared/lib';
import { PageHeader, QueryState } from '@/shared/ui';

export function LabourPage() {
  const rates = useLabourRates();

  return (
    <>
      <PageHeader title="Usta narxlari" lead="Har bir ish turi uchun bozor oralig‘i. Smetadagi ish haqi va «Usta narxini tekshirish» shu qiymatlardan hisoblanadi." />
      <QueryState loading={rates.isPending} error={rates.error} rows={6}>
        <div className="card divide-y divide-line">
          {rates.data?.map((rate) => (
            <div key={rate.code} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm/5 font-semibold">{rate.name}</p>
                <p className="text-xs text-fg-3">
                  {rate.unit} uchun · yangilangan {date(rate.updatedAt)}
                </p>
              </div>
              <LabourRateEditor key={rate.updatedAt} rate={rate} />
            </div>
          ))}
        </div>
      </QueryState>
    </>
  );
}
