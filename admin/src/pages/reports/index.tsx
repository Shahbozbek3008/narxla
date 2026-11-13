import { useState } from 'react';
import { useReports, type ReportStatus } from '@/entities/report';
import { ResolveReportActions } from '@/features/resolve-report';
import { dateTime } from '@/shared/lib';
import { EmptyState, PageHeader, QueryState, Segmented } from '@/shared/ui';

const STATUS_LABEL: Record<ReportStatus, string> = { OPEN: 'Ochiq', RESOLVED: 'Hal qilingan', DISMISSED: 'Rad etilgan' };
const STATUSES = Object.keys(STATUS_LABEL) as ReportStatus[];

export function ReportsPage() {
  const [status, setStatus] = useState<ReportStatus>('OPEN');
  const reports = useReports(status);

  return (
    <>
      <PageHeader
        title="Shikoyatlar"
        lead="Foydalanuvchilar smetadagi noto‘g‘ri narx haqida xabar beradi."
        actions={<Segmented label="Holat" value={status} onChange={setStatus} options={STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] }))} />}
      />
      <QueryState loading={reports.isPending} error={reports.error}>
        {reports.data?.length === 0 ? (
          <EmptyState>Bu holatda shikoyat yo‘q.</EmptyState>
        ) : (
          <div className="card divide-y divide-line">
            {reports.data?.map((report) => (
              <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm/5 font-semibold">{report.materialCode ?? 'Umumiy'}</p>
                  <p className="text-xs text-fg-3">
                    {dateTime(report.createdAt)} · smeta {report.estimateId}
                  </p>
                  {report.comment && <p className="mt-1 text-[13px] text-fg-2">{report.comment}</p>}
                </div>
                {report.status === 'OPEN' && <ResolveReportActions reportId={report.id} />}
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}
