import { useTranslations } from 'next-intl';
import { LocaleMenu } from '@/components/locale/LocaleMenu';
import { Logo } from '@/components/ui/Logo';
import { Reveal } from '@/components/ui/Reveal';
import { ANCHORS, toHash } from '@/lib/anchors';
import { appLinks, externalLinks } from '@/lib/config';
import { stagger } from '@/lib/motion';

const PLACEHOLDER_HREF = '#';

const COLUMNS = [
  {
    title: 'product.title',
    links: [
      { label: 'product.links.features', href: toHash(ANCHORS.features) },
      { label: 'product.links.pricing', href: toHash(ANCHORS.pricing) },
      { label: 'product.links.masters', href: toHash(ANCHORS.audience) },
      { label: 'product.links.updates', href: PLACEHOLDER_HREF },
    ],
  },
  {
    title: 'calculators.title',
    links: [
      { label: 'calculators.links.kafel', href: appLinks.calculator('kafel') },
      { label: 'calculators.links.boyoq', href: appLinks.calculator('boyoq') },
      { label: 'calculators.links.laminat', href: appLinks.calculator('laminat') },
      { label: 'calculators.links.shtuk', href: appLinks.calculator('shtuk') },
      { label: 'calculators.links.gips', href: appLinks.calculator('gips') },
    ],
  },
  {
    title: 'help.title',
    links: [
      { label: 'help.links.faq', href: toHash(ANCHORS.faq) },
      { label: 'help.links.telegram', href: externalLinks.telegram, external: true },
      { label: 'help.links.privacy', href: PLACEHOLDER_HREF },
      { label: 'help.links.terms', href: PLACEHOLDER_HREF },
    ],
  },
] as const;

const EXTERNAL_LINK_PROPS = { target: '_blank', rel: 'noreferrer' };
const LINK = 'text-fg-2 transition-colors duration-150 hover:text-fg';
const BOTTOM_LINK = 'text-fg-3 transition-colors duration-150 hover:text-fg';

export function Footer() {
  const t = useTranslations('footer');
  const tColumns = useTranslations('footer.columns');

  return (
    <footer className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,24px)] pt-16 pb-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <Reveal className="col-span-full max-w-[320px] md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm/[22px] text-fg-2">{t('about')}</p>
          </Reveal>
          {COLUMNS.map((column, index) => (
            <Reveal key={column.title} delay={stagger(index + 1, 60)} className="flex flex-col gap-2.5 text-sm/5">
              <span className="mb-1 font-semibold">{tColumns(column.title)}</span>
              {column.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={LINK}
                  {...('external' in link ? EXTERNAL_LINK_PROPS : {})}
                >
                  {tColumns(link.label)}
                </a>
              ))}
            </Reveal>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-[13px]/5 text-fg-3">
          <span>{t('copyright')}</span>
          <div className="flex items-center gap-5">
            <a href={externalLinks.telegram} className={BOTTOM_LINK} {...EXTERNAL_LINK_PROPS}>
              Telegram
            </a>
            <a href={externalLinks.instagram} className={BOTTOM_LINK} {...EXTERNAL_LINK_PROPS}>
              Instagram
            </a>
            <LocaleMenu variant="link" placement="top" />
          </div>
        </div>
      </div>
    </footer>
  );
}
