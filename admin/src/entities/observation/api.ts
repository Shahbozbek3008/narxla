import { useQuery } from '@tanstack/react-query';
import { http, query } from '@/shared/api';
import type { ObservationStatus, ReviewItem } from './model';

export const observationKeys = {
  all: ['observations'] as const,
  byStatus: (status: ObservationStatus) => ['observations', status] as const,
};

export const useObservations = (status: ObservationStatus) =>
  useQuery({
    queryKey: observationKeys.byStatus(status),
    queryFn: () => http.get<ReviewItem[]>(`/admin/observations${query({ status })}`),
  });
