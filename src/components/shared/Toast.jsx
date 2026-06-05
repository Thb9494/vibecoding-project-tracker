import { useEffect } from 'react';

export function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="rounded-xl bg-slate-800 dark:bg-stone-700 px-5 py-3 text-sm text-white shadow-xl">
        {message}
      </div>
    </div>
  );
}
