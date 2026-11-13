import { useTranslations } from 'next-intl';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { LiveCalculator } from './LiveCalculator';

export function LiveCalcSection() {
  const t = useTranslations('liveCalc');

  return (
    <Section tone="alt">
      <SectionHeading align="center" eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} leadWidth="sm" />
      <LiveCalculator />
    </Section>
  );
}
