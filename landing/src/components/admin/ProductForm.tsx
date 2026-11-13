'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import type { AdminProduct, ProductInput, ProductTier } from '@/lib/admin/types';
import { num } from '@/lib/format';
import { fieldLabel } from '../app/common/styles';

const TIERS: ProductTier[] = ['eco', 'mid', 'pre'];

type ProductFormProps = {
  unit: string;
  initial?: AdminProduct;
  busy: boolean;
  onSubmit: (product: ProductInput) => void;
  onCancel?: () => void;
};

export function ProductForm({ unit, initial, busy, onSubmit, onCancel }: ProductFormProps) {
  const t = useTranslations('admin.products');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [packSize, setPackSize] = useState(initial ? String(initial.packSize).replace('.', ',') : '1');
  const [tier, setTier] = useState<ProductTier | ''>(initial?.tier ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');

  const pack = num(packSize);
  const valid = brand.trim() !== '' && name.trim() !== '' && pack > 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      brand: brand.trim(),
      name: name.trim(),
      packSize: pack,
      tier: tier || null,
      imageUrl: imageUrl.trim() || null,
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      <div className="grid gap-3.5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('brand')}</span>
          <Input value={brand} maxLength={60} placeholder={t('brandPlaceholder')} onChange={(event) => setBrand(event.target.value)} className="text-sm" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('name')}</span>
          <Input value={name} maxLength={160} placeholder={t('namePlaceholder')} onChange={(event) => setName(event.target.value)} className="text-sm" />
        </label>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('pack', { unit })}</span>
          <Input inputMode="decimal" value={packSize} onChange={(event) => setPackSize(event.target.value)} className="text-sm" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('tier')}</span>
          <NativeSelect value={tier} onChange={(event) => setTier(event.target.value as ProductTier | '')} className="max-w-none">
            <option value="">{t('tierNone')}</option>
            {TIERS.map((value) => (
              <option key={value} value={value}>
                {t(`tiers.${value}`)}
              </option>
            ))}
          </NativeSelect>
        </label>
      </div>
      <p className="-mt-1.5 text-xs text-fg-3">{t('packHint', { unit })}</p>
      <label className="flex flex-col gap-1.5">
        <span className={fieldLabel}>{t('image')}</span>
        <Input type="url" inputMode="url" placeholder="https://" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="text-sm" />
      </label>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t('cancel')}
          </Button>
        )}
        <Button type="submit" size="sm" disabled={!valid || busy}>
          {initial ? t('save') : t('add')}
        </Button>
      </div>
    </form>
  );
}
