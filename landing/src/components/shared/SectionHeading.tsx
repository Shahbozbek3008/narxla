import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';
import { Reveal } from './Reveal';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  align?: 'start' | 'center';
  width?: 'md' | 'sm' | 'xs';
  leadSize?: 'md' | 'lg';
};

const WIDTH = {
  md: 'max-w-[640px]',
  sm: 'max-w-[560px]',
  xs: 'max-w-[400px]',
};

const LEAD_SIZE = {
  md: 'text-base/6',
  lg: 'text-lg/7',
};

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'start',
  width = 'md',
  leadSize = 'lg',
}: SectionHeadingProps) {
  return (
    <div className={clsx(WIDTH[width], align === 'center' && 'mx-auto text-center')}>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="gradient-text mt-4 pb-1 font-display text-[clamp(30px,4vw,48px)] leading-[1.12] font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={160}>
          <p className={clsx('mt-4 text-pretty text-fg-2', LEAD_SIZE[leadSize])}>{lead}</p>
        </Reveal>
      )}
    </div>
  );
}
