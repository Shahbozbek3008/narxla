import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyCardProps = {
  icon?: ReactNode;
  title: ReactNode;
  text: ReactNode;
  action?: ReactNode;
  dashed?: boolean;
  className?: string;
};

export function EmptyCard({ icon, title, text, action, dashed = false, className }: EmptyCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl px-6 py-12 text-center',
        dashed ? 'border border-dashed border-line-2' : 'border border-line bg-surface',
        className,
      )}
    >
      {icon && (
        <span className="mb-2 grid size-10 place-items-center rounded-xl border border-line-2 text-fg-3">{icon}</span>
      )}
      <div className="font-semibold">{title}</div>
      <div className="max-w-[320px] text-sm text-fg-2">{text}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
