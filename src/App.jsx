import { useState, useEffect } from 'react';

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

const TYPE_STYLES = {
  feature: 'bg-blue-100 text-blue-700',
  bug:     'bg-red-100  text-red-700',
};

const AVATAR_COLORS = {
  Theresa: 'bg-violet-500',
  Murtaza: 'bg-emerald-500',
  Makram:  'bg-amber-500',
};

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// ── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({ task }) {
  const isOverdue = task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10) && task.status !== 'done';

  return (
    <div className={`rounded-xl border bg-white p-3 shadow-sm flex flex-col gap-2 ${isOverdue ? 'border-red-300' : 'border-slate-200'}`}>
      {/* type badge + title */}
      <div className="flex items-start justify-between gap-2">
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${TYPE_STYLES[task.type]}`}>
          {task.type}
        </span>
      </div>

      <p className="text-sm font-semibold text-slate-800 leading-snug">{task.title}</p>

      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* footer: assignee + due date */}
      <div className="mt-1 flex items-center justify-between">
        {/* assignee avatar */}
        <div className="flex items-center gap-1.5">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${AVATAR_COLORS[task.assignee] ?? 'bg-slate-400'}`}>
            {initials(task.assignee)}
          </span>
          <span className="text-xs text-slate-600">{task.assignee}</span>
        </div>

        {/* due date */}
        {task.dueDate && (
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            {isOverdue ? '⚠ ' : ''}{task.dueDate}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────

function Column({ stage, tasks }) {
  return (
    <div className="flex flex-col gap-3 min-w-0 flex-1">
      {/* column header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
          {stage.label}
        </h2>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
          {tasks.length}
        </span>
      </div>

      {/* cards */}
      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
            No tasks
          </div>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [tasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vibecoding Project Tracker
          </h1>
          <p className="text-sm text-slate-500">Team · Theresa · Murtaza · Makram</p>
        </div>

        {/* task count summary */}
        <div className="flex gap-4 text-sm text-slate-500">
          <span>{tasks.length} tasks total</span>
          <span className="text-blue-600 font-medium">{tasks.filter(t => t.type === 'feature').length} features</span>
          <span className="text-red-500 font-medium">{tasks.filter(t => t.type === 'bug').length} bugs</span>
        </div>
      </header>

      {/* Kanban board */}
      <main className="grid grid-cols-4 gap-4">
        {STAGES.map(stage => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter(t => t.status === stage.id)}
          />
        ))}
      </main>
    </div>
  );
}
