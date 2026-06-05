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
 * @property {string} context              M9 — curated briefing for the next AI / teammate
 * @property {string|null} contextTool     M9 — 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other'
 * @property {string|null} contextUpdatedAt M9 — ISO timestamp, set automatically on save
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
    context: `## Background
The hero moment of the demo. Each task already stores a Context field (M9); this button serializes title + description + context into a clean Markdown block and copies it to the clipboard.

## Constraints
- Must read naturally when pasted into Claude / ChatGPT / Cursor.
- No external clipboard library — use navigator.clipboard.

## Tried so far
Prototyped the Markdown template; output looked good in a plain text editor.

## Pick up
Wire the button to navigator.clipboard.writeText and add a "Copied!" toast.`,
    contextTool: 'Claude',
    contextUpdatedAt: '2026-06-04T09:30:00.000Z',
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

// ── theme hook ───────────────────────────────────────────────────────────────
// Toggles the `dark` class on <html>, persists choice, falls back to OS setting.

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = window.localStorage.getItem('vibetracker.theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { window.localStorage.setItem('vibetracker.theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return [theme, toggle];
}

// ── helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  feature: {
    badge:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    stripe: 'border-l-4 border-l-indigo-500',
    icon:   '⚡',
  },
  bug: {
    badge:  'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
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

// M9 — relative time for the "last updated" hint
function timeAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return null;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} h ago`;
  const days = Math.floor(hrs / 24);
  return `${days} d ago`;
}

// M9 — AI tools that can pick up a context block
const CONTEXT_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

// M9 — scaffold that pre-fills the Context field on a new task
const CONTEXT_TEMPLATE = `## Background


## Constraints


## Tried so far


## Pick up
`;

// shared input styling (light + dark)
const INPUT_BASE =
  'rounded-lg border border-slate-200 dark:border-stone-600 bg-white dark:bg-stone-800 ' +
  'text-slate-800 dark:text-stone-100 placeholder-slate-400 dark:placeholder-stone-500 ' +
  'outline-none focus:ring-2 focus:ring-brand-ring';

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: TEAM[0],
  dueDate: '',
  context: CONTEXT_TEMPLATE,
  contextTool: '',
};

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-xl bg-slate-800 dark:bg-stone-700 px-5 py-3 text-sm text-white shadow-xl">
        {message}
      </div>
    </div>
  );
}

// ── ThemeToggle ──────────────────────────────────────────────────────────────

function ThemeToggle({ theme, onToggle }) {
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
      context:     task.context ?? '',
      contextTool: task.contextTool ?? '',
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

    // M9 — stamp contextUpdatedAt only when the context actually changed
    const prevContext = task?.context ?? '';
    const contextChanged = form.context !== prevContext;
    const contextUpdatedAt = contextChanged && form.context.trim()
      ? new Date().toISOString()
      : (task?.contextUpdatedAt ?? null);

    const saved = isNew
      ? { ...form, id: newId(), createdDate: today(), dueDate: form.dueDate || null, contextTool: form.contextTool || null, contextUpdatedAt }
      : { ...task, ...form, dueDate: form.dueDate || null, contextTool: form.contextTool || null, contextUpdatedAt };
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

  const labelClass = 'text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 shadow-2xl flex flex-col max-h-[90vh]">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-stone-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-stone-100">
            {isNew ? '✦ New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 hover:text-slate-700 dark:hover:text-stone-200 transition"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              className={`px-3 py-2 text-sm ${INPUT_BASE} ${errors.title ? '!border-red-400' : ''}`}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
            {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              className={`px-3 py-2 text-sm resize-none ${INPUT_BASE}`}
              placeholder="Add more context…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Type</label>
              <select
                className={`px-3 py-2 text-sm ${INPUT_BASE}`}
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                <option value="feature">⚡ Feature</option>
                <option value="bug">🐛 Bug</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Status</label>
              <select
                className={`px-3 py-2 text-sm ${INPUT_BASE}`}
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
              <label className={labelClass}>Assignee</label>
              <select
                className={`px-3 py-2 text-sm ${INPUT_BASE}`}
                value={form.assignee}
                onChange={e => set('assignee', e.target.value)}
              >
                {TEAM.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                className={`px-3 py-2 text-sm dark:[color-scheme:dark] ${INPUT_BASE}`}
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
              />
            </div>
          </div>

          {/* Context (M9) — the vibecoding differentiator */}
          <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-stone-700 pt-4">
            <div className="flex items-center justify-between">
              <label className={labelClass}>
                ✦ Context <span className="font-normal normal-case text-slate-400 dark:text-stone-500">· Markdown, paste-ready for any AI</span>
              </label>
              {!isNew && task.contextUpdatedAt && (
                <span className="text-xs text-slate-400 dark:text-stone-500">updated {timeAgo(task.contextUpdatedAt)}</span>
              )}
            </div>
            <textarea
              rows={6}
              className={`px-3 py-2 text-sm font-mono leading-relaxed resize-y ${INPUT_BASE}`}
              placeholder={CONTEXT_TEMPLATE}
              value={form.context}
              onChange={e => set('context', e.target.value)}
            />
            <div className="mt-1 flex items-center gap-2">
              <label className="text-xs text-slate-500 dark:text-stone-400">AI tool</label>
              <select
                className={`px-2 py-1 text-xs ${INPUT_BASE}`}
                value={form.contextTool}
                onChange={e => set('contextTool', e.target.value)}
              >
                <option value="">— none —</option>
                {CONTEXT_TOOLS.map(tool => (
                  <option key={tool} value={tool}>{tool}</option>
                ))}
              </select>
            </div>
          </div>

          {!isNew && (
            <p className="text-xs text-slate-400 dark:text-stone-500">Created: {task.createdDate}</p>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-stone-700">
          {!isNew ? (
            <button
              onClick={handleDelete}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            >
              🗑 Delete
            </button>
          ) : <span />}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-stone-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition"
            >
              {isNew ? '+ Add Task' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Due-tint helper (M8) ─────────────────────────────────────────────────────

function getDueTint(task) {
  if (task.status === 'done' || !task.dueDate) {
    return { card: '', label: '', icon: '' };
  }
  const t = today();
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  if (task.dueDate < t) {
    return {
      card:  'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900',
      label: 'text-red-600 dark:text-red-400 font-semibold',
      icon:  '🚨',
    };
  }
  if (task.dueDate <= tomorrow) {
    return {
      card:  'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900',
      label: 'text-amber-600 dark:text-amber-400 font-semibold',
      icon:  '⚠️',
    };
  }
  return {
    card:  'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900',
    label: 'text-emerald-600 dark:text-emerald-400',
    icon:  '',
  };
}

// ── TaskCard ──────────────────────────────────────────────────────────────────

function TaskCard({ task, onClick, onHandoff }) {
  const typeConfig = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;
  const tint = getDueTint(task);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-3 shadow-sm flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all ${typeConfig.stripe} ${tint.card || 'bg-white dark:bg-stone-800 border-slate-200 dark:border-stone-700'}`}
    >
      {/* type badge */}
      <span className={`self-start rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${typeConfig.badge}`}>
        {typeConfig.icon} {task.type}
      </span>

      <p className="text-sm font-semibold text-slate-800 dark:text-stone-100 leading-snug">{task.title}</p>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* footer: avatar + handoff + due date */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white dark:ring-stone-800 ${AVATAR_COLORS[task.assignee] ?? 'bg-slate-400'}`}>
            {initials(task.assignee)}
          </span>
          <span className="text-xs font-medium text-slate-700 dark:text-stone-300">{task.assignee}</span>
        </div>

        {/* hand-off dropdown — stopPropagation so it doesn't open the modal */}
        <select
          value=""
          onClick={e => e.stopPropagation()}
          onChange={e => { if (e.target.value) onHandoff(task, e.target.value); }}
          className="text-xs text-slate-400 dark:text-stone-400 bg-transparent dark:[color-scheme:dark] border border-slate-200 dark:border-stone-600 rounded-lg px-1.5 py-0.5 cursor-pointer hover:border-slate-400 dark:hover:border-stone-400 focus:outline-none focus:border-brand-ring transition-colors"
        >
          <option value="" disabled>Hand off →</option>
          {TEAM.filter(name => name !== task.assignee).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        {/* due date with tint color (M8) */}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs ${tint.label || 'text-slate-400 dark:text-stone-500'}`}>
            {tint.icon && <span>{tint.icon}</span>}
            {task.dueDate}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────

function Column({ stage, tasks, onCardClick, onHandoff }) {
  return (
    <div className="flex flex-col gap-3 min-w-0 flex-1">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-stone-400">
          {stage.label}
        </h2>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-stone-700 text-xs font-semibold text-slate-600 dark:text-stone-300">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-stone-700 p-4 text-center text-xs text-slate-400 dark:text-stone-500">
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
  const [theme, toggleTheme] = useTheme();

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
    <div className="min-h-screen p-6 bg-surface-page dark:bg-stone-900 transition-colors">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-stone-100">Vibecoding Project Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400">Team · Theresa · Murtaza · Makram</p>
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
                  <span className="text-xs text-slate-600 dark:text-stone-300">{name}</span>
                  <span className="text-xs font-semibold text-slate-400 dark:text-stone-500">({count})</span>
                </div>
              );
            })}
          </div>

          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark active:scale-95 transition-all"
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
