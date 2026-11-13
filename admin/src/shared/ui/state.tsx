import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { SkeletonList } from './skeleton';

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('rounded-2xl border border-dashed border-line-2 px-6 py-10 text-center text-sm text-fg-2', className)}>{children}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}

type QueryStateProps = {
  loading: boolean;
  error: Error | null;
  children: ReactNode;
  rows?: number;
};

export function QueryState({ loading, error, children, rows }: QueryStateProps) {
  if (error) return <ErrorState message={error.message} />;
  if (loading) return <SkeletonList rows={rows} />;
  return children;
}
