import { useState } from 'react';
import { TYPE_CONFIG, AVATAR_COLORS } from '../../constants';
import { initials } from '../../utils/ids';
import { DueTag } from '../shared/DueTag';
import { TaskModal } from '../board/TaskModal';

// ── date helpers ──────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_SHORT   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function todayIso() { return new Date().toISOString().slice(0, 10); }
function addDays(iso, n) { return new Date(Date.parse(iso + 'T12:00:00') + n * DAY_MS).toISOString().slice(0, 10); }

function weekStart(iso) {
  const dow = new Date(iso + 'T12:00:00').getDay();
  return addDays(iso, dow === 0 ? -6 : 1 - dow);
}

function lastOfMonth(iso) {
  const [y, m] = iso.split('-').map(Number);
  return new Date(y, m, 0).toISOString().slice(0, 10);
}

// effective span of a task: createdDate → dueDate (or just createdDate if no dueDate)
function taskRange(task) {
  const s = task.createdDate;
  const e = task.dueDate ?? s;
  return [s, e < s ? s : e];
}

function isActiveOnDay(task, day) {
  const [s, e] = taskRange(task);
  return day >= s && day <= e;
}

// ── task bar colors ───────────────────────────────────────────────────────────

const TASK_BAR = {
  feature: 'bg-feature/20 dark:bg-feature/30 text-feature dark:text-feature-soft border-l-[3px] border-feature',
  bug:     'bg-bug/20 dark:bg-bug/30 text-bug dark:text-bug-soft border-l-[3px] border-bug',
};

// ── GanttRow: one task in the grid ────────────────────────────────────────────

function GanttRow({ task, rowIdx, barStart, barEnd, todayCol, memberIndex, onClick }) {
  const tc = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;
  const barClass = TASK_BAR[task.type] ?? TASK_BAR.feature;
  const avatarColor = AVATAR_COLORS[memberIndex >= 0 ? memberIndex % AVATAR_COLORS.length : 0] ?? 'bg-slate-400';
  const showTitle = barEnd > barStart; // show title when bar spans ≥2 cols

  return (
    <>
      {/* label — sticky left */}
      <div
        style={{ gridRow: rowIdx, gridColumn: 1 }}
        className="sticky left-0 z-20 bg-white dark:bg-stone-800 border-b border-r border-slate-100 dark:border-stone-700 flex items-center gap-2 px-3 overflow-hidden"
      >
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarColor}`}>
          {initials(task.assignee)}
        </span>
        <span className="text-xs text-slate-700 dark:text-stone-200 truncate flex-1 min-w-0">
          {tc.icon} {task.title}
        </span>
        <DueTag task={task} />
      </div>

      {/* today column highlight (rendered behind the bar) */}
      {todayCol !== null && (
        <div
          style={{ gridRow: rowIdx, gridColumn: todayCol }}
          className="bg-brand-primary/5 dark:bg-brand-primary/10 border-b border-slate-100 dark:border-stone-700 pointer-events-none"
        />
      )}

      {/* task bar */}
      <button
        onClick={onClick}
        title={`${task.title} · ${task.createdDate} → ${task.dueDate ?? 'no due date'}`}
        style={{ gridRow: rowIdx, gridColumn: `${barStart} / ${barEnd + 1}` }}
        className={`relative z-10 mx-1 my-2.5 flex items-center rounded-md px-2 text-[11px] font-semibold truncate transition-opacity hover:opacity-70 ${barClass}`}
      >
        {showTitle
          ? <><span className="mr-1 shrink-0">{tc.icon}</span><span className="truncate">{task.title}</span></>
          : <span>{tc.icon}</span>
        }
      </button>
    </>
  );
}

// ── GanttGrid: shared layout for week + month timeline views ──────────────────

function GanttGrid({ columns, windowTasks, getBarPositions, todayCol, members, onTaskClick }) {
  const colCount = columns.length;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `200px repeat(${colCount}, minmax(72px, 1fr))`,
          gridTemplateRows: `44px${windowTasks.length > 0 ? ` repeat(${windowTasks.length}, 48px)` : ' 72px'}`,
          minWidth: 200 + colCount * 72,
        }}
      >
        {/* header: task label cell */}
        <div
          style={{ gridRow: 1, gridColumn: 1 }}
          className="sticky left-0 z-30 flex items-center px-4 border-b border-r border-slate-200 dark:border-stone-700 bg-slate-50/90 dark:bg-stone-900"
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-stone-500">
            Task
          </span>
        </div>

        {/* header: time column labels */}
        {columns.map((col, i) => (
          <div
            key={col.key}
            style={{ gridRow: 1, gridColumn: i + 2 }}
            className={`flex flex-col items-center justify-center border-b border-l border-slate-100 dark:border-stone-700
              ${col.isToday ? 'bg-brand-primary/10 dark:bg-brand-primary/15' : 'bg-slate-50/90 dark:bg-stone-900'}`}
          >
            <span className={`text-[11px] font-semibold uppercase ${col.isToday ? 'text-brand-primary dark:text-brand-ring' : 'text-slate-400 dark:text-stone-500'}`}>
              {col.label}
            </span>
            {col.sublabel && (
              <span className={`text-sm font-bold leading-tight ${col.isToday ? 'text-brand-primary dark:text-brand-ring' : 'text-slate-700 dark:text-stone-200'}`}>
                {col.sublabel}
              </span>
            )}
          </div>
        ))}

        {/* empty state */}
        {windowTasks.length === 0 && (
          <div
            style={{ gridRow: 2, gridColumn: `1 / ${colCount + 2}` }}
            className="flex items-center justify-center text-xs text-slate-400 dark:text-stone-500"
          >
            No tasks in this period.
          </div>
        )}

        {/* task rows */}
        {windowTasks.map((task, i) => {
          const pos = getBarPositions(task);
          if (!pos) return null;
          const memberIdx = members.findIndex(m => m.name === task.assignee);
          return (
            <GanttRow
              key={task.id}
              task={task}
              rowIdx={i + 2}
              barStart={pos.colStart}
              barEnd={pos.colEnd}
              todayCol={todayCol}
              memberIndex={memberIdx}
              onClick={() => onTaskClick(task)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── CalendarView ──────────────────────────────────────────────────────────────

export function CalendarView({ project, onUpdateProject }) {
  const [view,    setView]    = useState('week');
  const [anchor,  setAnchor]  = useState(todayIso());
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

  // ── header label ────────────────────────────────────────────────────────────
  let headerLabel;
  if (view === 'day') {
    headerLabel = new Date(anchor + 'T12:00:00').toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } else if (view === 'week') {
    const ws = weekStart(anchor);
    const ds = new Date(ws + 'T12:00:00');
    const de = new Date(addDays(ws, 6) + 'T12:00:00');
    headerLabel = ds.getMonth() === de.getMonth()
      ? `${MONTH_NAMES[ds.getMonth()]} ${ds.getFullYear()}`
      : `${MONTH_NAMES[ds.getMonth()].slice(0, 3)} – ${MONTH_NAMES[de.getMonth()].slice(0, 3)} ${de.getFullYear()}`;
  } else {
    const [y, m] = anchor.split('-').map(Number);
    headerLabel = `${MONTH_NAMES[m - 1]} ${y}`;
  }

  // ── task crud ────────────────────────────────────────────────────────────────
  function handleSave(saved) {
    const exists = tasks.find(t => t.id === saved.id);
    onUpdateProject({ ...project, tasks: exists ? tasks.map(t => t.id === saved.id ? saved : t) : [...tasks, saved] });
  }
  function handleDelete(id) {
    onUpdateProject({ ...project, tasks: tasks.filter(t => t.id !== id) });
    setEditing(null);
  }

  // ── toolbar ──────────────────────────────────────────────────────────────────
  const toolbar = (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setAnchor(todayIso())}
          className="rounded-lg border border-slate-200 dark:border-stone-600 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-stone-800 transition"
        >
          Today
        </button>
        <div className="flex">
          <button onClick={() => navigate(-1)} className="rounded-l-lg border border-slate-200 dark:border-stone-600 px-2.5 py-1.5 text-sm leading-none text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-800 transition">‹</button>
          <button onClick={() => navigate(1)}  className="rounded-r-lg border border-l-0 border-slate-200 dark:border-stone-600 px-2.5 py-1.5 text-sm leading-none text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-800 transition">›</button>
        </div>
        <span className="text-lg font-bold text-slate-900 dark:text-stone-100 min-w-[200px]">{headerLabel}</span>
      </div>
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-stone-600 p-1 bg-white dark:bg-stone-800">
        {['week', 'month', 'day'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition
              ${view === v ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-100'}`}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  const modal = editing && (
    <TaskModal
      task={editing}
      members={members}
      projectName={projectName}
      onClose={() => setEditing(null)}
      onSave={s => { handleSave(s); setEditing(null); }}
      onDelete={handleDelete}
    />
  );

  // ── day view (unchanged list) ─────────────────────────────────────────────────
  if (view === 'day') {
    const dayTasks = tasks.filter(t => isActiveOnDay(t, anchor));
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
                    className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-75 ${TASK_BAR[task.type] ?? TASK_BAR.feature}`}>
                    {(TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature).icon} {task.title}
                    {task.dueDate && <span className="ml-2 text-xs opacity-60">due {task.dueDate}</span>}
                  </button>
                ))
            }
          </div>
        </div>
        {modal}
      </div>
    );
  }

  // ── week timeline (X-axis = days) ─────────────────────────────────────────────
  if (view === 'week') {
    const ws = weekStart(anchor);
    const visibleDays = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    const [wStart, wEnd] = [visibleDays[0], visibleDays[6]];

    const windowTasks = tasks.filter(t => {
      const [s, e] = taskRange(t);
      return e >= wStart && s <= wEnd;
    });

    const columns = visibleDays.map(d => {
      const dt  = new Date(d + 'T12:00:00');
      const dow = dt.getDay() === 0 ? 6 : dt.getDay() - 1;
      return { key: d, label: DAY_SHORT[dow], sublabel: String(dt.getDate()), isToday: d === today };
    });

    const todayIdx = visibleDays.indexOf(today);
    const todayCol = todayIdx >= 0 ? todayIdx + 2 : null;

    const getBarPositions = (task) => {
      const [ts, te] = taskRange(task);
      if (te < wStart || ts > wEnd) return null;
      const cs = ts < wStart ? wStart : ts;
      const ce = te > wEnd   ? wEnd   : te;
      const c1 = visibleDays.indexOf(cs);
      const c2 = visibleDays.indexOf(ce);
      if (c1 < 0 || c2 < 0) return null;
      return { colStart: c1 + 2, colEnd: c2 + 2 };
    };

    return (
      <div className="px-6 py-10 pb-32">
        {toolbar}
        <GanttGrid
          columns={columns}
          windowTasks={windowTasks}
          getBarPositions={getBarPositions}
          todayCol={todayCol}
          members={members}
          onTaskClick={setEditing}
        />
        {modal}
      </div>
    );
  }

  // ── month timeline (X-axis = weeks) ───────────────────────────────────────────
  const [y, m] = anchor.split('-').map(Number);
  const firstDay = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay  = lastOfMonth(anchor);

  // collect weeks that overlap the month
  const weeks = [];
  let wk = weekStart(firstDay);
  while (wk <= lastDay) {
    weeks.push(wk);
    wk = addDays(wk, 7);
  }

  const mWindowStart = weeks[0];
  const mWindowEnd   = addDays(weeks[weeks.length - 1], 6);

  const windowTasks = tasks.filter(t => {
    const [s, e] = taskRange(t);
    return e >= mWindowStart && s <= mWindowEnd;
  });

  const columns = weeks.map(wMon => {
    const dt = new Date(wMon + 'T12:00:00');
    const we = addDays(wMon, 6);
    return {
      key: wMon,
      label: `${MONTH_NAMES[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`,
      sublabel: null,
      isToday: today >= wMon && today <= we,
    };
  });

  const todayWeekIdx = weeks.findIndex(wMon => today >= wMon && today <= addDays(wMon, 6));
  const todayCol = todayWeekIdx >= 0 ? todayWeekIdx + 2 : null;

  const getBarPositions = (task) => {
    const [ts, te] = taskRange(task);
    if (te < mWindowStart || ts > mWindowEnd) return null;
    const cs = ts < mWindowStart ? mWindowStart : ts;
    const ce = te > mWindowEnd   ? mWindowEnd   : te;
    const c1 = weeks.findIndex(wMon => wMon <= cs && addDays(wMon, 6) >= cs);
    const c2 = weeks.findIndex(wMon => wMon <= ce && addDays(wMon, 6) >= ce);
    if (c1 < 0 || c2 < 0) return null;
    return { colStart: c1 + 2, colEnd: c2 + 2 };
  };

  return (
    <div className="px-6 py-10 pb-32">
      {toolbar}
      <GanttGrid
        columns={columns}
        windowTasks={windowTasks}
        getBarPositions={getBarPositions}
        todayCol={todayCol}
        members={members}
        onTaskClick={setEditing}
      />
      {modal}
    </div>
  );
}
