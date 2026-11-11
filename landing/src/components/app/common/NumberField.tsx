import { CircleAlert } from 'lucide-react';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { fieldLabel } from './styles';

type NumberFieldProps = Omit<ComponentProps<'input'>, 'size'> & {
  label: ReactNode;
  labelAside?: ReactNode;
  unit?: string;
  hint?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  size?: 'md' | 'lg' | 'xl';
};

const SIZE = {
  md: 'h-12 pr-10',
  lg: 'h-[52px] pr-[52px] font-display text-xl font-semibold',
  xl: 'h-14 pr-14 font-display text-[22px] font-semibold tracking-[-0.01em]',
};

const UNIT_TOP = { md: 'top-3', lg: 'top-[15px]', xl: 'top-[17px]' };

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <span className="flex gap-2 text-[13px]/[18px] text-danger">
      <CircleAlert className="mt-px shrink-0" size={15} strokeWidth={1.75} aria-hidden />
      {children}
    </span>
  );
}

export function NumberField({
  label,
  labelAside,
  unit,
  hint,
  error,
  invalid = false,
  size = 'md',
  inputMode = 'decimal',
  className,
  ...props
}: NumberFieldProps) {
  const id = useId();

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cn(fieldLabel, 'flex items-center justify-between gap-2')}>
        {label}
        {labelAside}
      </label>
      <span className="relative flex">
        <Input id={id} inputMode={inputMode} aria-invalid={invalid || undefined} className={SIZE[size]} {...props} />
        {unit && (
          <span className={cn('pointer-events-none absolute right-3.5 text-sm text-fg-3', UNIT_TOP[size])}>{unit}</span>
        )}
      </span>
      {error}
      {!error && hint && <span className="text-[13px]/[18px] text-fg-3">{hint}</span>}
    </div>
  );
}
