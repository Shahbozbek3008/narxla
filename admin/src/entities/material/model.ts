export type MaterialCategory = 'FLOOR' | 'WALL' | 'CEILING' | 'CONSTRUCTION' | 'INSULATION' | 'ELECTRICAL' | 'PLUMBING';

export type Material = {
  code: string;
  name: string;
  unit: string;
  category: MaterialCategory;
  referencePrice: number;
  _count: { listings: number };
};

export const CATEGORY_LABEL: Record<MaterialCategory, string> = {
  FLOOR: 'Pol',
  WALL: 'Devor',
  CEILING: 'Shift',
  CONSTRUCTION: 'Qurilish',
  INSULATION: 'Izolyatsiya',
  ELECTRICAL: 'Elektr',
  PLUMBING: 'Santexnika',
};
