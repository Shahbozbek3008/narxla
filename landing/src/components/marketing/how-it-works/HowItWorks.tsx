import { useTranslations } from 'next-intl';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { type Step, StepsShowcase } from './StepsShowcase';

export function HowItWorks() {
  const t = useTranslations('how');

  return (
    <Section>
      <SectionHeading align="center" eyebrow={t('eyebrow')} title={t('title')} />
      <StepsShowcase steps={t.raw('steps') as Step[]} />
    </Section>
  );
}
