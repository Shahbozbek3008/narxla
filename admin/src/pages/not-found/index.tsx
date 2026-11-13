import { Link } from 'react-router';
import { routes } from '@/shared/config';
import { EmptyState } from '@/shared/ui';

export function NotFoundPage() {
  return (
    <EmptyState>
      Sahifa topilmadi.{' '}
      <Link to={routes.review} className="font-medium text-accent-text hover:underline">
        Bosh sahifaga
      </Link>
    </EmptyState>
  );
}
