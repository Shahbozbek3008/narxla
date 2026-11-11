import { useSyncExternalStore } from 'react';
import { readTheme, subscribeTheme, type Theme } from '@/lib/theme';

export type ScenePalette = {
  wall: string;
  cap: string;
  slab: string;
  skirting: string;
  frame: string;
  glass: string;
  door: string;
  handle: string;
  arc: string;
  dimension: string;
  wood: { hue: number; saturation: number; lightness: number; seam: string };
  sky: string;
  ground: string;
  shadowOpacity: number;
};

const PALETTES: Record<Theme, ScenePalette> = {
  light: {
    wall: '#F3F1EC',
    cap: '#353A43',
    slab: '#3A3F48',
    skirting: '#FFFFFF',
    frame: '#FBFBFA',
    glass: '#9CC9EC',
    door: '#EAE4D8',
    handle: '#7D828C',
    arc: '#9AA0AA',
    dimension: '#7D828C',
    wood: { hue: 34, saturation: 46, lightness: 68, seam: 'rgba(92,62,30,.35)' },
    sky: '#FFFFFF',
    ground: '#C9C2B6',
    shadowOpacity: 0.22,
  },
  dark: {
    wall: '#4A505B',
    cap: '#C9CDD4',
    slab: '#1A1E26',
    skirting: '#5A606C',
    frame: '#6A707C',
    glass: '#5E9FD6',
    door: '#5C626E',
    handle: '#A3A8B3',
    arc: '#737985',
    dimension: '#8A909B',
    wood: { hue: 28, saturation: 30, lightness: 34, seam: 'rgba(0,0,0,.45)' },
    sky: '#E9EAEC',
    ground: '#3A3328',
    shadowOpacity: 0.4,
  },
};

const getSnapshot = () => PALETTES[readTheme()];

export function useScenePalette() {
  return useSyncExternalStore(subscribeTheme, getSnapshot, () => PALETTES.dark);
}
