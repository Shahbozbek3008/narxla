'use client';

import { CircleCheck, Mail, Phone, Send, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import type { Profile } from '@/lib/api/types';
import { formatPhone } from '@/lib/format';
import { SettingsCard, SettingsField } from '../SettingsCard';
import { GoogleConnection } from './GoogleConnection';
import { PhoneConnection } from './PhoneConnection';
import { TelegramConnection } from './TelegramConnection';
import { useAccountLink } from './useAccountLink';

type MethodRowProps = {
  icon: LucideIcon;
  value: string;
  connected: boolean;
  connectedLabel: string;
  action: ReactNode;
};

function MethodRow({ icon: Icon, value, connected, connectedLabel, action }: MethodRowProps) {
  return (
    <span className="flex max-w-md flex-1 flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] border border-line bg-surface-2 py-1.5 pr-1.5 pl-3">
      <Icon size={16} strokeWidth={1.5} className="shrink-0 text-fg-3" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-sm tabular-nums">{value}</span>
      {connected && (
        <Badge tone="success" shape="status" className="gap-1">
          <CircleCheck size={12} strokeWidth={2.25} aria-hidden />
          {connectedLabel}
        </Badge>
      )}
      {action}
    </span>
  );
}

export function SignInMethodsCard({ user }: { user: Profile }) {
  const t = useTranslations('app.settings.profile');
  const account = useAccountLink();

  return (
    <SettingsCard title={t('methodsTitle')} description={t('methodsLead')}>
      <SettingsField label={t('phone')} hint={t('phoneHint')}>
        <MethodRow
          icon={Phone}
          value={user.phone ? formatPhone(user.phone) : t('noPhone')}
          connected={user.phone !== null}
          connectedLabel={t('verified')}
          action={<PhoneConnection user={user} account={account} />}
        />
      </SettingsField>
      <SettingsField label={t('google')} hint={t('googleHint')}>
        <MethodRow
          icon={Mail}
          value={user.email ?? 'Google'}
          connected={user.googleLinked}
          connectedLabel={t('connected')}
          action={<GoogleConnection user={user} account={account} />}
        />
      </SettingsField>
      <SettingsField label={t('telegram')} hint={t('telegramHint')}>
        <MethodRow
          icon={Send}
          value="Telegram"
          connected={user.telegramLinked}
          connectedLabel={t('connected')}
          action={<TelegramConnection user={user} account={account} />}
        />
      </SettingsField>
      {account.dialog}
    </SettingsCard>
  );
}
