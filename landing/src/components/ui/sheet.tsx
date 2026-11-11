'use client';

import { Dialog as SheetPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetTitle = SheetPrimitive.Title;

type SheetContentProps = ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'left' | 'right';
};

const SIDE = {
  right:
    'right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  left: 'left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
};

function SheetContent({ className, side = 'right', children, ...props }: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-100 bg-overlay backdrop-blur-[6px] duration-350 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        aria-describedby={undefined}
        className={cn(
          'sheen fixed inset-y-0 z-100 flex w-[min(340px,88vw)] flex-col overflow-x-hidden overflow-y-auto border-line-2 bg-surface shadow-(--shadow-elev) outline-none',
          'duration-450 ease-(--ease-drawer) data-[state=closed]:animate-out data-[state=open]:animate-in',
          SIDE[side],
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger };
