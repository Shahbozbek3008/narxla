import { useQuery } from '@tanstack/react-query';
import { http, query } from '@/shared/api';
import type { Listing } from './model';

export const listingKeys = {
  all: ['listings'] as const,
  byMaterial: (code: string) => ['listings', code] as const,
};

export const useListings = (materialCode: string) =>
  useQuery({
    queryKey: listingKeys.byMaterial(materialCode),
    queryFn: () => http.get<Listing[]>(`/admin/listings${query({ materialCode })}`),
  });
