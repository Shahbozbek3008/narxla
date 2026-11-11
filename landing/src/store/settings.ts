import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quality } from '@/lib/calc-engine';
import { persistOptions } from './persist';

export const DISTRICTS = ['Yunusobod', 'Chilonzor', 'Mirzo Ulug‘bek', 'Yakkasaroy', 'Sergeli', 'Olmazor'];
export const REGIONS = ['Toshkent', 'Samarqand', 'Buxoro', 'Farg‘ona', 'Andijon', 'Namangan'];
export const RESERVES = [5, 10, 15] as const;

export type Reserve = (typeof RESERVES)[number];

export type Profile = {
  name: string;
  district: string;
  region: string;
  reserve: Reserve;
  quality: Quality;
  notifyPrice: boolean;
  notifyTelegram: boolean;
  notifyNews: boolean;
};

const DEFAULT_PROFILE: Profile = {
  name: 'Dilshod Rahimov',
  district: 'Yunusobod',
  region: 'Toshkent',
  reserve: 10,
  quality: 'mid',
  notifyPrice: true,
  notifyTelegram: true,
  notifyNews: false,
};

type SettingsState = {
  saved: Profile;
  draft: Profile;
  update: (patch: Partial<Profile>) => void;
  commit: () => void;
  discard: () => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      saved: DEFAULT_PROFILE,
      draft: DEFAULT_PROFILE,
      update: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
      commit: () => set((state) => ({ saved: state.draft })),
      discard: () => set((state) => ({ draft: state.saved })),
    }),
    { ...persistOptions('settings'), partialize: (state: SettingsState) => ({ saved: state.saved, draft: state.saved }) },
  ),
);

export const isProfileDirty = (saved: Profile, draft: Profile) =>
  (Object.keys(saved) as (keyof Profile)[]).some((key) => saved[key] !== draft[key]);

export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
