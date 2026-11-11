'use client';

import { ChevronsUpDown, CircleHelp, CreditCard, LogIn, LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routes, withNext } from '@/lib/routes';
import { useDialogs } from '@/store/dialogs';
import { useSession } from '@/store/session';
import { initialsOf, useSettings } from '@/store/settings';
import { useNotify } from '../common/useNotify';
import { Avatar } from './Avatar';

export function ProfileMenu() {
  const t = useTranslations('app.profile');
  const { signedIn, phone } = useSession();
  const profile = useSettings((state) => state.saved);
  const openDialog = useDialogs((state) => state.open);
  const router = useRouter();
  const pathname = usePathname();
  const notify = useNotify();

  if (!signedIn) {
    return (
      <Button asChild variant="secondary" size="sm" block>
        <Link href={withNext(routes.login, pathname)}>
          <LogIn size={15} strokeWidth={1.5} aria-hidden />
          {t('signIn')}
        </Link>
      </Button>
    );
  }

  const initials = initialsOf(profile.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('trigger')}
        className="flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 text-left transition-[background-color,border-color] duration-150 outline-none hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:border-line-2 data-[state=open]:bg-surface-2"
      >
        <Avatar initials={initials} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px]/[18px] font-medium">{profile.name}</span>
          <span className="truncate text-xs/4 text-fg-3">{profile.district}</span>
        </span>
        <ChevronsUpDown className="shrink-0 text-fg-3" size={16} strokeWidth={1.5} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        <div className="flex items-center gap-2.5 px-2.5 pt-2 pb-3">
          <Avatar initials={initials} size={36} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm/5 font-semibold">{profile.name}</span>
            <span className="text-xs/4 whitespace-nowrap text-fg-3 tabular-nums">{phone}</span>
          </span>
        </div>
        <DropdownMenuSeparator className="mt-0" />
        <DropdownMenuItem onSelect={() => router.push(routes.settings)}>
          <User size={16} strokeWidth={1.5} aria-hidden />
          <span className="flex-1">{t('settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push(routes.settingsSection('s-tarif'))}>
          <CreditCard size={16} strokeWidth={1.5} aria-hidden />
          <span className="flex-1">{t('billing')}</span>
          <Badge tone="accent" shape="square">
            {t('billingBadge')}
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notify('help', 'info')}>
          <CircleHelp size={16} strokeWidth={1.5} aria-hidden />
          <span className="flex-1">{t('help')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger" onSelect={() => openDialog('logout')}>
          <LogOut size={16} strokeWidth={1.5} aria-hidden />
          <span className="flex-1">{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
