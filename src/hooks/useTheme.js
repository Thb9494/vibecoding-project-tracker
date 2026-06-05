import { useEffect } from 'react';

// Dark mode only — always on
export function useTheme() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    try { window.localStorage.setItem('vibetracker.theme', 'dark'); } catch { /* ignore */ }
  }, []);

  return ['dark', () => {}]; // toggle is a no-op
}
