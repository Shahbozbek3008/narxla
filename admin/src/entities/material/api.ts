import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import type { Material } from './model';

export const materialKeys = {
  all: ['materials'] as const,
};

export const useMaterials = () => useQuery({ queryKey: materialKeys.all, queryFn: () => http.get<Material[]>('/admin/materials') });
