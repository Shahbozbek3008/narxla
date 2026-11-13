import { Package } from 'lucide-react';
import { useState } from 'react';
import { Badge, type BadgeTone } from '@/shared/ui';
import { TIER_LABEL, type Product, type ProductTier } from './model';

const TIER_TONE: Record<ProductTier, BadgeTone> = { eco: 'neutral', mid: 'accent', pre: 'success' };

export function TierBadge({ tier }: { tier: ProductTier }) {
  return <Badge tone={TIER_TONE[tier]}>{TIER_LABEL[tier]}</Badge>;
}

export function ProductThumb({ product }: { product: Pick<Product, 'imageUrl'> }) {
  const [broken, setBroken] = useState(false);
  if (product.imageUrl && !broken) {
    return (
      <img
        src={product.imageUrl}
        alt=""
        onError={() => setBroken(true)}
        className="size-12 shrink-0 rounded-xl border border-line bg-white object-contain p-1"
      />
    );
  }
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-fg-3">
      <Package size={20} strokeWidth={1.5} aria-hidden />
    </span>
  );
}
