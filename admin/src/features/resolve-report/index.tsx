import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportKeys, type ReportStatus } from '@/entities/report';
import { http } from '@/shared/api';
import { notifySuccess } from '@/shared/lib';
import { Button } from '@/shared/ui';

type Resolution = Exclude<ReportStatus, 'OPEN'>;

export function ResolveReportActions({ reportId }: { reportId: string }) {
  const queryClient = useQueryClient();
  const resolve = useMutation({
    mutationFn: (status: Resolution) => http.patch(`/admin/price-reports/${reportId}`, { status }),
    onSuccess: () => {
      notifySuccess('Shikoyat yopildi');
      return queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });

  return (
    <div className="flex gap-1.5">
      <Button size="xs" disabled={resolve.isPending} onClick={() => resolve.mutate('RESOLVED')}>
        Hal qilindi
      </Button>
      <Button size="xs" variant="ghost" disabled={resolve.isPending} onClick={() => resolve.mutate('DISMISSED')}>
        Rad etish
      </Button>
    </div>
  );
}
