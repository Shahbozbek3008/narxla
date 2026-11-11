import { Bath, House, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ANCHORS } from '@/lib/anchors';
import { stagger } from '@/lib/motion';

type Persona = { title: string; text: string };

const ICONS = [House, Bath, Wrench];
const PRO_PERSONA_INDEX = 2;

export function Audience() {
  const t = useTranslations('audience');
  const personas = t.raw('items') as Persona[];

  return (
    <Section id={ANCHORS.audience} tone="alt">
      <SectionHeading align="center" eyebrow={t('eyebrow')} title={t('title')} />
      <div className="mt-[clamp(40px,5vw,64px)] grid grid-cols-1 gap-4 md:grid-cols-3">
        {personas.map((persona, index) => {
          const Icon = ICONS[index];
          return (
            <Reveal key={persona.title} delay={stagger(index, 100)}>
              <article className="sheen flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-(--shadow-card)">
                <span className="grid size-10 place-items-center rounded-[11px] border border-line-2 bg-surface-2 text-accent-text">
                  <Icon size={20} strokeWidth={1.5} aria-hidden />
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl/7 font-semibold tracking-[-0.02em]">{persona.title}</h3>
                  {index === PRO_PERSONA_INDEX && (
                    <Badge tone="accent" shape="square">
                      {t('pro')}
                    </Badge>
                  )}
                </div>
                <p className="text-[15px]/6 text-pretty text-fg-2">{persona.text}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
