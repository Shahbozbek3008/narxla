'use client';

import clsx from 'clsx';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { appLinks } from '@/lib/config';

export type Billing = 'monthly' | 'annual';
export type PlanId = 'free' | 'plus' | 'pro';

type PlanCardProps = {
  id: PlanId;
  billing: Billing;
  featured: boolean;
};

export function PlanCard({ id, billing, featured }: PlanCardProps) {
  const t = useTranslations('pricing');
  const features = t.raw(`plans.${id}.features`) as string[];

  return (
    <article
      className={clsx(
        'flex h-full flex-col rounded-3xl border bg-surface p-8',
        featured
          ? 'border-accent shadow-[0_0_0_4px_var(--accent-soft),var(--shadow-lift),0_24px_80px_-24px_var(--glow)]'
          : 'sheen border-line shadow-(--shadow-card)',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">{t(`plans.${id}.name`)}</h3>
        {featured && (
          <Badge tone="solid" size="sm">
            {t('popular')}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm/5 text-fg-2">{t(`plans.${id}.desc`)}</p>

      <div className="mt-6 flex items-baseline gap-1.5 tabular-nums">
        <span className="font-display text-[44px]/[52px] font-semibold tracking-[-0.03em]">
          {t(`plans.${id}.price.${billing}`)}
        </span>
        <span className="text-sm text-fg-2">{t(`plans.${id}.unit`)}</span>
      </div>
      <p className="min-h-5 text-[13px]/5 text-fg-3 tabular-nums">{t(`plans.${id}.note.${billing}`)}</p>

      <ButtonLink
        href={appLinks.newEstimate}
        variant={featured ? 'primary' : 'secondary'}
        size="md"
        block
        className="mt-6"
      >
        {t(`plans.${id}.cta`)}
      </ButtonLink>

      <ul
        className={clsx(
          'mt-6 flex flex-col gap-3 border-t border-line pt-6 text-sm/5',
          featured ? 'text-fg' : 'text-fg-2',
        )}
      >
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <Check
              className={clsx('mt-0.5 shrink-0', featured ? 'text-accent-text' : 'text-fg-3')}
              size={16}
              strokeWidth={1.75}
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}
