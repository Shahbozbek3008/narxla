import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { DraftStep } from '@/store/draft';

const STEP_KEYS = ['room', 'dims', 'works', 'quality'] as const;

type StepNavProps = {
  current: DraftStep;
  onSelect: (step: DraftStep) => void;
};

export function StepNav({ current, onSelect }: StepNavProps) {
  const t = useTranslations('app.wizard');

  return (
    <ol aria-label={t('stepsLabel')} className="mt-6 grid grid-cols-4 gap-1.5 sm:gap-4">
      {STEP_KEYS.map((key, index) => {
        const label = t(`steps.${key}`);
        const step = index as DraftStep;
        const done = step < current;
        const active = step === current;

        return (
          <li key={label} className="min-w-0">
            <button
              type="button"
              disabled={!done}
              aria-current={active ? 'step' : undefined}
              onClick={() => onSelect(step)}
              className="flex w-full min-w-0 flex-col gap-3 text-left focus-visible:rounded-[4px] focus-visible:outline-offset-4 enabled:cursor-pointer disabled:cursor-default"
            >
              <span className="relative block h-[3px] w-full overflow-hidden rounded-[3px] bg-surface-3">
                <span
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-[3px] bg-accent transition-[width] duration-600 ease-(--ease-out-expo)',
                    active && 'shadow-[0_0_12px_var(--glow)]',
                  )}
                  style={{ width: step <= current ? '100%' : '0%' }}
                />
              </span>
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    'font-mono text-xs/4 tabular-nums transition-colors duration-300',
                    active ? 'text-accent-text' : done ? 'text-fg-2' : 'text-fg-3',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'truncate text-sm/5 transition-colors duration-300',
                    active ? 'font-semibold text-fg' : done ? 'font-medium text-fg' : 'font-medium text-fg-3',
                    !active && 'max-sm:hidden',
                  )}
                >
                  {label}
                </span>
                {done && <Check className="shrink-0 text-accent-text" size={13} strokeWidth={2.5} aria-hidden />}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
