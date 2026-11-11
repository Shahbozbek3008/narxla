import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SelectCardProps = {
  selected: boolean;
  indicator: 'radio' | 'checkbox';
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  footer?: ReactNode;
  onSelect: () => void;
};

export function SelectCard({ selected, indicator, icon, title, description, footer, onSelect }: SelectCardProps) {
  return (
    <button
      type="button"
      role={indicator}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'sheen relative flex flex-col gap-3.5 rounded-2xl border bg-surface p-[18px] text-left transition-[border-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:border-fg-3 active:translate-y-0',
        selected
          ? 'border-accent shadow-[0_0_0_4px_var(--accent-soft),var(--shadow-card)]'
          : 'border-line shadow-(--shadow-card)',
      )}
    >
      <span
        className={cn(
          'grid size-10 place-items-center rounded-[11px] border border-line-2',
          selected ? 'bg-accent-soft text-accent-text' : 'bg-surface-2 text-fg-2',
        )}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-[13px]/5 text-fg-3">{description}</span>
      </span>
      {footer}
      <span
        aria-hidden
        className={cn(
          'absolute top-4 right-4 grid size-5 place-items-center border-[1.5px] text-accent-ink transition-all duration-200',
          indicator === 'radio' ? 'rounded-full' : 'rounded-md',
          selected ? 'border-accent bg-accent' : 'border-line-2 bg-transparent',
        )}
      >
        <Check size={11} strokeWidth={3} className={selected ? 'opacity-100' : 'opacity-0'} />
      </span>
    </button>
  );
}
