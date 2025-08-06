import { RemixBrowser } from '@remix-run/react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { setTheme } from '~/lib/stores/theme';

// Initialize theme on client side
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('bolt_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  setTheme(theme);
};

// Initialize theme before hydration
initializeTheme();

startTransition(() => {
  hydrateRoot(document.getElementById('root')!, <RemixBrowser />);
});
