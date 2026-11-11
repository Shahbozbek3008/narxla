import type { ReactNode } from 'react';
import { Container } from './Container';
import { cn } from '@/lib/utils';

type SectionProps = {
  id?: string;
  tone?: 'base' | 'alt';
  bordered?: boolean;
  spacing?: 'both' | 'bottom';
  children: ReactNode;
};

const SPACING = {
  both: 'py-[clamp(64px,10vw,128px)]',
  bottom: 'pb-[clamp(64px,10vw,128px)]',
};

export function Section({ id, tone = 'base', bordered = false, spacing = 'both', children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        SPACING[spacing],
        tone === 'alt' && 'border-y border-line bg-bg-2',
        bordered && 'border-t border-line',
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}
