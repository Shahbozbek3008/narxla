import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/shared/Container';
import { CtaGroup } from '@/components/shared/CtaGroup';
import { Reveal } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { ANCHORS, toHash } from '@/lib/anchors';
import { routes } from '@/lib/routes';
import { ProductShot } from './ProductShot';
import { SourcesStrip } from './SourcesStrip';

export function Hero() {
  const t = useTranslations('hero');
  const tCommon = useTranslations('common');
  const trust = t.raw('trust') as string[];

  return (
    <section id={ANCHORS.top} className="relative overflow-x-clip pt-[clamp(56px,9vw,112px)] pb-[clamp(64px,8vw,96px)]">
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 bg-size-[64px_64px] bg-top [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_20%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-60 left-1/2 h-160 w-[1100px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,var(--glow),transparent_62%)]"
      />

      <Container className="flex flex-col items-center text-center">
        <Reveal delay={60} className="max-w-full">
          <a
            href={toHash(ANCHORS.features)}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-line-2 bg-surface py-1 pr-3 pl-1 text-[13px]/5 text-fg-2 shadow-(--shadow-card) transition-colors duration-150 hover:border-ring hover:text-fg"
          >
            <span className="shrink-0 rounded-full bg-accent-soft px-2 text-xs font-semibold text-accent-text">
              {t('badge')}
            </span>
            <span className="truncate">{t('pill')}</span>
            <ChevronRight className="shrink-0" size={14} strokeWidth={1.5} aria-hidden />
          </a>
        </Reveal>

        <Reveal delay={140}>
          <h1 className="gradient-text mt-6 max-w-[900px] pb-1.5 font-display text-[clamp(38px,6.4vw,72px)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance">
            {t('titleLead')} <span className="text-fg-3">{t('titleTail')}</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-6 max-w-[580px] text-[clamp(16px,1.6vw,18px)] leading-7 text-pretty text-fg-2">{t('lead')}</p>
        </Reveal>

        <Reveal delay={330} className="mt-8 max-sm:w-full">
          <CtaGroup>
            <Button asChild size="xl">
              <Link href={routes.newEstimate}>
                {tCommon('cta')}
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl">
              <Link href={routes.demo}>{tCommon('sample')}</Link>
            </Button>
          </CtaGroup>
        </Reveal>

        <Reveal delay={420}>
          <ul className="mt-8 flex flex-wrap justify-center gap-3 text-sm/5 text-fg-2">
            {trust.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check className="text-success" size={14} strokeWidth={2} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>

      <ProductShot />
      <SourcesStrip />
    </section>
  );
}
