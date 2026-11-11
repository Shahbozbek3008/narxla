'use client';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useThemePreference } from '@/hooks/useTheme';
import type { ThemePreference } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useDialogs } from '@/store/dialogs';
import { usePlan } from '@/store/plan';
import { useFormatDate } from '../common/useFormatDate';
import { useNotify } from '../common/useNotify';
import { SettingsRow, SettingsSection } from './SettingsSection';

const THEMES: { id: ThemePreference; preview: string; line: string }[] = [
  { id: 'dark', preview: '#0B0D12', line: '#2A2F3A' },
  { id: 'light', preview: '#FAFAF8', line: '#DCDCD8' },
  { id: 'system', preview: 'linear-gradient(135deg,#0B0D12 50%,#FAFAF8 50%)', line: '#8A8F99' },
];

export function AppearanceSection() {
  const t = useTranslations('app.settings.appearance');
  const [preference, setPreference] = useThemePreference();

  return (
    <SettingsSection id="s-korinish" title={t('title')} lead={t('lead')}>
      <div role="radiogroup" aria-label={t('title')} className="grid grid-cols-3 gap-3 px-5 pt-1 pb-5">
        {THEMES.map(({ id, preview, line }) => {
          const selected = preference === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPreference(id)}
              className={cn(
                'overflow-hidden rounded-xl border bg-surface text-left transition-[border-color,box-shadow] duration-200 hover:border-fg-3',
                selected ? 'border-accent shadow-[0_0_0_4px_var(--accent-soft)]' : 'border-line-2',
              )}
            >
              <span className="block h-18 border-b border-line p-2.5" style={{ background: preview }} aria-hidden>
                <span className="block h-1.5 w-3/5 rounded-[3px]" style={{ background: line }} />
                <span className="mt-1.5 block h-1.5 w-2/5 rounded-[3px] opacity-60" style={{ background: line }} />
                <span className="mt-3 block h-2.5 w-7 rounded-[3px] bg-[#F4A93B]" />
              </span>
              <span className="flex items-center justify-between px-2.5 py-2 text-[13px] font-medium">
                {t(id)}
                <span
                  className={cn(
                    'grid size-3.5 place-items-center rounded-full border-[1.5px]',
                    selected ? 'border-accent' : 'border-line-2',
                  )}
                >
                  <span
                    className={cn('size-1.5 rounded-full bg-accent transition-transform duration-250', selected ? 'scale-100' : 'scale-0')}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
}

export function BillingSection() {
  const t = useTranslations('app.settings.billing');
  const { paidAt, trackingUntil, cardLast4 } = usePlan();
  const formatDate = useFormatDate();
  const notify = useNotify();

  return (
    <SettingsSection id="s-tarif" title={t('title')} lead={t('lead')}>
      <div className="mx-5 mb-5 flex flex-wrap items-center gap-4 rounded-xl border border-accent p-4 shadow-[0_0_0_4px_var(--accent-soft)] tabular-nums">
        <span className="flex min-w-50 flex-1 flex-col">
          <span className="flex items-center gap-2 font-semibold">
            {t('plan')}
            <Badge tone="accent" shape="square">
              {t('oneTime')}
            </Badge>
          </span>
          <span className="text-[13px] text-fg-2">{t('paid', { date: formatDate(paidAt) })}</span>
          <span className="text-[13px] text-fg-3">{t('tracking', { date: formatDate(trackingUntil), card: cardLast4 })}</span>
        </span>
        <Button variant="secondary" size="sm" onClick={() => notify('billing', 'info')}>
          {t('history')}
        </Button>
        <Button size="sm" className="shadow-none" onClick={() => notify('pro', 'info')}>
          {t('pro')}
        </Button>
      </div>
    </SettingsSection>
  );
}

export function AccountSection() {
  const t = useTranslations('app.settings.account');
  const openDialog = useDialogs((state) => state.open);

  return (
    <SettingsSection id="s-hisob" title={t('title')} lead={t('lead')}>
      <SettingsRow title={t('logout')} hint={t('logoutHint')}>
        <Button variant="secondary" size="sm" onClick={() => openDialog('logout')}>
          <LogOut size={15} strokeWidth={1.5} aria-hidden />
          {t('logoutCta')}
        </Button>
      </SettingsRow>
      <SettingsRow title={t('delete')} hint={t('deleteHint')}>
        <Button variant="destructive-outline" size="sm" onClick={() => openDialog('delete')}>
          {t('delete')}
        </Button>
      </SettingsRow>
    </SettingsSection>
  );
}
