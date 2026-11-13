'use client';

import { Merge } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { isApiError } from '@/lib/api/client';
import { useAccountMutation } from '@/lib/api/queries';
import type { Profile, SignInMethod } from '@/lib/api/types';
import { useNotify } from '../../common/useNotify';

type LinkRun = (merge: boolean) => Promise<Profile>;

type Conflict = { method: SignInMethod; estimates: number; run: LinkRun };

export function useAccountLink() {
  const t = useTranslations('app.settings.profile');
  const notify = useNotify();
  const mutation = useAccountMutation();
  const [conflict, setConflict] = useState<Conflict | null>(null);

  const link = (method: SignInMethod, run: LinkRun, onLinked?: () => void) =>
    mutation.mutate(() => run(false), {
      onSuccess: () => {
        notify('accountLinked');
        onLinked?.();
      },
      onError: (error) => {
        if (isApiError(error, 'ACCOUNT_EXISTS')) {
          const estimates = typeof error.details.estimates === 'number' ? error.details.estimates : 0;
          setConflict({ method, estimates, run });
          return;
        }
        notify('linkFailed', 'info');
      },
    });

  const unlink = (method: SignInMethod, run: () => Promise<Profile>) =>
    mutation.mutate(run, {
      onSuccess: () => notify('methodUnlinked'),
      onError: () => notify('actionFailed', 'info'),
    });

  const confirmMerge = () => {
    if (!conflict) return;
    const { run } = conflict;
    setConflict(null);
    mutation.mutate(() => run(true), {
      onSuccess: () => notify('accountsMerged'),
      onError: () => notify('actionFailed', 'info'),
    });
  };

  const dialog = (
    <AlertDialog open={conflict !== null} onOpenChange={(open) => !open && setConflict(null)}>
      <AlertDialogContent>
        <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-text">
          <Merge size={20} strokeWidth={1.5} aria-hidden />
        </span>
        <AlertDialogTitle>{conflict && t('mergeTitle', { method: t(`methods.${conflict.method}`) })}</AlertDialogTitle>
        <AlertDialogDescription>{conflict && t('mergeText', { count: conflict.estimates })}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" size="lg" className="w-full">
              {t('mergeCancel')}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button size="lg" className="w-full" onClick={confirmMerge}>
              {t('mergeConfirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { link, unlink, pending: mutation.isPending, dialog };
}

export type AccountLink = ReturnType<typeof useAccountLink>;

export const remainingMethods = (user: Profile, except: SignInMethod) =>
  [user.phone !== null && except !== 'phone', user.telegramLinked && except !== 'telegram', user.googleLinked && except !== 'google'].filter(Boolean)
    .length;
