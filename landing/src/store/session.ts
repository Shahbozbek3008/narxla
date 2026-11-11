import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from './persist';

type SessionState = {
  signedIn: boolean;
  phone: string;
  signIn: (phone: string) => void;
  signOut: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      signedIn: false,
      phone: '',
      signIn: (phone) => set({ signedIn: true, phone }),
      signOut: () => set({ signedIn: false }),
    }),
    persistOptions('session'),
  ),
);
