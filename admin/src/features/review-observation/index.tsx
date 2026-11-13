import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { observationKeys } from '@/entities/observation';
import { http } from '@/shared/api';
import { notifySuccess } from '@/shared/lib';
import { Button } from '@/shared/ui';

type Decision = 'approve' | 'reject';

export function ReviewActions({ observationId }: { observationId: string }) {
  const queryClient = useQueryClient();
  const decide = useMutation({
    mutationFn: (decision: Decision) => http.post(`/admin/observations/${observationId}/${decision}`),
    onSuccess: (_, decision) => {
      notifySuccess(decision === 'approve' ? 'Narx qabul qilindi' : 'Narx rad etildi');
      return queryClient.invalidateQueries({ queryKey: observationKeys.all });
    },
  });

  return (
    <div className="flex gap-1.5">
      <Button size="xs" disabled={decide.isPending} onClick={() => decide.mutate('approve')}>
        <Check size={14} strokeWidth={2} aria-hidden />
        Qabul qilish
      </Button>
      <Button size="xs" variant="secondary" disabled={decide.isPending} onClick={() => decide.mutate('reject')}>
        <X size={14} strokeWidth={2} aria-hidden />
        Rad etish
      </Button>
    </div>
  );
}
