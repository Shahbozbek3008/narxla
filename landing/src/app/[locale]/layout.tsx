import { routing } from "@/i18n/routing";
import { BRAND_NAME, SITE_URL } from "@/lib/config";
import { fontVariables } from "@/lib/fonts";
import { themeInitScript } from "@/lib/theme";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GlobalToaster } from "@/components/app/common/GlobalToaster";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StoreHydrator } from "@/store/StoreHydrator";
import "../globals.css";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const localePath = (locale: string) =>
  locale === routing.defaultLocale ? "/" : `/${locale}`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "meta" });
  const languages = Object.fromEntries(
    routing.locales.map((item) => [item, localePath(item)]),
  );

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: { canonical: localePath(locale), languages },
    openGraph: {
      type: "website",
      siteName: BRAND_NAME,
      title: t("title"),
      description: t("description"),
      locale,
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      data-theme="dark"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <QueryProvider>
            <StoreHydrator />
            {children}
            <GlobalToaster />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
