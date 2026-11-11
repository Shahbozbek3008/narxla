'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { ReportStatus } from '@/lib/admin/types';
import { cn } from '@/lib/utils';
import { EmptyCard } from '../app/common/EmptyCard';
import { plainCard } from '../app/common/styles';
import { PanelHeader, PanelState } from './PanelChrome';
import { formatDateTime, useAdminAction, useAdminResource } from './useAdmin';

export function ReportsPanel() {
  const t = useTranslations('admin.reports');
  const { data, error, loading, reload } = useAdminResource('reports', (api) => api.reports('OPEN'));
  const { run, pending } = useAdminAction();

  const resolve = async (id: string, status: Exclude<ReportStatus, 'OPEN'>) => {
    if (await run(id, (api) => api.resolveReport(id, status), t(status === 'RESOLVED' ? 'resolved' : 'dismissed'))) reload();
  };

  return (
    <section className="flex flex-col gap-4">
      <PanelHeader title={t('title')} lead={t('lead')} onRefresh={reload} />
      <PanelState loading={loading && !data} error={error}>
        {data?.length === 0 && <EmptyCard dashed title={t('emptyTitle')} text={t('emptyText')} />}
        <div className="flex flex-col gap-2.5">
          {data?.map((report) => (
            <article key={report.id} className={cn(plainCard, 'flex flex-wrap items-center gap-4 p-4')}>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm/5 font-semibold">
                  {report.materialCode ?? t('wholeEstimate')} · <span className="font-mono text-xs text-fg-3">{report.estimateId}</span>
                </span>
                {report.comment && <span className="text-[13px] text-fg-2">{report.comment}</span>}
                <span className="text-xs text-fg-3">{formatDateTime(report.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={pending === report.id} onClick={() => resolve(report.id, 'RESOLVED')}>
                  {t('resolve')}
                </Button>
                <Button size="sm" variant="secondary" disabled={pending === report.id} onClick={() => resolve(report.id, 'DISMISSED')}>
                  {t('dismiss')}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </PanelState>
    </section>
  );
}
