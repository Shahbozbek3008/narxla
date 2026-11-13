import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PLAN_LABEL, userKeys, type PlanKind } from '@/entities/user';
import { http } from '@/shared/api';
import { notifySuccess } from '@/shared/lib';
import { Button } from '@/shared/ui';

type PaidPlan = Exclude<PlanKind, 'free'>;

const PAID_PLANS: PaidPlan[] = ['project', 'pro'];

export function GrantPlanActions({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const grant = useMutation({
    mutationFn: (plan: PaidPlan) => http.post(`/admin/users/${userId}/plan`, { plan }),
    onSuccess: (_, plan) => {
      notifySuccess(`${PLAN_LABEL[plan]} tarifi berildi`);
      return queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });

  const confirmGrant = (plan: PaidPlan) => {
    if (window.confirm(`${PLAN_LABEL[plan]} tarifini berasizmi?`)) grant.mutate(plan);
  };

  return (
    <div className="flex gap-1.5">
      {PAID_PLANS.map((plan) => (
        <Button key={plan} size="xs" variant="secondary" disabled={grant.isPending} onClick={() => confirmGrant(plan)}>
          + {PLAN_LABEL[plan]}
        </Button>
      ))}
    </div>
  );
}
