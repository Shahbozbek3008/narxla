import { useTranslations } from 'next-intl';
import { CountUpText } from '@/components/shared/CountUpText';
import { Eyebrow } from '@/components/shared/Eyebrow';
import { Reveal } from '@/components/shared/Reveal';
import { Section } from '@/components/shared/Section';
import { OverspendCard } from './OverspendCard';

type Reason = [label: string, value: string];

export function Problem() {
  const t = useTranslations('problem');

  return (
    <Section bordered>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        <Reveal>
          <Eyebrow tone="danger">{t('eyebrow')}</Eyebrow>
          <div className="mt-4 font-display text-[clamp(60px,15vw,152px)] leading-[.95] font-semibold tracking-[-0.05em] whitespace-nowrap text-accent-text tabular-nums">
            <CountUpText text={t('stat')} />
          </div>
          <p className="mt-3 text-sm/5 text-fg-3 tabular-nums">{t('statCaption')}</p>
          <h2 className="mt-6 max-w-[480px] font-display text-[clamp(26px,3vw,36px)] leading-[1.22] font-semibold tracking-[-0.025em] text-balance">
            {t('title')}
          </h2>
          <p className="mt-4 max-w-[440px] text-pretty text-fg-2">{t('lead')}</p>
          <p className="mt-6 text-xs/4 text-fg-3">{t('disclaimer')}</p>
        </Reveal>

        <Reveal delay={140}>
          <OverspendCard
            title={t('card.title')}
            planned={t('card.planned')}
            plannedValue={t('card.plannedValue')}
            actual={t('card.actual')}
            actualValue={t('card.actualValue')}
            reasons={t.raw('card.reasons') as Reason[]}
            solution={t('card.solution')}
          />
        </Reveal>
      </div>
    </Section>
  );
}
