import { create } from 'zustand';
import { fetchPriceBook } from '@/lib/prices/api';
import type { PriceBook } from '@/lib/prices/price-book';

type PricesState = {
  book: PriceBook;
  state: 'idle' | 'loading' | 'live' | 'fallback';
  load: () => Promise<void>;
};

export const usePrices = create<PricesState>()((set, get) => ({
  book: {},
  state: 'idle',
  load: async () => {
    if (get().state === 'loading' || get().state === 'live') return;
    set({ state: 'loading' });
    try {
      set({ book: await fetchPriceBook(), state: 'live' });
    } catch {
      set({ state: 'fallback' });
    }
  },
}));

export const usePriceBook = () => usePrices((state) => state.book);
