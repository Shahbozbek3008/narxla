'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
};

type Size = 'sm' | 'md';

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  size?: Size;
};

const ROOT: Record<Size, string> = {
  sm: 'gap-0.5 rounded-[10px] p-[3px]',
  md: 'gap-1 rounded-xl p-1',
};

const OPTION: Record<Size, string> = {
  sm: 'h-[30px] gap-1.5 rounded-[7px] px-2.5 text-[13px]',
  md: 'h-9 gap-2 rounded-[9px] px-4 text-sm',
};

export function Segmented<T extends string>({ label, value, options, onChange, size = 'sm' }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={clsx('inline-flex border border-line bg-surface-2', ROOT[size])}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={clsx(
            'flex items-center font-medium whitespace-nowrap text-fg-2 transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-offset-1',
            'aria-checked:bg-surface aria-checked:text-fg aria-checked:shadow-[var(--shadow-card),0_0_0_1px_var(--border)]',
            OPTION[size],
          )}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          {option.label}
          {option.badge && (
            <span className="rounded-md bg-accent-soft px-1.5 text-xs/5 font-semibold text-accent-text">{option.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
