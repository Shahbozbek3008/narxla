'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { isProtectedPath } from '@/lib/access';
import { useAuth } from '@/lib/api/queries';
import { routes, withNext } from '@/lib/routes';
import { usePrices } from '@/store/prices';
import { ConfirmDialogHost } from './ConfirmDialogHost';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
  const blocked = isProtectedPath(pathname) && status !== 'authenticated';

  useEffect(() => {
    void usePrices.getState().load();
  }, []);

  useEffect(() => {
    if (status === 'guest' && isProtectedPath(pathname)) router.replace(withNext(routes.login, pathname));
  }, [status, pathname, router]);

  return (
    <div className="flex min-h-screen [--nav-bg:rgba(11,13,18,.78)] light:[--nav-bg:rgba(250,250,248,.8)]">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col pb-[84px] md:pb-0">
        <TopBar />
        <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col px-[clamp(16px,4vw,40px)] pt-[clamp(20px,4vw,40px)]">
          {!blocked && children}
        </div>
      </main>
      <TabBar />
      <ConfirmDialogHost />
    </div>
  );
}
