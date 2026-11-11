import type { MaterialCategory } from '../../src/generated/prisma/enums.js';

export type MaterialSeed = {
  code: string;
  name: string;
  unit: string;
  category: MaterialCategory;
  referencePrice: number;
};

const floor = (code: string, name: string, unit: string, referencePrice: number): MaterialSeed => ({ code, name, unit, category: 'FLOOR', referencePrice });
const wall = (code: string, name: string, unit: string, referencePrice: number): MaterialSeed => ({ code, name, unit, category: 'WALL', referencePrice });
const ceiling = (code: string, name: string, unit: string, referencePrice: number): MaterialSeed => ({ code, name, unit, category: 'CEILING', referencePrice });
const construction = (code: string, name: string, unit: string, referencePrice: number): MaterialSeed => ({ code, name, unit, category: 'CONSTRUCTION', referencePrice });
const insulation = (code: string, name: string, unit: string, referencePrice: number): MaterialSeed => ({ code, name, unit, category: 'INSULATION', referencePrice });
const electrical = (code: string, name: string, unit: string, referencePrice: number): MaterialSeed => ({ code, name, unit, category: 'ELECTRICAL', referencePrice });
const plumbing = (code: string, name: string, unit: string, referencePrice: number): MaterialSeed => ({ code, name, unit, category: 'PLUMBING', referencePrice });

export const MATERIALS: MaterialSeed[] = [
  floor('laminate-32', 'Laminat 32-sinf, 8 mm', 'm²', 82000),
  floor('laminate-33', 'Laminat 33-sinf, 8 mm', 'm²', 110000),
  floor('laminate-34', 'Laminat 34-sinf, 12 mm', 'm²', 180000),
  floor('underlay-3mm', 'Podlojka, 3 mm', 'm²', 12000),
  floor('skirting', 'Plintus', 'm', 25000),
  floor('skirting-fittings', 'Plintus burchak va zaglushkalari', 'dona', 6000),
  floor('porcelain-local', 'Keramogranit 60×60, mahalliy', 'm²', 61000),
  floor('porcelain-60x60', 'Keramogranit 60×60', 'm²', 85000),
  floor('porcelain-import', 'Keramogranit 60×60, import', 'm²', 140000),
  floor('tile-adhesive-25', 'Kafel yelimi, 25 kg', 'qop', 68000),
  floor('grout-2', 'Zatirka, 2 kg', 'qop', 42000),
  floor('tile-spacers', 'Krestik, 2 mm', 'paket', 15000),
  floor('linoleum', 'Linoleum', 'm²', 60000),
  floor('double-tape-25', 'Ikki tomonlama skotch, 25 m', 'rulon', 35000),
  floor('screed-m150-40', 'Quruq aralash M150, 40 kg', 'qop', 38000),
  floor('damper-tape', 'Demfer lenta', 'm', 4000),
  floor('self-leveling-25', 'Nalivnoy pol, 25 kg', 'qop', 75000),

  wall('rotband-30', 'Knauf Rotband, 30 kg', 'qop', 48500),
  wall('cement-plaster-25', 'Sement shtukaturka, 25 kg', 'qop', 35000),
  wall('plaster-beacon', 'Mayoq profil', 'dona', 12000),
  wall('putty-25', 'Shpaklyovka, 25 kg', 'qop', 55000),
  wall('sandpaper-roll', 'Zumpara qog‘oz', 'rulon', 30000),
  wall('primer-10', 'Gruntovka, 10 l', 'kanistr', 120000),
  wall('paint-emulsion-25', 'Suv-emulsion bo‘yoq, 25 kg', 'chelak', 335000),
  wall('paint-washable-25', 'Yuviladigan bo‘yoq, 25 kg', 'chelak', 465000),
  wall('paint-premium-25', 'Premium bo‘yoq, 25 kg', 'chelak', 767000),
  wall('wall-tile-30x60', 'Devor kafeli 30×60', 'm²', 80000),
  wall('wallpaper-053', 'Oboy 0,53 × 10 m', 'rulon', 120000),
  wall('wallpaper-106', 'Oboy 1,06 × 10 m', 'rulon', 220000),
  wall('wallpaper-glue', 'Oboy yelimi', 'paket', 45000),
  wall('pvc-panel', 'PVX panel 0,25 × 3 m', 'dona', 25000),
  wall('pvc-start-profile', 'Start profil, 3 m', 'dona', 15000),
  wall('mounting-adhesive', 'Montaj yelimi', 'dona', 30000),
  wall('decorative-plaster-15', 'Dekorativ shtukaturka, 15 kg', 'chelak', 350000),

  ceiling('drywall-12-5', 'Gipsokarton Knauf, 12,5 mm', 'list', 59500),
  ceiling('drywall-moisture', 'Gipsokarton Knauf, namga chidamli', 'list', 74000),
  ceiling('metal-profile-3m', 'Profil, 3 m', 'dona', 22000),
  ceiling('drywall-screw', 'Shurup', 'dona', 150),
  ceiling('joint-tape-45', 'Serpyanka lenta, 45 m', 'rulon', 25000),
  ceiling('ceiling-paint-10', 'Shift bo‘yog‘i, 10 kg', 'chelak', 420000),
  ceiling('stretch-ceiling', 'Natyajnoy shift polotnosi (montaj bilan)', 'm²', 90000),
  ceiling('stretch-baguette', 'Baget', 'm', 15000),
  ceiling('stretch-light-ring', 'Chiroq halqasi', 'dona', 30000),

  construction('brick', 'G‘isht 250×120×65', 'dona', 1300),
  construction('cement-m400-50', 'Sement M400, 50 kg', 'qop', 62000),
  construction('sand', 'Qum', 'm³', 150000),
  construction('gravel', 'Shag‘al', 'm³', 180000),
  construction('aerated-block-200', 'Gazoblok 600×300×200', 'dona', 18000),
  construction('aerated-block-300', 'Gazoblok 600×300×300', 'dona', 27000),
  construction('block-adhesive-25', 'Gazoblok montaj yelimi, 25 kg', 'qop', 45000),

  insulation('waterproofing-15', 'Gidroizolyatsiya, 15 kg', 'chelak', 310000),
  insulation('sealing-tape', 'Germetik lenta', 'm', 12000),
  insulation('mineral-wool-6m2', 'Mineral paxta 50 mm, 6 m²', 'upak.', 180000),
  insulation('eps-board-50', 'Penoplast 50 mm, 1 × 1 m', 'list', 18000),
  insulation('insulation-dowel', 'Dyubel-zontik', 'dona', 800),

  electrical('cable-vvg-3x2-5', 'Kabel VVGng 3×2,5', 'm', 21500),
  electrical('cable-vvg-3x1-5', 'Kabel VVGng 3×1,5', 'm', 14500),
  electrical('socket-switch', 'Rozetka va viklyuchatel', 'dona', 45000),
  electrical('junction-box', 'Montaj korobkasi', 'dona', 6000),
  electrical('breaker-16a', 'Avtomat, 16 A', 'dona', 180000),
  electrical('corrugated-pipe', 'Gofra truba', 'm', 2500),

  plumbing('ppr-pipe-20', 'PPR truba, 20 mm', 'm', 18000),
  plumbing('ppr-fitting', 'PPR fiting', 'dona', 7000),
  plumbing('pipe-clip', 'Truba klipsasi', 'dona', 1500),
  plumbing('mixer-tap', 'Smesitel', 'dona', 650000),
  plumbing('fittings-kit', 'Fitinglar to‘plami', 'komplekt', 420000),
];
