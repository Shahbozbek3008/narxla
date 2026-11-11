import { dec, fmt, num } from './format';
import type { MaterialCode } from './prices/catalog';
import { combineStatus, priceInfo, trackedLookup, type PriceBook, type PriceLookup, type PriceStatus } from './prices/price-book';

export type RoomId = 'yotoq' | 'mehmon' | 'oshxona' | 'hammom' | 'koridor' | 'bolalar';
export type Quality = 'eco' | 'mid' | 'pre';
export type WorkId = 'pol' | 'devor' | 'shift' | 'elektr' | 'santex';
export type Works = Record<WorkId, boolean>;

export interface EstimateInput {
  room: RoomId;
  L: number;
  W: number;
  H: number;
  doors: number;
  windows: number;
  works: Works;
  quality: Quality;
}

export interface Line {
  cat: WorkId;
  name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export interface MaterialLine extends Line {
  code: MaterialCode;
  status: PriceStatus;
  checkedAt: string | null;
}

export interface Estimate {
  area: number;
  perim: number;
  walls: number;
  mats: MaterialLine[];
  lab: Line[];
  matTotal: number;
  labTotal: number;
  total: number;
  low: number;
  high: number;
  dMin: number;
  dMax: number;
  byCat: Partial<Record<WorkId, number>>;
}

export const ROOMS: { id: RoomId; L: string; W: string }[] = [
  { id: 'yotoq', L: '4,2', W: '3,5' },
  { id: 'mehmon', L: '5,4', W: '4,0' },
  { id: 'oshxona', L: '3,6', W: '2,9' },
  { id: 'hammom', L: '2,3', W: '1,9' },
  { id: 'koridor', L: '4,5', W: '1,4' },
  { id: 'bolalar', L: '3,6', W: '3,2' },
];

export const WORK_IDS: WorkId[] = ['pol', 'devor', 'shift', 'elektr', 'santex'];
export const QUALITIES: Quality[] = ['eco', 'mid', 'pre'];
export const ALL_WORKS: Works = { pol: true, devor: true, shift: true, elektr: true, santex: true };

export const WET_ROOMS: RoomId[] = ['hammom', 'oshxona'];

export const DOOR_AREA = 1.8;
export const WINDOW_AREA = 2.1;
export const LIMITS = { doors: 3, windows: 4 };
export const RANGE = { low: 0.92, high: 1.12 };

const QF: Record<Quality, number> = { eco: 0.72, mid: 1, pre: 1.65 };
const LF: Record<Quality, number> = { eco: 0.85, mid: 1, pre: 1.3 };
const RESERVE = 1.1;
const LABOUR_PER_DAY = 550000;

const GRADED: Record<'laminate' | 'paint' | 'porcelain', Record<Quality, { code: MaterialCode; name: string }>> = {
  laminate: {
    eco: { code: 'laminate-32', name: 'Laminat 32-sinf, 8 mm' },
    mid: { code: 'laminate-33', name: 'Laminat 33-sinf, 8 mm' },
    pre: { code: 'laminate-34', name: 'Laminat 34-sinf, 12 mm' },
  },
  paint: {
    eco: { code: 'paint-emulsion-25', name: 'Suv-emulsion bo‘yoq, 25 kg' },
    mid: { code: 'paint-washable-25', name: 'Yuviladigan bo‘yoq, 25 kg' },
    pre: { code: 'paint-premium-25', name: 'Premium bo‘yoq, 25 kg' },
  },
  porcelain: {
    eco: { code: 'porcelain-local', name: 'Keramogranit 60×60, mahalliy' },
    mid: { code: 'porcelain-60x60', name: 'Keramogranit 60×60' },
    pre: { code: 'porcelain-import', name: 'Keramogranit 60×60, import' },
  },
};

const roundTo100 = (value: number) => Math.round(value / 100) * 100;

export function estimate(i: EstimateInput, book: PriceBook): Estimate {
  const { L, W, H, doors, windows, works, quality: q, room } = i;
  const area = L * W;
  const perim = 2 * (L + W);
  const walls = Math.max(0, perim * H - doors * DOOR_AREA - windows * WINDOW_AREA);
  const qf = QF[q];
  const lf = LF[q];
  const R = RESERVE;
  const wet = room === 'hammom';
  const tile = wet || room === 'oshxona';
  const c = Math.ceil;
  const r1 = (x: number) => Math.round(x * 10) / 10;
  const mats: MaterialLine[] = [];
  const lab: Line[] = [];

  const addMaterial = (cat: WorkId, code: MaterialCode, name: string, qty: number, unit: string, factor: number) => {
    const info = priceInfo(book, code);
    const price = roundTo100(info.price * factor);
    mats.push({ cat, code, name, qty, unit, price, total: qty * price, status: info.status, checkedAt: info.checkedAt });
  };
  const M = (cat: WorkId, code: MaterialCode, name: string, qty: number, unit: string) => addMaterial(cat, code, name, qty, unit, qf);
  const G = (cat: WorkId, kind: keyof typeof GRADED, qty: number, unit: string) => {
    const { code, name } = GRADED[kind][q];
    addMaterial(cat, code, name, qty, unit, 1);
  };
  const B = (cat: WorkId, name: string, qty: number, unit: string, price: number) => {
    const p = roundTo100(price * lf);
    lab.push({ cat, name, qty, unit, price: p, total: qty * p });
  };

  if (works.pol) {
    if (tile) {
      G('pol', 'porcelain', r1(area * R), 'm²');
      M('pol', 'tile-adhesive-25', 'Kafel yelimi, 25 kg', c((area * 5 * R) / 25), 'qop');
      M('pol', 'grout-2', 'Zatirka, 2 kg', c((area * 0.5 * R) / 2), 'qop');
      if (wet) M('pol', 'waterproofing-15', 'Gidroizolyatsiya, 15 kg', c(((area + perim * 0.3) * 1.2 * R) / 15), 'chelak');
      B('pol', 'Pol kafelini yotqizish', r1(area), 'm²', 80000);
    } else {
      G('pol', 'laminate', r1(area * R), 'm²');
      M('pol', 'underlay-3mm', 'Podlojka, 3 mm', r1(area * R), 'm²');
      M('pol', 'skirting', 'Plintus', c(perim * R), 'm');
      B('pol', 'Laminat yotqizish', r1(area), 'm²', 40000);
    }
  }
  if (works.devor) {
    M('devor', 'rotband-30', 'Knauf Rotband, 30 kg', c((walls * 9 * R) / 30), 'qop');
    B('devor', 'Devorlarni shtukaturka qilish', r1(walls), 'm²', 50000);
    if (wet) {
      M('devor', 'wall-tile-30x60', 'Devor kafeli 30×60', r1(walls * R), 'm²');
      M('devor', 'tile-adhesive-25', 'Kafel yelimi, 25 kg', c((walls * 5 * R) / 25), 'qop');
      B('devor', 'Devor kafelini yotqizish', r1(walls), 'm²', 110000);
    } else {
      M('devor', 'putty-25', 'Shpaklyovka, 25 kg', c((walls * 1.2 * R) / 25), 'qop');
      M('devor', 'primer-10', 'Gruntovka, 10 l', c((walls * 0.2 * R) / 10), 'kanistr');
      G('devor', 'paint', c((walls * 0.18 * 2 * R) / 25), 'chelak');
      B('devor', 'Shpaklyovka va bo‘yash', r1(walls), 'm²', 60000);
    }
  }
  if (works.shift) {
    if (wet) M('shift', 'drywall-moisture', 'Gipsokarton Knauf, namga chidamli', c((area * R) / 3), 'list');
    else M('shift', 'drywall-12-5', 'Gipsokarton Knauf, 12,5 mm', c((area * R) / 3), 'list');
    M('shift', 'metal-profile-3m', 'Profil, 3 m', c(area * R), 'dona');
    M('shift', 'ceiling-paint-10', 'Shift bo‘yog‘i, 10 kg', c((area * 0.18 * 2 * R) / 10), 'chelak');
    B('shift', 'Gipsokarton shift montaji', r1(area), 'm²', 115000);
    B('shift', 'Shiftni shpaklyovka va bo‘yash', r1(area), 'm²', 60000);
  }
  if (works.elektr) {
    const pts = c(area / 4) + 2;
    const cab = c((perim * 2.5 + 10) * R);
    M('elektr', 'cable-vvg-3x2-5', 'Kabel VVGng 3×2,5', cab, 'm');
    M('elektr', 'socket-switch', 'Rozetka va viklyuchatel', pts, 'dona');
    M('elektr', 'junction-box', 'Montaj korobkasi', pts, 'dona');
    M('elektr', 'breaker-16a', 'Avtomat, 16 A', 1, 'dona');
    B('elektr', 'Elektr nuqtalari', pts, 'dona', 60000);
    B('elektr', 'Kabel tortish', cab, 'm', 7000);
  }
  if (works.santex) {
    M('santex', 'ppr-pipe-20', 'PPR truba, 20 mm', c(perim * 1.5 * R), 'm');
    M('santex', 'mixer-tap', 'Smesitel', 2, 'dona');
    M('santex', 'fittings-kit', 'Fitinglar to‘plami', 1, 'komplekt');
    B('santex', 'Santexnika montaji', 1, 'komplekt', 1800000);
  }

  const sum = (lines: Line[]) => lines.reduce((total, line) => total + line.total, 0);
  const matTotal = sum(mats);
  const labTotal = sum(lab);
  const total = matTotal + labTotal;
  const byCat: Partial<Record<WorkId, number>> = {};
  [...mats, ...lab].forEach((line) => (byCat[line.cat] = (byCat[line.cat] ?? 0) + line.total));
  const days = Math.max(2, c(labTotal / LABOUR_PER_DAY));

  return {
    area,
    perim,
    walls,
    mats,
    lab,
    matTotal,
    labTotal,
    total,
    low: total * RANGE.low,
    high: total * RANGE.high,
    dMin: days,
    dMax: c(days * 1.35),
    byCat,
  };
}

export type CheckCategory = 'pol' | 'devor' | 'shift' | 'qurilish' | 'muh';
export type CheckUnit = 'm²' | 'm' | 'dona';

export type CheckType = {
  id: string;
  cat: CheckCategory;
  name: string;
  u: CheckUnit;
  def: string;
  lo: number;
  avg: number;
  hi: number;
  ok?: boolean;
};

export const CHECK_CATS: CheckCategory[] = ['pol', 'devor', 'shift', 'qurilish', 'muh'];

export const CHECK: CheckType[] = [
  { id: 'kafel', cat: 'pol', name: 'Kafel yotqizish', u: 'm²', def: '52', lo: 50000, avg: 80000, hi: 120000, ok: true },
  { id: 'lam', cat: 'pol', name: 'Laminat', u: 'm²', def: '18', lo: 30000, avg: 40000, hi: 60000, ok: true },
  { id: 'lino', cat: 'pol', name: 'Linoleum', u: 'm²', def: '18', lo: 15000, avg: 25000, hi: 35000 },
  { id: 'styaj', cat: 'pol', name: 'Styajka', u: 'm²', def: '40', lo: 35000, avg: 50000, hi: 70000 },
  { id: 'naliv', cat: 'pol', name: 'Nalivnoy pol', u: 'm²', def: '40', lo: 25000, avg: 35000, hi: 50000 },
  { id: 'plint', cat: 'pol', name: 'Plintus o‘rnatish', u: 'm', def: '30', lo: 8000, avg: 12000, hi: 18000 },
  { id: 'shtuk', cat: 'devor', name: 'Shtukaturka', u: 'm²', def: '80', lo: 30000, avg: 50000, hi: 65000, ok: true },
  { id: 'shpak', cat: 'devor', name: 'Shpaklyovka', u: 'm²', def: '80', lo: 25000, avg: 35000, hi: 50000 },
  { id: 'boyoq', cat: 'devor', name: 'Bo‘yash', u: 'm²', def: '80', lo: 25000, avg: 36000, hi: 45000, ok: true },
  { id: 'oboy', cat: 'devor', name: 'Oboy yopishtirish', u: 'm²', def: '45', lo: 20000, avg: 30000, hi: 45000 },
  { id: 'dkafel', cat: 'devor', name: 'Devor kafeli', u: 'm²', def: '25', lo: 70000, avg: 110000, hi: 150000 },
  { id: 'dekor', cat: 'devor', name: 'Dekorativ shtukaturka', u: 'm²', def: '20', lo: 60000, avg: 90000, hi: 130000 },
  { id: 'gips', cat: 'shift', name: 'Gipsokarton shift', u: 'm²', def: '18', lo: 40000, avg: 85000, hi: 115000, ok: true },
  { id: 'natyaj', cat: 'shift', name: 'Natyajnoy shift', u: 'm²', def: '18', lo: 60000, avg: 90000, hi: 120000 },
  { id: 'shboy', cat: 'shift', name: 'Shift bo‘yash', u: 'm²', def: '18', lo: 25000, avg: 40000, hi: 55000 },
  { id: 'gisht', cat: 'qurilish', name: 'G‘isht terish', u: 'm²', def: '20', lo: 60000, avg: 90000, hi: 130000 },
  { id: 'gazo', cat: 'qurilish', name: 'Gazoblok terish', u: 'm²', def: '20', lo: 50000, avg: 70000, hi: 100000 },
  { id: 'demon', cat: 'qurilish', name: 'Demontaj', u: 'm²', def: '50', lo: 15000, avg: 25000, hi: 40000 },
  { id: 'gidro', cat: 'qurilish', name: 'Gidroizolyatsiya', u: 'm²', def: '8', lo: 25000, avg: 40000, hi: 60000 },
  { id: 'elnuq', cat: 'muh', name: 'Elektr nuqtasi', u: 'dona', def: '20', lo: 40000, avg: 60000, hi: 90000 },
  { id: 'kabel', cat: 'muh', name: 'Kabel tortish', u: 'm', def: '100', lo: 5000, avg: 7000, hi: 10000 },
  { id: 'santex', cat: 'muh', name: 'Santexnika nuqtasi', u: 'dona', def: '6', lo: 150000, avg: 250000, hi: 400000 },
  { id: 'unitaz', cat: 'muh', name: 'Unitaz o‘rnatish', u: 'dona', def: '1', lo: 200000, avg: 300000, hi: 450000 },
];

export type CheckVerdict = 'fair' | 'expensive' | 'cheap' | 'tooCheap';
export type CheckTone = 'success' | 'accent' | 'danger';

const FAIR_TOLERANCE = 5;
const DANGER_MARKUP = 30;

export function checkPrice(typeId: string, volume: number, price: number) {
  const type = CHECK.find((item) => item.id === typeId) ?? CHECK[0];
  const lo = type.lo * volume;
  const avg = type.avg * volume;
  const hi = type.hi * volume;
  const dmin = lo * 0.7;
  const dmax = hi * 1.3;
  const span = Math.max(dmax - dmin, 1);
  const pct = (x: number) => Math.max(0, Math.min(100, ((x - dmin) / span) * 100));
  const diff = avg ? ((price - avg) / avg) * 100 : 0;
  const percent = Math.round(Math.abs(diff));

  let verdict: CheckVerdict;
  let tone: CheckTone;
  if (Math.abs(diff) <= FAIR_TOLERANCE) {
    verdict = 'fair';
    tone = 'success';
  } else if (diff > 0) {
    verdict = 'expensive';
    tone = diff > DANGER_MARKUP ? 'danger' : 'accent';
  } else if (price < lo) {
    verdict = 'tooCheap';
    tone = 'danger';
  } else {
    verdict = 'cheap';
    tone = 'success';
  }

  return {
    lo,
    avg,
    hi,
    verdict,
    tone,
    percent,
    zone1: pct(lo),
    zone2: pct(hi) - pct(lo),
    avgPct: pct(avg),
    markerPct: Math.max(3, Math.min(97, pct(price))),
  };
}

export type CalcCategory = 'pol' | 'devor' | 'shift' | 'qurilish' | 'izol' | 'muh';
export type CalcValues = Record<string, number | string>;

export type CalcInput =
  | { k: string; label: string; type: 'num'; unit: string; def: string }
  | { k: string; label: string; type: 'opt'; opts: [value: string, label: string][]; def: string };

export type CalcResult = { rows: [label: string, value: string][]; cost: number; note: string };

export type Calculator = {
  id: string;
  cat: CalcCategory;
  name: string;
  desc: string;
  icon: string;
  inputs: CalcInput[];
  calc: (values: CalcValues, price: PriceLookup) => CalcResult;
};

export const CALC_CATS: CalcCategory[] = ['pol', 'devor', 'shift', 'qurilish', 'izol', 'muh'];

export const CAT_ICON: Record<CalcCategory | 'all', string> = {
  all: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  pol: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83zM2 12l9.17 4.17a2 2 0 0 0 1.66 0L22 12M2 17l9.17 4.17a2 2 0 0 0 1.66 0L22 17',
  devor: 'M3 3h18v18H3zM12 9v6M16 15v6M16 3v6M3 15h18M3 9h18M8 15v6M8 3v6',
  shift: 'M3 4h18M7 4v5M17 4v5M12 4v9M9 13h6l-1 4h-4z',
  qurilish:
    'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7 12 12l8.7-5M12 22V12',
  izol: 'M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z',
  muh: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
};

const CI = {
  tile: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 3v18M3 12h18',
  planks:
    'M4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13A1.5 1.5 0 0 1 4.5 4zM3 9.33h18M3 14.67h18M10 4v5.33M15 9.33v5.34M7 14.67V20M18 4v5.33',
  roll: 'M7 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM7 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM7 12h14v8H3v-8M7 4h10a4 4 0 0 1 4 4v4',
  level: 'M2 18h20M4 14h16v4H4zM7 10h10M12 10V6M9 6h6',
  skirting: 'M3 4v16h18M3 16h18M7 16v4M13 16v4M19 16v4',
  roller:
    'M4 2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 16h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z',
  trowel: 'M3 14h13.5l4.5-7H8.5zM11 14v3M9.5 17h3a1 1 0 0 1 1 1v3h-5v-3a1 1 0 0 1 1-1z',
  bucket: 'M4 7h16l-1.5 13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM4 7a8 3 0 0 1 16 0M9 11v6M15 11v6',
  scroll: 'M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4M19 17V5a2 2 0 0 0-2-2H4',
  panels: 'M3 3h18v18H3zM8 3v18M13 3v18M18 3v18',
  sparkle:
    'M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z',
  drywall: 'M8 3h12v15H8zM5 6v15h12M11.5 6.5h.01M16.5 6.5h.01M11.5 14.5h.01M16.5 14.5h.01',
  ceiling: 'M3 4h18M7 4v5M17 4v5M12 4v9M9 13h6l-1 4h-4z',
  brick: 'M3 3h18v18H3zM12 9v6M16 15v6M16 3v6M3 15h18M3 9h18M8 15v6M8 3v6',
  block: 'M3 6h18v12H3zM3 12h18M12 6v6M7.5 12v6M16.5 12v6',
  box: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7 12 12l8.7-5M12 22V12',
  umbrella: 'M22 12a10 10 0 0 0-20 0zM12 12v7a2 2 0 0 0 4 0M12 2v1',
  thermo: 'M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  pipe: 'M4 4v6a4 4 0 0 0 4 4h8a4 4 0 0 1 4 4v2M2 4h4M18 20h4',
};

const n = (k: string, label: string, unit: string, def: string): CalcInput => ({ k, label, type: 'num', unit, def });
const opt = (k: string, label: string, opts: [string, string][], def: string): CalcInput => ({ k, label, type: 'opt', opts, def });
const area = (label = 'Maydon', def = '14,7') => n('A', label, 'm²', def);
const c = Math.ceil;
const R = 1.1;
const d1 = (x: number) => dec(x);
const f0 = (x: number) => fmt(x);
const v = (values: CalcValues, key: string) => Number(values[key]);
const s = (values: CalcValues, key: string) => String(values[key]);
const code = (values: CalcValues, key: string) => s(values, key) as MaterialCode;

export const CALCULATORS: Calculator[] = [
  {
    id: 'kafel', cat: 'pol', name: 'Kafel / keramogranit', desc: 'Dona, yelim, zatirka, krestik', icon: CI.tile,
    inputs: [area('Pol maydoni'), opt('s', 'Plitka o‘lchami', [['0.09', '30×30'], ['0.36', '60×60'], ['0.72', '60×120']], '0.36')],
    calc: (x, p) => {
      const A = v(x, 'A'), m2 = A * R, d = c(m2 / v(x, 's')), y = c((A * 5 * R) / 25), z = c((A * 0.5 * R) / 2), k = c(A / 10);
      return { rows: [['Plitka', `${d} dona`], ['Plitka maydoni', `${d1(m2)} m²`], ['Kafel yelimi, 25 kg', `${y} qop`], ['Zatirka, 2 kg', `${z} qop`], ['Krestik, 2 mm', `${k} paket`]], cost: m2 * p('porcelain-60x60') + y * p('tile-adhesive-25') + z * p('grout-2') + k * p('tile-spacers'), note: 'Kesish chiqindisi va 10% zaxira bilan. Yelim sarfi 5 kg/m².' };
    },
  },
  {
    id: 'laminat', cat: 'pol', name: 'Laminat', desc: 'Upakovka, podlojka, plintus', icon: CI.planks,
    inputs: [area('Pol maydoni'), opt('k', 'Sinf', [['laminate-32', '32-sinf'], ['laminate-33', '33-sinf'], ['laminate-34', '34-sinf']], 'laminate-33')],
    calc: (x, p) => {
      const A = v(x, 'A'), u = c((A * R) / 2.13), area2 = A * R, pl = c(Math.sqrt(A) * 4 * R);
      return { rows: [['Laminat, 2,13 m² upak.', `${u} upak.`], ['Podlojka, 3 mm', `${d1(area2)} m²`], ['Plintus', `${pl} m`]], cost: u * 2.13 * p(code(x, 'k')) + area2 * p('underlay-3mm') + pl * p('skirting'), note: 'Kvadrat xona deb olingan. Diagonal yotqizishda +5% qo‘shing.' };
    },
  },
  {
    id: 'linoleum', cat: 'pol', name: 'Linoleum', desc: 'Polotno va ikki tomonlama skotch', icon: CI.roll,
    inputs: [area('Pol maydoni')],
    calc: (x, p) => {
      const A = v(x, 'A'), m = A * R, sk = c(A / 15), pl = c(Math.sqrt(A) * 4 * R);
      return { rows: [['Linoleum', `${d1(m)} m²`], ['Ikki tomonlama skotch, 25 m', `${sk} rulon`], ['Plintus', `${pl} m`]], cost: m * p('linoleum') + sk * p('double-tape-25') + pl * p('skirting'), note: 'Rulon kengligini xona kengligidan katta tanlang — choklarsiz yotadi.' };
    },
  },
  {
    id: 'styajka', cat: 'pol', name: 'Styajka (sement-qum)', desc: 'Quruq aralash va demfer lenta', icon: CI.level,
    inputs: [area('Pol maydoni'), n('t', 'Qalinlik', 'mm', '50')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = ((A * v(x, 't')) / 10) * 20 * R, q = c(kg / 40), dl = c(Math.sqrt(A) * 4 * R);
      return { rows: [['Quruq aralash M150, 40 kg', `${q} qop`], ['Aralash og‘irligi', `${f0(kg)} kg`], ['Demfer lenta', `${dl} m`]], cost: q * p('screed-m150-40') + dl * p('damper-tape'), note: 'Sarf: 20 kg/m² har 1 sm qalinlikka.' };
    },
  },
  {
    id: 'nalivnoy', cat: 'pol', name: 'Nalivnoy pol', desc: 'O‘zi tekislanadigan aralash', icon: CI.level,
    inputs: [area('Pol maydoni'), n('t', 'Qalinlik', 'mm', '5')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * v(x, 't') * 1.6 * R, q = c(kg / 25), g = c((A * 0.15 * R) / 10);
      return { rows: [['Nalivnoy pol, 25 kg', `${q} qop`], ['Aralash og‘irligi', `${f0(kg)} kg`], ['Gruntovka, 10 l', `${g} kanistr`]], cost: q * p('self-leveling-25') + g * p('primer-10'), note: 'Sarf: 1,6 kg/m² har 1 mm qalinlikka.' };
    },
  },
  {
    id: 'plintus', cat: 'pol', name: 'Plintus', desc: 'Planka va burchaklar', icon: CI.skirting,
    inputs: [n('P', 'Xona perimetri', 'm', '15,4'), n('d', 'Eshiklar soni', 'dona', '1')],
    calc: (x, p) => {
      const len = Math.max(0, v(x, 'P') - v(x, 'd') * 0.9) * R, pl = c(len / 2.5), ug = c(4 + v(x, 'd') * 2);
      return { rows: [['Plintus, 2,5 m', `${pl} dona`], ['Umumiy uzunlik', `${d1(len)} m`], ['Burchak va zaglushkalar', `${ug} dona`]], cost: pl * 2.5 * p('skirting') + ug * p('skirting-fittings'), note: 'Eshik kengligi 0,9 m ayiriladi, 10% zaxira.' };
    },
  },
  {
    id: 'boyoq', cat: 'devor', name: 'Bo‘yoq', desc: 'Kg, chelak va gruntovka', icon: CI.roller,
    inputs: [area('Devor maydoni', '37,7'), opt('q', 'Qatlamlar', [['1', '1'], ['2', '2'], ['3', '3']], '2')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 0.18 * v(x, 'q') * R, b = c(kg / 25), g = c((A * 0.2 * R) / 10);
      return { rows: [['Bo‘yoq', `${d1(kg)} kg`], ['Chelak, 25 kg', `${b} dona`], ['Gruntovka, 10 l', `${g} kanistr`]], cost: b * p('paint-washable-25') + g * p('primer-10'), note: 'Sarf: 0,18 kg/m² bir qatlamga, 10% zaxira.' };
    },
  },
  {
    id: 'shtuk', cat: 'devor', name: 'Gipsli shtukaturka', desc: 'Knauf Rotband, mayoqlar', icon: CI.trowel,
    inputs: [area('Devor maydoni', '37,7'), n('t', 'O‘rtacha qatlam', 'mm', '15')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 0.9 * v(x, 't') * R, q = c(kg / 30), m = c(A / 1.5), g = c((A * 0.2 * R) / 10);
      return { rows: [['Knauf Rotband, 30 kg', `${q} qop`], ['Mayoq profil', `${m} dona`], ['Gruntovka, 10 l', `${g} kanistr`]], cost: q * p('rotband-30') + m * p('plaster-beacon') + g * p('primer-10'), note: 'Sarf: 9 kg/m² har 1 sm qatlamga. Devor egri bo‘lsa sarf oshadi.' };
    },
  },
  {
    id: 'sementshtuk', cat: 'devor', name: 'Sement shtukaturka', desc: 'Nam xonalar va fasad uchun', icon: CI.trowel,
    inputs: [area('Devor maydoni', '20'), n('t', 'O‘rtacha qatlam', 'mm', '20')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 1.7 * v(x, 't') * R, q = c(kg / 25), m = c(A / 1.5);
      return { rows: [['Sement shtukaturka, 25 kg', `${q} qop`], ['Aralash og‘irligi', `${f0(kg)} kg`], ['Mayoq profil', `${m} dona`]], cost: q * p('cement-plaster-25') + m * p('plaster-beacon'), note: 'Sarf: 17 kg/m² har 1 sm qatlamga.' };
    },
  },
  {
    id: 'shpak', cat: 'devor', name: 'Shpaklyovka', desc: 'Start va finish qatlamlari', icon: CI.trowel,
    inputs: [area('Devor maydoni', '37,7'), opt('q', 'Qatlamlar', [['1', '1'], ['2', '2'], ['3', '3']], '2')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 1.2 * v(x, 'q') * R, q = c(kg / 25), z = c(A / 50);
      return { rows: [['Shpaklyovka, 25 kg', `${q} qop`], ['Aralash og‘irligi', `${f0(kg)} kg`], ['Zumpara qog‘oz', `${z} rulon`]], cost: q * p('putty-25') + z * p('sandpaper-roll'), note: 'Sarf: 1,2 kg/m² har bir qatlamga.' };
    },
  },
  {
    id: 'grunt', cat: 'devor', name: 'Gruntovka', desc: 'Chuqur singuvchi, litrda', icon: CI.bucket,
    inputs: [area('Yuza maydoni', '37,7'), opt('q', 'Qatlamlar', [['1', '1'], ['2', '2']], '1')],
    calc: (x, p) => {
      const l = v(x, 'A') * 0.15 * v(x, 'q') * R, k = c(l / 10);
      return { rows: [['Gruntovka', `${d1(l)} l`], ['Kanistr, 10 l', `${k} dona`]], cost: k * p('primer-10'), note: 'Sarf: 0,15 l/m² bir qatlamga.' };
    },
  },
  {
    id: 'oboy', cat: 'devor', name: 'Oboy (devor qog‘ozi)', desc: 'Rulon soni va yelim', icon: CI.scroll,
    inputs: [n('P', 'Devorlar perimetri', 'm', '15,4'), n('H', 'Shift balandligi', 'm', '2,7'), opt('w', 'Rulon', [['0.53', '0,53 × 10 m'], ['1.06', '1,06 × 10 m']], '1.06')],
    calc: (x, p) => {
      const w = v(x, 'w'), H = v(x, 'H'), P = v(x, 'P'), per = Math.max(1, Math.floor(10 / (H + 0.1))), strips = c(P / w), r = c(strips / per), y = c((P * H) / 25);
      return { rows: [['Oboy rulon', `${r} dona`], ['Polosalar', `${strips} dona`], ['Oboy yelimi', `${y} paket`]], cost: r * p(w > 1 ? 'wallpaper-106' : 'wallpaper-053') + y * p('wallpaper-glue'), note: 'Naqsh moslash uchun har polosaga +10 sm qo‘shilgan.' };
    },
  },
  {
    id: 'devorkafel', cat: 'devor', name: 'Devor kafeli', desc: 'Hammom va oshxona fartugi', icon: CI.tile,
    inputs: [area('Devor maydoni', '18'), opt('s', 'Plitka o‘lchami', [['0.06', '20×30'], ['0.18', '30×60']], '0.18')],
    calc: (x, p) => {
      const A = v(x, 'A'), m2 = A * R, d = c(m2 / v(x, 's')), y = c((A * 4 * R) / 25), z = c((A * 0.4 * R) / 2);
      return { rows: [['Plitka', `${d} dona`], ['Kafel yelimi, 25 kg', `${y} qop`], ['Zatirka, 2 kg', `${z} qop`]], cost: m2 * p('wall-tile-30x60') + y * p('tile-adhesive-25') + z * p('grout-2'), note: 'Kesish chiqindisi va 10% zaxira bilan.' };
    },
  },
  {
    id: 'pvx', cat: 'devor', name: 'PVX panel', desc: 'Panel va start profil', icon: CI.panels,
    inputs: [area('Yuza maydoni', '12')],
    calc: (x, p) => {
      const A = v(x, 'A'), panels = c((A * R) / 0.75), sp = c((Math.sqrt(A) * 4) / 3), m = c(A / 5);
      return { rows: [['PVX panel 0,25 × 3 m', `${panels} dona`], ['Start profil, 3 m', `${sp} dona`], ['Montaj yelimi / skoba', `${m} dona`]], cost: panels * p('pvc-panel') + sp * p('pvc-start-profile') + m * p('mounting-adhesive'), note: 'Panel maydoni 0,75 m², 10% zaxira.' };
    },
  },
  {
    id: 'dekor', cat: 'devor', name: 'Dekorativ shtukaturka', desc: 'Fakturali qoplama', icon: CI.sparkle,
    inputs: [area('Devor maydoni', '20')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 2.5 * R, ch = c(kg / 15), g = c((A * 0.2 * R) / 10);
      return { rows: [['Dekorativ shtukaturka', `${d1(kg)} kg`], ['Chelak, 15 kg', `${ch} dona`], ['Gruntovka, 10 l', `${g} kanistr`]], cost: ch * p('decorative-plaster-15') + g * p('primer-10'), note: 'Sarf: 2,5 kg/m² (faktura turiga bog‘liq).' };
    },
  },
  {
    id: 'gips', cat: 'shift', name: 'Gipsokarton', desc: 'List, profil, shuruplar, lenta', icon: CI.drywall,
    inputs: [area('Yuza maydoni'), opt('l', 'Qatlamlar', [['1', '1 qatlam'], ['2', '2 qatlam']], '1')],
    calc: (x, p) => {
      const A = v(x, 'A'), layers = v(x, 'l'), L = c((A * R * layers) / 3), pr = c(A * R), sh = c(A * 30 * layers * R), le = c((A * 1.2) / 45);
      return { rows: [['Gipsokarton Knauf 1,2 × 2,5 m', `${L} list`], ['Profil, 3 m', `${pr} dona`], ['Shuruplar', `${f0(sh)} dona`], ['Serpyanka lenta, 45 m', `${le} rulon`]], cost: L * p('drywall-12-5') + pr * p('metal-profile-3m') + sh * p('drywall-screw') + le * p('joint-tape-45'), note: 'Profil qadami 60 sm.' };
    },
  },
  {
    id: 'natyajnoy', cat: 'shift', name: 'Natyajnoy shift', desc: 'Polotno va baget', icon: CI.ceiling,
    inputs: [area('Shift maydoni'), n('P', 'Perimetr', 'm', '15,4'), n('L', 'Chiroq nuqtalari', 'dona', '4')],
    calc: (x, p) => {
      const A = v(x, 'A'), b = c(v(x, 'P') * R), L = v(x, 'L');
      return { rows: [['Polotno (montaj bilan)', `${d1(A)} m²`], ['Baget', `${b} m`], ['Chiroq halqalari', `${f0(L)} dona`]], cost: A * p('stretch-ceiling') + b * p('stretch-baguette') + L * p('stretch-light-ring'), note: 'Narx polotno va o‘rnatish bilan.' };
    },
  },
  {
    id: 'shiftboyoq', cat: 'shift', name: 'Shift bo‘yog‘i', desc: 'Matoviy shift bo‘yog‘i', icon: CI.roller,
    inputs: [area('Shift maydoni'), opt('q', 'Qatlamlar', [['1', '1'], ['2', '2']], '2')],
    calc: (x, p) => {
      const kg = v(x, 'A') * 0.18 * v(x, 'q') * R, b = c(kg / 10);
      return { rows: [['Shift bo‘yog‘i', `${d1(kg)} kg`], ['Chelak, 10 kg', `${b} dona`]], cost: b * p('ceiling-paint-10'), note: 'Sarf: 0,18 kg/m² bir qatlamga.' };
    },
  },
  {
    id: 'gisht', cat: 'qurilish', name: 'G‘isht terish', desc: 'G‘isht, sement, qum', icon: CI.brick,
    inputs: [area('Devor maydoni', '10'), opt('t', 'Devor qalinligi', [['51|0.019', '½ g‘isht'], ['102|0.046', '1 g‘isht'], ['153|0.073', '1½ g‘isht']], '102|0.046')],
    calc: (x, p) => {
      const A = v(x, 'A'), [pc, mv] = s(x, 't').split('|').map(Number), g = c(A * pc * 1.05), m3 = A * mv, cem = c((m3 * 300) / 50), sandM3 = m3 * 1.1;
      return { rows: [['G‘isht 250×120×65', `${f0(g)} dona`], ['Qorishma', `${d1(m3)} m³`], ['Sement M400, 50 kg', `${cem} qop`], ['Qum', `${d1(sandM3)} m³`]], cost: g * p('brick') + cem * p('cement-m400-50') + sandM3 * p('sand'), note: 'Choklar bilan, 5% zaxira. Qorishma 1:3.' };
    },
  },
  {
    id: 'gazoblok', cat: 'qurilish', name: 'Gazoblok', desc: 'Blok va montaj yelimi', icon: CI.block,
    inputs: [area('Devor maydoni', '10'), opt('t', 'Qalinlik', [['0.2', '200 mm'], ['0.3', '300 mm']], '0.2')],
    calc: (x, p) => {
      const A = v(x, 'A'), t = v(x, 't'), b = c(A * 5.56 * 1.05), m3 = A * t, y = c((m3 * 30) / 25);
      return { rows: [['Gazoblok 600×300', `${f0(b)} dona`], ['Hajm', `${d1(m3)} m³`], ['Montaj yelimi, 25 kg', `${y} qop`]], cost: b * p(t > 0.25 ? 'aerated-block-300' : 'aerated-block-200') + y * p('block-adhesive-25'), note: 'Blok yuzasi 600×300 mm, 5% zaxira.' };
    },
  },
  {
    id: 'beton', cat: 'qurilish', name: 'Beton', desc: 'Sement, qum, shag‘al', icon: CI.box,
    inputs: [n('V', 'Beton hajmi', 'm³', '1'), opt('m', 'Marka', [['280', 'M200'], ['330', 'M250'], ['380', 'M300']], '280')],
    calc: (x, p) => {
      const V = v(x, 'V'), cem = c((V * v(x, 'm')) / 50), sandM3 = V * 0.5, gravelM3 = V * 0.8;
      return { rows: [['Sement M400, 50 kg', `${cem} qop`], ['Qum', `${d1(sandM3)} m³`], ['Shag‘al', `${d1(gravelM3)} m³`], ['Suv', `${f0(V * 190)} l`]], cost: cem * p('cement-m400-50') + sandM3 * p('sand') + gravelM3 * p('gravel'), note: 'Tarkib 1 m³ uchun: sement marka bo‘yicha, qum 0,5 m³, shag‘al 0,8 m³.' };
    },
  },
  {
    id: 'gidro', cat: 'izol', name: 'Gidroizolyatsiya', desc: 'Hammom poli va devor osti', icon: CI.umbrella,
    inputs: [area('Pol maydoni', '4,4'), n('P', 'Perimetr', 'm', '8,4'), opt('q', 'Qatlamlar', [['1', '1'], ['2', '2']], '2')],
    calc: (x, p) => {
      const P = v(x, 'P'), S = v(x, 'A') + P * 0.3, kg = S * 0.6 * v(x, 'q') * R, ch = c(kg / 15), le = c(P * R);
      return { rows: [['Ishlov maydoni', `${d1(S)} m²`], ['Gidroizolyatsiya, 15 kg', `${ch} chelak`], ['Germetik lenta', `${le} m`]], cost: ch * p('waterproofing-15') + le * p('sealing-tape'), note: 'Devorga 30 sm ko‘tarilgan holda. Sarf 0,6 kg/m² har qatlamga.' };
    },
  },
  {
    id: 'issiq', cat: 'izol', name: 'Issiqlik izolyatsiyasi', desc: 'Mineral paxta yoki penoplast', icon: CI.thermo,
    inputs: [area('Yuza maydoni', '20'), opt('m', 'Material', [['min', 'Mineral paxta 50 mm'], ['pen', 'Penoplast 50 mm']], 'min')],
    calc: (x, p) => {
      const A = v(x, 'A'), isMin = s(x, 'm') === 'min', u = isMin ? c((A * R) / 6) : c(A * R), dy = c(A * 5);
      return { rows: [[isMin ? 'Mineral paxta, 6 m² upak.' : 'Penoplast list 1 × 1 m', `${u} ${isMin ? 'upak.' : 'list'}`], ['Dyubel-zontik', `${dy} dona`]], cost: u * p(isMin ? 'mineral-wool-6m2' : 'eps-board-50') + dy * p('insulation-dowel'), note: '10% zaxira, 5 ta dyubel/m².' };
    },
  },
  {
    id: 'elektr', cat: 'muh', name: 'Elektr montaj', desc: 'Kabel, rozetka, korobka', icon: CI.zap,
    inputs: [area('Xona maydoni'), n('r', 'Rozetka va viklyuchatel', 'dona', '6'), n('l', 'Chiroq nuqtalari', 'dona', '2')],
    calc: (x, p) => {
      const r = v(x, 'r'), l = v(x, 'l'), P = Math.sqrt(v(x, 'A')) * 4, k25 = c((P * 2.5 + r * 3) * R), k15 = c((P + l * 4) * R), kb = c(r + l), gofra = c((k25 + k15) * 0.8);
      return { rows: [['Kabel VVGng 3×2,5 (rozetka)', `${k25} m`], ['Kabel VVGng 3×1,5 (chiroq)', `${k15} m`], ['Rozetka / viklyuchatel', `${f0(r)} dona`], ['Montaj korobkasi', `${kb} dona`], ['Gofra truba', `${gofra} m`]], cost: k25 * p('cable-vvg-3x2-5') + k15 * p('cable-vvg-3x1-5') + r * p('socket-switch') + kb * p('junction-box') + gofra * p('corrugated-pipe'), note: 'Kabel uzunligi xona perimetri bo‘yicha taxminiy hisoblangan.' };
    },
  },
  {
    id: 'truba', cat: 'muh', name: 'Suv trubalari (PPR)', desc: 'Truba va fitinglar', icon: CI.pipe,
    inputs: [n('L', 'Truba uzunligi', 'm', '15'), n('b', 'Burilishlar soni', 'dona', '8')],
    calc: (x, p) => {
      const L = v(x, 'L'), t = c(L * R), ft = c(v(x, 'b') * 1.2 + 4), clips = c(L / 0.5);
      return { rows: [['PPR truba, 20 mm', `${t} m`], ['Fitinglar (burchak, troynik, mufta)', `${ft} dona`], ['Kreplenie (klipsa)', `${clips} dona`]], cost: t * p('ppr-pipe-20') + ft * p('ppr-fitting') + clips * p('pipe-clip'), note: 'Klipsa qadami 50 sm.' };
    },
  },
];

export const findCalculator = (id: string) => CALCULATORS.find((item) => item.id === id);

export const defaultValues = (calculator: Calculator): CalcValues =>
  Object.fromEntries(calculator.inputs.map((input) => [input.k, input.type === 'num' ? num(input.def) : input.def]));

export function runCalculator(calculator: Calculator, values: CalcValues, book: PriceBook) {
  const { lookup, used } = trackedLookup(book);
  const result = calculator.calc(values, lookup);
  return { ...result, status: combineStatus([...used].map((material) => priceInfo(book, material).status)) };
}

export const calculatorStatus = (calculator: Calculator, book: PriceBook) =>
  runCalculator(calculator, defaultValues(calculator), book).status;

export const qtyLabel = (line: Pick<Line, 'qty' | 'unit'>) =>
  `${line.unit === 'm²' ? dec(line.qty) : fmt(line.qty)} ${line.unit}`;

export const validate = (L: number, W: number, H: number, works: Works) => ({
  errLW: L < 1 || L > 20 || W < 1 || W > 20,
  errL: L < 1 || L > 20,
  errW: W < 1 || W > 20,
  errH: H < 2.3 || H > 3.6,
  errWorks: !Object.values(works).some(Boolean),
});
