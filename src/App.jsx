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
    badge:  'bg-feature/10 text-feature dark:bg-feature/20 dark:text-feature-soft',
    stripe: 'border-l-4 border-l-feature',
    icon:   '⚡',
  },
  bug: {
    badge:  'bg-bug/10 text-bug dark:bg-bug/20 dark:text-bug-soft',
    stripe: 'border-l-4 border-l-bug',
    icon:   '🐛',
  },
};

const AVATAR_COLORS = {
  Theresa: 'bg-team-theresa',
  Murtaza: 'bg-team-murtaza',
  Makram:  'bg-team-makram',
};

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const GHIBLI_ICONS = [
  { img: '/avatars/chihiro.png',      name: 'Chihiro' },
  { img: '/avatars/no-face.png',      name: 'No-Face' },
  { img: '/avatars/yubaba.png',       name: 'Yubaba' },
  { img: '/avatars/frosch-diener.png',name: 'Frosch-Diener' },
  { img: '/avatars/totoro.png',       name: 'Totoro' },
  { img: '/avatars/chibi-totoro.png', name: 'Chibi-Totoro' },
  { img: '/avatars/catbus.png',       name: 'Catbus' },
  { img: '/avatars/calcifer.png',     name: 'Calcifer' },
  { img: '/avatars/sophie.png',       name: 'Sophie' },
  { img: '/avatars/howls-castle.png', name: "Howls Schloss" },
];

// ── GhibliPicker ─────────────────────────────────────────────────────────────

function GhibliPicker({ name, current, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-6" onClick={onClose}>
      <div
        className="w-72 rounded-2xl bg-white shadow-2xl border border-slate-100 p-4 flex flex-col gap-3"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {name}'s Ghibli character
        </p>
        <div className="grid grid-cols-5 gap-2">
          {GHIBLI_ICONS.map(({ img, name: charName }) => (
            <button
              key={img}
              onClick={() => { onSelect(img); onClose(); }}
              className={`flex flex-col items-center gap-1 rounded-xl p-1.5 transition-all hover:bg-indigo-50
                ${current === img ? 'bg-indigo-100 ring-2 ring-indigo-400' : ''}`}
              title={charName}
            >
              <img
                src={img}
                alt={charName}
                className="h-12 w-12 rounded-full object-cover object-top"
              />
              <span className="text-[9px] text-slate-400 leading-tight text-center">{charName}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => { onSelect(null); onClose(); }}
          className="text-xs text-slate-400 hover:text-slate-600 transition text-center"
        >
          ↩ Zurück zu Initialen
        </button>
      </div>
    </div>
  );
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
  'rounded-lg border border-slate-200 dark:border-stone-600 bg-white dark:bg-surface-card-dark ' +
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
      <div className="w-full max-w-lg rounded-2xl bg-surface-card dark:bg-surface-card-dark shadow-2xl flex flex-col max-h-[90vh]">

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
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              >
                🗑 Delete
              </button>
              <CopyContextButton task={task} />
            </div>
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

// ── Copy-Context helper (M10) ────────────────────────────────────────────────

function buildPromptContext(task) {
  const tool = task.contextTool ? ` · via ${task.contextTool}` : '';
  const contextBlock = task.context
    ? `\n\n## Context${tool}\n${task.context}`
    : '\n\n## Context\n_(not yet filled in — add via the task modal)_';

  return `# Task: ${task.title}
**Type:** ${task.type} · **Status:** ${task.status} · **Assignee:** ${task.assignee}${task.dueDate ? ` · **Due:** ${task.dueDate}` : ''}

## Description
${task.description || '_(no description)_'}${contextBlock}

---
_Copied from GraceBayGarage Vibecoding Project Tracker_`;
}

const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function CopyContextButton({ task, onCopied, stopClick = false }) {
  const [copied, setCopied] = useState(false);

  function handleClick(e) {
    if (stopClick) e.stopPropagation();
    navigator.clipboard.writeText(buildPromptContext(task)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopied) onCopied();
    });
  }

  return (
    <button
      onClick={handleClick}
      title="Copy as prompt context"
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium border transition-all duration-200
        ${copied
          ? 'border-emerald-400 bg-emerald-500 text-white dark:bg-emerald-600 dark:border-emerald-500'
          : 'border-brand-primary bg-brand-primary text-white hover:bg-brand-dark dark:bg-brand-primary/90 dark:hover:bg-brand-dark'
        }`}
    >
      <span className={`transition-transform duration-200 ${copied ? 'scale-110' : ''}`}>
        {copied ? <IconCheck /> : <IconCopy />}
      </span>
      <span>{copied ? 'Copied!' : 'Copy Context'}</span>
    </button>
  );
}

// ── Due-date progress tag (M8, redesigned) ───────────────────────────────────
// Cards share one background. Deadline urgency lives in a small pill whose
// coloured fill grows as the deadline nears, with the time remaining written
// inside it. Colour steps safe (green) → warning (gold) → overdue (red).

const DUE_STYLES = {
  overdue: { track: 'bg-due-overdue/10', fill: 'bg-due-overdue/35', text: 'text-due-overdue dark:text-due-overdue-soft', border: 'border-due-overdue/30' },
  warning: { track: 'bg-due-warning/10', fill: 'bg-due-warning/35', text: 'text-due-warning dark:text-due-warning-soft', border: 'border-due-warning/30' },
  safe:    { track: 'bg-due-safe/10',    fill: 'bg-due-safe/30',    text: 'text-due-safe dark:text-due-safe-soft',       border: 'border-due-safe/30' },
  neutral: { track: 'bg-due-neutral/10', fill: 'bg-due-neutral/25', text: 'text-due-neutral dark:text-due-neutral-soft', border: 'border-due-neutral/30' },
};

const DAY_MS = 86_400_000;

function getDue(task) {
  if (!task.dueDate) return null;

  const nowMs     = Date.now();
  const dueMs     = Date.parse(`${task.dueDate}T23:59:59`);
  const createdMs = task.createdDate ? Date.parse(`${task.createdDate}T00:00:00`) : nowMs - 3 * DAY_MS;
  const total     = dueMs - createdMs;
  // fill % = how far through the created→due window we are (caps at 100)
  const pct       = total > 0 ? Math.min(100, Math.max(0, ((nowMs - createdMs) / total) * 100)) : 100;

  if (task.status === 'done') {
    return { ...DUE_STYLES.neutral, pct: 100, label: 'Done' };
  }

  const t = today();
  if (task.dueDate < t) {
    const daysLate = Math.floor((nowMs - dueMs) / DAY_MS);
    return { ...DUE_STYLES.overdue, pct: 100, label: daysLate >= 1 ? `${daysLate}d late` : 'Overdue' };
  }

  const tomorrow = new Date(nowMs + DAY_MS).toISOString().slice(0, 10);
  if (task.dueDate <= tomorrow) {
    return { ...DUE_STYLES.warning, pct, label: task.dueDate === t ? 'Due today' : '1d left' };
  }

  const daysLeft = Math.round((Date.parse(`${task.dueDate}T12:00:00`) - Date.parse(`${t}T12:00:00`)) / DAY_MS);
  return { ...DUE_STYLES.safe, pct, label: `${daysLeft}d left` };
}

function DueTag({ task }) {
  const due = getDue(task);
  if (!due) return null;
  return (
    <span
      className={`relative inline-flex h-5 w-[86px] shrink-0 items-center justify-center overflow-hidden rounded-full border ${due.border} ${due.track}`}
      title={`Due ${task.dueDate}`}
    >
      {/* coloured progress fill */}
      <span className={`absolute inset-y-0 left-0 ${due.fill}`} style={{ width: `${due.pct}%` }} />
      {/* remaining-time label, sitting on top of the bar */}
      <span className={`relative z-10 px-1 text-[11px] font-semibold leading-none ${due.text}`}>
        {due.label}
      </span>
    </span>
  );
}

// ── TaskCard ──────────────────────────────────────────────────────────────────

function TaskCard({ task, onClick, onHandoff, getIcon, onDragStart, onDragEnd, isDragging }) {
  const typeConfig = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(task); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`cursor-grab active:cursor-grabbing rounded-xl border p-3 shadow-sm flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all select-none
        ${typeConfig.stripe}
        ${'bg-surface-card dark:bg-surface-card-dark border-slate-200 dark:border-white/10'}
        ${isDragging ? 'opacity-40 scale-95 rotate-1' : ''}`}
    >
      {/* top row: type badge + due-date progress tag */}
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${typeConfig.badge}`}>
          {typeConfig.icon} {task.type}
        </span>
        <DueTag task={task} />
      </div>

      <p className="text-sm font-semibold text-slate-800 dark:text-stone-100 leading-snug">{task.title}</p>

      {task.description && (
        <p className="text-xs text-slate-600 dark:text-stone-400 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* footer: avatar + handoff */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          {(() => {
            const icon = getIcon(task.assignee);
            return icon
              ? <img src={icon} alt={task.assignee} className="h-7 w-7 rounded-full object-cover object-top ring-2 ring-white dark:ring-stone-800 shrink-0" />
              : <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white dark:ring-stone-800 ${AVATAR_COLORS[task.assignee] ?? 'bg-slate-400'}`}>{initials(task.assignee)}</span>;
          })()}
          <span className="text-xs font-semibold text-slate-800 dark:text-stone-200">{task.assignee}</span>
        </div>

        {/* hand-off dropdown — stopPropagation so it doesn't open the modal */}
        <select
          value=""
          onClick={e => e.stopPropagation()}
          onChange={e => { if (e.target.value) onHandoff(task, e.target.value); }}
          className="text-xs text-slate-600 dark:text-stone-400 bg-transparent dark:[color-scheme:dark] border border-slate-300 dark:border-stone-600 rounded-lg px-1.5 py-0.5 cursor-pointer hover:border-brand-primary dark:hover:border-stone-400 focus:outline-none focus:border-brand-ring transition-colors"
        >
          <option value="" disabled>Hand off →</option>
          {TEAM.filter(name => name !== task.assignee).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* copy context button (M10) */}
      <div onClick={e => e.stopPropagation()}>
        <CopyContextButton task={task} stopClick />
      </div>
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────

function Column({ stage, tasks, onCardClick, onHandoff, getIcon, onDragStart, onDragEnd, onDrop, draggingId }) {
  const [isOver, setIsOver] = useState(false);

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsOver(false);
    onDrop(stage.id);
  }

  return (
    <div
      className="flex flex-col gap-3 min-w-0 flex-1"
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-stone-400">
          {stage.label}
        </h2>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-stone-700 text-xs font-semibold text-slate-800 dark:text-stone-200">
          {tasks.length}
        </span>
      </div>

      <div className={`flex flex-col gap-2 rounded-2xl p-1.5 min-h-24 transition-all duration-150
        ${isOver && draggingId
          ? 'bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-300 dark:ring-indigo-700 ring-offset-2'
          : 'bg-transparent'}`}
      >
        {tasks.length === 0 && !isOver ? (
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
              getIcon={getIcon}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingId === task.id}
            />
          ))
        )}
        {/* drop target hint when hovering over empty column */}
        {isOver && draggingId && tasks.every(t => t.id === draggingId) && (
          <div className="rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 p-4 text-center text-xs text-indigo-400">
            Hier ablegen
          </div>
        )}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);
  const [icons, setIcons] = useLocalStorage('vibetracker.icons', {});
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [theme, toggleTheme] = useTheme();
  const [pickerFor, setPickerFor] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  function getIcon(name) { return icons[name] ?? null; }

  function handleDragStart(task) { setDraggingId(task.id); }
  function handleDragEnd()       { setDraggingId(null); }
  function handleDrop(newStatus) {
    if (!draggingId) return;
    setTasks(prev => prev.map(t => t.id === draggingId ? { ...t, status: newStatus } : t));
    setDraggingId(null);
  }

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
    <div className="min-h-screen p-6 bg-surface-page dark:bg-surface-page-dark transition-colors">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-stone-100">Vibecoding Project Tracker</h1>
          <p className="text-sm text-slate-600 dark:text-stone-400">Team · Theresa · Murtaza · Makram</p>
        </div>

        <div className="flex items-center gap-6">
          {/* team overview strip */}
          <div className="flex items-center gap-3">
            {TEAM.map(name => {
              const count = tasks.filter(t => t.assignee === name && t.status !== 'done').length;
              const icon = getIcon(name);
              return (
                <div key={name} className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPickerFor(pickerFor === name ? null : name)}
                    className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-stone-700 hover:ring-indigo-300 transition-transform hover:scale-110 overflow-hidden flex items-center justify-center"
                    title={`${name}'s Charakter ändern`}
                  >
                    {icon
                      ? <img src={icon} alt={name} className="h-full w-full object-cover object-top" />
                      : <span className={`flex h-full w-full items-center justify-center text-xs font-bold text-white ${AVATAR_COLORS[name]}`}>{initials(name)}</span>
                    }
                  </button>
                  <span className="text-xs font-medium text-slate-800 dark:text-stone-200">{name}</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-stone-500">({count})</span>
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
            getIcon={getIcon}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            draggingId={draggingId}
          />
        ))}
      </main>

      {pickerFor && (
        <GhibliPicker
          name={pickerFor}
          current={getIcon(pickerFor)}
          onSelect={emoji => setIcons(prev => ({ ...prev, [pickerFor]: emoji }))}
          onClose={() => setPickerFor(null)}
        />
      )}

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
