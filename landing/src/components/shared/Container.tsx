import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Container({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cn('relative mx-auto max-w-[1200px] px-[clamp(20px,5vw,24px)]', className)} {...rest} />;
}
