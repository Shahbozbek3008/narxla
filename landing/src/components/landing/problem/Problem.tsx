import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grow } from '@/components/ui/Grow';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';

type Reason = [label: string, value: string];

const BAR_HEAD = 'mb-2 flex justify-between gap-3 text-sm/5';
const TRACK = 'flex h-3 overflow-hidden rounded-md bg-surface-3';

export function Problem() {
  const t = useTranslations('problem');
  const reasons = t.raw('card.reasons') as Reason[];

  return (
    <Section bordered>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        <Reveal>
          <Eyebrow tone="danger">{t('eyebrow')}</Eyebrow>
          <div className="mt-4 font-display text-[clamp(60px,15vw,152px)] leading-[.95] font-semibold tracking-[-0.05em] whitespace-nowrap text-accent-text tabular-nums">
            {t('stat')}
          </div>
          <p className="mt-3 text-sm/5 text-fg-3 tabular-nums">{t('statCaption')}</p>
          <h2 className="mt-6 max-w-[480px] font-display text-[clamp(26px,3vw,36px)] leading-[1.22] font-semibold tracking-[-0.025em] text-balance">
            {t('title')}
          </h2>
          <p className="mt-4 max-w-[440px] text-pretty text-fg-2">{t('lead')}</p>
          <p className="mt-6 text-xs/4 text-fg-3">{t('disclaimer')}</p>
        </Reveal>

        <Reveal
          delay={140}
          className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-[clamp(20px,3vw,32px)] shadow-(--shadow-lift)"
        >
          <p className="text-sm/5 text-fg-2">{t('card.title')}</p>

          <div className="flex flex-col gap-4 tabular-nums">
            <div>
              <div className={BAR_HEAD}>
                <span className="text-fg-2">{t('card.planned')}</span>
                <span className="font-semibold">{t('card.plannedValue')}</span>
              </div>
              <div className={TRACK}>
                <Grow delay={200} className="h-full w-[68%] rounded-md bg-fg-3" />
              </div>
            </div>
            <div>
              <div className={BAR_HEAD}>
                <span className="text-fg-2">{t('card.actual')}</span>
                <span className="font-semibold text-danger">{t('card.actualValue')}</span>
              </div>
              <div className={TRACK}>
                <Grow delay={350} className="h-full w-[68%] bg-fg-3" />
                <Grow delay={900} className="h-full w-[32%] bg-danger opacity-85" />
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-3 border-t border-line pt-4 text-sm/5 tabular-nums">
            {reasons.map(([label, value]) => (
              <li key={label} className="flex justify-between gap-4 text-fg-2">
                <span>{label}</span>
                <span className="whitespace-nowrap text-danger">{value}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 rounded-xl bg-success-soft px-4 py-3 text-sm/5 font-medium text-success">
            <Check size={16} strokeWidth={1.75} aria-hidden />
            {t('card.solution')}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
