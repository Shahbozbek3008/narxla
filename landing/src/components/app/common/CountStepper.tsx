import { Minus, Plus } from 'lucide-react';

type CountStepperProps = {
  label: string;
  hint: string;
  value: number;
  max: number;
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (value: number) => void;
};

const BUTTON =
  'grid size-9 place-items-center rounded-[7px] text-fg-2 transition-colors duration-150 hover:bg-surface-3 hover:text-fg disabled:opacity-40 disabled:hover:bg-transparent';

export function CountStepper({ label, hint, value, max, decreaseLabel, increaseLabel, onChange }: CountStepperProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-[13px] text-fg-3">{hint}</span>
      </span>
      <span className="flex items-center gap-1 rounded-[10px] border border-line-2 bg-surface-2 p-[3px]">
        <button type="button" className={BUTTON} aria-label={decreaseLabel} disabled={value <= 0} onClick={() => onChange(value - 1)}>
          <Minus size={14} strokeWidth={2} aria-hidden />
        </button>
        <span className="w-7 text-center font-semibold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button type="button" className={BUTTON} aria-label={increaseLabel} disabled={value >= max} onClick={() => onChange(value + 1)}>
          <Plus size={14} strokeWidth={2} aria-hidden />
        </button>
      </span>
    </div>
  );
}
