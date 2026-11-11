export type LabourRange = { min: number; price: number; max: number };

const range = (min: number, price: number, max: number): LabourRange => ({ min, price, max });

export const REFERENCE_LABOUR = {
  'floor-tiling': range(50000, 80000, 120000),
  'laminate-laying': range(30000, 40000, 60000),
  'linoleum-laying': range(15000, 25000, 35000),
  screed: range(35000, 50000, 70000),
  'self-leveling-floor': range(25000, 35000, 50000),
  'skirting-install': range(8000, 12000, 18000),
  'wall-plastering': range(30000, 50000, 65000),
  'wall-puttying': range(25000, 35000, 50000),
  'wall-painting': range(25000, 36000, 45000),
  'wall-putty-paint': range(45000, 60000, 85000),
  wallpapering: range(20000, 30000, 45000),
  'wall-tiling': range(70000, 110000, 150000),
  'decorative-plastering': range(60000, 90000, 130000),
  'drywall-ceiling': range(60000, 85000, 115000),
  'ceiling-putty-paint': range(45000, 60000, 85000),
  'stretch-ceiling': range(60000, 90000, 120000),
  'ceiling-painting': range(25000, 40000, 55000),
  bricklaying: range(60000, 90000, 130000),
  'block-laying': range(50000, 70000, 100000),
  demolition: range(15000, 25000, 40000),
  waterproofing: range(25000, 40000, 60000),
  'electric-point': range(40000, 60000, 90000),
  'cable-laying': range(5000, 7000, 10000),
  'plumbing-point': range(150000, 250000, 400000),
  'toilet-install': range(200000, 300000, 450000),
  'plumbing-set': range(1400000, 1800000, 2500000),
} satisfies Record<string, LabourRange>;

export type LabourCode = keyof typeof REFERENCE_LABOUR;

export const LABOUR_CODES = Object.keys(REFERENCE_LABOUR) as LabourCode[];
