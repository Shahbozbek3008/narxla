import clsx from 'clsx';
import { ArrowRight, PaintRoller } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';
import { Drywall, Laminate, Tile, Trowel, type IconProps } from '@/components/icons';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ANCHORS } from '@/lib/anchors';
import { appLinks } from '@/lib/config';
import { stagger } from '@/lib/motion';

type CalculatorId = 'kafel' | 'boyoq' | 'laminat' | 'shtuk' | 'gips';

const CALCULATORS: { id: CalculatorId; Icon: ComponentType<IconProps>; pattern: string }[] = [
  { id: 'kafel', Icon: Tile, pattern: 'pattern-tile' },
  { id: 'boyoq', Icon: PaintRoller, pattern: 'pattern-paint' },
  { id: 'laminat', Icon: Laminate, pattern: 'pattern-planks' },
  { id: 'shtuk', Icon: Trowel, pattern: 'pattern-plaster' },
  { id: 'gips', Icon: Drywall, pattern: 'pattern-drywall' },
];

export function Calculators() {
  const t = useTranslations('calculators');

  return (
    <Section id={ANCHORS.calculators} bordered>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} width="sm" />
        <a
          href={appLinks.calculators}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-2 transition-colors duration-150 hover:text-fg"
        >
          {t('all')}
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
        </a>
      </div>

      <div className="mt-[clamp(32px,4vw,48px)] grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {CALCULATORS.map(({ id, Icon, pattern }, index) => (
          <Reveal key={id} delay={stagger(index, 70)}>
            <a
              href={appLinks.calculator(id)}
              className="sheen flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-(--shadow-card) transition-[translate,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:border-line-2 hover:shadow-(--shadow-lift)"
            >
              <div className={clsx('grid h-28 place-items-center border-b border-line bg-surface-2', pattern)}>
                <span className="sheen grid size-16 place-items-center rounded-[18px] border border-line-2 bg-surface text-accent-text shadow-(--shadow-lift)">
                  <Icon size={30} strokeWidth={1.5} />
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <span className="font-display text-[17px] font-semibold tracking-[-0.01em]">{t(`items.${id}.name`)}</span>
                <span className="text-[13px]/5 text-fg-2">{t(`items.${id}.desc`)}</span>
                <span className="mt-3 font-mono text-xs text-fg-3">{t(`items.${id}.example`)}</span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
