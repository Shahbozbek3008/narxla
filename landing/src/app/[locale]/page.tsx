import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Audience } from '@/components/landing/audience/Audience';
import { Calculators } from '@/components/landing/calculators/Calculators';
import { Faq } from '@/components/landing/faq/Faq';
import { Features } from '@/components/landing/features/Features';
import { FinalCta } from '@/components/landing/final-cta/FinalCta';
import { Footer } from '@/components/landing/footer/Footer';
import { Hero } from '@/components/landing/hero/Hero';
import { HowItWorks } from '@/components/landing/how-it-works/HowItWorks';
import { Navbar } from '@/components/landing/navbar/Navbar';
import { Pricing } from '@/components/landing/pricing/Pricing';
import { Problem } from '@/components/landing/problem/Problem';
import { routing } from '@/i18n/routing';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <Calculators />
        <Audience />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
