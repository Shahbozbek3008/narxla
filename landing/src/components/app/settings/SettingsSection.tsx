import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SettingsSection as SectionId } from '@/lib/routes';
import { card } from '../common/styles';

type SettingsSectionProps = {
  id: SectionId;
  title: string;
  lead: string;
  children: ReactNode;
};

export function SettingsSection({ id, title, lead, children }: SettingsSectionProps) {
  return (
    <section id={id} className={cn(card, 'scroll-mt-6 overflow-hidden')}>
      <div className="px-5 py-[18px]">
        <h2 className="font-display text-[17px]/6 font-semibold tracking-[-0.01em]">{title}</h2>
        <p className="mt-0.5 text-[13px]/[18px] text-fg-3">{lead}</p>
      </div>
      {children}
    </section>
  );
}

type SettingsRowProps = {
  title: string;
  hint?: string;
  children: ReactNode;
};

export function SettingsRow({ title, hint, children }: SettingsRowProps) {
  return (
    <div className="grid items-center gap-x-6 gap-y-2.5 border-t border-line px-5 py-[18px] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <span className="flex flex-col">
        <span className="text-sm/5 font-medium">{title}</span>
        {hint && <span className="text-[13px]/[18px] text-fg-3">{hint}</span>}
      </span>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}
