import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui';
import { useCreateProduct } from './model';
import { ProductForm } from './ProductForm';

type AddProductProps = {
  materialCode: string;
  unit: string;
};

export function AddProduct({ materialCode, unit }: AddProductProps) {
  const [open, setOpen] = useState(false);
  const create = useCreateProduct(materialCode);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={15} strokeWidth={2} aria-hidden />
        Mahsulot qo‘shish
      </Button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-line-2 bg-surface-2/50 p-4">
      <ProductForm
        unit={unit}
        pending={create.isPending}
        submitLabel="Qo‘shish"
        onCancel={() => setOpen(false)}
        onSubmit={(input) => create.mutate(input, { onSuccess: () => setOpen(false) })}
      />
    </div>
  );
}
