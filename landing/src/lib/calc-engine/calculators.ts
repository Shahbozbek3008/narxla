import type messages from '../../../messages/uz.json';
import { num } from '../format';
import type { MaterialCode } from '../prices/catalog';
import { combineStatus, priceInfo, trackedLookup, type PriceBook, type PriceLookup } from '../prices/price-book';
import type { Unit } from './units';

type CalcMessages = (typeof messages)['app']['calcs'];

export type CalculatorId = keyof CalcMessages['items'];
export type CalcFieldKey = keyof CalcMessages['fields'];
export type CalcOptionKey = keyof CalcMessages['options'];
export type CalcRowKey = keyof CalcMessages['rows'];
export type CalcCategory = 'pol' | 'devor' | 'shift' | 'qurilish' | 'izol' | 'muh';
export type CalcValues = Record<string, number | string>;

export type CalcInput =
  | { k: string; label: CalcFieldKey; type: 'num'; unit: Unit; def: string }
  | { k: string; label: CalcFieldKey; type: 'opt'; opts: [value: string, label: CalcOptionKey][]; def: string };

export type CalcRow = { key: CalcRowKey; value: number; unit: Unit; precise: boolean };

export type CalcResult = { rows: CalcRow[]; cost: number };

export type Calculator = {
  id: CalculatorId;
  cat: CalcCategory;
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

const n = (k: string, label: CalcFieldKey, unit: Unit, def: string): CalcInput => ({ k, label, type: 'num', unit, def });
const opt = (k: string, label: CalcFieldKey, opts: [string, CalcOptionKey][], def: string): CalcInput => ({ k, label, type: 'opt', opts, def });
const area = (label: CalcFieldKey, def = '14,7') => n('A', label, 'm2', def);
const LAYER_OPTIONS: [string, CalcOptionKey][] = [['1', 'one'], ['2', 'two'], ['3', 'three']];
const layers = (choices: 2 | 3, def: string) => opt('q', 'layers', LAYER_OPTIONS.slice(0, choices), def);
const row = (key: CalcRowKey, value: number, unit: Unit, precise = false): CalcRow => ({ key, value, unit, precise });
const c = Math.ceil;
const R = 1.1;
const v = (values: CalcValues, key: string) => Number(values[key]);
const s = (values: CalcValues, key: string) => String(values[key]);
const code = (values: CalcValues, key: string) => s(values, key) as MaterialCode;

export const CALCULATORS: Calculator[] = [
  {
    id: 'kafel', cat: 'pol', icon: CI.tile,
    inputs: [area('floorArea'), opt('s', 'tileSize', [['0.09', 'tile30'], ['0.36', 'tile60'], ['0.72', 'tile120']], '0.36')],
    calc: (x, p) => {
      const A = v(x, 'A'), m2 = A * R, d = c(m2 / v(x, 's')), y = c((A * 5 * R) / 25), z = c((A * 0.5 * R) / 2), k = c(A / 10);
      return { rows: [row('tiles', d, 'pcs'), row('tileArea', m2, 'm2', true), row('tileAdhesive', y, 'bag'), row('grout', z, 'bag'), row('spacers', k, 'packet')], cost: m2 * p('porcelain-60x60') + y * p('tile-adhesive-25') + z * p('grout-2') + k * p('tile-spacers') };
    },
  },
  {
    id: 'laminat', cat: 'pol', icon: CI.planks,
    inputs: [area('floorArea'), opt('k', 'laminateClass', [['laminate-32', 'class32'], ['laminate-33', 'class33'], ['laminate-34', 'class34']], 'laminate-33')],
    calc: (x, p) => {
      const A = v(x, 'A'), u = c((A * R) / 2.13), area2 = A * R, pl = c(Math.sqrt(A) * 4 * R);
      return { rows: [row('laminatePacks', u, 'pack'), row('underlay', area2, 'm2', true), row('skirting', pl, 'm')], cost: u * 2.13 * p(code(x, 'k')) + area2 * p('underlay-3mm') + pl * p('skirting') };
    },
  },
  {
    id: 'linoleum', cat: 'pol', icon: CI.roll,
    inputs: [area('floorArea')],
    calc: (x, p) => {
      const A = v(x, 'A'), m = A * R, sk = c(A / 15), pl = c(Math.sqrt(A) * 4 * R);
      return { rows: [row('linoleum', m, 'm2', true), row('doubleTape', sk, 'roll'), row('skirting', pl, 'm')], cost: m * p('linoleum') + sk * p('double-tape-25') + pl * p('skirting') };
    },
  },
  {
    id: 'styajka', cat: 'pol', icon: CI.level,
    inputs: [area('floorArea'), n('t', 'thickness', 'mm', '50')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = ((A * v(x, 't')) / 10) * 20 * R, q = c(kg / 40), dl = c(Math.sqrt(A) * 4 * R);
      return { rows: [row('screedMix', q, 'bag'), row('mixWeight', kg, 'kg'), row('damperTape', dl, 'm')], cost: q * p('screed-m150-40') + dl * p('damper-tape') };
    },
  },
  {
    id: 'nalivnoy', cat: 'pol', icon: CI.level,
    inputs: [area('floorArea'), n('t', 'thickness', 'mm', '5')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * v(x, 't') * 1.6 * R, q = c(kg / 25), g = c((A * 0.15 * R) / 10);
      return { rows: [row('selfLeveling', q, 'bag'), row('mixWeight', kg, 'kg'), row('primerCanister', g, 'canister')], cost: q * p('self-leveling-25') + g * p('primer-10') };
    },
  },
  {
    id: 'plintus', cat: 'pol', icon: CI.skirting,
    inputs: [n('P', 'roomPerimeter', 'm', '15,4'), n('d', 'doors', 'pcs', '1')],
    calc: (x, p) => {
      const len = Math.max(0, v(x, 'P') - v(x, 'd') * 0.9) * R, pl = c(len / 2.5), ug = c(4 + v(x, 'd') * 2);
      return { rows: [row('skirtingPlanks', pl, 'pcs'), row('totalLength', len, 'm', true), row('skirtingFittings', ug, 'pcs')], cost: pl * 2.5 * p('skirting') + ug * p('skirting-fittings') };
    },
  },
  {
    id: 'boyoq', cat: 'devor', icon: CI.roller,
    inputs: [area('wallArea', '37,7'), layers(3, '2')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 0.18 * v(x, 'q') * R, b = c(kg / 25), g = c((A * 0.2 * R) / 10);
      return { rows: [row('paint', kg, 'kg', true), row('paintBuckets', b, 'pcs'), row('primerCanister', g, 'canister')], cost: b * p('paint-washable-25') + g * p('primer-10') };
    },
  },
  {
    id: 'shtuk', cat: 'devor', icon: CI.trowel,
    inputs: [area('wallArea', '37,7'), n('t', 'averageLayer', 'mm', '15')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 0.9 * v(x, 't') * R, q = c(kg / 30), m = c(A / 1.5), g = c((A * 0.2 * R) / 10);
      return { rows: [row('rotband', q, 'bag'), row('beacons', m, 'pcs'), row('primerCanister', g, 'canister')], cost: q * p('rotband-30') + m * p('plaster-beacon') + g * p('primer-10') };
    },
  },
  {
    id: 'sementshtuk', cat: 'devor', icon: CI.trowel,
    inputs: [area('wallArea', '20'), n('t', 'averageLayer', 'mm', '20')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 1.7 * v(x, 't') * R, q = c(kg / 25), m = c(A / 1.5);
      return { rows: [row('cementPlaster', q, 'bag'), row('mixWeight', kg, 'kg'), row('beacons', m, 'pcs')], cost: q * p('cement-plaster-25') + m * p('plaster-beacon') };
    },
  },
  {
    id: 'shpak', cat: 'devor', icon: CI.trowel,
    inputs: [area('wallArea', '37,7'), layers(3, '2')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 1.2 * v(x, 'q') * R, q = c(kg / 25), z = c(A / 50);
      return { rows: [row('putty', q, 'bag'), row('mixWeight', kg, 'kg'), row('sandpaper', z, 'roll')], cost: q * p('putty-25') + z * p('sandpaper-roll') };
    },
  },
  {
    id: 'grunt', cat: 'devor', icon: CI.bucket,
    inputs: [area('surfaceArea', '37,7'), layers(2, '1')],
    calc: (x, p) => {
      const l = v(x, 'A') * 0.15 * v(x, 'q') * R, k = c(l / 10);
      return { rows: [row('primer', l, 'l', true), row('canisters', k, 'pcs')], cost: k * p('primer-10') };
    },
  },
  {
    id: 'oboy', cat: 'devor', icon: CI.scroll,
    inputs: [n('P', 'wallPerimeter', 'm', '15,4'), n('H', 'ceilingHeight', 'm', '2,7'), opt('w', 'roll', [['0.53', 'roll053'], ['1.06', 'roll106']], '1.06')],
    calc: (x, p) => {
      const w = v(x, 'w'), H = v(x, 'H'), P = v(x, 'P'), per = Math.max(1, Math.floor(10 / (H + 0.1))), strips = c(P / w), r = c(strips / per), y = c((P * H) / 25);
      return { rows: [row('wallpaperRolls', r, 'pcs'), row('strips', strips, 'pcs'), row('wallpaperGlue', y, 'packet')], cost: r * p(w > 1 ? 'wallpaper-106' : 'wallpaper-053') + y * p('wallpaper-glue') };
    },
  },
  {
    id: 'devorkafel', cat: 'devor', icon: CI.tile,
    inputs: [area('wallArea', '18'), opt('s', 'tileSize', [['0.06', 'tile20x30'], ['0.18', 'tile30x60']], '0.18')],
    calc: (x, p) => {
      const A = v(x, 'A'), m2 = A * R, d = c(m2 / v(x, 's')), y = c((A * 4 * R) / 25), z = c((A * 0.4 * R) / 2);
      return { rows: [row('tiles', d, 'pcs'), row('tileAdhesive', y, 'bag'), row('grout', z, 'bag')], cost: m2 * p('wall-tile-30x60') + y * p('tile-adhesive-25') + z * p('grout-2') };
    },
  },
  {
    id: 'pvx', cat: 'devor', icon: CI.panels,
    inputs: [area('surfaceArea', '12')],
    calc: (x, p) => {
      const A = v(x, 'A'), panels = c((A * R) / 0.75), sp = c((Math.sqrt(A) * 4) / 3), m = c(A / 5);
      return { rows: [row('pvcPanels', panels, 'pcs'), row('startProfile', sp, 'pcs'), row('mountingAdhesive', m, 'pcs')], cost: panels * p('pvc-panel') + sp * p('pvc-start-profile') + m * p('mounting-adhesive') };
    },
  },
  {
    id: 'dekor', cat: 'devor', icon: CI.sparkle,
    inputs: [area('wallArea', '20')],
    calc: (x, p) => {
      const A = v(x, 'A'), kg = A * 2.5 * R, ch = c(kg / 15), g = c((A * 0.2 * R) / 10);
      return { rows: [row('decorativePlaster', kg, 'kg', true), row('buckets15', ch, 'pcs'), row('primerCanister', g, 'canister')], cost: ch * p('decorative-plaster-15') + g * p('primer-10') };
    },
  },
  {
    id: 'gips', cat: 'shift', icon: CI.drywall,
    inputs: [area('surfaceArea'), opt('l', 'layers', [['1', 'layer1'], ['2', 'layer2']], '1')],
    calc: (x, p) => {
      const A = v(x, 'A'), count = v(x, 'l'), L = c((A * R * count) / 3), pr = c(A * R), sh = c(A * 30 * count * R), le = c((A * 1.2) / 45);
      return { rows: [row('drywallSheets', L, 'sheet'), row('profiles', pr, 'pcs'), row('screws', sh, 'pcs'), row('jointTape', le, 'roll')], cost: L * p('drywall-12-5') + pr * p('metal-profile-3m') + sh * p('drywall-screw') + le * p('joint-tape-45') };
    },
  },
  {
    id: 'natyajnoy', cat: 'shift', icon: CI.ceiling,
    inputs: [area('ceilingArea'), n('P', 'perimeter', 'm', '15,4'), n('L', 'lightPoints', 'pcs', '4')],
    calc: (x, p) => {
      const A = v(x, 'A'), b = c(v(x, 'P') * R), L = v(x, 'L');
      return { rows: [row('stretchCanvas', A, 'm2', true), row('baguette', b, 'm'), row('lightRings', L, 'pcs')], cost: A * p('stretch-ceiling') + b * p('stretch-baguette') + L * p('stretch-light-ring') };
    },
  },
  {
    id: 'shiftboyoq', cat: 'shift', icon: CI.roller,
    inputs: [area('ceilingArea'), layers(2, '2')],
    calc: (x, p) => {
      const kg = v(x, 'A') * 0.18 * v(x, 'q') * R, b = c(kg / 10);
      return { rows: [row('ceilingPaint', kg, 'kg', true), row('buckets10', b, 'pcs')], cost: b * p('ceiling-paint-10') };
    },
  },
  {
    id: 'gisht', cat: 'qurilish', icon: CI.brick,
    inputs: [area('wallArea', '10'), opt('t', 'wallThickness', [['51|0.019', 'brickHalf'], ['102|0.046', 'brickOne'], ['153|0.073', 'brickOneHalf']], '102|0.046')],
    calc: (x, p) => {
      const A = v(x, 'A'), [pc, mv] = s(x, 't').split('|').map(Number), g = c(A * pc * 1.05), m3 = A * mv, cem = c((m3 * 300) / 50), sandM3 = m3 * 1.1;
      return { rows: [row('bricks', g, 'pcs'), row('mortar', m3, 'm3', true), row('cement', cem, 'bag'), row('sand', sandM3, 'm3', true)], cost: g * p('brick') + cem * p('cement-m400-50') + sandM3 * p('sand') };
    },
  },
  {
    id: 'gazoblok', cat: 'qurilish', icon: CI.block,
    inputs: [area('wallArea', '10'), opt('t', 'thickness', [['0.2', 'block200'], ['0.3', 'block300']], '0.2')],
    calc: (x, p) => {
      const A = v(x, 'A'), t = v(x, 't'), b = c(A * 5.56 * 1.05), m3 = A * t, y = c((m3 * 30) / 25);
      return { rows: [row('blocks', b, 'pcs'), row('volume', m3, 'm3', true), row('blockAdhesive', y, 'bag')], cost: b * p(t > 0.25 ? 'aerated-block-300' : 'aerated-block-200') + y * p('block-adhesive-25') };
    },
  },
  {
    id: 'beton', cat: 'qurilish', icon: CI.box,
    inputs: [n('V', 'concreteVolume', 'm3', '1'), opt('m', 'grade', [['280', 'm200'], ['330', 'm250'], ['380', 'm300']], '280')],
    calc: (x, p) => {
      const V = v(x, 'V'), cem = c((V * v(x, 'm')) / 50), sandM3 = V * 0.5, gravelM3 = V * 0.8;
      return { rows: [row('cement', cem, 'bag'), row('sand', sandM3, 'm3', true), row('gravel', gravelM3, 'm3', true), row('water', V * 190, 'l')], cost: cem * p('cement-m400-50') + sandM3 * p('sand') + gravelM3 * p('gravel') };
    },
  },
  {
    id: 'gidro', cat: 'izol', icon: CI.umbrella,
    inputs: [area('floorArea', '4,4'), n('P', 'perimeter', 'm', '8,4'), layers(2, '2')],
    calc: (x, p) => {
      const P = v(x, 'P'), S = v(x, 'A') + P * 0.3, kg = S * 0.6 * v(x, 'q') * R, ch = c(kg / 15), le = c(P * R);
      return { rows: [row('treatedArea', S, 'm2', true), row('waterproofing', ch, 'bucket'), row('sealingTape', le, 'm')], cost: ch * p('waterproofing-15') + le * p('sealing-tape') };
    },
  },
  {
    id: 'issiq', cat: 'izol', icon: CI.thermo,
    inputs: [area('surfaceArea', '20'), opt('m', 'material', [['min', 'mineralWool'], ['pen', 'eps']], 'min')],
    calc: (x, p) => {
      const A = v(x, 'A'), isMin = s(x, 'm') === 'min', u = isMin ? c((A * R) / 6) : c(A * R), dy = c(A * 5);
      return { rows: [isMin ? row('mineralWool', u, 'pack') : row('epsBoard', u, 'sheet'), row('dowels', dy, 'pcs')], cost: u * p(isMin ? 'mineral-wool-6m2' : 'eps-board-50') + dy * p('insulation-dowel') };
    },
  },
  {
    id: 'elektr', cat: 'muh', icon: CI.zap,
    inputs: [area('roomArea'), n('r', 'sockets', 'pcs', '6'), n('l', 'lightPoints', 'pcs', '2')],
    calc: (x, p) => {
      const r = v(x, 'r'), l = v(x, 'l'), P = Math.sqrt(v(x, 'A')) * 4, k25 = c((P * 2.5 + r * 3) * R), k15 = c((P + l * 4) * R), kb = c(r + l), gofra = c((k25 + k15) * 0.8);
      return { rows: [row('cable25', k25, 'm'), row('cable15', k15, 'm'), row('sockets', r, 'pcs'), row('junctionBoxes', kb, 'pcs'), row('conduit', gofra, 'm')], cost: k25 * p('cable-vvg-3x2-5') + k15 * p('cable-vvg-3x1-5') + r * p('socket-switch') + kb * p('junction-box') + gofra * p('corrugated-pipe') };
    },
  },
  {
    id: 'truba', cat: 'muh', icon: CI.pipe,
    inputs: [n('L', 'pipeLength', 'm', '15'), n('b', 'bends', 'pcs', '8')],
    calc: (x, p) => {
      const L = v(x, 'L'), t = c(L * R), ft = c(v(x, 'b') * 1.2 + 4), clips = c(L / 0.5);
      return { rows: [row('pprPipe', t, 'm'), row('pprFittings', ft, 'pcs'), row('pipeClips', clips, 'pcs')], cost: t * p('ppr-pipe-20') + ft * p('ppr-fitting') + clips * p('pipe-clip') };
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
