import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FeatureCardProps = {
  layout?: 'stack' | 'grid';
  className?: string;
  children: ReactNode;
};

const LAYOUT = {
  stack: 'flex flex-col gap-5',
  grid: 'grid',
};

export const featureTitleClass = (large = false) =>
  cn('font-display font-semibold tracking-[-0.02em]', large ? 'text-[22px]/[30px]' : 'text-xl/7');

export const featureTextClass = 'mt-2 text-[15px]/6 text-pretty text-fg-2';

export function FeatureCard({ layout = 'stack', className, children }: FeatureCardProps) {
  return (
    <article
      className={cn(
        'spotlight sheen h-full rounded-2xl border border-line bg-surface p-6 shadow-(--shadow-card) transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-lift)',
        LAYOUT[layout],
        className,
      )}
    >
      {children}
    </article>
  );
}

type FeatureIntroProps = {
  title: string;
  text: string;
};

export function FeatureIntro({ title, text }: FeatureIntroProps) {
  return (
    <div>
      <h3 className={featureTitleClass()}>{title}</h3>
      <p className={featureTextClass}>{text}</p>
    </div>
  );
}
