import {
  type CalcValues,
  type CalculatorId,
  checkPrice,
  CHECK_TYPES,
  defaultValues,
  estimate,
  estimateLabourRange,
  type EstimateInput,
  findCalculator,
  type Quality,
  QUALITIES,
  type RoomId,
  runCalculator,
  WET_ROOMS,
} from '../calc-engine';
import type { LabourCode } from '../prices/labour';
import { labourInfo, type PriceBook } from '../prices/price-book';
import { DEFAULT_DRAFT, draftToInput } from '@/store/draft';
import { type Parsed, normalize, parse } from './parse';
import type { Surface } from './lexicon';

export type Topic = 'estimate' | 'calc' | 'check';
export type Awaiting = 'room' | 'dims' | 'area' | 'length' | 'volume' | 'count' | 'quote' | 'work';

export type Slots = {
  room?: RoomId;
  quality?: Quality;
  L?: number;
  W?: number;
  H?: number;
  area?: number;
  length?: number;
  volume?: number;
  count?: number;
  money?: number;
  calc?: CalculatorId;
  labour?: LabourCode;
  surface?: Surface;
  calcSurface?: Surface | 'length' | 'volume' | 'points';
};

export type AssistantState = {
  topic?: Topic;
  slots: Slots;
  awaiting?: Awaiting;
  lastEstimate?: EstimateInput;
};

export type Chip =
  | { kind: 'room'; id: RoomId }
  | { kind: 'quality'; id: Quality }
  | { kind: 'text'; text: string }
  | { kind: 'example'; index: number }
  | { kind: 'work'; index: number }
  | { kind: 'askQuote' };

export type Reply =
  | { kind: 'estimate'; input: EstimateInput; result: ReturnType<typeof estimate>; chips: Chip[] }
  | { kind: 'calc'; calc: CalculatorId; values: CalcValues; output: ReturnType<typeof runCalculator>; derived: boolean; chips: Chip[] }
  | {
      kind: 'check';
      subject: { type: 'labour'; code: LabourCode; volume: number } | { type: 'estimate'; room: RoomId };
      quote: number;
      result: ReturnType<typeof checkPrice>;
      chips: Chip[];
    }
  | { kind: 'ask'; question: Awaiting; invalid: boolean; chips: Chip[] }
  | { kind: 'help'; understood: boolean; chips: Chip[] };

type Solved = { reply: Reply; awaiting?: Awaiting; input?: EstimateInput };

export const INITIAL_STATE: AssistantState = { slots: {} };

const DEFAULT_HEIGHT = 2.7;
const OPENINGS_AREA = 3.9;
const ROOM_LIMITS = { min: 0.5, max: 30 };
const HEIGHT_LIMITS = { min: 2, max: 6 };
const MONEY_MILLION_THRESHOLD = 1000;
const MIN_QUOTE = 10_000;

const EXAMPLE_CHIPS: Chip[] = [0, 1, 2].map((index) => ({ kind: 'example', index }));
const DIMS_CHIPS: Chip[] = ['3x3', '4x3,5', '5x4'].map((text) => ({ kind: 'text', text }));
const ROOM_CHIPS: Chip[] = (['yotoq', 'mehmon', 'oshxona', 'hammom'] as RoomId[]).map((id) => ({ kind: 'room', id }));
const WORK_CHIPS: Chip[] = [0, 1, 2, 3].map((index) => ({ kind: 'work', index }));
const AREA_CHIPS: Chip[] = ['10 m²', '20 m²', '40 m²'].map((text) => ({ kind: 'text', text }));

const GEOMETRY: (keyof Slots)[] = ['room', 'L', 'W', 'H', 'quality'];

const defined = <T extends object>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>;

function topicOf(parsed: Parsed): Topic | undefined {
  if (parsed.money !== undefined && (parsed.wantsCheck || parsed.material?.labour)) return 'check';
  if (parsed.material) return 'calc';
  if (parsed.room || parsed.wantsEstimate) return 'estimate';
  if (parsed.money !== undefined) return 'check';
  return undefined;
}

function slotsFrom(parsed: Parsed): Slots {
  return defined({
    room: parsed.room,
    quality: parsed.quality,
    L: parsed.L,
    W: parsed.W,
    H: parsed.H,
    area: parsed.area,
    length: parsed.length,
    volume: parsed.volume,
    count: parsed.count,
    money: parsed.money,
    calc: parsed.material?.calc,
    labour: parsed.material?.labour,
    surface: parsed.surface,
    calcSurface: parsed.material?.topic.surface,
  });
}

function fillAwaited(parsed: Parsed, text: string, awaiting?: Awaiting): Slots {
  if (!awaiting) return {};
  const bare = /(\d+(?:[.,]\d+)?)/u.exec(normalize(text));
  if (!bare) return {};
  const value = Number(bare[1].replace(',', '.'));
  switch (awaiting) {
    case 'quote':
      return parsed.money === undefined ? { money: value < MONEY_MILLION_THRESHOLD ? value * 1e6 : value } : {};
    case 'area':
      return parsed.area === undefined && parsed.L === undefined ? { area: value } : {};
    case 'length':
      return parsed.length === undefined ? { length: value } : {};
    case 'volume':
      return parsed.volume === undefined ? { volume: value } : {};
    case 'count':
      return parsed.count === undefined ? { count: value } : {};
    default:
      return {};
  }
}

const inRange = (value: number, { min, max }: { min: number; max: number }) => value >= min && value <= max;

function roomSize(slots: Slots): { L: number; W: number } | null {
  if (slots.L !== undefined && slots.W !== undefined) return { L: slots.L, W: slots.W };
  if (slots.area !== undefined && slots.area > 0) {
    const side = Math.sqrt(slots.area);
    return { L: side, W: side };
  }
  return null;
}

function surfaceArea(slots: Slots, surface: Surface): number | undefined {
  if (slots.area !== undefined) return slots.area;
  if (slots.L === undefined || slots.W === undefined) return undefined;
  if (surface === 'wall') {
    const height = slots.H ?? DEFAULT_HEIGHT;
    return Math.max(1, 2 * (slots.L + slots.W) * height - OPENINGS_AREA);
  }
  return slots.L * slots.W;
}

const perimeter = (slots: Slots) =>
  slots.length ?? (slots.L !== undefined && slots.W !== undefined ? 2 * (slots.L + slots.W) : undefined);

const round = (value: number, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

const AREA_LABEL_SURFACE: Record<string, Surface> = {
  floorArea: 'floor',
  roomArea: 'floor',
  ceilingArea: 'ceiling',
  wallArea: 'wall',
};

function solveEstimate(slots: Slots, book: PriceBook): Solved {
  if (!slots.room) return { reply: { kind: 'ask', question: 'room', invalid: false, chips: ROOM_CHIPS }, awaiting: 'room' };
  const size = roomSize(slots);
  if (!size) return { reply: { kind: 'ask', question: 'dims', invalid: false, chips: DIMS_CHIPS }, awaiting: 'dims' };
  const height = slots.H ?? DEFAULT_HEIGHT;
  if (!inRange(size.L, ROOM_LIMITS) || !inRange(size.W, ROOM_LIMITS) || !inRange(height, HEIGHT_LIMITS)) {
    return { reply: { kind: 'ask', question: 'dims', invalid: true, chips: DIMS_CHIPS }, awaiting: 'dims' };
  }

  const quality = slots.quality ?? DEFAULT_DRAFT.quality;
  const input: EstimateInput = {
    ...draftToInput(DEFAULT_DRAFT),
    room: slots.room,
    L: round(size.L, 2),
    W: round(size.W, 2),
    H: height,
    quality,
    works: { ...DEFAULT_DRAFT.works, santex: WET_ROOMS.includes(slots.room) },
  };
  const chips: Chip[] = [
    ...QUALITIES.filter((id) => id !== quality).map((id): Chip => ({ kind: 'quality', id })),
    { kind: 'askQuote' },
  ];
  return { reply: { kind: 'estimate', input, result: estimate(input, book), chips }, input };
}

function solveCalc(slots: Slots, book: PriceBook): Solved {
  const calculator = slots.calc ? findCalculator(slots.calc) : undefined;
  if (!calculator) return { reply: { kind: 'help', understood: false, chips: EXAMPLE_CHIPS } };

  const values = defaultValues(calculator);
  let derived = false;

  for (const field of calculator.inputs) {
    if (field.type !== 'num') continue;
    const surface =
      AREA_LABEL_SURFACE[field.label] ??
      (slots.surface && slots.calcSurface !== 'length' ? slots.surface : (slots.calcSurface as Surface | undefined)) ??
      'floor';
    let value: number | undefined;
    if (field.k === 'A') value = surfaceArea(slots, surface);
    else if (field.k === 'P' || (field.k === 'L' && field.unit === 'm')) value = perimeter(slots);
    else if (field.k === 'H') value = slots.H ?? DEFAULT_HEIGHT;
    else if (field.k === 'V') value = slots.volume;
    else if (field.k === 'r') value = slots.count;
    else continue;

    if (value === undefined) {
      if (field.k === 'H' || field.k === 'r') continue;
      const question: Awaiting = field.k === 'A' ? 'area' : field.k === 'V' ? 'volume' : 'length';
      return { reply: { kind: 'ask', question, invalid: false, chips: question === 'area' ? AREA_CHIPS : [] }, awaiting: question };
    }
    if (field.k === 'A' && slots.area === undefined) derived = true;
    values[field.k] = round(value, 2);
  }

  const chips: Chip[] = slots.labour ? [{ kind: 'askQuote' }] : [];
  return { reply: { kind: 'calc', calc: calculator.id, values, output: runCalculator(calculator, values, book), derived, chips } };
}

function labourVolume(slots: Slots, code: LabourCode): number | undefined {
  const type = CHECK_TYPES.find((item) => item.code === code);
  if (!type) return undefined;
  if (type.unit === 'pcs') return slots.count;
  if (type.unit === 'm') return perimeter(slots);
  const surface: Surface = code.startsWith('wall') || code === 'wallpapering' || code === 'decorative-plastering' || code === 'bricklaying' || code === 'block-laying' ? 'wall' : code.includes('ceiling') ? 'ceiling' : 'floor';
  return surfaceArea(slots, surface);
}

function solveCheck(slots: Slots, state: AssistantState, book: PriceBook): Solved {
  const quote = slots.money;
  if (slots.labour) {
    const volume = labourVolume(slots, slots.labour);
    if (volume === undefined) {
      const type = CHECK_TYPES.find((item) => item.code === slots.labour);
      const question: Awaiting = type?.unit === 'pcs' ? 'count' : type?.unit === 'm' ? 'length' : 'area';
      return { reply: { kind: 'ask', question, invalid: false, chips: question === 'area' ? AREA_CHIPS : [] }, awaiting: question };
    }
    if (quote === undefined || quote < MIN_QUOTE) {
      return { reply: { kind: 'ask', question: 'quote', invalid: quote !== undefined, chips: [] }, awaiting: 'quote' };
    }
    const result = checkPrice(labourInfo(book, slots.labour), volume, quote);
    return { reply: { kind: 'check', subject: { type: 'labour', code: slots.labour, volume: round(volume) }, quote, result, chips: [] } };
  }

  if (state.lastEstimate) {
    if (quote === undefined || quote < MIN_QUOTE) {
      return { reply: { kind: 'ask', question: 'quote', invalid: quote !== undefined, chips: [] }, awaiting: 'quote' };
    }
    const computed = estimate(state.lastEstimate, book);
    const { range } = estimateLabourRange(computed.lab, (code) => labourInfo(book, code));
    return {
      reply: {
        kind: 'check',
        subject: { type: 'estimate', room: state.lastEstimate.room },
        quote,
        result: checkPrice(range, 1, quote),
        chips: [],
      },
    };
  }

  return { reply: { kind: 'ask', question: 'work', invalid: false, chips: WORK_CHIPS }, awaiting: 'work' };
}

export function respond(state: AssistantState, text: string, book: PriceBook): { state: AssistantState; reply: Reply } {
  const parsed = parse(text);
  const explicit = state.awaiting === 'work' && parsed.material ? 'check' : topicOf(parsed);
  const incoming = { ...slotsFrom(parsed), ...fillAwaited(parsed, text, state.awaiting) };
  const hasData = Object.keys(incoming).length > 0;

  if (!explicit && !state.topic) {
    return {
      state,
      reply: { kind: 'help', understood: parsed.greeting || !hasData, chips: EXAMPLE_CHIPS },
    };
  }
  if (!explicit && !hasData) {
    return { state, reply: { kind: 'help', understood: parsed.greeting, chips: EXAMPLE_CHIPS } };
  }

  const topic = explicit ?? state.topic!;
  const carried: Slots =
    topic === state.topic
      ? state.slots
      : (Object.fromEntries(GEOMETRY.filter((key) => state.slots[key] !== undefined).map((key) => [key, state.slots[key]])) as Slots);
  const switchingMaterial = incoming.calc !== undefined && carried.calc !== undefined && incoming.calc !== carried.calc;
  const base: Slots = switchingMaterial ? { ...carried, area: undefined, length: undefined, count: undefined, money: undefined } : carried;
  const slots: Slots = { ...base, ...incoming };
  if (incoming.L !== undefined) delete slots.area;

  const solved: Solved =
    topic === 'estimate' ? solveEstimate(slots, book) : topic === 'calc' ? solveCalc(slots, book) : solveCheck(slots, state, book);

  return {
    state: {
      topic,
      slots,
      awaiting: solved.awaiting,
      lastEstimate: solved.input ?? state.lastEstimate,
    },
    reply: solved.reply,
  };
}

export function startQuote(state: AssistantState): { state: AssistantState; reply: Reply } {
  const slots: Slots = state.topic === 'calc' ? { ...state.slots, money: undefined } : {};
  return {
    state: { ...state, topic: 'check', slots, awaiting: 'quote' },
    reply: { kind: 'ask', question: 'quote', invalid: false, chips: [] },
  };
}
