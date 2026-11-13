import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Power, Trash2 } from 'lucide-react';
import { listingKeys, type Listing } from '@/entities/listing';
import { STATUS_LABEL, type ObservationStatus } from '@/entities/observation';
import { productKeys, type Product } from '@/entities/product';
import { http } from '@/shared/api';
import { fmt, notifyError, notifySuccess } from '@/shared/lib';
import { Button, Select } from '@/shared/ui';

type CheckResult =
  | { outcome: 'OK'; status: ObservationStatus; price: number; unitPrice: number; reason: string | null }
  | { outcome: 'FAILED' | 'BLOCKED'; error: string };

function useListingMutation<TVariables, TResult>(
  listing: Listing,
  action: (variables: TVariables) => Promise<TResult>,
  onDone?: (result: TResult) => void,
) {
  const queryClient = useQueryClient();
  const materialCode = listing.material.code;
  return useMutation({
    mutationFn: action,
    onSuccess: (result) => {
      onDone?.(result);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: listingKeys.byMaterial(materialCode) }),
        queryClient.invalidateQueries({ queryKey: productKeys.byMaterial(materialCode) }),
      ]);
    },
  });
}

const reportCheck = (result: CheckResult) =>
  result.outcome === 'OK'
    ? notifySuccess(`Narx olindi: ${fmt(result.price)} so‘m · ${STATUS_LABEL[result.status]}`)
    : notifyError(`Narx olinmadi: ${result.error}`);

export function ListingActions({ listing }: { listing: Listing }) {
  const check = useListingMutation(listing, () => http.post<CheckResult>(`/admin/scraper/listings/${listing.id}/check`), reportCheck);
  const toggle = useListingMutation(listing, () => http.patch(`/admin/listings/${listing.id}`, { active: !listing.active }));
  const remove = useListingMutation(
    listing,
    () => http.delete(`/admin/listings/${listing.id}`),
    () => notifySuccess('Havola o‘chirildi'),
  );
  const busy = check.isPending || toggle.isPending || remove.isPending;

  const confirmDelete = () => {
    if (window.confirm('Havola va uning barcha narx tarixi o‘chiriladi. Davom etasizmi?')) remove.mutate(undefined);
  };

  return (
    <div className="flex gap-1">
      <Button size="xs" variant="secondary" disabled={busy || !listing.active} onClick={() => check.mutate(undefined)}>
        <Play size={14} strokeWidth={1.75} aria-hidden />
        Tekshirish
      </Button>
      <Button size="xs" variant="ghost" disabled={busy} onClick={() => toggle.mutate(undefined)}>
        <Power size={14} strokeWidth={1.75} aria-hidden />
        {listing.active ? 'O‘chirish' : 'Yoqish'}
      </Button>
      <Button size="xs" variant="danger" aria-label="Havolani o‘chirish" disabled={busy} onClick={confirmDelete}>
        <Trash2 size={14} strokeWidth={1.75} />
      </Button>
    </div>
  );
}

export function LinkProductSelect({ listing, products }: { listing: Listing; products: Product[] }) {
  const link = useListingMutation(listing, (productId: string) =>
    http.patch(`/admin/listings/${listing.id}`, { productId: productId || null }),
  );

  return (
    <Select
      aria-label="Mahsulot"
      value={listing.product?.id ?? ''}
      disabled={link.isPending}
      onChange={(event) => link.mutate(event.target.value)}
      className="h-8 max-w-[280px] text-xs"
    >
      <option value="">Brendsiz</option>
      {products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.brand} · {product.name}
        </option>
      ))}
    </Select>
  );
}
