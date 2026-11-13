'use client';

import { Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useChangeLocale } from '@/hooks/useChangeLocale';
import { useThemePreference } from '@/hooks/useTheme';
import { routing } from '@/i18n/routing';
import { LOCALE_LABELS } from '@/lib/locales';
import type { ThemePreference } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { SettingsCard } from '../SettingsCard';

const THEMES: { id: ThemePreference; preview: string; line: string }[] = [
  { id: 'dark', preview: '#0E1621', line: '#2B3846' },
  { id: 'light', preview: '#FAFAF8', line: '#DCDCD8' },
  { id: 'system', preview: 'linear-gradient(135deg,#0E1621 50%,#FAFAF8 50%)', line: '#8A8F99' },
];

const OPTION =
  'relative overflow-hidden rounded-xl border bg-surface text-left transition-[border-color,box-shadow] duration-200 outline-none hover:border-fg-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function SelectedMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'grid size-[18px] place-items-center rounded-full border-[1.5px] transition-colors duration-200',
        selected ? 'border-accent bg-accent text-accent-ink' : 'border-line-2',
      )}
      aria-hidden
    >
      {selected && <Check size={11} strokeWidth={3} />}
    </span>
  );
}

function OptionGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,180px),1fr))] gap-3 px-4 sm:px-6 py-5">
      {children}
    </div>
  );
}

export function AppearanceTab() {
  const t = useTranslations('app.settings.appearance');
  const [preference, setPreference] = useThemePreference();
  const locale = useLocale();
  const changeLocale = useChangeLocale();

  return (
    <>
      <SettingsCard title={t('themeTitle')} description={t('themeLead')}>
        <OptionGrid label={t('themeTitle')}>
          {THEMES.map(({ id, preview, line }) => {
            const selected = preference === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPreference(id)}
                className={cn(OPTION, selected ? 'border-accent shadow-[0_0_0_4px_var(--accent-soft)]' : 'border-line-2')}
              >
                <span className="block h-24 border-b border-line p-3" style={{ background: preview }} aria-hidden>
                  <span className="block h-1.5 w-3/5 rounded-[3px]" style={{ background: line }} />
                  <span className="mt-1.5 block h-1.5 w-2/5 rounded-[3px] opacity-60" style={{ background: line }} />
                  <span className="mt-4 block h-3 w-9 rounded-[4px] bg-[#F4A93B]" />
                </span>
                <span className="flex items-center justify-between px-3 py-2.5 text-[13px] font-medium">
                  {t(id)}
                  <SelectedMark selected={selected} />
                </span>
              </button>
            );
          })}
        </OptionGrid>
      </SettingsCard>

      <SettingsCard title={t('languageTitle')} description={t('languageLead')}>
        <OptionGrid label={t('languageTitle')}>
          {routing.locales.map((code) => {
            const selected = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => !selected && changeLocale(code)}
                className={cn(
                  OPTION,
                  'flex items-center gap-3 px-3.5 py-3',
                  selected ? 'border-accent shadow-[0_0_0_4px_var(--accent-soft)]' : 'border-line-2',
                )}
              >
                <span className="grid size-9 place-items-center rounded-lg border border-line bg-surface-2 font-mono text-xs font-semibold text-fg-2">
                  {LOCALE_LABELS[code].short}
                </span>
                <span className="flex-1 text-sm font-medium">{LOCALE_LABELS[code].name}</span>
                <SelectedMark selected={selected} />
              </button>
            );
          })}
        </OptionGrid>
      </SettingsCard>
    </>
  );
}
