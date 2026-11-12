'use client';

import { LogOut, MonitorSmartphone, ShieldOff, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRevokeOtherSessions } from '@/lib/api/queries';
import { useDialogs } from '@/store/dialogs';
import { useNotify } from '../../common/useNotify';
import { SettingsCard, SettingsFooter } from '../SettingsCard';

type ActionRowProps = {
  icon: ReactNode;
  title: ReactNode;
  hint: string;
  children: ReactNode;
};

function ActionRow({ icon, title, hint, children }: ActionRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-6 py-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-line bg-surface-2 text-fg-2">{icon}</span>
      <span className="flex min-w-[200px] flex-1 flex-col">
        <span className="text-sm/5 font-medium">{title}</span>
        <span className="text-[13px]/[18px] text-fg-3">{hint}</span>
      </span>
      {children}
    </div>
  );
}

export function SecurityTab() {
  const t = useTranslations('app.settings.security');
  const openDialog = useDialogs((state) => state.open);
  const revokeOthers = useRevokeOtherSessions();
  const notify = useNotify();

  const signOutOthers = () =>
    revokeOthers.mutate(undefined, {
      onSuccess: ({ revoked }) => notify('sessionsRevoked', 'success', { count: revoked }),
      onError: () => notify('actionFailed', 'info'),
    });

  return (
    <>
      <SettingsCard title={t('sessionsTitle')} description={t('sessionsLead')}>
        <ActionRow
          icon={<MonitorSmartphone size={16} strokeWidth={1.5} aria-hidden />}
          title={
            <span className="flex items-center gap-2">
              {t('currentDevice')}
              <Badge tone="success" shape="status" dot>
                {t('active')}
              </Badge>
            </span>
          }
          hint={t('currentDeviceHint')}
        >
          <Button variant="secondary" size="sm" onClick={() => openDialog('logout')}>
            <LogOut size={15} strokeWidth={1.5} aria-hidden />
            {t('logout')}
          </Button>
        </ActionRow>
        <ActionRow icon={<ShieldOff size={16} strokeWidth={1.5} aria-hidden />} title={t('othersTitle')} hint={t('othersHint')}>
          <Button variant="secondary" size="sm" disabled={revokeOthers.isPending} onClick={signOutOthers}>
            {t('othersCta')}
          </Button>
        </ActionRow>
      </SettingsCard>

      <SettingsCard
        tone="danger"
        title={t('dangerTitle')}
        description={t('dangerLead')}
        footer={
          <SettingsFooter tone="danger" note={t('deleteNote')}>
            <Button variant="destructive" size="sm" onClick={() => openDialog('delete')}>
              <Trash2 size={15} strokeWidth={1.75} aria-hidden />
              {t('deleteCta')}
            </Button>
          </SettingsFooter>
        }
      />
    </>
  );
}
