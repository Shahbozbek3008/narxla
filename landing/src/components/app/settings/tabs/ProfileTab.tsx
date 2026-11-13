'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { DISTRICTS, initialsOf } from '@/store/settings';
import { useFormatDate } from '../../common/useFormatDate';
import { Avatar } from '../../shell/Avatar';
import { FormActions } from '../FormActions';
import { SettingsCard, SettingsField, SettingsFooter } from '../SettingsCard';
import { SettingsSkeleton } from '../SettingsSkeleton';
import { SignInMethodsCard } from '../account-link/SignInMethodsCard';
import { useProfileForm } from '../useProfileForm';

const FIELDS = ['name', 'district'] as const;
const NAME_LIMIT = 80;

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

      <SignInMethodsCard user={user} />
    </>
  );
}
