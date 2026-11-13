import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import type { Product } from './model';

export const productKeys = {
  all: ['products'] as const,
  byMaterial: (code: string) => ['products', code] as const,
};

export const useProducts = (materialCode: string) =>
  useQuery({
    queryKey: productKeys.byMaterial(materialCode),
    queryFn: () => http.get<Product[]>(`/admin/materials/${materialCode}/products`),
  });
