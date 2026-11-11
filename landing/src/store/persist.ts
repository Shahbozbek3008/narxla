import { createJSONStorage } from 'zustand/middleware';

export const persistOptions = (name: string) => ({
  name: `smetachi-${name}`,
  version: 1,
  storage: createJSONStorage(() => localStorage),
  skipHydration: true,
});
