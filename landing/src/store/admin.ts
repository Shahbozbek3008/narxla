import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AdminState = {
  key: string;
  signIn: (key: string) => void;
  signOut: () => void;
};

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      key: '',
      signIn: (key) => set({ key }),
      signOut: () => set({ key: '' }),
    }),
    {
      name: 'smetachi-admin',
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);
