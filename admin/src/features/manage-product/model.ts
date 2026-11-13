import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listingKeys } from '@/entities/listing';
import { productKeys, type Product, type ProductInput } from '@/entities/product';
import { http } from '@/shared/api';
import { notifySuccess } from '@/shared/lib';

type ProductPatch = Partial<ProductInput & { active: boolean }>;

function useRefresh(materialCode: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: productKeys.byMaterial(materialCode) }),
      queryClient.invalidateQueries({ queryKey: listingKeys.byMaterial(materialCode) }),
    ]);
}

export function useCreateProduct(materialCode: string) {
  const refresh = useRefresh(materialCode);
  return useMutation({
    mutationFn: (input: ProductInput) => http.post<Product>('/admin/products', { materialCode, ...input }),
    onSuccess: () => {
      notifySuccess('Mahsulot qo‘shildi');
      return refresh();
    },
  });
}

export function useUpdateProduct(materialCode: string) {
  const refresh = useRefresh(materialCode);
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ProductPatch }) => http.patch<Product>(`/admin/products/${id}`, patch),
    onSuccess: refresh,
  });
}

export function useDeleteProduct(materialCode: string) {
  const refresh = useRefresh(materialCode);
  return useMutation({
    mutationFn: (id: string) => http.delete(`/admin/products/${id}`),
    onSuccess: () => {
      notifySuccess('Mahsulot o‘chirildi');
      return refresh();
    },
  });
}
