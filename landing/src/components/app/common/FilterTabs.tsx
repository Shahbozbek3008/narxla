'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FilterTab<T extends string> = {
  value: T;
  label: ReactNode;
  count: number;
  icon?: ReactNode;
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
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scroller.current;
    const active = container?.querySelector<HTMLElement>('[aria-pressed=true]');
    if (!container || !active || container.scrollWidth <= container.clientWidth) return;
    const left = active.offsetLeft - (container.clientWidth - active.offsetWidth) / 2;
    container.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [value, reducedMotion]);

  return (
    <div className={cn('relative -mx-4 border-b border-line sm:mx-0', className)}>
      <div
        ref={scroller}
        role="group"
        aria-label={label}
        className="scrollbar-none max-sm:fade-x relative flex gap-1 overflow-x-auto px-4 sm:px-0"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                'group relative flex h-11 shrink-0 items-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none sm:first:-ml-3',
                'focus-visible:rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring',
                selected ? 'text-fg' : 'text-fg-3 hover:text-fg',
              )}
            >
              <span
                className="absolute inset-x-1 inset-y-1.5 rounded-lg transition-colors duration-150 group-hover:bg-surface-2"
                aria-hidden
              />
              {option.icon && (
                <span className={cn('relative transition-colors duration-150', selected && 'text-accent-text')}>{option.icon}</span>
              )}
              <span className="relative">{option.label}</span>
              <span
                className={cn(
                  'relative grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums transition-colors duration-150',
                  selected ? 'bg-fg text-bg' : 'bg-surface-3 text-fg-3',
                )}
              >
                {option.count}
              </span>
              {selected && (
                <motion.span
                  layoutId={id}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 42 }}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
