'use client';

import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type PanelHeaderProps = {
  title: string;
  lead: string;
  onRefresh?: () => void;
  actions?: ReactNode;
};

export function PanelHeader({ title, lead, onRefresh, actions }: PanelHeaderProps) {
  const t = useTranslations('admin');

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl/8 font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="text-sm text-fg-2">{lead}</p>
      </div>
      <div className="flex gap-2">
        {actions}
        {onRefresh && (
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            <RefreshCw size={15} strokeWidth={1.75} aria-hidden />
            {t('refresh')}
          </Button>
        )}
      </div>
    </div>
  );
}

type PanelStateProps = {
  loading: boolean;
  error: string | null;
  children: ReactNode;
};

export function PanelState({ loading, error, children }: PanelStateProps) {
  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
        {error}
      </p>
    );
  }
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }
  return children;
}
