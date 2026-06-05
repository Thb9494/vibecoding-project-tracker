import { useState, useEffect, useCallback } from 'react';

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 */

export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

export const TEAM = ['Theresa', 'Murtaza', 'Makram'];

const SEED_TASKS = [
  {
    id: '1',
    title: 'Set up Kanban board layout',
    description: 'Render four columns with task cards using Tailwind.',
    type: 'feature',
    status: 'done',
    assignee: 'Murtaza',
    dueDate: '2026-06-05',
    createdDate: '2026-06-01',
  },
  {
    id: '2',
    title: 'Design color system & typography',
    description: 'Define palette, font sizes and component styles in DESIGN.md and tailwind.config.',
    type: 'feature',
    status: 'in-progress',
    assignee: 'Theresa',
    dueDate: '2026-06-06',
    createdDate: '2026-06-01',
  },
  {
    id: '3',
    title: 'Fix due-date tint not applying',
    description: 'Cards past their due date should turn red — currently no tint is applied.',
    type: 'bug',
    status: 'todo',
    assignee: 'Makram',
    dueDate: '2026-06-07',
    createdDate: '2026-06-02',
  },
  {
    id: '4',
    title: 'Add "Copy as Prompt Context" button',
    description: 'Serialize the task + context field to Markdown and copy to clipboard.',
    type: 'feature',
    status: 'review',
    assignee: 'Murtaza',
    dueDate: '2026-06-10',
    createdDate: '2026-06-03',
  },
];

// ── localStorage hook ────────────────────────────────────────────────────────

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota or private-mode — ignore */ }
  }, [key, value]);

  return [value, setValue];
}

// ── helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  feature: {
    badge:  'bg-indigo-100 text-indigo-700',
    stripe: 'border-l-4 border-l-indigo-500',
    icon:   '⚡',
  },
  bug: {
    badge:  'bg-orange-100 text-orange-700',
    stripe: 'border-l-4 border-l-orange-500',
    icon:   '🐛',
  },
};

const AVATAR_COLORS = {
  Theresa: 'bg-violet-500',
  Murtaza: 'bg-emerald-500',
  Makram:  'bg-amber-500',
};

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: TEAM[0],
  dueDate: '',
};

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-xl bg-slate-800 px-5 py-3 text-sm text-white shadow-xl">
        {message}
      </div>
    </div>
  );
}

// ── TaskModal ────────────────────────────────────────────────────────────────

function TaskModal({ task, onClose, onSave, onDelete }) {
  const isNew = !task;
  const [form, setForm] = useState(
    isNew ? EMPTY_FORM : {
      title:       task.title,
      description: task.description,
      type:        task.type,
      status:      task.status,
      assignee:    task.assignee,
      dueDate:     task.dueDate ?? '',
    }
  );
  const [errors, setErrors] = useState({});

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const saved = isNew
      ? { ...form, id: newId(), createdDate: today(), dueDate: form.dueDate || null }
      : { ...task, ...form, dueDate: form.dueDate || null };
    onSave(saved);
    onClose();
  }

  function handleDelete() {
    if (window.confirm('Delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {isNew ? '✦ New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
            {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea
              rows={3}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Add more context…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</label>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                <option value="feature">⚡ Feature</option>
                <option value="bug">🐛 Bug</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignee</label>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                value={form.assignee}
                onChange={e => set('assignee', e.target.value)}
              >
                {TEAM.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</label>
              <input
                type="date"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
              />
            </div>
          </div>

          {!isNew && (
            <p className="text-xs text-slate-400">Created: {task.createdDate}</p>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          {!isNew ? (
            <button
              onClick={handleDelete}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
            >
              🗑 Delete
            </button>
          ) : <span />}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              {isNew ? '+ Add Task' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onClick, onHandoff }) {
  const isOverdue = task.dueDate && task.dueDate < today() && task.status !== 'done';
  const typeConfig = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border bg-white p-3 shadow-sm flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all ${typeConfig.stripe} ${isOverdue ? 'border-red-300' : 'border-slate-200'}`}
    >
      {/* type badge */}
      <span className={`self-start rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${typeConfig.badge}`}>
        {typeConfig.icon} {task.type}
      </span>

      <p className="text-sm font-semibold text-slate-800 leading-snug">{task.title}</p>

      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* footer: avatar + handoff + due date */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white ${AVATAR_COLORS[task.assignee] ?? 'bg-slate-400'}`}>
            {initials(task.assignee)}
          </span>
          <span className="text-xs font-medium text-slate-700">{task.assignee}</span>
        </div>

        {/* hand-off dropdown — stopPropagation so it doesn't open the modal */}
        <select
          value=""
          onClick={e => e.stopPropagation()}
          onChange={e => { if (e.target.value) onHandoff(task, e.target.value); }}
          className="text-xs text-slate-400 bg-transparent border border-slate-200 rounded-lg px-1.5 py-0.5 cursor-pointer hover:border-slate-400 focus:outline-none focus:border-indigo-400 transition-colors"
        >
          <option value="" disabled>Hand off →</option>
          {TEAM.filter(name => name !== task.assignee).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {task.dueDate && (
        <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
          {isOverdue ? '⚠ ' : ''}{task.dueDate}
        </span>
      )}
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────

function Column({ stage, tasks, onCardClick, onHandoff }) {
  return (
    <div className="flex flex-col gap-3 min-w-0 flex-1">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
          {stage.label}
        </h2>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
            Nothing here yet — keep going.
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onCardClick(task)}
              onHandoff={onHandoff}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  function openNew()      { setEditing('new'); }
  function openEdit(task) { setEditing(task); }
  function closeModal()   { setEditing(null); }

  function handleSave(saved) {
    setTasks(prev => {
      const exists = prev.find(t => t.id === saved.id);
      return exists ? prev.map(t => t.id === saved.id ? saved : t) : [...prev, saved];
    });
  }

  function handleDelete(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const handleHandoff = useCallback((task, newAssignee) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, assignee: newAssignee } : t));
    setToast(`Handed off to ${newAssignee}. They've got it.`);
  }, [setTasks]);

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vibecoding Project Tracker</h1>
          <p className="text-sm text-slate-500">Team · Theresa · Murtaza · Makram</p>
        </div>

        <div className="flex items-center gap-6">
          {/* team overview strip */}
          <div className="flex items-center gap-3">
            {TEAM.map(name => {
              const count = tasks.filter(t => t.assignee === name && t.status !== 'done').length;
              return (
                <div key={name} className="flex items-center gap-1.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${AVATAR_COLORS[name]}`}>
                    {initials(name)}
                  </span>
                  <span className="text-xs text-slate-600">{name}</span>
                  <span className="text-xs font-semibold text-slate-400">({count})</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-95 transition-all"
          >
            <span className="text-lg leading-none">+</span> New Task
          </button>
        </div>
      </header>

      <main className="grid grid-cols-4 gap-4">
        {STAGES.map(stage => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter(t => t.status === stage.id)}
            onCardClick={openEdit}
            onHandoff={handleHandoff}
          />
        ))}
      </main>

      {editing !== null && (
        <TaskModal
          task={editing === 'new' ? null : editing}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
