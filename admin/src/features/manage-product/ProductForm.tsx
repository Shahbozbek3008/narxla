import { useState, type FormEvent } from 'react';
import { TIER_LABEL, TIERS, type Product, type ProductInput, type ProductTier } from '@/entities/product';
import { decimal, parseNumber } from '@/shared/lib';
import { Button, Field, Input, Select } from '@/shared/ui';

type ProductFormProps = {
  unit: string;
  initial?: Product;
  pending: boolean;
  submitLabel: string;
  onSubmit: (input: ProductInput) => void;
  onCancel: () => void;
};

export function ProductForm({ unit, initial, pending, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [packSize, setPackSize] = useState(initial ? decimal(initial.packSize) : '1');
  const [tier, setTier] = useState<ProductTier | ''>(initial?.tier ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');

  const pack = parseNumber(packSize);
  const valid = brand.trim() !== '' && name.trim() !== '' && pack > 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    onSubmit({ brand: brand.trim(), name: name.trim(), packSize: pack, tier: tier || null, imageUrl: imageUrl.trim() || null });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Field label="Brend">
          <Input value={brand} maxLength={60} placeholder="Masalan, Knauf" autoFocus onChange={(event) => setBrand(event.target.value)} />
        </Field>
        <Field label="Mahsulot nomi">
          <Input value={name} maxLength={160} placeholder="Masalan, Rotband 30 kg" onChange={(event) => setName(event.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`Qadoqdagi miqdor, ${unit}`} hint="Yangi havolalar shu qiymatni avtomatik oladi">
          <Input inputMode="decimal" value={packSize} onChange={(event) => setPackSize(event.target.value)} />
        </Field>
        <Field label="Sifat darajasi" hint="Smetada sifat tanlanganda mos mahsulot taklif qilinadi">
          <Select value={tier} onChange={(event) => setTier(event.target.value as ProductTier | '')}>
            <option value="">Ko‘rsatilmagan</option>
            {TIERS.map((value) => (
              <option key={value} value={value}>
                {TIER_LABEL[value]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Rasm havolasi" hint="Ixtiyoriy, https:// bilan">
        <Input type="url" inputMode="url" placeholder="https://" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={!valid || pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
