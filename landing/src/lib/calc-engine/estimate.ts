import type { MaterialCode } from '../prices/catalog';
import type { LabourCode } from '../prices/labour';
import { labourInfo, priceInfo, type PriceBook, type PriceStatus } from '../prices/price-book';
import type { Unit } from './units';

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

interface LineBase {
  cat: WorkId;
  qty: number;
  unit: Unit;
  price: number;
  total: number;
}

export interface MaterialLine extends LineBase {
  kind: 'material';
  code: MaterialCode;
  status: PriceStatus;
  checkedAt: string | null;
}

export interface LabourLine extends LineBase {
  kind: 'labour';
  code: LabourCode;
}

export type Line = MaterialLine | LabourLine;

export interface Estimate {
  area: number;
  perim: number;
  walls: number;
  mats: MaterialLine[];
  lab: LabourLine[];
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

const GRADED: Record<'laminate' | 'paint' | 'porcelain', Record<Quality, MaterialCode>> = {
  laminate: { eco: 'laminate-32', mid: 'laminate-33', pre: 'laminate-34' },
  paint: { eco: 'paint-emulsion-25', mid: 'paint-washable-25', pre: 'paint-premium-25' },
  porcelain: { eco: 'porcelain-local', mid: 'porcelain-60x60', pre: 'porcelain-import' },
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
  const lab: LabourLine[] = [];

  const addMaterial = (cat: WorkId, code: MaterialCode, qty: number, unit: Unit, factor: number) => {
    const info = priceInfo(book, code);
    const price = roundTo100(info.price * factor);
    mats.push({ kind: 'material', cat, code, qty, unit, price, total: qty * price, status: info.status, checkedAt: info.checkedAt });
  };
  const M = (cat: WorkId, code: MaterialCode, qty: number, unit: Unit) => addMaterial(cat, code, qty, unit, qf);
  const G = (cat: WorkId, kind: keyof typeof GRADED, qty: number, unit: Unit) => addMaterial(cat, GRADED[kind][q], qty, unit, 1);
  const B = (cat: WorkId, code: LabourCode, qty: number, unit: Unit) => {
    const price = roundTo100(labourInfo(book, code).price * lf);
    lab.push({ kind: 'labour', cat, code, qty, unit, price, total: qty * price });
  };

  if (works.pol) {
    if (tile) {
      G('pol', 'porcelain', r1(area * R), 'm2');
      M('pol', 'tile-adhesive-25', c((area * 5 * R) / 25), 'bag');
      M('pol', 'grout-2', c((area * 0.5 * R) / 2), 'bag');
      if (wet) M('pol', 'waterproofing-15', c(((area + perim * 0.3) * 1.2 * R) / 15), 'bucket');
      B('pol', 'floor-tiling', r1(area), 'm2');
    } else {
      G('pol', 'laminate', r1(area * R), 'm2');
      M('pol', 'underlay-3mm', r1(area * R), 'm2');
      M('pol', 'skirting', c(perim * R), 'm');
      B('pol', 'laminate-laying', r1(area), 'm2');
    }
  }
  if (works.devor) {
    M('devor', 'rotband-30', c((walls * 9 * R) / 30), 'bag');
    B('devor', 'wall-plastering', r1(walls), 'm2');
    if (wet) {
      M('devor', 'wall-tile-30x60', r1(walls * R), 'm2');
      M('devor', 'tile-adhesive-25', c((walls * 5 * R) / 25), 'bag');
      B('devor', 'wall-tiling', r1(walls), 'm2');
    } else {
      M('devor', 'putty-25', c((walls * 1.2 * R) / 25), 'bag');
      M('devor', 'primer-10', c((walls * 0.2 * R) / 10), 'canister');
      G('devor', 'paint', c((walls * 0.18 * 2 * R) / 25), 'bucket');
      B('devor', 'wall-putty-paint', r1(walls), 'm2');
    }
  }
  if (works.shift) {
    M('shift', wet ? 'drywall-moisture' : 'drywall-12-5', c((area * R) / 3), 'sheet');
    M('shift', 'metal-profile-3m', c(area * R), 'pcs');
    M('shift', 'ceiling-paint-10', c((area * 0.18 * 2 * R) / 10), 'bucket');
    B('shift', 'drywall-ceiling', r1(area), 'm2');
    B('shift', 'ceiling-putty-paint', r1(area), 'm2');
  }
  if (works.elektr) {
    const pts = c(area / 4) + 2;
    const cab = c((perim * 2.5 + 10) * R);
    M('elektr', 'cable-vvg-3x2-5', cab, 'm');
    M('elektr', 'socket-switch', pts, 'pcs');
    M('elektr', 'junction-box', pts, 'pcs');
    M('elektr', 'breaker-16a', 1, 'pcs');
    B('elektr', 'electric-point', pts, 'pcs');
    B('elektr', 'cable-laying', cab, 'm');
  }
  if (works.santex) {
    M('santex', 'ppr-pipe-20', c(perim * 1.5 * R), 'm');
    M('santex', 'mixer-tap', 2, 'pcs');
    M('santex', 'fittings-kit', 1, 'set');
    B('santex', 'plumbing-set', 1, 'set');
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

export const validate = (L: number, W: number, H: number, works: Works) => ({
  errLW: L < 1 || L > 20 || W < 1 || W > 20,
  errL: L < 1 || L > 20,
  errW: W < 1 || W > 20,
  errH: H < 2.3 || H > 3.6,
  errWorks: !Object.values(works).some(Boolean),
});
