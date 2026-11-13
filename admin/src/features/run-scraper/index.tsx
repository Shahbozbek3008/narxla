import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { scrapeRunKeys } from '@/entities/scrape-run';
import { http } from '@/shared/api';
import { notifySuccess } from '@/shared/lib';
import { Button } from '@/shared/ui';

export function RunScraperButton({ disabled }: { disabled?: boolean }) {
  const queryClient = useQueryClient();
  const start = useMutation({
    mutationFn: () => http.post('/admin/scraper/runs'),
    onSuccess: () => {
      notifySuccess('Narx yig‘ish boshlandi');
      return queryClient.invalidateQueries({ queryKey: scrapeRunKeys.all });
    },
  });

  return (
    <Button disabled={disabled || start.isPending} onClick={() => start.mutate()}>
      <Play size={15} strokeWidth={2} aria-hidden />
      Hozir ishga tushirish
    </Button>
  );
}
