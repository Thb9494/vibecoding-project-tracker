import { useState } from 'react';
import { INPUT_BASE } from '../../constants';

const ANCHORS = [
  { id: 'presentation',  label: 'Presentation', icon: '🎤', description: 'Slide deck or pitch link' },
  { id: 'demo',          label: 'Demo',          icon: '🖥️', description: 'Live demo or video link' },
  { id: 'report',        label: 'Report',        icon: '📄', description: 'Written report link' },
  { id: 'documentation', label: 'Documentation', icon: '📚', description: 'Docs or wiki link' },
];

function AnchorCard({ anchor, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(anchor.url ?? '');
  const filled = Boolean(anchor.url);

  function commit() {
    const trimmed = draft.trim();
    onChange(anchor.id, trimmed || null);
    setEditing(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter')  commit();
    if (e.key === 'Escape') { setDraft(anchor.url ?? ''); setEditing(false); }
  }

  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all shadow-sm
      ${filled
        ? 'bg-stone-800 border-brand-primary/30'
        : 'bg-slate-50 dark:bg-stone-900 border-slate-200 dark:border-stone-700'
      }`}
    >
      {/* header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none">{anchor.icon}</span>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 dark:text-stone-100">{anchor.label}</span>
          <span className="text-xs text-slate-400 dark:text-stone-500">{anchor.description}</span>
        </div>
        {/* status dot */}
        <span
          className={`ml-auto h-2.5 w-2.5 rounded-full flex-shrink-0 transition-colors ${filled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-stone-600'}`}
          title={filled ? 'Link added ✓' : 'No link yet'}
        />
      </div>

      {/* URL area */}
      {editing ? (
        <div className="flex gap-2">
          <input
            autoFocus
            className={`flex-1 px-3 py-2 text-sm ${INPUT_BASE}`}
            placeholder="https://..."
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            onBlur={commit}
          />
          <button
            onMouseDown={commit}
            className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition"
          >
            Save
          </button>
        </div>
      ) : filled ? (
        <div className="flex items-center gap-2 min-w-0">
          <a
            href={anchor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-sm text-brand-ring hover:underline"
          >
            {anchor.url}
          </a>
          <button
            onClick={() => { setDraft(anchor.url ?? ''); setEditing(true); }}
            className="shrink-0 rounded-lg border border-slate-200 dark:border-stone-600 px-2.5 py-1 text-xs text-slate-500 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-700 transition"
          >
            Edit
          </button>
          <button
            onClick={() => { onChange(anchor.id, null); setDraft(''); }}
            className="shrink-0 rounded-lg border border-red-200 dark:border-red-900 px-2.5 py-1 text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="self-start rounded-xl border border-dashed border-stone-600 px-4 py-2 text-sm text-stone-500 hover:border-brand-ring hover:text-brand-ring transition"
        >
          + Add link
        </button>
      )}
    </div>
  );
}

export function DeliverablesView({ project, onUpdateProject }) {
  const { name: projectName, anchors = {} } = project;
  const filledCount = ANCHORS.filter(a => anchors[a.id]).length;

  function handleChange(id, url) {
    onUpdateProject({ ...project, anchors: { ...anchors, [id]: url } });
  }

  return (
    <div className="p-6 pb-32">
      {/* header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-stone-100">{projectName}</h1>
        <p className="text-sm text-slate-500 dark:text-stone-400 mt-1">
          Final Deliverables ·{' '}
          <span className={filledCount === ANCHORS.length ? 'text-emerald-600 font-semibold' : ''}>
            {filledCount} / {ANCHORS.length} linked
          </span>
        </p>
      </header>

      {/* four cards */}
      <div className="grid grid-cols-2 gap-4">
        {ANCHORS.map(def => (
          <AnchorCard
            key={def.id}
            anchor={{ ...def, url: anchors[def.id] ?? null }}
            onChange={handleChange}
          />
        ))}
      </div>
    </div>
  );
}
