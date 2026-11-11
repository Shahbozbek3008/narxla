import { Geist, Geist_Mono, Inter } from 'next/font/google';

const geist = Geist({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-geist-mono',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
});

export const fontVariables = [geist.variable, geistMono.variable, inter.variable].join(' ');
