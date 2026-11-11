export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'smetachi-theme';

export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    return;
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  persistTheme(theme);
}

export function toggleTheme() {
  applyTheme(readTheme() === 'dark' ? 'light' : 'dark');
}

export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
