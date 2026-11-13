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
import { Link, usePathname } from '@/i18n/navigation';
import { useRouter } from '@/i18n/router';
import { routes, withNext } from '@/lib/routes';
import { useDialogs } from '@/store/dialogs';
import { useAuth } from '@/lib/api/queries';
import { formatPhone } from '@/lib/format';
import { initialsOf } from '@/store/settings';
import { useNotify } from '../common/useNotify';
import { Avatar } from './Avatar';

export function ProfileMenu() {
  const t = useTranslations('app.profile');
  const { user } = useAuth();
  const tPlan = useTranslations('app.plan');
  const openDialog = useDialogs((state) => state.open);
  const router = useRouter();
  const pathname = usePathname();
  const notify = useNotify();

  if (!user) {
    return (
      <Button asChild variant="secondary" size="sm" block>
        <Link href={withNext(routes.login, pathname)}>
          <LogIn size={15} strokeWidth={1.5} aria-hidden />
          {t('signIn')}
        </Link>
      </Button>
    );
  }

  const contact = user.phone ? formatPhone(user.phone) : (user.email ?? t('telegram'));
  const displayName = user.name || contact;
  const initials = initialsOf(user.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('trigger')}
        className="flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 text-left transition-[background-color,border-color] duration-150 outline-none hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:border-line-2 data-[state=open]:bg-surface-2"
      >
        <Avatar initials={initials} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px]/[18px] font-medium">{displayName}</span>
          {(user.district || user.name) && (
            <span className="truncate text-xs/4 text-fg-3">{user.district || contact}</span>
          )}
        </span>
        <ChevronsUpDown className="shrink-0 text-fg-3" size={16} strokeWidth={1.5} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        <div className="flex items-center gap-2.5 px-2.5 pt-2 pb-3">
          <Avatar initials={initials} size={36} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm/5 font-semibold">{displayName}</span>
            {user.name && <span className="text-xs/4 whitespace-nowrap text-fg-3 tabular-nums">{contact}</span>}
          </span>
        </div>
        <DropdownMenuSeparator className="mt-0" />
        <DropdownMenuItem onSelect={() => router.push(routes.settingsTab('profile'))}>
          <User size={16} strokeWidth={1.5} aria-hidden />
          <span className="flex-1">{t('settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push(routes.settingsTab('billing'))}>
          <CreditCard size={16} strokeWidth={1.5} aria-hidden />
          <span className="flex-1">{t('billing')}</span>
          <Badge tone="accent" shape="square">
            {tPlan(`kinds.${user.plan.kind}`)}
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
