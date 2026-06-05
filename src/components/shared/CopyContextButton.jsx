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
          ? 'border-emerald-500 bg-emerald-500 text-white dark:bg-emerald-600 dark:border-emerald-500'
          : 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
        }`}
      title="Copy as prompt context"
    >
      <span className={`transition-transform duration-200 ${copied ? 'scale-110' : ''}`}>
        {copied
          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        }
      </span>
      <span>{copied ? 'Copied!' : 'Copy Context'}</span>
    </button>
  );
}
