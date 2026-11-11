import { useSyncExternalStore } from 'react';
import {
  applyThemePreference,
  readTheme,
  readThemePreference,
  subscribeTheme,
  type Theme,
  type ThemePreference,
} from '@/lib/theme';

const getServerTheme = (): Theme => 'dark';

export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, getServerTheme);
  return [theme, applyThemePreference] as const;
}

export function useThemePreference() {
  const preference = useSyncExternalStore<ThemePreference>(subscribeTheme, readThemePreference, getServerTheme);
  return [preference, applyThemePreference] as const;
}
