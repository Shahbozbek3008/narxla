import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';

export type Store = {
  code: string;
  name: string;
  baseUrl: string;
  active: boolean;
  crawlDelayMs: number;
  _count: { listings: number };
};

export const storeKeys = { all: ['stores'] as const };

export const useStores = () => useQuery({ queryKey: storeKeys.all, queryFn: () => http.get<Store[]>('/admin/stores') });
