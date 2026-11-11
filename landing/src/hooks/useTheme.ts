import { useSyncExternalStore } from 'react';
import { applyTheme, readTheme, subscribeTheme, type Theme } from '@/lib/theme';

const getServerTheme = (): Theme => 'dark';

export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, getServerTheme);
  return [theme, applyTheme] as const;
}
