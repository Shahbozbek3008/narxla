import { useTranslations } from 'next-intl';
import { Logo } from '@/components/brand/Logo';
import { LocaleMenu } from '@/components/locale/LocaleMenu';
import { Reveal } from '@/components/shared/Reveal';
import { Link } from '@/i18n/navigation';
import { ANCHORS, toHash } from '@/lib/anchors';
import { externalLinks } from '@/lib/config';
import { stagger } from '@/lib/motion';
import { routes } from '@/lib/routes';

type FooterLink = {
  label: string;
  href: string;
  kind: 'anchor' | 'route' | 'external';
};

const PLACEHOLDER_HREF = '#';

const anchor = (label: string, href: string): FooterLink => ({ label, href, kind: 'anchor' });
const route = (label: string, href: string): FooterLink => ({ label, href, kind: 'route' });

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'product.title',
    links: [
      anchor('product.links.features', toHash(ANCHORS.features)),
      anchor('product.links.pricing', toHash(ANCHORS.pricing)),
      anchor('product.links.masters', toHash(ANCHORS.audience)),
      anchor('product.links.updates', PLACEHOLDER_HREF),
    ],
  },
  {
    title: 'calculators.title',
    links: (['kafel', 'boyoq', 'laminat', 'shtuk', 'gips'] as const).map((id) =>
      route(`calculators.links.${id}`, routes.calc(id)),
    ),
  },
  {
    title: 'help.title',
    links: [
      anchor('help.links.faq', toHash(ANCHORS.faq)),
      { label: 'help.links.telegram', href: externalLinks.telegram, kind: 'external' },
      anchor('help.links.privacy', PLACEHOLDER_HREF),
      anchor('help.links.terms', PLACEHOLDER_HREF),
    ],
  },
];

const EXTERNAL_LINK_PROPS = { target: '_blank', rel: 'noreferrer' };
const LINK = 'py-1.5 text-fg-2 transition-colors duration-150 hover:text-fg sm:py-0';
const BOTTOM_LINK = 'text-fg-3 transition-colors duration-150 hover:text-fg';

export function Footer() {
  const t = useTranslations('footer');
  const tColumns = useTranslations('footer.columns');
  const label = (key: string) => tColumns(key as Parameters<typeof tColumns>[0]);

  return (
    <footer className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,24px)] pt-16 pb-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <Reveal className="col-span-full max-w-[320px] md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm/[22px] text-fg-2">{t('about')}</p>
          </Reveal>
          {COLUMNS.map((column, index) => (
            <Reveal key={column.title} delay={stagger(index + 1, 60)} className="flex flex-col gap-0.5 text-sm/5 sm:gap-2.5">
              <span className="mb-1 font-semibold">{label(column.title)}</span>
              {column.links.map((link) =>
                link.kind === 'route' ? (
                  <Link key={link.label} href={link.href} className={LINK}>
                    {label(link.label)}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className={LINK}
                    {...(link.kind === 'external' ? EXTERNAL_LINK_PROPS : {})}
                  >
                    {label(link.label)}
                  </a>
                ),
              )}
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
