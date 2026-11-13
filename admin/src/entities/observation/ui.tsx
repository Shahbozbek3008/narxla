import { Badge, type BadgeTone } from '@/shared/ui';
import { STATUS_LABEL, type ObservationStatus } from './model';

const STATUS_TONE: Record<ObservationStatus, BadgeTone> = {
  ACCEPTED: 'success',
  PENDING_REVIEW: 'accent',
  REJECTED: 'neutral',
};

export function StatusBadge({ status }: { status: ObservationStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
