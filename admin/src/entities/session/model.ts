import { create } from 'zustand';
import { request } from '@/shared/api';
import { readStorage, writeStorage } from '@/shared/lib';

const STORAGE_KEY = 'narxla-admin-key';

type SessionState = {
  key: string | null;
  signIn: (key: string) => Promise<void>;
  signOut: () => void;
};

export const useSession = create<SessionState>()((set) => ({
  key: readStorage(STORAGE_KEY),
  signIn: async (key) => {
    await request('GET', '/admin/materials', undefined, key);
    writeStorage(STORAGE_KEY, key);
    set({ key });
  },
  signOut: () => {
    writeStorage(STORAGE_KEY, null);
    set({ key: null });
  },
}));
