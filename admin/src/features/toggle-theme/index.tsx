import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { writeStorage } from '@/shared/lib';
import { Button } from '@/shared/ui';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'narxla-admin-theme';

const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    writeStorage(STORAGE_KEY, next);
    setTheme(next);
  };

  return (
    <Button variant="ghost" size="xs" aria-label="Mavzuni almashtirish" onClick={toggle}>
      {theme === 'dark' ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
    </Button>
  );
}
