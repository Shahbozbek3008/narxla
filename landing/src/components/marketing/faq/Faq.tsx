'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ANCHORS } from '@/lib/anchors';
import { externalLinks } from '@/lib/config';
import { stagger } from '@/lib/motion';

type FaqItem = { question: string; answer: string };

const CLOSED = -1;

export function Faq() {
  const t = useTranslations('faq');
  const items = t.raw('items') as FaqItem[];
  const [openIndex, setOpenIndex] = useState(0);
  const baseId = useId();

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

        <div className="border-t border-line">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-${index}`;

            return (
              <Reveal key={item.question} delay={stagger(index, 60)} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    className="group flex w-full items-center justify-between gap-4 py-5 text-left text-[17px]/[26px] font-medium text-fg focus-visible:rounded-md"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? CLOSED : index)}
                  >
                    {item.question}
                    <ChevronDown
                      className="shrink-0 text-fg-3 transition-transform duration-250 group-aria-expanded:rotate-180"
                      size={18}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  data-open={isOpen}
                  className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out data-[open=true]:grid-rows-[1fr]"
                >
                  <div className="overflow-hidden">
                    <p className="pr-10 pb-5 text-pretty text-fg-2">{item.answer}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
