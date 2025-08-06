import { atom } from 'nanostores';

export type Theme = 'dark' | 'light';

export const kTheme = 'bolt_theme';

export function themeIsDark() {
  return themeStore.get() === 'dark';
}

export const DEFAULT_THEME = 'light';

export const themeStore = atom<Theme>(initStore());

function initStore() {
  if (typeof window !== 'undefined') {
    const persistedTheme = localStorage.getItem(kTheme) as Theme | undefined;
    const themeAttribute = document.querySelector('html')?.getAttribute('data-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return persistedTheme ?? (themeAttribute as Theme) ?? (systemPrefersDark ? 'dark' : 'light');
  }

  return DEFAULT_THEME;
}

export function toggleTheme() {
  const currentTheme = themeStore.get();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  themeStore.set(newTheme);

  if (typeof window !== 'undefined') {
    localStorage.setItem(kTheme, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }
}

export function setTheme(theme: Theme) {
  themeStore.set(theme);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(kTheme, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}
