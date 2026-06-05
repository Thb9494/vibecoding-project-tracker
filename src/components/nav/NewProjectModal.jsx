import { useState } from 'react';
import { INPUT_BASE, PROJECT_COLORS } from '../../constants';
import { newId, today, initials } from '../../utils/ids';

const DEFAULT_MEMBERS = [
  { id: newId(), name: 'Theresa' },
  { id: newId(), name: 'Murtaza' },
  { id: newId(), name: 'Makram'  },
];

export function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [badge, setBadge] = useState('');

  const derivedInitials = badge || (name ? initials(name).slice(0, 2) : '?');

  function handleCreate() {
    if (!name.trim()) return;
    onCreate({
      id: newId(),
      name: name.trim(),
      color,
      initials: derivedInitials,
      createdDate: today(),
      tasks: [],
      documents: [],
      members: DEFAULT_MEMBERS.map(m => ({ ...m, id: newId() })),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-page-dark shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-stone-100">New Project</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition">✕</button>
        </div>

        {/* preview badge */}
        <div className="flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: color }}>{derivedInitials}</span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide">Project name</label>
          <input autoFocus className={`px-3 py-2 text-sm ${INPUT_BASE}`}
            placeholder="e.g. GraceBayGarage" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide">Color</label>
          <div className="flex gap-2">
            {PROJECT_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide">Initials (max 2)</label>
          <input className={`px-3 py-2 text-sm ${INPUT_BASE}`}
            placeholder={name ? initials(name).slice(0, 2) : 'GB'} maxLength={2}
            value={badge} onChange={e => setBadge(e.target.value.toUpperCase().slice(0, 2))} />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-lg border border-slate-200 dark:border-stone-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-stone-800 transition">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim()}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40 transition">Create Project</button>
        </div>
      </div>
    </div>
  );
}
