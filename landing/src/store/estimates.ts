import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EstimateInput } from '@/lib/calc-engine';
import { persistOptions } from './persist';

export type EstimateStatus = 'ready' | 'draft' | 'sent';

export type Project = {
  id: string;
  name: string;
  input: EstimateInput;
  createdAt: string;
  status: EstimateStatus;
};

const ALL = { pol: true, devor: true, shift: true, elektr: true, santex: false };

const SEED: Project[] = [
  {
    id: 'p-0142',
    name: 'Chilonzor, 3 xonali',
    input: { room: 'mehmon', L: 8.5, W: 8, H: 2.7, doors: 3, windows: 4, works: { ...ALL, santex: true }, quality: 'mid' },
    createdAt: '2026-11-06',
    status: 'ready',
  },
  {
    id: 'p-0139',
    name: 'Hammomni yangilash',
    input: { room: 'hammom', L: 2.2, W: 2, H: 2.7, doors: 1, windows: 0, works: { ...ALL, elektr: false, santex: true }, quality: 'pre' },
    createdAt: '2026-11-02',
    status: 'draft',
  },
  {
    id: 'p-0131',
    name: 'Oshxona',
    input: { room: 'oshxona', L: 3.2, W: 3.25, H: 2.7, doors: 1, windows: 1, works: { ...ALL, santex: true }, quality: 'mid' },
    createdAt: '2026-10-28',
    status: 'sent',
  },
  {
    id: 'p-0124',
    name: 'Bolalar xonasi',
    input: { room: 'bolalar', L: 3.6, W: 3.2, H: 2.7, doors: 1, windows: 1, works: ALL, quality: 'eco' },
    createdAt: '2026-10-19',
    status: 'ready',
  },
];

type EstimatesState = {
  projects: Project[];
  add: (project: Omit<Project, 'id' | 'createdAt' | 'status'>) => string;
};

const today = () => new Date().toISOString().slice(0, 10);

export const useEstimates = create<EstimatesState>()(
  persist(
    (set) => ({
      projects: SEED,
      add: (project) => {
        const id = `p-${Date.now().toString(36)}`;
        set((state) => ({ projects: [{ ...project, id, createdAt: today(), status: 'ready' }, ...state.projects] }));
        return id;
      },
    }),
    persistOptions('estimates'),
  ),
);

export const findProject = (projects: Project[], id: string) => projects.find((project) => project.id === id);
