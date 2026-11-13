import { useQuery } from '@tanstack/react-query';
import { http, query } from '@/shared/api';

export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export type PriceReport = {
  id: string;
  estimateId: string;
  materialCode: string | null;
  comment: string | null;
  status: ReportStatus;
  createdAt: string;
};

export const reportKeys = {
  all: ['reports'] as const,
  byStatus: (status: ReportStatus) => ['reports', status] as const,
};

export const useReports = (status: ReportStatus) =>
  useQuery({ queryKey: reportKeys.byStatus(status), queryFn: () => http.get<PriceReport[]>(`/admin/price-reports${query({ status })}`) });
