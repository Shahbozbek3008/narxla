import { create } from 'zustand';
import type { Profile, ProfileFields } from '@/lib/api/types';

export const DISTRICTS = ['Yunusobod', 'Chilonzor', 'Mirzo Ulug‘bek', 'Yakkasaroy', 'Sergeli', 'Olmazor'];
export const REGIONS = ['Toshkent', 'Samarqand', 'Buxoro', 'Farg‘ona', 'Andijon', 'Namangan'];

const FIELD_KEYS: (keyof ProfileFields)[] = [
  'name',
  'region',
  'district',
  'reserve',
  'quality',
  'notifyPrice',
  'notifyTelegram',
  'notifyNews',
];

export const profileFields = (profile: Profile): ProfileFields =>
  Object.fromEntries(FIELD_KEYS.map((key) => [key, profile[key]])) as ProfileFields;

export const changedFields = (saved: ProfileFields, draft: ProfileFields): Partial<ProfileFields> =>
  Object.fromEntries(FIELD_KEYS.filter((key) => saved[key] !== draft[key]).map((key) => [key, draft[key]]));

type SettingsDraftState = {
  draft: ProfileFields | null;
  load: (fields: ProfileFields) => void;
  update: (patch: Partial<ProfileFields>) => void;
  clear: () => void;
};

export const useSettingsDraft = create<SettingsDraftState>()((set) => ({
  draft: null,
  load: (draft) => set({ draft }),
  update: (patch) => set((state) => (state.draft ? { draft: { ...state.draft, ...patch } } : state)),
  clear: () => set({ draft: null }),
}));

export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
