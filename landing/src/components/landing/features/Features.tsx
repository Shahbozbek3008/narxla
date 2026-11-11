import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ANCHORS } from '@/lib/anchors';
import { stagger } from '@/lib/motion';
import { LivePricesCard } from './cards/LivePricesCard';
import { MaterialsCard } from './cards/MaterialsCard';
import { PdfCard } from './cards/PdfCard';
import { PlanCard } from './cards/PlanCard';
import { PriceCheckCard } from './cards/PriceCheckCard';
import { ProjectsCard } from './cards/ProjectsCard';

type Span = 2 | 4 | 6;

const SPAN: Record<Span, string> = {
  2: 'lg:col-span-2',
  4: 'sm:col-span-2 lg:col-span-4',
  6: 'sm:col-span-2 lg:col-span-6',
};

const BENTO: { key: string; span: Span; Card: ComponentType }[] = [
  { key: 'materials', span: 4, Card: MaterialsCard },
  { key: 'check', span: 2, Card: PriceCheckCard },
  { key: 'prices', span: 2, Card: LivePricesCard },
  { key: 'pdf', span: 2, Card: PdfCard },
  { key: 'plan', span: 2, Card: PlanCard },
  { key: 'projects', span: 6, Card: ProjectsCard },
];

export function Features() {
  const t = useTranslations('features');

  return (
    <Section id={ANCHORS.features} tone="alt">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />
      <div className="mt-[clamp(40px,5vw,64px)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {BENTO.map(({ key, span, Card }, index) => (
          <Reveal key={key} delay={stagger(index, 80)} className={SPAN[span]}>
            <Card />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
