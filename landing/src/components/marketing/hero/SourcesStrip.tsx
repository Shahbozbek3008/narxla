import { useTranslations } from 'next-intl';
import { Container } from '@/components/shared/Container';
import { Reveal } from '@/components/shared/Reveal';
import { PRICE_SOURCES } from '@/lib/config';

const COPIES = 2;
const ITEM = 'shrink-0 px-[clamp(20px,3vw,36px)] font-display text-[clamp(15px,1.6vw,18px)] leading-6 font-semibold tracking-[-0.02em] text-fg-3 transition-colors duration-200 hover:text-fg';

export function SourcesStrip() {
  const t = useTranslations('sources');

  return (
    <Container className="mt-[clamp(56px,7vw,88px)] flex flex-col items-center gap-5 text-center">
      <p className="text-[13px]/5 text-fg-3">{t('caption')}</p>
      <Reveal className="marquee-mask group w-full max-w-[880px] overflow-hidden">
        <ul className="sr-only">
          {PRICE_SOURCES.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]" aria-hidden>
          {Array.from({ length: COPIES }, (_, copy) =>
            [...PRICE_SOURCES, ...PRICE_SOURCES].map((source, index) => (
              <span key={`${copy}-${index}`} className={ITEM}>
                {source}
              </span>
            )),
          )}
        </div>
      </Reveal>
    </Container>
  );
}
