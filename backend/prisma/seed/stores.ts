export type StoreSeed = {
  code: string;
  name: string;
  baseUrl: string;
};

export const STORES: StoreSeed[] = [
  { code: 'prom-uz', name: 'Prom.uz', baseUrl: 'https://www.prom.uz' },
  { code: 'glotr-uz', name: 'Glotr.uz', baseUrl: 'https://glotr.uz' },
  { code: '24stroy-uz', name: '24stroy.uz', baseUrl: 'https://24stroy.uz' },
  { code: 'uzum-market', name: 'Uzum Market', baseUrl: 'https://uzum.uz' },
  { code: 'maff-uz', name: 'Maff.uz', baseUrl: 'https://maff.uz' },
];
