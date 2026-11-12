'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Bell, CreditCard, Palette, ShieldCheck, SlidersHorizontal, UserRound, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routes, SETTINGS_TABS, type SettingsTab } from '@/lib/routes';
import { cn } from '@/lib/utils';

const ICONS: Record<SettingsTab, LucideIcon> = {
  profile: UserRound,
  preferences: SlidersHorizontal,
  notifications: Bell,
  appearance: Palette,
  billing: CreditCard,
  security: ShieldCheck,
};

export function SettingsTabs() {
  const t = useTranslations('app.settings');
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const active = SETTINGS_TABS.find((tab) => pathname.endsWith(`/${tab}`)) ?? SETTINGS_TABS[0];

  return (
    <nav aria-label={t('tabsLabel')} className="relative -mx-[clamp(16px,4vw,40px)] border-b border-line">
      <div className="flex gap-1 overflow-x-auto px-[clamp(16px,4vw,40px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SETTINGS_TABS.map((tab) => {
          const Icon = ICONS[tab];
          const selected = tab === active;
          return (
            <Link
              key={tab}
              href={routes.settingsTab(tab)}
              aria-current={selected ? 'page' : undefined}
              className={cn(
                'group relative flex h-11 shrink-0 items-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none',
                'focus-visible:rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring',
                selected ? 'text-fg' : 'text-fg-3 hover:text-fg',
              )}
            >
              <span className="absolute inset-x-1 inset-y-1.5 -z-0 rounded-lg transition-colors duration-150 group-hover:bg-surface-2" aria-hidden />
              <Icon size={16} strokeWidth={1.75} className="relative" aria-hidden />
              <span className="relative">{t(`tabs.${tab}`)}</span>
              {selected && (
                <motion.span
                  layoutId="settings-tab-indicator"
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
