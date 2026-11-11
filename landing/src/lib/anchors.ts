export const ANCHORS = {
  top: 'top',
  features: 'imkoniyatlar',
  calculators: 'kalkulyatorlar',
  audience: 'kimlar-uchun',
  pricing: 'narxlar',
  faq: 'faq',
} as const;

export const toHash = (anchor: string) => `#${anchor}`;
