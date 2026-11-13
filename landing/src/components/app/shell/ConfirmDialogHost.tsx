'use client';

import { FileX2, LogOut, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/router';
import { useDeleteAccount, useDeleteEstimate, useSignOut } from '@/lib/api/queries';
import { routes } from '@/lib/routes';
import { useDialogs, type DialogKind } from '@/store/dialogs';
import { useNotify } from '../common/useNotify';

const ICONS = { logout: LogOut, delete: Trash2, deleteEstimate: FileX2 };

export function ConfirmDialogHost() {
  const t = useTranslations('app.dialogs');
  const { dialog, target, close } = useDialogs();
  const [shown, setShown] = useState<DialogKind>('logout');
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();
  const deleteEstimate = useDeleteEstimate();
  const router = useRouter();
  const notify = useNotify();

  if (dialog && dialog !== shown) setShown(dialog);

  const Icon = ICONS[shown];
  const failed = () => notify('actionFailed', 'info');

  const confirm = () => {
    close();
    if (shown === 'logout') {
      signOut.mutate(undefined, {
        onSettled: () => {
          router.push(routes.login);
          notify('loggedOut');
        },
      });
      return;
    }
    if (shown === 'delete') {
      deleteAccount.mutate(undefined, {
        onSuccess: () => {
          router.push(routes.home);
          notify('accountDeleted');
        },
        onError: failed,
      });
      return;
    }
    if (target) {
      deleteEstimate.mutate(target, {
        onSuccess: () => {
          router.replace(routes.estimates);
          notify('estimateDeleted');
        },
        onError: failed,
      });
    }
  };

  return (
    <AlertDialog open={dialog !== null} onOpenChange={(open) => !open && close()}>
      <AlertDialogContent>
        <span className="grid size-11 place-items-center rounded-xl bg-danger-soft text-danger">
          <Icon size={20} strokeWidth={1.5} aria-hidden />
        </span>
        <AlertDialogTitle>{t(`${shown}.title`)}</AlertDialogTitle>
        <AlertDialogDescription>{t(`${shown}.text`)}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" size="lg" className="w-full">
              {t('cancel')}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" size="lg" className="w-full" onClick={confirm}>
              {t(`${shown}.action`)}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
