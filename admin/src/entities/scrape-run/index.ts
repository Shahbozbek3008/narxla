import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';

export type ScrapeRun = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  total: number;
  accepted: number;
  flagged: number;
  failed: number;
  blocked: number;
};

const RUNNING_POLL_MS = 5000;

export const scrapeRunKeys = { all: ['scrape-runs'] as const };

export const useScrapeRuns = () =>
  useQuery({
    queryKey: scrapeRunKeys.all,
    queryFn: () => http.get<ScrapeRun[]>('/admin/scraper/runs'),
    refetchInterval: (state) => (state.state.data?.some((run) => !run.finishedAt) ? RUNNING_POLL_MS : false),
  });
