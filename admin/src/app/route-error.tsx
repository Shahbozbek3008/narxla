import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { routes } from '@/shared/config';
import { Button } from '@/shared/ui';

function describe(error: unknown) {
  if (isRouteErrorResponse(error)) return `${error.status} · ${error.statusText}`;
  return error instanceof Error ? error.message : 'Noma’lum xatolik';
}

export function RouteError() {
  const error = useRouteError();

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="card flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-xl font-semibold">Nimadir noto‘g‘ri ketdi</h1>
        <p className="text-sm break-words text-fg-2">{describe(error)}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Qayta yuklash
          </Button>
          <Link to={routes.review}>
            <Button>Bosh sahifa</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
