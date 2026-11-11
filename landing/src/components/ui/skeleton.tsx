import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="skeleton" className={cn('skeleton rounded-md', className)} aria-hidden {...props} />;
}

export { Skeleton };
