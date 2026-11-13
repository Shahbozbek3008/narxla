import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Audience } from '@/components/marketing/audience/Audience';
import { Calculators } from '@/components/marketing/calculators/Calculators';
import { Faq } from '@/components/marketing/faq/Faq';
import { Features } from '@/components/marketing/features/Features';
import { FinalCta } from '@/components/marketing/final-cta/FinalCta';
import { Footer } from '@/components/marketing/footer/Footer';
import { Hero } from '@/components/marketing/hero/Hero';
import { HowItWorks } from '@/components/marketing/how-it-works/HowItWorks';
import { LiveCalcSection } from '@/components/marketing/live-calc/LiveCalcSection';
import { Navbar } from '@/components/marketing/navbar/Navbar';
import { Pricing } from '@/components/marketing/pricing/Pricing';
import { SpotlightTracker } from '@/components/shared/SpotlightTracker';
import { Problem } from '@/components/marketing/problem/Problem';
import { routing } from '@/i18n/routing';

export const revalidate = 3600;

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
        <LiveCalcSection />
        <Calculators />
        <Audience />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <SpotlightTracker />
    </>
  );
}
