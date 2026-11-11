import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EstimateStatus } from './estimates';
import { persistOptions } from './persist';

export type ListView = 'cards' | 'table';
export type ListFilter = 'all' | EstimateStatus;
export type SortKey = 'name' | 'qty' | 'price' | 'total';
export type SortDir = 1 | -1;

type UiState = {
  view: ListView;
  filter: ListFilter;
  search: string;
  materialQuery: string;
  sortKey: SortKey;
  sortDir: SortDir;
  setView: (view: ListView) => void;
  setFilter: (filter: ListFilter) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  setMaterialQuery: (query: string) => void;
  sortBy: (key: SortKey) => void;
};

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      view: 'cards',
      filter: 'all',
      search: '',
      materialQuery: '',
      sortKey: 'total',
      sortDir: -1,
      setView: (view) => set({ view }),
      setFilter: (filter) => set({ filter }),
      setSearch: (search) => set({ search }),
      clearFilters: () => set({ filter: 'all', search: '' }),
      setMaterialQuery: (materialQuery) => set({ materialQuery }),
      sortBy: (key) =>
        set((state) => ({
          sortKey: key,
          sortDir: state.sortKey === key ? (-state.sortDir as SortDir) : key === 'name' ? 1 : -1,
        })),
    }),
    persistOptions('ui'),
  ),
);
