import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { PRICE_SOURCES } from '@/lib/config';
import { stagger } from '@/lib/motion';

export function SourcesStrip() {
  const t = useTranslations('sources');

  return (
    <Container className="mt-[clamp(56px,7vw,88px)] flex flex-col items-center gap-5 text-center">
      <p className="text-[13px]/5 text-fg-3">{t('caption')}</p>
      <div className="flex flex-wrap justify-center gap-x-[clamp(24px,4vw,48px)] gap-y-3 font-display text-[clamp(15px,1.6vw,18px)] leading-6 font-semibold tracking-[-0.02em] text-fg-3">
        {PRICE_SOURCES.map((source, index) => (
          <Reveal key={source} delay={stagger(index, 60)}>
            {source}
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
