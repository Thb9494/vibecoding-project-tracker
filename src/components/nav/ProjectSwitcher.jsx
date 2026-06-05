import { useState } from 'react';
import { NewProjectModal } from './NewProjectModal';
import { initials } from '../../utils/ids';
import { INPUT_BASE, PROJECT_COLORS } from '../../constants';

// ── inline edit popover ───────────────────────────────────────────────────────

function EditProjectPopover({ project, onSave, onClose }) {
  const [name, setName]   = useState(project.name);
  const [color, setColor] = useState(project.color);
  const [badge, setBadge] = useState(project.initials ?? '');

  function handleSave() {
    if (!name.trim()) return;
    onSave({ ...project, name: name.trim(), color, initials: badge || initials(name).slice(0, 2) });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-80 rounded-2xl bg-zinc-900 border border-stone-600 shadow-2xl flex flex-col max-h-[90vh]">
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
          <h3 className="text-sm font-bold text-stone-100">Projekt bearbeiten</h3>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-200 transition">✕</button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-4">
          {/* preview */}
          <div className="flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow"
              style={{ backgroundColor: color }}>
              {badge || initials(name).slice(0, 2) || '?'}
            </span>
          </div>

          {/* name + save button — always in view */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Name</label>
            <input autoFocus className={`px-3 py-2 text-sm ${INPUT_BASE}`} value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()} />
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 rounded-lg border border-stone-600 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800 transition">Abbrechen</button>
              <button onClick={handleSave} disabled={!name.trim()}
                className="flex-1 rounded-lg bg-blue-700 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-40 transition">Speichern</button>
            </div>
          </div>

          {/* color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Farbe</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform hover:scale-110 shrink-0 ${color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* badge */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Kürzel <span className="font-normal normal-case text-stone-500">· max. 2</span></label>
            <input className={`px-3 py-2 text-sm ${INPUT_BASE}`} maxLength={2}
              placeholder={initials(name).slice(0, 2)}
              value={badge} onChange={e => setBadge(e.target.value.toUpperCase().slice(0, 2))} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ProjectSwitcher ───────────────────────────────────────────────────────────

export function ProjectSwitcher({ projects, activeProjectId, onSelect, onCreate, onUpdate }) {
  const [open, setOpen]         = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [editing, setEditing]   = useState(null); // project being edited

  const active = projects.find(p => p.id === activeProjectId);

  function handleSelect(id) { setOpen(false); onSelect(id); }

  function handleCreate(project) { onCreate(project); setOpen(false); onSelect(project.id); }

  return (
    <>
      <div className="relative">
        {/* badge button */}
        <button
          onClick={() => setOpen(o => !o)}
          title={active ? active.name : 'Select project'}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white shadow transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: active?.color ?? '#64748b' }}
        >
          {active ? (active.initials || initials(active.name).slice(0, 2)) : '+'}
        </button>

        {/* popover */}
        {open && (
          <>
            {/* backdrop — closes on click outside */}
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

            <div className="absolute bottom-full mb-3 left-0 z-40 w-64 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-stone-700 shadow-xl py-2">
              {projects.length === 0 && (
                <p className="px-4 py-2 text-xs text-stone-500">Noch keine Projekte</p>
              )}

              {projects.map(p => (
                <div key={p.id} className="flex items-center group">
                  <button
                    onClick={() => handleSelect(p.id)}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-stone-800 text-left
                      ${p.id === activeProjectId ? 'font-semibold text-stone-100' : 'text-stone-300'}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: p.color }}>
                      {p.initials || initials(p.name).slice(0, 2)}
                    </span>
                    <span className="truncate">{p.name}</span>
                    {p.id === activeProjectId && <span className="ml-auto text-blue-400 shrink-0">✓</span>}
                  </button>

                  {/* edit button — appears on hover */}
                  <button
                    onClick={e => { e.stopPropagation(); setOpen(false); setEditing(p); }}
                    className="opacity-0 group-hover:opacity-100 pr-3 text-stone-500 hover:text-stone-200 transition text-xs"
                    title="Bearbeiten"
                  >
                    ✏️
                  </button>
                </div>
              ))}

              <div className="border-t border-stone-700 mt-1 pt-1">
                <button
                  onClick={() => { setOpen(false); setShowNew(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-400 hover:bg-stone-800 transition-colors"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-dashed border-stone-600 text-stone-400 text-lg leading-none">+</span>
                  New project
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showNew && (
        <NewProjectModal onClose={() => setShowNew(false)} onCreate={handleCreate} />
      )}

      {editing && (
        <EditProjectPopover
          project={editing}
          onSave={p => onUpdate?.(p)}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
