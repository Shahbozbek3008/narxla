import { create } from 'zustand';
import { CHECK_TYPES, type CheckCategory } from '@/lib/calc-engine';
import type { LabourCode } from '@/lib/prices/labour';
import { digitsOnly } from '@/lib/format';

const MAX_PRICE_DIGITS = 11;

type CheckState = {
  cat: CheckCategory;
  type: LabourCode;
  volume: string;
  price: string;
  pickCategory: (cat: CheckCategory) => void;
  pickType: (type: LabourCode) => void;
  setVolume: (volume: string) => void;
  setPrice: (price: string) => void;
};

export const useCheck = create<CheckState>()((set, get) => ({
  cat: 'pol',
  type: 'floor-tiling',
  volume: '52',
  price: '4900000',
  pickCategory: (cat) => {
    if (cat === get().cat) return;
    const first = CHECK_TYPES.find((item) => item.cat === cat);
    if (first) set({ cat, type: first.code, volume: first.def });
  },
  pickType: (type) => {
    if (type === get().type) return;
    const next = CHECK_TYPES.find((item) => item.code === type);
    if (next) set({ type, volume: next.def });
  },
  setVolume: (volume) => set({ volume }),
  setPrice: (price) => set({ price: digitsOnly(price, MAX_PRICE_DIGITS) }),
}));
