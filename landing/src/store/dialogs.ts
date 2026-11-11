import { create } from 'zustand';

export type DialogKind = 'logout' | 'delete';

type DialogsState = {
  dialog: DialogKind | null;
  open: (dialog: DialogKind) => void;
  close: () => void;
};

export const useDialogs = create<DialogsState>()((set) => ({
  dialog: null,
  open: (dialog) => set({ dialog }),
  close: () => set({ dialog: null }),
}));
