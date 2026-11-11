'use client';

import { Check, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ToastKind = 'success' | 'info';

type NotifyOptions = {
  title: string;
  description?: string;
  kind?: ToastKind;
  closeLabel: string;
};

const ICON = {
  success: { Icon: Check, className: 'bg-success-soft text-success' },
  info: { Icon: Info, className: 'bg-accent-soft text-accent-text' },
};

export function notify({ title, description, kind = 'success', closeLabel }: NotifyOptions) {
  const { Icon, className } = ICON[kind];
  toast.dismiss();
  toast.custom((id) => (
    <div className="sheen flex w-full max-w-[380px] items-start gap-3 rounded-[14px] border border-line-2 bg-surface py-3.5 pr-3 pl-3.5 text-fg shadow-(--shadow-elev) sm:w-[380px]">
      <span className={cn('grid size-7 shrink-0 place-items-center rounded-full', className)}>
        <Icon size={14} strokeWidth={2.25} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm/5 font-semibold">{title}</span>
        {description && <span className="text-[13px]/[18px] text-fg-2">{description}</span>}
      </span>
      <button
        type="button"
        aria-label={closeLabel}
        className="grid size-7 shrink-0 place-items-center rounded-[7px] text-fg-3 transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
        onClick={() => toast.dismiss(id)}
      >
        <X size={14} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  ));
}
