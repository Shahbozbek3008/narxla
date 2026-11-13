'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';

type MethodButtonProps = Omit<ComponentProps<typeof Button>, 'children'> & { pending?: boolean };

const Spinner = () => <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden />;

export function ConnectButton({ pending, ...props }: MethodButtonProps) {
  const t = useTranslations('app.settings.profile');
  return (
    <Button variant="secondary" size="xs" className="shrink-0" {...props}>
      {pending && <Spinner />}
      {t('connect')}
    </Button>
  );
}

export function DisconnectButton({ pending, ...props }: MethodButtonProps) {
  const t = useTranslations('app.settings.profile');
  return (
    <Button variant="ghost" size="xs" className="shrink-0 text-danger hover:bg-danger-soft hover:text-danger" {...props}>
      {pending && <Spinner />}
      {t('disconnect')}
    </Button>
  );
}
