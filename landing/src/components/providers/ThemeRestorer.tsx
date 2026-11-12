'use client';

import { useLayoutEffect } from 'react';
import { restoreTheme } from '@/lib/theme';

export function ThemeRestorer() {
  useLayoutEffect(restoreTheme, []);
  return null;
}
