'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routes } from '@/lib/routes';
import { activeNavKey, TAB_ITEMS } from './navigation';

const TAB =
  'group relative flex h-14 flex-col items-center justify-center gap-1 text-[11px]/[14px] font-medium text-fg-3 transition-colors duration-150 active:scale-95 aria-[current=page]:font-semibold aria-[current=page]:text-fg';

export function TabBar() {
  const t = useTranslations('app.tabs');
  const active = activeNavKey(usePathname());

  const renderTabs = (items: typeof TAB_ITEMS.left) =>
    items.map(({ key, href, icon: Icon }) => (
      <Link key={key} href={href} className={TAB} aria-current={active === key ? 'page' : undefined}>
        <span
          aria-hidden
          className="absolute -top-1.5 h-0.5 w-6 scale-x-0 rounded-full bg-accent transition-transform duration-250 ease-(--ease-out-expo) group-aria-[current=page]:scale-x-100"
        />
        <Icon size={22} strokeWidth={1.5} className="transition-colors duration-150 group-aria-[current=page]:text-accent-text" aria-hidden />
        {t(key)}
      </Link>
    ));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-60 grid grid-cols-5 items-center border-t border-line bg-nav px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] backdrop-blur-[20px] backdrop-saturate-[160%] md:hidden">
      {renderTabs(TAB_ITEMS.left)}
      <Link href={routes.newEstimate} aria-label={t('new')} className="grid h-14 place-items-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent bg-linear-to-b from-white/20 to-white/0 text-accent-ink shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_8px_20px_-6px_var(--glow)]">
          <Plus size={22} strokeWidth={2} aria-hidden />
        </span>
      </Link>
      {renderTabs(TAB_ITEMS.right)}
    </nav>
  );
}
