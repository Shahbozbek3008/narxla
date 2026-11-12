'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FilterTab<T extends string> = {
  value: T;
  label: ReactNode;
  count: number;
};

type FilterTabsProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  options: FilterTab<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function FilterTabs<T extends string>({ id, label, value, options, onChange, className }: FilterTabsProps<T>) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={cn('scrollbar-none max-sm:fade-x -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)}>
      <div role="group" aria-label={label} className="inline-flex gap-0.5 rounded-xl border border-line bg-surface-2 p-1">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 outline-none sm:h-8',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                selected ? 'text-fg' : 'text-fg-3 hover:text-fg',
              )}
            >
              {selected && (
                <motion.span
                  layoutId={id}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 40 }}
                  className="absolute inset-0 rounded-lg bg-surface shadow-[0_1px_2px_rgba(0,0,0,.12),0_0_0_1px_var(--border)]"
                  aria-hidden
                />
              )}
              <span className="relative">{option.label}</span>
              <span
                className={cn(
                  'relative min-w-5 rounded-md px-1.5 text-center text-[11px]/[18px] font-semibold tabular-nums transition-colors duration-150',
                  selected ? 'bg-accent-soft text-accent-text' : 'bg-surface-3 text-fg-3',
                )}
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
