import { cn } from '@/shared/lib';

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-line bg-surface-2 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-8 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150',
            option.value === value ? 'bg-surface text-fg shadow-[inset_0_0_0_1px_var(--border-2)]' : 'text-fg-2 hover:text-fg',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
