import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EyebrowProps = {
  tone?: 'accent' | 'danger';
  children: ReactNode;
};

export function Eyebrow({ tone = 'accent', children }: EyebrowProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface py-1 pr-3 pl-2.5 text-[13px]/5 font-medium text-fg-2 shadow-(--shadow-card)">
      <span className={cn('size-1.5 rounded-full', tone === 'danger' ? 'bg-danger' : 'bg-accent')} />
      {children}
    </span>
  );
}
