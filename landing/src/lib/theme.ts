export type Theme = 'dark' | 'light';
export type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'smetachi-theme';
const LIGHT_QUERY = '(prefers-color-scheme: light)';

export const themeInitScript = `(function(){try{var p=localStorage.getItem('${STORAGE_KEY}');if(p!=='light'&&p!=='dark'&&p!=='system')p='dark';var t=p==='system'?(matchMedia('${LIGHT_QUERY}').matches?'light':'dark'):p;var d=document.documentElement;d.dataset.theme=t;d.dataset.themePreference=p}catch(e){}})();`;

const root = () => document.documentElement;

const resolve = (preference: ThemePreference): Theme =>
  preference === 'system' ? (window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark') : preference;

const isPreference = (value: unknown): value is ThemePreference => value === 'light' || value === 'dark' || value === 'system';

export function storedThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isPreference(value) ? value : 'dark';
  } catch {
    return 'dark';
  }
}

export function restoreTheme() {
  const preference = storedThemePreference();
  root().dataset.themePreference = preference;
  root().dataset.theme = resolve(preference);
}

export function readTheme(): Theme {
  return root().dataset.theme === 'light' ? 'light' : 'dark';
}

export function readThemePreference(): ThemePreference {
  const value = root().dataset.themePreference;
  return value === 'light' || value === 'system' ? value : readTheme();
}

export function applyThemePreference(preference: ThemePreference) {
  root().dataset.themePreference = preference;
  root().dataset.theme = resolve(preference);
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    return;
  }
}

export function toggleTheme() {
  applyThemePreference(readTheme() === 'dark' ? 'light' : 'dark');
}

export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ['data-theme', 'data-theme-preference'] });

  const media = window.matchMedia(LIGHT_QUERY);
  const handleSystemChange = () => {
    if (readThemePreference() === 'system') applyThemePreference('system');
  };
  media.addEventListener('change', handleSystemChange);

  return () => {
    observer.disconnect();
    media.removeEventListener('change', handleSystemChange);
  };
}
