import { ClipboardCheck, Flag, Hammer, LogOut, Menu, Package, RefreshCcw, Users, X, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useSession } from '@/entities/session';
import { ThemeToggle } from '@/features/toggle-theme';
import { routes } from '@/shared/config';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const NAV: NavItem[] = [
  { to: routes.review, label: 'Narxlarni tekshirish', icon: ClipboardCheck, end: true },
  { to: routes.catalog, label: 'Katalog', icon: Package },
  { to: routes.labour, label: 'Usta narxlari', icon: Hammer },
  { to: routes.scraper, label: 'Narx yig‘ish', icon: RefreshCcw },
  { to: routes.users, label: 'Foydalanuvchilar', icon: Users },
  { to: routes.reports, label: 'Shikoyatlar', icon: Flag },
];

function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-[10px] bg-accent text-sm font-bold text-accent-ink">N</span>
      <span className="text-[15px] font-semibold">Narxla</span>
      <span className="rounded-md bg-surface-3 px-1.5 text-[11px]/5 font-semibold text-fg-2">Admin</span>
    </span>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Admin navigatsiya">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm transition-colors duration-150',
              isActive ? 'bg-surface-3 font-medium text-fg shadow-[inset_0_0_0_1px_var(--border)]' : 'text-fg-2 hover:bg-surface-2 hover:text-fg',
            )
          }
        >
          <Icon size={17} strokeWidth={1.6} aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  const signOut = useSession((state) => state.signOut);
  return (
    <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
      <Button variant="ghost" size="xs" onClick={signOut}>
        <LogOut size={15} strokeWidth={1.75} aria-hidden />
        Chiqish
      </Button>
      <ThemeToggle />
    </div>
  );
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-line bg-bg-2 p-4 lg:flex">
        <Brand />
        <Navigation />
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur lg:hidden">
          <Brand />
          <Button variant="ghost" size="xs" aria-label="Menyu" onClick={() => setMenuOpen(true)}>
            <Menu size={20} strokeWidth={1.75} />
          </Button>
        </header>
        <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Yopish" className="absolute inset-0 bg-overlay" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col gap-6 border-r border-line bg-bg-2 p-4">
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="ghost" size="xs" aria-label="Yopish" onClick={() => setMenuOpen(false)}>
                <X size={18} strokeWidth={1.75} />
              </Button>
            </div>
            <Navigation onNavigate={() => setMenuOpen(false)} />
            <SidebarFooter />
          </aside>
        </div>
      )}
    </div>
  );
}
