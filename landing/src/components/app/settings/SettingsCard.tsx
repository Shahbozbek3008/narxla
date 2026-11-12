import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SettingsCardProps = {
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  tone?: 'default' | 'danger';
  className?: string;
  children?: ReactNode;
};

export function SettingsCard({ title, description, aside, footer, tone = 'default', className, children }: SettingsCardProps) {
  const danger = tone === 'danger';

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border bg-surface shadow-(--shadow-card)',
        danger ? 'border-danger/35' : 'border-line',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6 pt-5 pb-4">
        <div className="min-w-0">
          <h2 className={cn('text-base/6 font-semibold tracking-[-0.01em]', danger && 'text-danger')}>{title}</h2>
          {description && <p className="mt-0.5 max-w-[620px] text-[13px]/5 text-fg-3">{description}</p>}
        </div>
        {aside}
      </header>
      {children && <div className="divide-y divide-line border-t border-line">{children}</div>}
      {footer}
    </section>
  );
}

type SettingsFieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
};

export function SettingsField({ label, hint, htmlFor, children }: SettingsFieldProps) {
  const Label = htmlFor ? 'label' : 'span';

  return (
    <div className="grid items-center gap-x-8 gap-y-2.5 px-4 sm:px-6 py-4 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col">
        <Label htmlFor={htmlFor} className="text-sm/5 font-medium">
          {label}
        </Label>
        {hint && <span className="text-[13px]/[18px] text-fg-3">{hint}</span>}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

type SettingsFooterProps = {
  note?: ReactNode;
  tone?: 'default' | 'danger';
  children?: ReactNode;
};

export function SettingsFooter({ note, tone = 'default', children }: SettingsFooterProps) {
  return (
    <footer
      className={cn(
        'flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6',
        tone === 'danger' ? 'border-danger/25 bg-danger-soft' : 'border-line bg-surface-2',
      )}
    >
      {note && <p className="min-w-0 flex-1 text-[13px]/5 text-fg-3">{note}</p>}
      {children && <div className="flex shrink-0 items-center gap-2 max-sm:[&>*]:flex-1">{children}</div>}
    </footer>
  );
}
