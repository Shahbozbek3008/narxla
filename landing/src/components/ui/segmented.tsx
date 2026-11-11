'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { cn } from '@/lib/utils';

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  ariaLabel?: string;
};

const itemVariants = cva('', {
  variants: {
    size: {
      icon: 'h-[30px] w-[34px]',
      mini: 'h-6 rounded-md px-2 text-xs',
      xs: 'h-[30px] px-2.5 text-[13px]',
      sm: 'h-8 px-3.5 text-[13px]',
      md: 'h-[34px] px-3 text-[13px]',
    },
    stretch: {
      true: 'flex-[1_1_auto] px-2.5',
    },
  },
  defaultVariants: { size: 'sm' },
});

type SegmentedProps<T extends string> = VariantProps<typeof itemVariants> & {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  wrap?: boolean;
  className?: string;
};

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size,
  stretch,
  wrap = false,
  className,
}: SegmentedProps<T>) {
  return (
    <ToggleGroup
      type="single"
      aria-label={label}
      value={value}
      onValueChange={(next) => next && onChange(next as T)}
      className={cn(wrap && 'flex flex-wrap', stretch && 'flex w-full', className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.ariaLabel}
          className={cn(itemVariants({ size, stretch }), 'tabular-nums')}
        >
          {option.icon}
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
