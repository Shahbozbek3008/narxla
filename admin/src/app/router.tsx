import { createBrowserRouter } from 'react-router';
import { LoginPage } from '@/pages/login';
import { routes } from '@/shared/config';
import { AppShell } from '@/widgets/app-shell';
import { GuestOnly, RequireSession } from './guards';
import { RouteError } from './route-error';

export const router = createBrowserRouter([
  {
    path: routes.login,
    errorElement: <RouteError />,
    element: (
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    ),
  },
  {
    errorElement: <RouteError />,
    element: (
      <RequireSession>
        <AppShell />
      </RequireSession>
    ),
    children: [
      { index: true, lazy: () => import('@/pages/review').then(({ ReviewPage }) => ({ Component: ReviewPage })) },
      { path: 'catalog/:code?', lazy: () => import('@/pages/catalog').then(({ CatalogPage }) => ({ Component: CatalogPage })) },
      { path: 'labour', lazy: () => import('@/pages/labour').then(({ LabourPage }) => ({ Component: LabourPage })) },
      { path: 'scraper', lazy: () => import('@/pages/scraper').then(({ ScraperPage }) => ({ Component: ScraperPage })) },
      { path: 'users', lazy: () => import('@/pages/users').then(({ UsersPage }) => ({ Component: UsersPage })) },
      { path: 'reports', lazy: () => import('@/pages/reports').then(({ ReportsPage }) => ({ Component: ReportsPage })) },
      { path: '*', lazy: () => import('@/pages/not-found').then(({ NotFoundPage }) => ({ Component: NotFoundPage })) },
    ],
  },
]);
