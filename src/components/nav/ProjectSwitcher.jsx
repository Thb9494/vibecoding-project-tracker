import { useState } from 'react';
import { NewProjectModal } from './NewProjectModal';
import { initials } from '../../utils/ids';

export function ProjectSwitcher({ projects, activeProjectId, onSelect, onCreate }) {
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const active = projects.find(p => p.id === activeProjectId);

  function handleSelect(id) {
    setOpen(false);
    onSelect(id);
  }

  function handleCreate(project) {
    onCreate(project);
    setOpen(false);
    onSelect(project.id);
  }

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
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-40 w-56 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-white/30 dark:border-stone-700/50 shadow-xl py-2">
              {projects.length === 0 && (
                <p className="px-4 py-2 text-xs text-slate-400 dark:text-stone-500">No projects yet</p>
              )}
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-stone-800
                    ${p.id === activeProjectId ? 'font-semibold text-slate-900 dark:text-stone-100' : 'text-slate-600 dark:text-stone-300'}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: p.color }}>
                    {p.initials || initials(p.name).slice(0, 2)}
                  </span>
                  <span className="truncate flex-1">{p.name}</span>
                  {p.id === activeProjectId && <span className="text-brand-primary">✓</span>}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-stone-700 mt-1 pt-1">
                <button
                  onClick={() => { setOpen(false); setShowModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-stone-600 text-slate-400 text-lg leading-none">+</span>
                  New project
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
