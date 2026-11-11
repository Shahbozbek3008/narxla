import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { MaterialLine } from '@/lib/calc-engine';
import { useFormatDate } from '../common/useFormatDate';

export function PricesSummaryBadge({ lines }: { lines: MaterialLine[] }) {
  const t = useTranslations('app.result');
  const formatDate = useFormatDate();
  const verified = lines.filter((line) => line.status === 'verified');
  const latest = verified.map((line) => line.checkedAt).filter(Boolean).sort().at(-1);

  if (!latest) {
    return (
      <Badge tone="neutral" shape="status" dot>
        {t('pricesBadgeNone')}
      </Badge>
    );
  }

  return (
    <Badge tone={verified.length === lines.length ? 'success' : 'accent'} shape="status" dot>
      {t('pricesBadge', { verified: verified.length, total: lines.length, date: formatDate(latest.slice(0, 10)) })}
    </Badge>
  );
}

export function LinePriceMark({ line }: { line: MaterialLine }) {
  const t = useTranslations('app.result');
  if (line.status === 'verified') return null;

  return (
    <span
      title={t(`priceStatusHint.${line.status}`)}
      className="shrink-0 rounded-md bg-surface-3 px-1.5 text-[11px]/[18px] font-medium text-fg-3"
    >
      {t(`priceStatus.${line.status}`)}
    </span>
  );
}
