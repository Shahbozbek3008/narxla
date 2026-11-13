'use client';

import { CircleCheck, Phone, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatPhone } from '@/lib/format';
import { DISTRICTS, initialsOf } from '@/store/settings';
import { useFormatDate } from '../../common/useFormatDate';
import { Avatar } from '../../shell/Avatar';
import { FormActions } from '../FormActions';
import { SettingsCard, SettingsField, SettingsFooter } from '../SettingsCard';
import { SettingsSkeleton } from '../SettingsSkeleton';
import { TelegramConnection } from '../TelegramConnection';
import { useProfileForm } from '../useProfileForm';

const FIELDS = ['name', 'district'] as const;
const NAME_LIMIT = 80;

function ConnectionState({ connected, label }: { connected: boolean; label: string }) {
  const t = useTranslations('app.settings.profile');
  return connected ? (
    <Badge tone="success" shape="status" className="gap-1">
      <CircleCheck size={12} strokeWidth={2.25} aria-hidden />
      {label}
    </Badge>
  ) : (
    <Badge tone="neutral" shape="status">
      {t('notConnected')}
    </Badge>
  );
}

export function ProfileTab() {
  const t = useTranslations('app.settings.profile');
  const tPlan = useTranslations('app.plan');
  const formatDate = useFormatDate();
  const form = useProfileForm(FIELDS);
  const { user, values } = form;

  if (!user || !values) return <SettingsSkeleton />;

  return (
    <>
      <SettingsCard
        title={t('identityTitle')}
        description={t('identityLead')}
        footer={
          <SettingsFooter note={t('identityNote')}>
            <FormActions dirty={form.dirty} saving={form.saving} onReset={form.reset} onSave={form.save} />
          </SettingsFooter>
        }
      >
        <div className="flex flex-wrap items-center gap-4 px-4 sm:px-6 py-5">
          <Avatar initials={initialsOf(values.name)} size={64} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-lg/6 font-semibold tracking-[-0.01em]">{values.name.trim() || t('noName')}</span>
              <Badge tone={user.plan.kind === 'free' ? 'neutral' : 'accent'} shape="square">
                {tPlan(`kinds.${user.plan.kind}`)}
              </Badge>
            </span>
            <span className="text-[13px] text-fg-3">{t('memberSince', { date: formatDate(user.createdAt.slice(0, 10), true) })}</span>
          </div>
        </div>
        <SettingsField label={t('name')} hint={t('nameHint')} htmlFor="settings-name">
          <Input
            id="settings-name"
            className="h-11 max-w-md px-3 text-base sm:h-10 sm:text-sm"
            placeholder={t('namePlaceholder')}
            maxLength={NAME_LIMIT}
            autoComplete="name"
            value={values.name}
            onChange={(event) => form.set('name', event.target.value)}
          />
        </SettingsField>
        <SettingsField label={t('district')} hint={t('districtHint')} htmlFor="settings-district">
          <NativeSelect
            id="settings-district"
            className="max-w-md"
            value={values.district}
            onChange={(event) => form.set('district', event.target.value)}
          >
            <option value="">{t('districtNone')}</option>
            {DISTRICTS.map((district) => (
              <option key={district}>{district}</option>
            ))}
          </NativeSelect>
        </SettingsField>
      </SettingsCard>

      <SettingsCard title={t('methodsTitle')} description={t('methodsLead')}>
        <SettingsField label={t('phone')} hint={t('phoneHint')}>
          <span className="flex max-w-md flex-1 items-center gap-3 rounded-[10px] border border-line bg-surface-2 px-3 py-2.5">
            <Phone size={16} strokeWidth={1.5} className="text-fg-3" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-sm whitespace-nowrap tabular-nums">{user.phone ? formatPhone(user.phone) : t('noPhone')}</span>
            <ConnectionState connected={user.phone !== null} label={t('verified')} />
          </span>
        </SettingsField>
        <SettingsField label={t('telegram')} hint={t('telegramHint')}>
          <span className="flex max-w-md flex-1 items-center gap-3 rounded-[10px] border border-line bg-surface-2 py-1.5 pr-1.5 pl-3">
            <Send size={16} strokeWidth={1.5} className="text-fg-3" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-sm">Telegram</span>
            {user.telegramLinked && <ConnectionState connected label={t('connected')} />}
            <TelegramConnection user={user} />
          </span>
        </SettingsField>
      </SettingsCard>
    </>
  );
}
