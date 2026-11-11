export type LabourRateSeed = {
  code: string;
  name: string;
  unit: string;
  minPrice: number;
  price: number;
  maxPrice: number;
};

const rate = (code: string, name: string, unit: string, minPrice: number, price: number, maxPrice: number): LabourRateSeed => ({
  code,
  name,
  unit,
  minPrice,
  price,
  maxPrice,
});

export const LABOUR_RATES: LabourRateSeed[] = [
  rate('floor-tiling', 'Pol kafelini yotqizish', 'm²', 50000, 80000, 120000),
  rate('laminate-laying', 'Laminat yotqizish', 'm²', 30000, 40000, 60000),
  rate('linoleum-laying', 'Linoleum yotqizish', 'm²', 15000, 25000, 35000),
  rate('screed', 'Styajka', 'm²', 35000, 50000, 70000),
  rate('self-leveling-floor', 'Nalivnoy pol', 'm²', 25000, 35000, 50000),
  rate('skirting-install', 'Plintus o‘rnatish', 'm', 8000, 12000, 18000),
  rate('wall-plastering', 'Devorlarni shtukaturka qilish', 'm²', 30000, 50000, 65000),
  rate('wall-puttying', 'Shpaklyovka', 'm²', 25000, 35000, 50000),
  rate('wall-painting', 'Bo‘yash', 'm²', 25000, 36000, 45000),
  rate('wall-putty-paint', 'Shpaklyovka va bo‘yash', 'm²', 45000, 60000, 85000),
  rate('wallpapering', 'Oboy yopishtirish', 'm²', 20000, 30000, 45000),
  rate('wall-tiling', 'Devor kafelini yotqizish', 'm²', 70000, 110000, 150000),
  rate('decorative-plastering', 'Dekorativ shtukaturka', 'm²', 60000, 90000, 130000),
  rate('drywall-ceiling', 'Gipsokarton shift montaji', 'm²', 60000, 85000, 115000),
  rate('ceiling-putty-paint', 'Shiftni shpaklyovka va bo‘yash', 'm²', 45000, 60000, 85000),
  rate('stretch-ceiling', 'Natyajnoy shift', 'm²', 60000, 90000, 120000),
  rate('ceiling-painting', 'Shift bo‘yash', 'm²', 25000, 40000, 55000),
  rate('bricklaying', 'G‘isht terish', 'm²', 60000, 90000, 130000),
  rate('block-laying', 'Gazoblok terish', 'm²', 50000, 70000, 100000),
  rate('demolition', 'Demontaj', 'm²', 15000, 25000, 40000),
  rate('waterproofing', 'Gidroizolyatsiya', 'm²', 25000, 40000, 60000),
  rate('electric-point', 'Elektr nuqtasi', 'dona', 40000, 60000, 90000),
  rate('cable-laying', 'Kabel tortish', 'm', 5000, 7000, 10000),
  rate('plumbing-point', 'Santexnika nuqtasi', 'dona', 150000, 250000, 400000),
  rate('toilet-install', 'Unitaz o‘rnatish', 'dona', 200000, 300000, 450000),
  rate('plumbing-set', 'Santexnika montaji', 'komplekt', 1400000, 1800000, 2500000),
];
