import { useTranslations } from 'next-intl';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import type { PriceStatus } from '@/lib/prices/price-book';

export const SOURCE_TONE: Record<PriceStatus, BadgeTone> = {
  verified: 'success',
  partial: 'accent',
  estimated: 'neutral',
};

export function SourceBadge({ status }: { status: PriceStatus }) {
  const t = useTranslations('app.calcs.source');
  return (
    <Badge tone={SOURCE_TONE[status]} dot title={t(`${status}.title`)}>
      {t(`${status}.short`)}
    </Badge>
  );
}
