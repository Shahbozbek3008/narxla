import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { FeatureCard, FeatureIntro } from './FeatureCard';
import { miniPanel } from './miniPanel';

type PriceRow = [name: string, price: string, unit: string];

export function LivePricesCard() {
  const t = useTranslations('features.prices');
  const rows = t.raw('rows') as PriceRow[];

  return (
    <FeatureCard>
      <FeatureIntro title={t('title')} text={t('text')} />
      <div className={clsx(miniPanel.root, 'mt-auto')}>
        <div className={miniPanel.head}>
          <span className="size-1.5 animate-ping-soft rounded-full bg-success" />
          {t('header')}
        </div>
        {rows.map(([name, price, unit]) => (
          <div key={name} className={clsx(miniPanel.row, 'py-2.5')}>
            <span>{name}</span>
            <span className="ml-auto">{price}</span>
            <span className="min-w-11 text-right text-fg-3">{unit}</span>
          </div>
        ))}
      </div>
    </FeatureCard>
  );
}
