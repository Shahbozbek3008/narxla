import type { LabourCode, LabourRange } from '../prices/labour';
import type { Unit } from './units';

export type CheckCategory = 'pol' | 'devor' | 'shift' | 'qurilish' | 'muh';

export type CheckType = {
  code: LabourCode;
  cat: CheckCategory;
  unit: Extract<Unit, 'm2' | 'm' | 'pcs'>;
  def: string;
};

export const CHECK_CATS: CheckCategory[] = ['pol', 'devor', 'shift', 'qurilish', 'muh'];

const type = (code: LabourCode, cat: CheckCategory, unit: CheckType['unit'], def: string): CheckType => ({ code, cat, unit, def });

export const CHECK_TYPES: CheckType[] = [
  type('floor-tiling', 'pol', 'm2', '52'),
  type('laminate-laying', 'pol', 'm2', '18'),
  type('linoleum-laying', 'pol', 'm2', '18'),
  type('screed', 'pol', 'm2', '40'),
  type('self-leveling-floor', 'pol', 'm2', '40'),
  type('skirting-install', 'pol', 'm', '30'),
  type('wall-plastering', 'devor', 'm2', '80'),
  type('wall-puttying', 'devor', 'm2', '80'),
  type('wall-painting', 'devor', 'm2', '80'),
  type('wallpapering', 'devor', 'm2', '45'),
  type('wall-tiling', 'devor', 'm2', '25'),
  type('decorative-plastering', 'devor', 'm2', '20'),
  type('drywall-ceiling', 'shift', 'm2', '18'),
  type('stretch-ceiling', 'shift', 'm2', '18'),
  type('ceiling-painting', 'shift', 'm2', '18'),
  type('bricklaying', 'qurilish', 'm2', '20'),
  type('block-laying', 'qurilish', 'm2', '20'),
  type('demolition', 'qurilish', 'm2', '50'),
  type('waterproofing', 'qurilish', 'm2', '8'),
  type('electric-point', 'muh', 'pcs', '20'),
  type('cable-laying', 'muh', 'm', '100'),
  type('plumbing-point', 'muh', 'pcs', '6'),
  type('toilet-install', 'muh', 'pcs', '1'),
];

export const findCheckType = (code: string) => CHECK_TYPES.find((item) => item.code === code) ?? CHECK_TYPES[0];

export type CheckVerdict = 'fair' | 'expensive' | 'cheap' | 'tooCheap';
export type CheckTone = 'success' | 'accent' | 'danger';

const FAIR_TOLERANCE = 5;
const DANGER_MARKUP = 30;

export function checkPrice(rate: LabourRange, volume: number, price: number) {
  const lo = rate.min * volume;
  const avg = rate.price * volume;
  const hi = rate.max * volume;
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
