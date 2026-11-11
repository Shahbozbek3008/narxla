import { create } from 'zustand';

type CalculationState = {
  pending: boolean;
  start: () => void;
  finish: () => void;
};

export const useCalculation = create<CalculationState>()((set) => ({
  pending: false,
  start: () => set({ pending: true }),
  finish: () => set({ pending: false }),
}));
