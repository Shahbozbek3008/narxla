'use client';

import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuLabel = DropdownMenuPrimitive.Label;

function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'sheen z-71 origin-(--radix-dropdown-menu-content-transform-origin) rounded-[14px] border border-line-2 bg-surface-2 p-1.5 text-fg shadow-(--shadow-elev) outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-97 data-[state=open]:duration-350 data-[state=open]:ease-(--ease-out-expo)',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-97 data-[state=closed]:duration-200',
          'data-[side=bottom]:slide-in-from-top-1.5 data-[side=top]:slide-in-from-bottom-1.5',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

type DropdownMenuItemProps = ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  tone?: 'default' | 'danger';
};

function DropdownMenuItem({ className, tone = 'default', ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        'flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-sm outline-none transition-colors duration-[120ms] select-none data-highlighted:bg-surface-3 [&_svg]:opacity-85',
        tone === 'danger' ? 'text-danger' : 'text-fg',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuRadioItem({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        'flex h-9 w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 text-left text-sm text-fg outline-none transition-colors duration-[120ms] select-none data-highlighted:bg-surface-3',
        className,
      )}
      {...props}
    />
  );
}

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
const DropdownMenuItemIndicator = DropdownMenuPrimitive.ItemIndicator;

function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn('mx-1 my-1.5 h-px bg-line', className)} {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
