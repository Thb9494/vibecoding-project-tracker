import { useState } from 'react';
import { INPUT_BASE, AVATAR_COLORS } from '../../constants';
import { newId, initials } from '../../utils/ids';
import { ThemeToggle } from '../shared/ThemeToggle';
import { GhibliPicker } from '../shared/GhibliPicker';

export function SettingsView({ project, onUpdateProject, onDeleteProject, theme, onToggleTheme, icons, setIcons }) {
  const [pickerFor, setPickerFor] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const members = project.members ?? [];

  function commitRename(id) {
    if (!editName.trim()) { setEditingId(null); return; }
    onUpdateProject({ ...project, members: members.map(m => m.id === id ? { ...m, name: editName.trim() } : m) });
    setEditingId(null);
  }

  function addMember() {
    const m = { id: newId(), name: 'New Member' };
    onUpdateProject({ ...project, members: [...members, m] });
    setEditingId(m.id);
    setEditName(m.name);
  }

  function deleteMember(id) {
    const m = members.find(x => x.id === id);
    if (!window.confirm(`Remove ${m?.name}? Tasks assigned to them will stay as-is.`)) return;
    onUpdateProject({ ...project, members: members.filter(x => x.id !== id) });
  }

  function handleDeleteProject() {
    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    onDeleteProject(project.id);
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 pb-32 flex flex-col gap-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-stone-100">Settings</h1>

      {/* Appearance */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide">Appearance</h2>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-surface-card-dark px-4 py-3">
          <span className="text-sm font-medium text-slate-700 dark:text-stone-200">Theme</span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </section>

      {/* Team Members */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide">Team Members</h2>
        <div className="rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-surface-card-dark overflow-hidden divide-y divide-slate-100 dark:divide-stone-700">
          {members.map((m, i) => {
            const icon = icons[m.name] ?? null;
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setPickerFor(m.name)} className="shrink-0 h-9 w-9 rounded-full overflow-hidden ring-2 ring-white dark:ring-stone-700 hover:ring-feature/40 transition-transform hover:scale-105">
                  {icon
                    ? <img src={icon} alt={m.name} className="h-full w-full object-cover" />
                    : <span className={`flex h-full w-full items-center justify-center text-xs font-bold text-white ${color}`}>{initials(m.name)}</span>
                  }
                </button>
                <div className="flex-1 min-w-0">
                  {editingId === m.id
                    ? <input autoFocus className={`w-full px-2 py-1 text-sm ${INPUT_BASE}`} value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={() => commitRename(m.id)}
                        onKeyDown={e => { if (e.key === 'Enter') commitRename(m.id); if (e.key === 'Escape') setEditingId(null); }} />
                    : <span className="text-sm font-medium text-slate-800 dark:text-stone-100">{m.name}</span>
                  }
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editingId !== m.id && (
                    <button onClick={() => { setEditingId(m.id); setEditName(m.name); }}
                      className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-700 transition">
                      rename
                    </button>
                  )}
                  <button onClick={() => deleteMember(m.id)}
                    className="rounded-lg px-2 py-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
          <button onClick={addMember}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-700/50 transition">
            <span className="text-lg leading-none">+</span> Add member
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wide">Danger Zone</h2>
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-surface-card-dark px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-stone-100">Delete project</p>
            <p className="text-xs text-slate-500 dark:text-stone-400">Permanently removes all tasks and documents.</p>
          </div>
          <button onClick={handleDeleteProject}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition">
            Delete
          </button>
        </div>
      </section>

      {pickerFor && (
        <GhibliPicker
          name={pickerFor}
          current={icons[pickerFor] ?? null}
          onSelect={img => setIcons(prev => ({ ...prev, [pickerFor]: img }))}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}
