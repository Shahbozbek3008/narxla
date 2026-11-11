const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smetachi.uz';

export const BRAND_NAME = 'Smetachi';

export const appLinks = {
  newEstimate: `${APP_URL}/new`,
  login: `${APP_URL}/login`,
  sample: `${APP_URL}/estimates/demo`,
  calculators: `${APP_URL}/calcs`,
  calculator: (id: string) => `${APP_URL}/calcs/${id}`,
};

export const externalLinks = {
  telegram: 'https://t.me/smetachi',
  instagram: 'https://instagram.com/smetachi',
};

export const PRICE_SOURCES = ['Uzum Market', 'Prom.uz', 'Glotr.uz', '24stroy.uz', 'Maff.uz', 'Ustabor.uz'];
