import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';

export type LabourRate = {
  code: string;
  name: string;
  unit: string;
  minPrice: number;
  price: number;
  maxPrice: number;
  updatedAt: string;
};

export const labourKeys = { all: ['labour-rates'] as const };

export const useLabourRates = () => useQuery({ queryKey: labourKeys.all, queryFn: () => http.get<LabourRate[]>('/admin/labour-rates') });
