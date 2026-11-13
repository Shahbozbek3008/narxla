'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from '@/i18n/navigation';
import { useRouter } from '@/i18n/router';
import { isProtectedPath } from '@/lib/access';
import { useAuth } from '@/lib/api/queries';
import { routes, withNext } from '@/lib/routes';
import { usePrices } from '@/store/prices';
import { AssistantWidget } from '../assistant/AssistantWidget';
import { ConfirmDialogHost } from './ConfirmDialogHost';
import { isFocusedScreen } from './navigation';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
  const blocked = isProtectedPath(pathname) && status !== 'authenticated';
  const focused = isFocusedScreen(pathname);

  useEffect(() => {
    void usePrices.getState().load();
  }, []);

  useEffect(() => {
    if (status === 'guest' && isProtectedPath(pathname)) router.replace(withNext(routes.login, pathname));
  }, [status, pathname, router]);

  return (
    <div
      data-focused={focused}
      className="flex min-h-screen [--nav-bg:rgba(14,22,33,.8)] [--tabbar-space:calc(68px+env(safe-area-inset-bottom))] light:[--nav-bg:rgba(250,250,248,.8)] data-[focused=true]:[--tabbar-space:env(safe-area-inset-bottom)] md:[--tabbar-space:0px]"
    >
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col pb-[calc(var(--tabbar-space)+16px)] md:pb-0">
        <TopBar />
        <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col overflow-y-clip px-[clamp(16px,4vw,40px)] pt-[clamp(20px,4vw,40px)]">
          {!blocked && children}
        </div>
      </main>
      {!focused && <TabBar />}
      {!focused && <AssistantWidget className="max-md:bottom-[calc(var(--tabbar-space)+12px)]" />}
      <ConfirmDialogHost />
    </div>
  );
}
