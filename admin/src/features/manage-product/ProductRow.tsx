import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ProductThumb, TierBadge, type Product } from '@/entities/product';
import { cn, decimal, fmt, notifySuccess } from '@/shared/lib';
import { Badge, Button } from '@/shared/ui';
import { useDeleteProduct, useUpdateProduct } from './model';
import { ProductForm } from './ProductForm';

type ProductRowProps = {
  product: Product;
  materialCode: string;
  unit: string;
};

export function ProductRow({ product, materialCode, unit }: ProductRowProps) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateProduct(materialCode);
  const remove = useDeleteProduct(materialCode);
  const busy = update.isPending || remove.isPending;

  if (editing) {
    return (
      <li className="border-b border-line bg-surface-2/50 px-5 py-4 last:border-b-0">
        <ProductForm
          unit={unit}
          initial={product}
          pending={update.isPending}
          submitLabel="Saqlash"
          onCancel={() => setEditing(false)}
          onSubmit={(patch) =>
            update.mutate(
              { id: product.id, patch },
              {
                onSuccess: () => {
                  notifySuccess('Mahsulot saqlandi');
                  setEditing(false);
                },
              },
            )
          }
        />
      </li>
    );
  }

  const confirmDelete = () => {
    if (window.confirm('Mahsulot o‘chiriladi. Bog‘langan havolalar saqlanadi, lekin brendsiz qoladi. Davom etasizmi?')) {
      remove.mutate(product.id);
    }
  };

  return (
    <li className={cn('flex flex-wrap items-center gap-3.5 border-b border-line px-5 py-3.5 last:border-b-0', !product.active && 'opacity-55')}>
      <ProductThumb product={product} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2 text-sm/5">
          <span className="font-semibold">{product.brand}</span>
          <span className="truncate text-fg-2">{product.name}</span>
          {product.tier && <TierBadge tier={product.tier} />}
          {!product.active && <Badge tone="outline">Yashirilgan</Badge>}
        </span>
        <span className="text-xs text-fg-3 tabular-nums">
          {decimal(product.packSize)} {unit} · {product.listings} ta havola ·{' '}
          {product.price ? `${fmt(product.price.min)}–${fmt(product.price.max)} so‘m / ${unit}` : 'narx yo‘q'}
        </span>
      </div>
      <div className="flex gap-0.5">
        <Button variant="ghost" size="xs" aria-label="Tahrirlash" disabled={busy} onClick={() => setEditing(true)}>
          <Pencil size={15} strokeWidth={1.75} />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          aria-label={product.active ? 'Yashirish' : 'Ko‘rsatish'}
          disabled={busy}
          onClick={() => update.mutate({ id: product.id, patch: { active: !product.active } })}
        >
          {product.active ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
        </Button>
        <Button variant="danger" size="xs" aria-label="O‘chirish" disabled={busy} onClick={confirmDelete}>
          <Trash2 size={15} strokeWidth={1.75} />
        </Button>
      </div>
    </li>
  );
}
