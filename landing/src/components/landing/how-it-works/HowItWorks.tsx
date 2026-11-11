import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { Grow } from '@/components/ui/Grow';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { stagger } from '@/lib/motion';
import { DimensionsPreview, EstimatePreview, RoomPreview } from './StepPreviews';

type Step = { title: string; text: string };

const PREVIEWS = [RoomPreview, DimensionsPreview, EstimatePreview];

const stepCode = (index: number) => String(index + 1).padStart(2, '0');

export function HowItWorks() {
  const t = useTranslations('how');
  const steps = t.raw('steps') as Step[];

  return (
    <Section>
      <SectionHeading align="center" eyebrow={t('eyebrow')} title={t('title')} />
      <div className="relative mt-[clamp(40px,5vw,64px)]">
        <Grow
          delay={300}
          className="absolute top-4 right-[16%] left-[16%] hidden h-px bg-[linear-gradient(90deg,transparent,var(--border-2)_10%,var(--border-2)_90%,transparent)] md:block"
        />
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Preview = PREVIEWS[index];
            return (
              <li key={step.title}>
                <Reveal delay={stagger(index, 120)} className="flex flex-col items-center gap-5 text-center">
                  <span
                    className={clsx(
                      'relative grid size-8 place-items-center rounded-full font-mono text-xs font-semibold',
                      index === 0
                        ? 'gloss bg-accent text-accent-ink shadow-[0_0_0_6px_var(--bg),0_0_24px_var(--glow)]'
                        : 'bg-surface-3 text-fg shadow-[0_0_0_6px_var(--bg),inset_0_0_0_1px_var(--border-2)]',
                    )}
                  >
                    {stepCode(index)}
                  </span>
                  <div>
                    <h3 className="font-display text-xl/7 font-semibold tracking-[-0.02em]">{step.title}</h3>
                    <p className="mt-2 text-[15px]/6 text-fg-2">{step.text}</p>
                  </div>
                  <div
                    aria-hidden
                    className="sheen w-full rounded-2xl border border-line bg-surface p-4 text-left text-[13px]/5 tabular-nums shadow-(--shadow-card)"
                  >
                    <Preview />
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
