import { create } from 'zustand';
import { CHECK_TYPES, findCheckType, type CheckCategory } from '@/lib/calc-engine';
import type { LabourCode } from '@/lib/prices/labour';
import { dec, digitsOnly } from '@/lib/format';

const MAX_PRICE_DIGITS = 11;

export type VolumeHints = Partial<Record<LabourCode, number>>;

type CheckState = {
  cat: CheckCategory;
  type: LabourCode;
  volume: string;
  price: string;
  hints: VolumeHints;
  pickCategory: (cat: CheckCategory) => void;
  pickType: (type: LabourCode) => void;
  setVolume: (volume: string) => void;
  setPrice: (price: string) => void;
  applyHints: (hints: VolumeHints) => void;
};

const volumeFor = (code: LabourCode, hints: VolumeHints) => {
  const hinted = hints[code];
  return hinted ? dec(hinted) : findCheckType(code).def;
};

const FIRST = CHECK_TYPES[0];

export const useCheck = create<CheckState>()((set, get) => ({
  cat: FIRST.cat,
  type: FIRST.code,
  volume: FIRST.def,
  price: '',
  hints: {},
  pickCategory: (cat) => {
    if (cat === get().cat) return;
    const { hints } = get();
    const options = CHECK_TYPES.filter((item) => item.cat === cat);
    const first = options.find((item) => hints[item.code]) ?? options[0];
    if (first) set({ cat, type: first.code, volume: volumeFor(first.code, hints) });
  },
  pickType: (type) => {
    if (type === get().type) return;
    set({ type, volume: volumeFor(type, get().hints) });
  },
  setVolume: (volume) => set({ volume }),
  setPrice: (price) => set({ price: digitsOnly(price, MAX_PRICE_DIGITS) }),
  applyHints: (hints) => {
    const first = CHECK_TYPES.find((item) => hints[item.code]) ?? FIRST;
    set({ hints, cat: first.cat, type: first.code, volume: volumeFor(first.code, hints), price: '' });
  },
}));
