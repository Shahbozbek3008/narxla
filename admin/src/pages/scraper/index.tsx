import { useScrapeRuns, type ScrapeRun } from '@/entities/scrape-run';
import { RunScraperButton } from '@/features/run-scraper';
import { dateTime } from '@/shared/lib';
import { Badge, EmptyState, PageHeader, QueryState } from '@/shared/ui';

const COUNTERS: { key: keyof Pick<ScrapeRun, 'total' | 'accepted' | 'flagged' | 'failed' | 'blocked'>; label: string }[] = [
  { key: 'total', label: 'Jami' },
  { key: 'accepted', label: 'Qabul' },
  { key: 'flagged', label: 'Tekshiruvga' },
  { key: 'failed', label: 'Xato' },
  { key: 'blocked', label: 'Bloklangan' },
];

export function ScraperPage() {
  const runs = useScrapeRuns();
  const running = runs.data?.some((run) => !run.finishedAt) ?? false;

  return (
    <>
      <PageHeader
        title="Narx yig‘ish"
        lead="Scraper har hafta do‘kon havolalaridan narxlarni oladi. Kerak bo‘lsa, hozir qo‘lda ishga tushiring."
        actions={<RunScraperButton disabled={running} />}
      />
      <QueryState loading={runs.isPending} error={runs.error}>
        {runs.data?.length === 0 ? (
          <EmptyState>Hali ishga tushirilmagan.</EmptyState>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line text-left text-xs text-fg-3">
                  <th className="px-5 py-3 font-medium">Boshlangan</th>
                  <th className="px-5 py-3 font-medium">Holat</th>
                  {COUNTERS.map(({ key, label }) => (
                    <th key={key} className="px-3 py-3 text-right font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.data?.map((run) => (
                  <tr key={run.id} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3">{dateTime(run.startedAt)}</td>
                    <td className="px-5 py-3">
                      {run.finishedAt ? <Badge tone="success">Tugagan</Badge> : <Badge tone="accent" dot>Ishlayapti</Badge>}
                    </td>
                    {COUNTERS.map(({ key }) => (
                      <td key={key} className="px-3 py-3 text-right">
                        {run[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryState>
    </>
  );
}
