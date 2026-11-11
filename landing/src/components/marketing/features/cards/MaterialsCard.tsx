import clsx from 'clsx';
import { Ruler } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FeatureCard, featureTextClass, featureTitleClass } from './FeatureCard';
import { miniPanel } from './miniPanel';

type MaterialItem = [name: string, quantity: string];

export function MaterialsCard() {
  const t = useTranslations('features.materials');
  const items = t.raw('items') as MaterialItem[];

  return (
    <FeatureCard layout="grid" className="grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-6">
      <div className="flex flex-col">
        <span className="grid size-9 place-items-center rounded-[10px] border border-line-2 text-accent-text">
          <Ruler size={18} strokeWidth={1.5} aria-hidden />
        </span>
        <h3 className={clsx(featureTitleClass(true), 'mt-5')}>{t('title')}</h3>
        <p className={featureTextClass}>{t('text')}</p>
        <p className="mt-auto pt-5 font-mono text-xs/4 text-fg-3">{t('formula')}</p>
      </div>

      <div className={miniPanel.root}>
        <div className={clsx(miniPanel.head, 'justify-between')}>
          <span>{t('listTitle')}</span>
          <span>{t('listCount')}</span>
        </div>
        {items.map(([name, quantity], index) => {
          const hasReserve = index === 0;
          return (
            <div key={name} className={clsx(miniPanel.row, 'py-3')}>
              <span>{name}</span>
              {hasReserve && (
                <span className="ml-auto rounded-md bg-accent-soft px-1.5 text-[11px] font-medium text-accent-text">
                  {t('reserve')}
                </span>
              )}
              <span className={clsx('min-w-16 text-right font-semibold', !hasReserve && 'ml-auto')}>{quantity}</span>
            </div>
          );
        })}
      </div>
    </FeatureCard>
  );
}
