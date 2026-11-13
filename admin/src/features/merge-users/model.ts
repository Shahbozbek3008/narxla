import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys, type User } from '@/entities/user';
import { http } from '@/shared/api';
import { notifySuccess } from '@/shared/lib';

export function useMergeUsers(onMerged: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ target, source }: { target: User; source: User }) => http.post<User>(`/admin/users/${target.id}/merge`, { sourceId: source.id }),
    onSuccess: () => {
      notifySuccess('Hisoblar birlashtirildi');
      onMerged();
      return queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
