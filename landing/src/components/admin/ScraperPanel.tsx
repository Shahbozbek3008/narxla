'use client';

import { Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmptyCard } from '../app/common/EmptyCard';
import { plainCard } from '../app/common/styles';
import { PanelHeader, PanelState } from './PanelChrome';
import { formatDateTime, useAdminAction, useAdminResource } from './useAdmin';

const COUNTERS = ['total', 'accepted', 'flagged', 'failed', 'blocked'] as const;
const GRID = 'grid grid-cols-[minmax(150px,1.4fr)_minmax(110px,1fr)_repeat(5,minmax(64px,0.6fr))] items-center gap-3 px-5';

export function ScraperPanel() {
  const t = useTranslations('admin.scraper');
  const { data, error, loading, reload } = useAdminResource('runs', (api) => api.runs());
  const { run, pending } = useAdminAction();
  const running = data?.some((item) => item.finishedAt === null) ?? false;

  const start = async () => {
    if (await run('start', (api) => api.startRun(), t('started'))) reload();
  };

  return (
    <section className="flex flex-col gap-4">
      <PanelHeader
        title={t('title')}
        lead={t('lead')}
        onRefresh={reload}
        actions={
          <Button size="sm" disabled={running || pending !== null} onClick={start}>
            <Play size={15} strokeWidth={1.75} aria-hidden />
            {t('start')}
          </Button>
        }
      />
      <PanelState loading={loading && !data} error={error}>
        {data?.length === 0 ? (
          <EmptyCard dashed title={t('emptyTitle')} text={t('emptyText')} />
        ) : (
          <div className={cn(plainCard, 'overflow-x-auto')}>
            <div className="min-w-[720px]">
              <div className={cn(GRID, 'h-10 border-b border-line bg-surface-2 text-xs font-medium text-fg-3')}>
                <span>{t('columns.startedAt')}</span>
                <span>{t('columns.finishedAt')}</span>
                {COUNTERS.map((counter) => (
                  <span key={counter} className="text-right">
                    {t(`columns.${counter}`)}
                  </span>
                ))}
              </div>
              {data?.map((item) => (
                <div key={item.id} className={cn(GRID, 'border-b border-line py-3 text-sm tabular-nums')}>
                  <span>{formatDateTime(item.startedAt)}</span>
                  <span>
                    {item.finishedAt ? (
                      formatDateTime(item.finishedAt)
                    ) : (
                      <Badge tone="accent" shape="status" dot>
                        {t('running')}
                      </Badge>
                    )}
                  </span>
                  {COUNTERS.map((counter) => (
                    <span key={counter} className="text-right">
                      {item[counter]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </PanelState>
    </section>
  );
}
