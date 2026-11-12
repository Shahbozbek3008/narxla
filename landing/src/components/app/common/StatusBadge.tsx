import { useTranslations } from 'next-intl';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import type { EstimateStatus } from '@/lib/api/types';

const TONE: Record<EstimateStatus, BadgeTone> = {
  ready: 'success',
  draft: 'neutral',
  sent: 'accent',
};

type StatusBadgeProps = {
  status: EstimateStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations('app.status');
  return (
    <Badge tone={TONE[status]} className={className}>
      {t(status)}
    </Badge>
  );
}
