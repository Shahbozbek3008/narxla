import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@/shared/api';
import { notifyError } from '@/shared/lib';

const STALE_MS = 30_000;

const shouldRetry = (failures: number, error: unknown) => !(error instanceof ApiError) && failures < 2;

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: STALE_MS, retry: shouldRetry, refetchOnWindowFocus: false } },
    mutationCache: new MutationCache({
      onError: (error) => notifyError(error instanceof ApiError ? error.message : 'Serverga ulanib bo‘lmadi'),
    }),
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
