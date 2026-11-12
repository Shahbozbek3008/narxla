'use client';

import { useTranslations } from 'next-intl';
import { NativeSelect } from '@/components/ui/native-select';
import { Segmented } from '@/components/ui/segmented';
import { RESERVES, type Reserve } from '@/lib/api/types';
import { QUALITIES, type Quality } from '@/lib/calc-engine';
import { REGIONS } from '@/store/settings';
import { FormActions } from '../FormActions';
import { SettingsCard, SettingsField, SettingsFooter } from '../SettingsCard';
import { useProfileForm } from '../useProfileForm';

const FIELDS = ['region', 'reserve', 'quality'] as const;

export function PreferencesTab() {
  const t = useTranslations('app.settings.preferences');
  const tQuality = useTranslations('app.qualities');
  const form = useProfileForm(FIELDS);
  const { values } = form;

  if (!values) return null;

  return (
    <SettingsCard
      title={t('title')}
      description={t('lead')}
      footer={
        <SettingsFooter note={t('note')}>
          <FormActions dirty={form.dirty} saving={form.saving} onReset={form.reset} onSave={form.save} />
        </SettingsFooter>
      }
    >
      <SettingsField label={t('region')} hint={t('regionHint')} htmlFor="settings-region">
        <NativeSelect id="settings-region" className="max-w-md" value={values.region} onChange={(event) => form.set('region', event.target.value)}>
          {REGIONS.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </NativeSelect>
      </SettingsField>
      <SettingsField label={t('reserve')} hint={t('reserveHint')}>
        <Segmented
          label={t('reserve')}
          value={String(values.reserve)}
          onChange={(value) => form.set('reserve', Number(value) as Reserve)}
          options={RESERVES.map((reserve) => ({ value: String(reserve), label: `${reserve}%` }))}
        />
      </SettingsField>
      <SettingsField label={t('quality')} hint={t('qualityHint')}>
        <Segmented<Quality>
          label={t('quality')}
          value={values.quality}
          onChange={(quality) => form.set('quality', quality)}
          options={QUALITIES.map((quality) => ({ value: quality, label: tQuality(`${quality}.name`) }))}
        />
      </SettingsField>
    </SettingsCard>
  );
}
