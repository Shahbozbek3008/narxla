'use client';

import { useTranslations } from 'next-intl';
import { Logo } from '@/components/brand/Logo';
import { Link, usePathname } from '@/i18n/navigation';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useEstimates } from '@/store/estimates';
import { sectionLabel } from '../common/styles';
import { activeNavKey, NAV_ITEMS } from './navigation';
import { PlanCard } from './PlanCard';
import { ProfileMenu } from './ProfileMenu';

export function Sidebar() {
  const t = useTranslations('app.nav');
  const pathname = usePathname();
  const active = activeNavKey(pathname);
  const count = useEstimates((state) => state.projects.length);

  return (
    <aside className="sticky top-0 hidden h-screen w-62 shrink-0 flex-col border-r border-line bg-bg-2 px-3 py-4 md:flex">
      <Link href={routes.estimates} className="px-2 pt-1 pb-6">
        <Logo />
      </Link>
      <p className={cn(sectionLabel, 'px-2.5 pb-2')}>{t('workspace')}</p>
      <nav aria-label={t('label')} className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            aria-current={active === key ? 'page' : undefined}
            className="flex h-[38px] items-center gap-2.5 rounded-[9px] px-2.5 text-sm font-medium text-fg-2 transition-colors duration-150 hover:bg-surface-2 hover:text-fg focus-visible:-outline-offset-2 aria-[current=page]:bg-surface-3 aria-[current=page]:text-fg aria-[current=page]:shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <Icon size={17} strokeWidth={1.5} aria-hidden />
            <span className="flex-1">{t(key)}</span>
            {key === 'estimates' && <span className="text-xs text-fg-3 tabular-nums">{count}</span>}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        <PlanCard />
        <ProfileMenu />
      </div>
    </aside>
  );
}
