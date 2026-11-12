import { Calculator, Folder, Plus, Settings, ShieldCheck, type LucideIcon } from 'lucide-react';
import { routes } from '@/lib/routes';

export type NavKey = 'estimates' | 'new' | 'calcs' | 'check' | 'settings';
export type ScreenKey = 'estimates' | 'new' | 'result' | 'check' | 'calcs' | 'pdf' | 'settings';

type NavItem = { key: NavKey; href: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { key: 'estimates', href: routes.estimates, icon: Folder },
  { key: 'new', href: routes.newEstimate, icon: Plus },
  { key: 'calcs', href: routes.calcs, icon: Calculator },
  { key: 'check', href: routes.check, icon: ShieldCheck },
  { key: 'settings', href: routes.settings, icon: Settings },
];

export const TAB_ITEMS = {
  left: NAV_ITEMS.filter((item) => item.key === 'estimates' || item.key === 'calcs'),
  right: NAV_ITEMS.filter((item) => item.key === 'check' || item.key === 'settings'),
};

export function activeNavKey(pathname: string): NavKey | null {
  const section = pathname.split('/')[2];
  if (!section || section === 'estimates') return 'estimates';
  return NAV_ITEMS.some((item) => item.key === section) ? (section as NavKey) : null;
}

const FOCUSED_SCREENS: ScreenKey[] = ['new', 'pdf'];

export const isFocusedScreen = (pathname: string) => FOCUSED_SCREENS.includes(screenKey(pathname));

export function screenKey(pathname: string): ScreenKey {
  const [, , section, id, child] = pathname.split('/');
  if (section === 'estimates' && child === 'pdf') return 'pdf';
  if ((section === 'estimates' && id) || section === 'shared') return 'result';
  if (section === 'new' || section === 'check' || section === 'calcs' || section === 'settings') return section;
  return 'estimates';
}
