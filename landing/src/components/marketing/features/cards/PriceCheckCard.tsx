import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { RangeScale } from '@/components/ui/RangeScale';
import { FeatureCard, FeatureIntro } from './FeatureCard';
import { miniPanel } from './miniPanel';

const QUOTE_POSITION = 74;

export function PriceCheckCard() {
  const t = useTranslations('features.check');
  const axis = t.raw('axis') as string[];

  return (
    <FeatureCard>
      <FeatureIntro title={t('title')} text={t('text')} />
      <div className={clsx(miniPanel.root, 'mt-auto p-4')}>
        <p className="text-xs/4 text-fg-3">{t('label')}</p>
        <p className="mt-1 font-display text-[22px]/7 font-semibold">{t('price')}</p>
        <RangeScale className="mt-7" marker={QUOTE_POSITION} label={t('you')} ring="surface-2" />
        <div className="mt-2 flex justify-between text-[11px]/4 text-fg-3">
          {axis.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <span className="mt-3 inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-xs/4 font-semibold text-accent-text">
          {t('verdict')}
        </span>
      </div>
    </FeatureCard>
  );
}
