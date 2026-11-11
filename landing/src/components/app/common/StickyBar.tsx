import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function StickyBar({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'glass sticky bottom-[84px] z-30 flex items-center gap-3 rounded-2xl border border-line-2 p-3 shadow-(--shadow-elev) md:bottom-4',
        className,
      )}
      {...props}
    />
  );
}

export function StickyTotal({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-xs/4 text-fg-3">{label}</span>
      <span className="font-display text-base/[22px] font-semibold whitespace-nowrap tabular-nums">{value}</span>
    </span>
  );
}
