import { useState } from 'react';
import { STAGES, TYPE_CONFIG } from '../../constants';
import { getDue } from '../shared/DueTag';
import { TaskModal } from '../board/TaskModal';

const DAY_MS = 86_400_000;

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export function CalendarView({ project, onUpdateProject }) {
  const [editing, setEditing] = useState(null);
  const { tasks = [], members = [], name: projectName } = project;

  const tasksWithDate = tasks.filter(t => t.dueDate);
  const tasksNoDate   = tasks.filter(t => !t.dueDate);

  // build date window
  const today = new Date().toISOString().slice(0, 10);
  const allDates = [today, ...tasksWithDate.map(t => t.dueDate)];
  const minDate = allDates.reduce((a, b) => (a < b ? a : b));
  const maxDate = allDates.reduce((a, b) => (a > b ? a : b));
  const startMs = Date.parse(minDate);
  const endMs   = Math.max(Date.parse(maxDate), startMs + 13 * DAY_MS);
  const dayCount = Math.round((endMs - startMs) / DAY_MS) + 1;
  const days = Array.from({ length: dayCount }, (_, i) => {
    const ms = startMs + i * DAY_MS;
    return new Date(ms).toISOString().slice(0, 10);
  });

  function colFor(date) {
    return Math.round((Date.parse(date) - startMs) / DAY_MS) + 2; // +2: col 1 = label
  }

  function handleSave(saved) {
    const exists = tasks.find(t => t.id === saved.id);
    const next = exists ? tasks.map(t => t.id === saved.id ? saved : t) : [...tasks, saved];
    onUpdateProject({ ...project, tasks: next });
  }

  function handleDelete(id) {
    onUpdateProject({ ...project, tasks: tasks.filter(t => t.id !== id) });
  }

  const todayCol = colFor(today);

  return (
    <div className="px-6 py-10 pb-32">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-stone-100 mb-8">Calendar</h1>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div
          className="min-w-max"
          style={{ display: 'grid', gridTemplateColumns: `140px repeat(${dayCount}, minmax(72px, 1fr))` }}
        >
          {/* header row */}
          <div className="sticky left-0 z-10 bg-white dark:bg-stone-800 border-b border-r border-slate-200 dark:border-stone-700 px-3 py-2 text-xs font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wide">
            Status
          </div>
          {days.map((d, i) => {
            const isToday = d === today;
            const isMon = new Date(d).getDay() === 1;
            return (
              <div key={d}
                className={`border-b border-l border-slate-100 dark:border-stone-700 px-1 py-2 text-center text-xs
                  ${isToday ? 'bg-brand-primary/10 font-bold text-brand-primary dark:text-brand-ring' : isMon ? 'bg-slate-50 dark:bg-stone-700/30 text-slate-500 dark:text-stone-400' : 'text-slate-400 dark:text-stone-500'}`}>
                {(isToday || isMon || i === 0) ? formatDate(d) : ''}
              </div>
            );
          })}

          {/* today marker column highlight — done via task cells; rows per stage */}
          {STAGES.map(stage => {
            const stageTasks = tasksWithDate.filter(t => t.status === stage.id);
            return (
              <div key={stage.id} className="contents">
                {/* stage label cell */}
                <div className="sticky left-0 z-10 bg-white dark:bg-stone-800 border-b border-r border-slate-100 dark:border-stone-700 px-3 py-3 flex items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-stone-400">{stage.label}</span>
                </div>
                {/* day cells */}
                {days.map(d => {
                  const isToday = d === today;
                  const cellTasks = stageTasks.filter(t => t.dueDate === d);
                  return (
                    <div key={d}
                      className={`border-b border-l border-slate-100 dark:border-stone-700 px-1 py-1.5 min-h-[48px] flex flex-col gap-1
                        ${isToday ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''}`}>
                      {cellTasks.map(task => {
                        const tc = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;
                        const due = getDue(task);
                        return (
                          <button key={task.id} onClick={() => setEditing(task)}
                            className={`w-full text-left rounded-lg border px-2 py-1 text-xs font-medium truncate transition hover:shadow-sm
                              ${tc.stripe} bg-white dark:bg-stone-700 border-slate-200 dark:border-stone-600
                              ${due?.text ?? 'text-slate-700 dark:text-stone-200'}`}>
                            {tc.icon} {task.title}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* No due date section */}
      {tasksNoDate.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide mb-3">No due date</h2>
          <div className="flex flex-wrap gap-2">
            {tasksNoDate.map(task => {
              const tc = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;
              return (
                <button key={task.id} onClick={() => setEditing(task)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:shadow-sm ${tc.stripe} bg-white dark:bg-stone-800 border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-200`}>
                  {tc.icon} {task.title}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {editing && (
        <TaskModal
          task={editing}
          members={members}
          projectName={projectName}
          onClose={() => setEditing(null)}
          onSave={saved => { handleSave(saved); setEditing(null); }}
          onDelete={id => { handleDelete(id); setEditing(null); }}
        />
      )}
    </div>
  );
}
