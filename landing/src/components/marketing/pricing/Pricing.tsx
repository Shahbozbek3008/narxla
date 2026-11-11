'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Segmented } from '@/components/ui/Segmented';
import { ANCHORS } from '@/lib/anchors';
import { stagger } from '@/lib/motion';
import { PlanCard, type Billing, type PlanId } from './PlanCard';

const PLANS: { id: PlanId; featured: boolean }[] = [
  { id: 'free', featured: false },
  { id: 'plus', featured: true },
  { id: 'pro', featured: false },
];

export function Pricing() {
  const t = useTranslations('pricing');
  const [billing, setBilling] = useState<Billing>('annual');

  return (
    <Section id={ANCHORS.pricing}>
      <div className="flex flex-col items-center">
        <SectionHeading align="center" eyebrow={t('eyebrow')} title={t('title')} />
        <div className="mt-8">
          <Segmented<Billing>
            size="md"
            label={t('billingLabel')}
            value={billing}
            onChange={setBilling}
            options={[
              { value: 'monthly', label: t('monthly') },
              { value: 'annual', label: t('annual'), badge: t('discount') },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-[480px] grid-cols-1 gap-4 md:max-w-none md:grid-cols-3">
        {PLANS.map(({ id, featured }, index) => (
          <Reveal key={id} delay={stagger(index, 100)}>
            <PlanCard id={id} billing={billing} featured={featured} />
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-center text-[13px]/5 text-fg-3">{t('payments')}</p>
    </Section>
  );
}
