'use client';

import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function ToggleGroup({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('inline-flex gap-0.5 rounded-[10px] border border-line bg-surface-2 p-[3px]', className)}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-[7px] font-medium whitespace-nowrap text-fg-2 transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-offset-1',
        'data-[state=on]:bg-surface data-[state=on]:text-fg data-[state=on]:shadow-[var(--shadow-card),0_0_0_1px_var(--border)]',
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
