'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SETTINGS_SECTIONS, type SettingsSection } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useAuth, useUpdateProfile } from '@/lib/api/queries';
import { changedFields, profileFields, useSettingsDraft } from '@/store/settings';
import { PageHeader } from '../common/PageHeader';
import { StickyBar } from '../common/StickyBar';
import { useNotify } from '../common/useNotify';
import { AccountSection, AppearanceSection, BillingSection } from './AccountSections';
import { EstimateDefaultsSection, NotificationsSection, ProfileSection } from './ProfileSections';

function useActiveSection() {
  const [active, setActive] = useState<SettingsSection>(SETTINGS_SECTIONS[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id as SettingsSection);
      },
      { rootMargin: '0px 0px -70% 0px' },
    );
    SETTINGS_SECTIONS.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  return active;
}

export function SettingsScreen() {
  const t = useTranslations('app.settings');
  const { user } = useAuth();
  const { draft, load, clear } = useSettingsDraft();
  const updateProfile = useUpdateProfile();
  const saved = user ? profileFields(user) : null;
  const changes = saved && draft ? changedFields(saved, draft) : {};
  const dirty = Object.keys(changes).length > 0;
  const active = useActiveSection();
  const notify = useNotify();

  useEffect(() => {
    if (user && !draft) load(profileFields(user));
  }, [user, draft, load]);

  useEffect(() => clear, [clear]);

  const discard = () => saved && load(saved);

  const save = () =>
    updateProfile.mutate(changes, {
      onSuccess: (profile) => {
        load(profileFields(profile));
        notify('settingsSaved');
      },
      onError: () => notify('actionFailed', 'info'),
    });

  if (!draft) return null;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <PageHeader title={t('title')} subtitle={t('lead')} />
      <div className="grid items-start gap-8 md:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label={t('navLabel')} className="sticky top-6 hidden flex-col gap-0.5 text-sm md:flex">
          {SETTINGS_SECTIONS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'location' : undefined}
              className="flex h-[34px] items-center rounded-lg px-2.5 text-fg-2 transition-colors duration-150 hover:bg-surface-2 hover:text-fg aria-[current=location]:text-fg"
            >
              {t(`nav.${id}`)}
            </a>
          ))}
        </nav>
        <div className="flex min-w-0 flex-col gap-4">
          <ProfileSection />
          <EstimateDefaultsSection />
          <NotificationsSection />
          <AppearanceSection />
          <BillingSection />
          <AccountSection />
        </div>
      </div>

      <StickyBar
        inert={!dirty}
        className={cn(
          'pl-[18px] transition-[opacity,translate] duration-450 ease-(--ease-out-expo)',
          dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
        )}
      >
        <span className="size-2 rounded-full bg-accent" aria-hidden />
        <span className="flex-1 text-sm font-medium">{t('dirty')}</span>
        <Button variant="ghost" size="sm" className="h-[38px]" onClick={discard}>
          {t('cancel')}
        </Button>
        <Button size="sm" className="h-[38px] px-4 shadow-none" disabled={updateProfile.isPending} onClick={save}>
          {t('save')}
        </Button>
      </StickyBar>
    </div>
  );
}
