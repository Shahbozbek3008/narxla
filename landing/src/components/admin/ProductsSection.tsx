'use client';

import { Eye, EyeOff, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminMaterial, AdminProduct, ProductInput } from '@/lib/admin/types';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { plainCard } from '../app/common/styles';
import { ProductForm } from './ProductForm';
import { useAdminAction } from './useAdmin';

type ProductsSectionProps = {
  material: AdminMaterial;
  products: AdminProduct[];
  onChange: () => void;
};

const TIER_TONE = { eco: 'neutral', mid: 'accent', pre: 'success' } as const;

function ProductThumb({ product }: { product: AdminProduct }) {
  const [broken, setBroken] = useState(false);
  if (product.imageUrl && !broken) {
    return (
      <img
        src={product.imageUrl}
        alt=""
        onError={() => setBroken(true)}
        className="size-11 shrink-0 rounded-xl border border-line bg-surface-2 object-contain"
      />
    );
  }
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-fg-3">
      <Package size={18} strokeWidth={1.5} aria-hidden />
    </span>
  );
}

export function ProductsSection({ material, products, onChange }: ProductsSectionProps) {
  const t = useTranslations('admin.products');
  const { run, pending } = useAdminAction();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const create = async (input: ProductInput) => {
    if (await run('product:create', (api) => api.createProduct(material.code, input), t('created'))) {
      setAdding(false);
      onChange();
    }
  };

  const update = async (id: string, patch: Partial<ProductInput & { active: boolean }>, message?: string) => {
    if (await run(id, (api) => api.updateProduct(id, patch), message)) {
      setEditing(null);
      onChange();
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    if (await run(id, (api) => api.deleteProduct(id).then(() => true), t('deleted'))) onChange();
  };

  return (
    <section className={cn(plainCard, 'flex flex-col')}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold">
            {t('title')} <span className="text-fg-3 tabular-nums">· {products.length}</span>
          </h3>
          <p className="max-w-[560px] text-[13px] text-fg-3">{t('lead')}</p>
        </div>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus size={15} strokeWidth={2} aria-hidden />
            {t('add')}
          </Button>
        )}
      </header>

      {adding && (
        <div className="border-b border-line bg-surface-2/50 px-5 py-4">
          <ProductForm unit={material.unit} busy={pending !== null} onSubmit={create} onCancel={() => setAdding(false)} />
        </div>
      )}

      {products.length === 0 && !adding ? (
        <p className="px-5 py-8 text-center text-sm text-fg-2">{t('empty')}</p>
      ) : (
        <ul>
          {products.map((product) => {
            const busy = pending === product.id;
            if (editing === product.id) {
              return (
                <li key={product.id} className="border-b border-line bg-surface-2/50 px-5 py-4 last:border-b-0">
                  <ProductForm
                    unit={material.unit}
                    initial={product}
                    busy={busy}
                    onSubmit={(input) => update(product.id, input, t('updated'))}
                    onCancel={() => setEditing(null)}
                  />
                </li>
              );
            }
            return (
              <li
                key={product.id}
                className={cn('flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 last:border-b-0', !product.active && 'opacity-55')}
              >
                <ProductThumb product={product} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2 text-sm/5">
                    <span className="font-semibold">{product.brand}</span>
                    <span className="truncate text-fg-2">{product.name}</span>
                    {product.tier && (
                      <Badge tone={TIER_TONE[product.tier]} shape="square">
                        {t(`tiers.${product.tier}`)}
                      </Badge>
                    )}
                    {!product.active && <Badge tone="outline">{t('hidden')}</Badge>}
                  </span>
                  <span className="text-xs text-fg-3 tabular-nums">
                    {fmt(product.packSize)} {material.unit} · {t('listings', { count: product.listings })} ·{' '}
                    {product.price
                      ? t('priceRange', { min: fmt(product.price.min), max: fmt(product.price.max), unit: material.unit })
                      : t('noPrice')}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="xs" variant="ghost" disabled={busy} aria-label={t('edit')} onClick={() => setEditing(product.id)}>
                    <Pencil size={14} strokeWidth={1.75} aria-hidden />
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    disabled={busy}
                    aria-label={product.active ? t('hide') : t('show')}
                    onClick={() => update(product.id, { active: !product.active })}
                  >
                    {product.active ? <EyeOff size={14} strokeWidth={1.75} aria-hidden /> : <Eye size={14} strokeWidth={1.75} aria-hidden />}
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    disabled={busy}
                    aria-label={t('remove')}
                    onClick={() => remove(product.id)}
                    className="text-danger hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
