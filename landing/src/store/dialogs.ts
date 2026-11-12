import { create } from 'zustand';

export type DialogKind = 'logout' | 'delete' | 'deleteEstimate';

type DialogsState = {
  dialog: DialogKind | null;
  target: string | null;
  open: (dialog: DialogKind, target?: string) => void;
  close: () => void;
};

export const useDialogs = create<DialogsState>()((set) => ({
  dialog: null,
  target: null,
  open: (dialog, target) => set({ dialog, target: target ?? null }),
  close: () => set({ dialog: null }),
}));
