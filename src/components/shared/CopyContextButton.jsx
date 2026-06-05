import { useState } from 'react';
import { buildPromptContext } from '../../utils/buildPromptContext';

export function CopyContextButton({ task, projectName, stopClick = false }) {
  const [copied, setCopied] = useState(false);

  function handleClick(e) {
    if (stopClick) e.stopPropagation();
    navigator.clipboard.writeText(buildPromptContext(task, projectName)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-all
        ${copied
          ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
          : 'border-slate-200 dark:border-stone-600 bg-white dark:bg-transparent text-slate-500 dark:text-stone-400 hover:border-feature/50 hover:text-feature'
        }`}
      title="Copy as prompt context"
    >
      {copied ? '✓ Copied!' : '⎘ Copy Context'}
    </button>
  );
}
