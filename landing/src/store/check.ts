import { create } from 'zustand';
import { CHECK, type CheckCategory } from '@/lib/calc-engine';
import { digitsOnly } from '@/lib/format';

const MAX_PRICE_DIGITS = 11;

type CheckState = {
  cat: CheckCategory;
  type: string;
  volume: string;
  price: string;
  pickCategory: (cat: CheckCategory) => void;
  pickType: (type: string) => void;
  setVolume: (volume: string) => void;
  setPrice: (price: string) => void;
};

export const useCheck = create<CheckState>()((set, get) => ({
  cat: 'pol',
  type: 'kafel',
  volume: '52',
  price: '4900000',
  pickCategory: (cat) => {
    if (cat === get().cat) return;
    const first = CHECK.find((item) => item.cat === cat);
    if (first) set({ cat, type: first.id, volume: first.def });
  },
  pickType: (type) => {
    if (type === get().type) return;
    const next = CHECK.find((item) => item.id === type);
    if (next) set({ type, volume: next.def });
  },
  setVolume: (volume) => set({ volume }),
  setPrice: (price) => set({ price: digitsOnly(price, MAX_PRICE_DIGITS) }),
}));
