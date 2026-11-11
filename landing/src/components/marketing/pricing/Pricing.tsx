import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/shared/Reveal';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { ANCHORS } from '@/lib/anchors';
import { stagger } from '@/lib/motion';
import { FEATURED_PLAN, PLAN_KINDS } from '@/lib/plans';
import { PlanCard } from './PlanCard';

export function Pricing() {
  const t = useTranslations('pricing');

  return (
    <Section id={ANCHORS.pricing}>
      <SectionHeading align="center" eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} leadWidth="sm" />

      <div className="mx-auto mt-12 grid max-w-[480px] grid-cols-1 gap-4 md:max-w-none md:grid-cols-3">
        {PLAN_KINDS.map((id, index) => (
          <Reveal key={id} delay={stagger(index, 100)}>
            <PlanCard id={id} featured={id === FEATURED_PLAN} />
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-center text-[13px]/5 text-fg-3">{t('payments')}</p>
    </Section>
  );
}
