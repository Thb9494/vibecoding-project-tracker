import { useState } from 'react';
import { TYPE_CONFIG } from '../../constants';
import { TaskModal } from '../board/TaskModal';

// ── date helpers ──────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function todayIso() { return new Date().toISOString().slice(0, 10); }
function addDays(iso, n) { return new Date(Date.parse(iso + 'T12:00:00') + n * DAY_MS).toISOString().slice(0, 10); }

// Monday of the week containing iso
function weekStart(iso) {
  const d = new Date(iso + 'T12:00:00');
  const dow = d.getDay(); // 0=Sun
  return addDays(iso, dow === 0 ? -6 : 1 - dow);
}

// Effective span of a task: createdDate → dueDate (or just createdDate if no dueDate)
function taskRange(task) {
  const s = task.createdDate;
  const e = task.dueDate ?? s;
  return [s, e < s ? s : e];
}

function isActiveOnDay(task, day) {
  const [s, e] = taskRange(task);
  return day >= s && day <= e;
}

// ── task color ────────────────────────────────────────────────────────────────

const TASK_COLORS = {
  feature: 'bg-feature/15 dark:bg-feature/25 text-feature dark:text-feature-soft border-l-[3px] border-feature',
  bug:     'bg-bug/15 dark:bg-bug/25 text-bug dark:text-bug-soft border-l-[3px] border-bug',
};

// ── sub-components ────────────────────────────────────────────────────────────

function TaskChip({ task, onClick }) {
  const tc = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;
  return (
    <button onClick={onClick} title={task.title}
      className={`w-full text-left px-1.5 py-0.5 text-[11px] font-medium truncate rounded-md transition-opacity hover:opacity-75 ${TASK_COLORS[task.type] ?? TASK_COLORS.feature}`}>
      {tc.icon} {task.title}
    </button>
  );
}

function EventBar({ task, colStart, colEnd, startsHere, endsHere, onClick }) {
  const tc = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;
  const round = startsHere && endsHere ? 'rounded-md'
              : startsHere             ? 'rounded-l-md'
              : endsHere               ? 'rounded-r-md'
              : '';
  return (
    <button onClick={onClick} title={task.title}
      style={{ gridColumn: `${colStart} / ${colEnd + 1}` }}
      className={`text-left px-2 py-0.5 text-xs font-medium truncate transition-opacity hover:opacity-75 ${TASK_COLORS[task.type] ?? TASK_COLORS.feature} ${round}`}>
      {startsHere && <>{tc.icon} {task.title}</>}
    </button>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function CalendarView({ project, onUpdateProject }) {
  const [view,   setView]   = useState('month');
  const [anchor, setAnchor] = useState(todayIso());
  const [editing, setEditing] = useState(null);
  const { tasks = [], members = [], name: projectName } = project;
  const today = todayIso();

  // ── navigation ──────────────────────────────────────────────────────────────
  function navigate(dir) {
    if (view === 'day') {
      setAnchor(a => addDays(a, dir));
    } else if (view === 'week') {
      setAnchor(a => addDays(a, dir * 7));
    } else {
      setAnchor(a => {
        const [y, m] = a.split('-').map(Number);
        const nm = m + dir;
        const ny = nm < 1 ? y - 1 : nm > 12 ? y + 1 : y;
        const fm = ((nm - 1 + 12) % 12) + 1;
        return `${ny}-${String(fm).padStart(2, '0')}-01`;
      });
    }
  }

  // ── visible days + header label ─────────────────────────────────────────────
  let visibleDays, headerLabel;

  if (view === 'day') {
    visibleDays = [anchor];
    const d = new Date(anchor + 'T12:00:00');
    headerLabel = d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  } else if (view === 'week') {
    const ws = weekStart(anchor);
    visibleDays = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    const s = new Date(visibleDays[0] + 'T12:00:00');
    const e = new Date(visibleDays[6] + 'T12:00:00');
    headerLabel = s.getMonth() === e.getMonth()
      ? `${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`
      : `${MONTH_NAMES[s.getMonth()]} – ${MONTH_NAMES[e.getMonth()]} ${e.getFullYear()}`;

  } else {
    const [y, m] = anchor.split('-').map(Number);
    const fm = `${y}-${String(m).padStart(2, '0')}-01`;
    const ws = weekStart(fm);
    visibleDays = Array.from({ length: 42 }, (_, i) => addDays(ws, i));
    headerLabel = `${MONTH_NAMES[m - 1]} ${y}`;
  }

  const windowStart = visibleDays[0];
  const windowEnd   = visibleDays[visibleDays.length - 1];

  // tasks that touch the visible window
  const windowTasks = tasks.filter(t => {
    const [s, e] = taskRange(t);
    return e >= windowStart && s <= windowEnd;
  });

  // ── task crud ────────────────────────────────────────────────────────────────
  function handleSave(saved) {
    const exists = tasks.find(t => t.id === saved.id);
    onUpdateProject({ ...project, tasks: exists ? tasks.map(t => t.id === saved.id ? saved : t) : [...tasks, saved] });
  }
  function handleDelete(id) {
    onUpdateProject({ ...project, tasks: tasks.filter(t => t.id !== id) });
    setEditing(null);
  }

  // ── week event bars ──────────────────────────────────────────────────────────
  function weekBars(weekDays) {
    return windowTasks.flatMap(task => {
      const [ts, te] = taskRange(task);
      const wStart = weekDays[0], wEnd = weekDays[6];
      if (te < wStart || ts > wEnd) return [];
      const cs = weekDays.indexOf(ts < wStart ? wStart : ts) + 1;
      const ce = weekDays.indexOf(te > wEnd   ? wEnd   : te) + 1;
      if (cs === 0 || ce === 0) return [];
      return [{ task, colStart: cs, colEnd: ce, startsHere: ts >= wStart, endsHere: te <= wEnd }];
    });
  }

  // ── toolbar ──────────────────────────────────────────────────────────────────
  const toolbar = (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <button onClick={() => setAnchor(todayIso())}
          className="rounded-lg border border-slate-200 dark:border-stone-600 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-stone-800 transition">
          Today
        </button>
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="rounded-l-lg border border-slate-200 dark:border-stone-600 px-2.5 py-1.5 text-sm text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-800 transition leading-none">‹</button>
          <button onClick={() => navigate(1)}  className="rounded-r-lg border border-l-0 border-slate-200 dark:border-stone-600 px-2.5 py-1.5 text-sm text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-800 transition leading-none">›</button>
        </div>
        <span className="text-lg font-bold text-slate-900 dark:text-stone-100 min-w-[220px]">{headerLabel}</span>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-stone-600 p-1 bg-white dark:bg-stone-800">
        {['day', 'week', 'month'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition
              ${view === v ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-100'}`}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  // ── day view ─────────────────────────────────────────────────────────────────
  if (view === 'day') {
    const dayTasks = windowTasks.filter(t => isActiveOnDay(t, anchor));
    return (
      <div className="px-6 py-10 pb-32">
        {toolbar}
        <div className="rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden">
          <div className={`px-4 py-2 border-b border-slate-100 dark:border-stone-700 text-sm font-semibold ${anchor === today ? 'text-brand-primary dark:text-brand-ring' : 'text-slate-700 dark:text-stone-200'}`}>
            {new Date(anchor + 'T12:00:00').toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="p-4 flex flex-col gap-2 min-h-[200px]">
            {dayTasks.length === 0
              ? <p className="text-xs text-slate-400 dark:text-stone-500 py-6 text-center">No tasks on this day.</p>
              : dayTasks.map(task => (
                  <button key={task.id} onClick={() => setEditing(task)}
                    className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-75 ${TASK_COLORS[task.type] ?? TASK_COLORS.feature}`}>
                    {(TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature).icon} {task.title}
                    {task.dueDate && <span className="ml-2 text-xs opacity-60">due {task.dueDate}</span>}
                  </button>
                ))
            }
          </div>
        </div>
        {editing && <TaskModal task={editing} members={members} projectName={projectName}
          onClose={() => setEditing(null)} onSave={s => { handleSave(s); setEditing(null); }} onDelete={handleDelete} />}
      </div>
    );
  }

  // ── week view ─────────────────────────────────────────────────────────────────
  if (view === 'week') {
    const bars = weekBars(visibleDays);
    return (
      <div className="px-6 py-10 pb-32">
        {toolbar}
        <div className="rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden">
          {/* day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-stone-700">
            {visibleDays.map(d => {
              const isToday = d === today;
              const dt = new Date(d + 'T12:00:00');
              const dowIdx = dt.getDay() === 0 ? 6 : dt.getDay() - 1;
              return (
                <div key={d} className={`border-l border-slate-100 dark:border-stone-700 first:border-l-0 px-2 py-2.5 text-center ${isToday ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''}`}>
                  <p className="text-[11px] text-slate-400 dark:text-stone-500 uppercase">{DAY_LABELS[dowIdx]}</p>
                  <p className={`text-xl font-bold leading-snug ${isToday ? 'text-brand-primary dark:text-brand-ring' : 'text-slate-800 dark:text-stone-100'}`}>{dt.getDate()}</p>
                </div>
              );
            })}
          </div>
          {/* event bars */}
          <div className="p-2 min-h-[80px]"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '3px' }}>
            {bars.length === 0
              ? <div className="col-span-7 text-center text-xs text-slate-400 dark:text-stone-500 py-6">No tasks this week.</div>
              : bars.map(({ task, colStart, colEnd, startsHere, endsHere }) => (
                  <EventBar key={task.id + '-' + colStart}
                    task={task} colStart={colStart} colEnd={colEnd}
                    startsHere={startsHere} endsHere={endsHere}
                    onClick={() => setEditing(task)} />
                ))
            }
          </div>
        </div>
        {editing && <TaskModal task={editing} members={members} projectName={projectName}
          onClose={() => setEditing(null)} onSave={s => { handleSave(s); setEditing(null); }} onDelete={handleDelete} />}
      </div>
    );
  }

  // ── month view ────────────────────────────────────────────────────────────────
  const [y, m] = anchor.split('-').map(Number);
  const currentMonthPrefix = `${y}-${String(m).padStart(2, '0')}`;
  const weeks = Array.from({ length: 6 }, (_, i) => visibleDays.slice(i * 7, i * 7 + 7));

  return (
    <div className="px-6 py-10 pb-32">
      {toolbar}
      <div className="rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden">
        {/* weekday header */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-stone-700">
          {DAY_LABELS.map(d => (
            <div key={d} className="border-l border-slate-100 dark:border-stone-700 first:border-l-0 px-2 py-2 text-center text-[11px] font-semibold text-slate-400 dark:text-stone-500 uppercase">
              {d}
            </div>
          ))}
        </div>
        {/* 6 weeks */}
        {weeks.map((weekDays, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-slate-100 dark:border-stone-700 last:border-b-0">
            {weekDays.map(day => {
              const isToday     = day === today;
              const inMonth     = day.startsWith(currentMonthPrefix);
              const dayTasks    = windowTasks.filter(t => isActiveOnDay(t, day));
              const maxShow     = 3;
              const overflow    = dayTasks.length - maxShow;
              return (
                <div key={day}
                  className={`border-l border-slate-100 dark:border-stone-700 first:border-l-0 min-h-[96px] p-1.5 flex flex-col gap-0.5
                    ${isToday ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : !inMonth ? 'bg-slate-50/60 dark:bg-stone-800/60' : ''}`}>
                  {/* date number */}
                  <span className={`self-start flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold mb-0.5
                    ${isToday ? 'bg-brand-primary text-white' : inMonth ? 'text-slate-700 dark:text-stone-200' : 'text-slate-300 dark:text-stone-600'}`}>
                    {parseInt(day.slice(-2))}
                  </span>
                  {dayTasks.slice(0, maxShow).map(task => (
                    <TaskChip key={task.id} task={task} onClick={() => setEditing(task)} />
                  ))}
                  {overflow > 0 && (
                    <span className="text-[10px] text-slate-400 dark:text-stone-500 pl-1">+{overflow} more</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {editing && (
        <TaskModal task={editing} members={members} projectName={projectName}
          onClose={() => setEditing(null)}
          onSave={saved => { handleSave(saved); setEditing(null); }}
          onDelete={handleDelete} />
      )}
    </div>
  );
}
