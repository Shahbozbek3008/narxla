import type { CalculatorId, Quality, RoomId } from '../calc-engine';
import type { LabourCode } from '../prices/labour';
import {
  CEMENT_STEMS,
  CHECK_STEMS,
  ESTIMATE_STEMS,
  GREETING_STEMS,
  MATERIALS,
  type MaterialTopic,
  QUALITY_STEMS,
  ROOM_STEMS,
  SURFACE_STEMS,
  type Surface,
} from './lexicon';

export type Parsed = {
  room?: RoomId;
  quality?: Quality;
  surface?: Surface;
  material?: { calc: CalculatorId; labour?: LabourCode; topic: MaterialTopic };
  L?: number;
  W?: number;
  H?: number;
  area?: number;
  length?: number;
  volume?: number;
  count?: number;
  money?: number;
  wantsCheck: boolean;
  wantsEstimate: boolean;
  greeting: boolean;
};

const NUM = String.raw`(\d+(?:[.,]\d+)?)`;
const BY = String.raw`\s*(?:x|х|×|\*|ga|на|by|on)\s*`;
const END = String.raw`(?![a-zа-я0-9²³])`;

const DIMENSIONS = new RegExp(`${NUM}${BY}${NUM}(?:${BY}${NUM})?`, 'u');
const MONEY_SCALED = new RegExp(String.raw`${NUM}\s*(mln|million|миллион|млн|mlrd|ming|тысяч|тыс|k${END})`, 'u');
const MONEY_GROUPED = /(?<![\d.,])\d{1,3}(?:[  .]\d{3}){1,3}(?![\d.,])/u;
const MONEY_PLAIN = /(?<![\d.,])\d{5,}(?![\d.,])/u;
const AREA = new RegExp(String.raw`${NUM}\s*(?:m2|m²|м2|м²|kv\.?\s*m|кв\.?\s*м|kvadrat|квадрат|sq\.?\s*m|square)`, 'u');
const VOLUME = new RegExp(String.raw`${NUM}\s*(?:m3|m³|м3|м³|kub|куб|cubic)`, 'u');
const LENGTH = new RegExp(String.raw`${NUM}\s*(?:metr|метр|meter|m${END}|м${END})`, 'u');
const COUNT = new RegExp(String.raw`${NUM}\s*(?:ta${END}|dona|штук|шт|pcs|points|nuqta|точ)`, 'u');
const HEIGHT = new RegExp(String.raw`(?:balandlig\w*|высот\w*|height|shift)\s*${NUM}`, 'u');
const BARE_NUMBER = new RegExp(NUM, 'u');

const NUMBER_WORDS: Record<string, number> = {
  bir: 1, ikki: 2, uch: 3, "to'rt": 4, tort: 4, besh: 5, olti: 6, yetti: 7, sakkiz: 8, "to'qqiz": 9, "o'n": 10,
  один: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6, семь: 7, восемь: 8, девять: 9, десять: 10,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

const MONEY_SCALE: Record<string, number> = {
  mln: 1e6, million: 1e6, миллион: 1e6, млн: 1e6, mlrd: 1e9, ming: 1e3, тыс: 1e3, тысяч: 1e3, k: 1e3,
};

const toNumber = (raw: string) => Number(raw.replace(',', '.'));

export function normalize(text: string) {
  const lowered = text
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/gu, "'")
    .replace(/ё/gu, 'е')
    .replace(/\s+/gu, ' ')
    .trim();
  return lowered.replace(/[a-zа-я']+/gu, (word) => (word in NUMBER_WORDS ? String(NUMBER_WORDS[word]) : word));
}

const hasAny = (text: string, stems: string[]) => stems.some((stem) => text.includes(stem));

function pickKey<K extends string>(text: string, table: Record<K, string[]>): K | undefined {
  return (Object.keys(table) as K[]).find((key) => hasAny(text, table[key]));
}

function take(text: string, pattern: RegExp): [RegExpExecArray | null, string] {
  const match = pattern.exec(text);
  if (!match) return [null, text];
  return [match, `${text.slice(0, match.index)} ${text.slice(match.index + match[0].length)}`];
}

function extractMoney(text: string): [number | undefined, string] {
  const [scaled, rest] = take(text, MONEY_SCALED);
  if (scaled) return [toNumber(scaled[1]) * MONEY_SCALE[scaled[2]], rest];
  const [grouped, rest2] = take(text, MONEY_GROUPED);
  if (grouped) return [Number(grouped[0].replace(/[  .]/gu, '')), rest2];
  const [plain, rest3] = take(text, MONEY_PLAIN);
  if (plain) return [Number(plain[0]), rest3];
  return [undefined, text];
}

function findMaterial(text: string, surface?: Surface) {
  const topic = MATERIALS.find((item) => hasAny(text, item.stems));
  if (!topic) return undefined;
  const variant = (hasAny(text, CEMENT_STEMS) && topic.variants?.cement) || (surface && topic.variants?.[surface]);
  return { calc: variant ? variant.calc : topic.calc, labour: variant ? variant.labour : topic.labour, topic };
}

export function parse(input: string): Parsed {
  let text = ` ${normalize(input)} `;
  const surface = pickKey(text, SURFACE_STEMS);
  const parsed: Parsed = {
    room: pickKey(text, ROOM_STEMS),
    quality: pickKey(text, QUALITY_STEMS),
    surface,
    material: findMaterial(text, surface),
    wantsCheck: hasAny(text, CHECK_STEMS),
    wantsEstimate: hasAny(text, ESTIMATE_STEMS),
    greeting: hasAny(text, GREETING_STEMS),
  };

  [parsed.money, text] = extractMoney(text);

  const [height, afterHeight] = take(text, HEIGHT);
  if (height) {
    parsed.H = toNumber(height[1]);
    text = afterHeight;
  }

  const [dims, afterDims] = take(text, DIMENSIONS);
  if (dims) {
    parsed.L = toNumber(dims[1]);
    parsed.W = toNumber(dims[2]);
    if (dims[3]) parsed.H = toNumber(dims[3]);
    text = afterDims;
  }

  const extractors: [RegExp, 'area' | 'volume' | 'count' | 'length'][] = [
    [AREA, 'area'],
    [VOLUME, 'volume'],
    [COUNT, 'count'],
    [LENGTH, 'length'],
  ];
  for (const [pattern, key] of extractors) {
    const [match, rest] = take(text, pattern);
    if (match) {
      parsed[key] = toNumber(match[1]);
      text = rest;
    }
  }

  if (parsed.area === undefined && parsed.L === undefined && parsed.material) {
    const bare = BARE_NUMBER.exec(text);
    if (bare) parsed.area = toNumber(bare[1]);
  }

  return parsed;
}
