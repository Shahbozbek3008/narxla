import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  LIMITS,
  ROOMS,
  WET_ROOMS,
  type EstimateInput,
  type Quality,
  type RoomId,
  type WorkId,
  type Works,
} from '@/lib/calc-engine';
import { dec, num } from '@/lib/format';
import { persistOptions } from './persist';

export type DraftStep = 0 | 1 | 2 | 3;
export const LAST_STEP: DraftStep = 3;

export type Draft = {
  step: DraftStep;
  room: RoomId;
  L: string;
  W: string;
  H: string;
  doors: number;
  windows: number;
  works: Works;
  quality: Quality;
  editingId: string | null;
};

type DraftActions = {
  setStep: (step: DraftStep) => void;
  pickRoom: (room: RoomId) => void;
  setDimension: (key: 'L' | 'W' | 'H', value: string) => void;
  setDoors: (value: number) => void;
  setWindows: (value: number) => void;
  toggleWork: (work: WorkId) => void;
  setQuality: (quality: Quality) => void;
  load: (input: EstimateInput, step: DraftStep, editingId?: string | null) => void;
  reset: () => void;
};

export const DEFAULT_DRAFT: Draft = {
  step: 0,
  room: 'yotoq',
  L: '4,2',
  W: '3,5',
  H: '2,7',
  doors: 1,
  windows: 1,
  works: { pol: true, devor: true, shift: true, elektr: true, santex: false },
  quality: 'mid',
  editingId: null,
};

const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

export const draftToInput = (draft: Draft): EstimateInput => ({
  room: draft.room,
  L: num(draft.L),
  W: num(draft.W),
  H: num(draft.H),
  doors: draft.doors,
  windows: draft.windows,
  works: draft.works,
  quality: draft.quality,
});

export const DEMO_INPUT = draftToInput(DEFAULT_DRAFT);

export const useDraft = create<Draft & DraftActions>()(
  persist(
    (set) => ({
      ...DEFAULT_DRAFT,
      setStep: (step) => set({ step }),
      pickRoom: (room) => {
        const preset = ROOMS.find((item) => item.id === room) ?? ROOMS[0];
        set((state) => ({
          room,
          L: preset.L,
          W: preset.W,
          works: { ...state.works, santex: WET_ROOMS.includes(room) },
        }));
      },
      setDimension: (key, value) => set({ [key]: value }),
      setDoors: (value) => set({ doors: clamp(value, LIMITS.doors) }),
      setWindows: (value) => set({ windows: clamp(value, LIMITS.windows) }),
      toggleWork: (work) => set((state) => ({ works: { ...state.works, [work]: !state.works[work] } })),
      setQuality: (quality) => set({ quality }),
      reset: () => set(DEFAULT_DRAFT),
      load: (input, step, editingId = null) =>
        set({
          step,
          editingId,
          room: input.room,
          L: dec(input.L),
          W: dec(input.W),
          H: dec(input.H),
          doors: input.doors,
          windows: input.windows,
          works: input.works,
          quality: input.quality,
        }),
    }),
    persistOptions('draft'),
  ),
);
