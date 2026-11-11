import { useTranslations } from 'next-intl';
import { BRAND_NAME } from '@/lib/config';
import { FeatureCard, FeatureIntro } from './FeatureCard';

const SKELETON_LINES = [3, 2.4, 2.8, 2];

export function PdfCard() {
  const t = useTranslations('features.pdf');

  return (
    <FeatureCard className="overflow-hidden">
      <FeatureIntro title={t('title')} text={t('text')} />
      <div
        aria-hidden
        className="mx-auto mt-auto -mb-12 flex aspect-[1/1.1] w-[78%] -rotate-2 flex-col gap-2 rounded-md bg-paper p-4 text-paper-ink shadow-[0_0_0_1px_rgba(11,13,18,.08),0_12px_32px_-8px_rgba(0,0,0,.35)]"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-display text-[11px] font-semibold">
            <span className="size-2.5 rounded-[3px] bg-brand-amber" />
            {BRAND_NAME}
          </span>
          <span className="font-mono text-[9px] text-paper-muted">{t('number')}</span>
        </div>
        <div className="mt-1.5 font-display text-[13px] font-semibold">{t('docTitle')}</div>
        <div className="h-px bg-[rgba(11,13,18,.08)]" />
        <div className="flex flex-col gap-1.5">
          {SKELETON_LINES.map((weight) => (
            <div key={weight} className="flex gap-1.5">
              <span className="h-[5px] rounded-[3px] bg-paper-line" style={{ flex: weight }} />
              <span className="h-[5px] flex-1 rounded-[3px] bg-paper-line" />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-semibold tabular-nums">
          <span>{t('total')}</span>
          <span>{t('totalValue')}</span>
        </div>
      </div>
    </FeatureCard>
  );
}
