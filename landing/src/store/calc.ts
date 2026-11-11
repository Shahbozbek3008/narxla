import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalcCategory } from '@/lib/calc-engine';
import { persistOptions } from './persist';

export type CalcFilter = CalcCategory | 'all';

type CalcState = {
  cat: CalcFilter;
  query: string;
  values: Record<string, Record<string, string>>;
  setCat: (cat: CalcFilter) => void;
  setQuery: (query: string) => void;
  setValue: (calcId: string, key: string, value: string) => void;
};

export const useCalc = create<CalcState>()(
  persist(
    (set) => ({
      cat: 'all',
      query: '',
      values: {},
      setCat: (cat) => set({ cat }),
      setQuery: (query) => set({ query }),
      setValue: (calcId, key, value) =>
        set((state) => ({ values: { ...state.values, [calcId]: { ...state.values[calcId], [key]: value } } })),
    }),
    persistOptions('calc'),
  ),
);
