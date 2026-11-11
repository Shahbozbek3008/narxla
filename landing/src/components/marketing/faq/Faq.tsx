import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/shared/Reveal';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ANCHORS } from '@/lib/anchors';
import { externalLinks } from '@/lib/config';
import { stagger } from '@/lib/motion';

type FaqItem = { question: string; answer: string };

const itemValue = (index: number) => `faq-${index}`;

export function Faq() {
  const t = useTranslations('faq');
  const items = t.raw('items') as FaqItem[];

  const lead = t.rich('lead', {
    link: (chunks) => (
      <a href={externalLinks.telegram} className="font-medium text-accent-text" target="_blank" rel="noreferrer">
        {chunks}
      </a>
    ),
  });

  return (
    <Section id={ANCHORS.faq} bordered>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-[clamp(32px,6vw,96px)]">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={lead} leadSize="md" width="xs" />

        <Accordion type="single" collapsible defaultValue={itemValue(0)} className="border-t border-line">
          {items.map((item, index) => (
            <Reveal key={item.question} delay={stagger(index, 60)}>
              <AccordionItem value={itemValue(index)}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
