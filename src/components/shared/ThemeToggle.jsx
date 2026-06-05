export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-xl border border-slate-200 dark:border-stone-600 p-2 text-base leading-none text-slate-600 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
