import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CtaGroup } from '@/components/shared/CtaGroup';
import { PointerGlow } from '@/components/shared/PointerGlow';
import { Reveal } from '@/components/shared/Reveal';
import { Section } from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { ANCHORS, toHash } from '@/lib/anchors';
import { routes } from '@/lib/routes';

export function FinalCta() {
  const t = useTranslations('finalCta');
  const tCommon = useTranslations('common');

  return (
    <Section spacing="bottom">
      <Reveal
        kind="rise"
        className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-line-2 bg-surface px-6 py-[clamp(48px,8vw,96px)] text-center shadow-(--shadow-lift)"
      >
        <div
          aria-hidden
          className="grid-bg pointer-events-none absolute inset-0 bg-size-[48px_48px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,#000,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-65 left-1/2 h-110 w-205 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,var(--glow),transparent_65%)]"
        />
        <PointerGlow size={480} />
        <Reveal delay={80} className="relative">
          <h2 className="gradient-text max-w-[720px] pb-1 font-display text-[clamp(32px,5vw,56px)] leading-[1.08] font-semibold tracking-[-0.04em] text-balance">
            {t('title')}
          </h2>
        </Reveal>
        <p className="relative mt-4 max-w-[480px] text-lg/7 text-pretty text-fg-2">{t('lead')}</p>
        <div className="relative mt-8 max-sm:w-full">
          <CtaGroup>
            <Button asChild size="xl" className="group shine">
              <Link href={routes.newEstimate}>
                {tCommon('cta')}
                <ArrowRight size={16} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl">
              <a href={toHash(ANCHORS.pricing)}>{t('secondary')}</a>
            </Button>
          </CtaGroup>
        </div>
      </Reveal>
    </Section>
  );
}
