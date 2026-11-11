'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Segmented } from '@/components/ui/segmented';
import { Switch } from '@/components/ui/switch';
import { QUALITIES, type Quality } from '@/lib/calc-engine';
import { useSession } from '@/store/session';
import { DISTRICTS, initialsOf, REGIONS, RESERVES, useSettings, type Profile } from '@/store/settings';
import { useNotify } from '../common/useNotify';
import { Avatar } from '../shell/Avatar';
import { SettingsRow, SettingsSection } from './SettingsSection';

type NotificationKey = 'notifyPrice' | 'notifyTelegram' | 'notifyNews';

const NOTIFICATIONS: NotificationKey[] = ['notifyPrice', 'notifyTelegram', 'notifyNews'];

export function ProfileSection() {
  const t = useTranslations('app.settings.profile');
  const { draft, update } = useSettings();
  const phone = useSession((state) => state.phone);
  const notify = useNotify();

  return (
    <SettingsSection id="s-profil" title={t('title')} lead={t('lead')}>
      <SettingsRow title={t('photo')} hint={t('photoHint')}>
        <Avatar initials={initialsOf(draft.name)} size={48} />
        <Button variant="secondary" size="sm" onClick={() => notify('upload', 'info')}>
          {t('upload')}
        </Button>
      </SettingsRow>
      <SettingsRow title={t('name')}>
        <Input
          aria-label={t('name')}
          className="max-w-[360px] px-3 text-sm"
          value={draft.name}
          onChange={(event) => update({ name: event.target.value })}
        />
      </SettingsRow>
      <SettingsRow title={t('phone')} hint={t('phoneHint')}>
        <span className="flex min-h-10 max-w-[360px] min-w-0 flex-auto flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[10px] border border-line bg-surface-2 px-3 py-2 text-sm text-fg-2 tabular-nums">
          <span className="whitespace-nowrap">{phone}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap text-success">
            <Check size={12} strokeWidth={2.5} aria-hidden />
            {t('verified')}
          </span>
        </span>
      </SettingsRow>
      <SettingsRow title={t('district')}>
        <NativeSelect aria-label={t('district')} value={draft.district} onChange={(event) => update({ district: event.target.value })}>
          {DISTRICTS.map((district) => (
            <option key={district}>{district}</option>
          ))}
        </NativeSelect>
      </SettingsRow>
    </SettingsSection>
  );
}

export function EstimateDefaultsSection() {
  const t = useTranslations('app.settings.estimate');
  const tQuality = useTranslations('app.qualities');
  const { draft, update } = useSettings();

  return (
    <SettingsSection id="s-smeta" title={t('title')} lead={t('lead')}>
      <SettingsRow title={t('region')} hint={t('regionHint')}>
        <NativeSelect aria-label={t('region')} value={draft.region} onChange={(event) => update({ region: event.target.value })}>
          {REGIONS.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </NativeSelect>
      </SettingsRow>
      <SettingsRow title={t('reserve')} hint={t('reserveHint')}>
        <Segmented
          label={t('reserve')}
          value={String(draft.reserve)}
          onChange={(value) => update({ reserve: Number(value) as Profile['reserve'] })}
          options={RESERVES.map((reserve) => ({ value: String(reserve), label: `${reserve}%` }))}
        />
      </SettingsRow>
      <SettingsRow title={t('quality')}>
        <Segmented<Quality>
          label={t('quality')}
          value={draft.quality}
          onChange={(quality) => update({ quality })}
          options={QUALITIES.map((quality) => ({ value: quality, label: tQuality(`${quality}.name`) }))}
        />
      </SettingsRow>
    </SettingsSection>
  );
}

export function NotificationsSection() {
  const t = useTranslations('app.settings.notifications');
  const { draft, update } = useSettings();

  return (
    <SettingsSection id="s-bildirish" title={t('title')} lead={t('lead')}>
      {NOTIFICATIONS.map((key) => (
        <label key={key} className="flex cursor-pointer items-center gap-4 border-t border-line px-5 py-4">
          <span className="flex flex-1 flex-col">
            <span className="text-sm/5 font-medium">{t(`${key}.title`)}</span>
            <span className="text-[13px]/[18px] text-fg-3">{t(`${key}.desc`)}</span>
          </span>
          <Switch checked={draft[key]} onCheckedChange={(checked) => update({ [key]: checked })} />
        </label>
      ))}
    </SettingsSection>
  );
}
