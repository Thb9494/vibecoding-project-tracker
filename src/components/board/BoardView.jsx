import { useState, useCallback } from 'react';
import { STAGES, AVATAR_COLORS } from '../../constants';
import { newId, initials } from '../../utils/ids';
import { Column } from './Column';
import { TaskModal } from './TaskModal';
import { GhibliPicker } from '../shared/GhibliPicker';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from '../shared/ThemeToggle';

export function BoardView({ project, icons, setIcons, onUpdateProject, onToast }) {
  const [editing, setEditing] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);
  const [theme, toggleTheme] = useTheme();

  const { tasks = [], members = [], name: projectName } = project;


  function getIcon(name) { return icons[name] ?? null; }

  function handleSave(saved) {
    const exists = tasks.find(t => t.id === saved.id);
    const next = exists ? tasks.map(t => t.id === saved.id ? saved : t) : [...tasks, saved];
    onUpdateProject({ ...project, tasks: next });
  }

  function handleDelete(id) {
    onUpdateProject({ ...project, tasks: tasks.filter(t => t.id !== id) });
  }

  const handleHandoff = useCallback((task, newAssignee) => {
    onUpdateProject({ ...project, tasks: tasks.map(t => t.id === task.id ? { ...t, assignee: newAssignee } : t) });
    onToast(`Handed off to ${newAssignee}. They've got it.`);
  }, [project, tasks, onUpdateProject, onToast]);

  return (
    <div className="p-6 pb-32">
      {/* header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-stone-100">{projectName}</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400">
            Team · {members.map(m => m.name).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* team strip */}
          <div className="flex items-center gap-3">
            {members.map((m, i) => {
              const count = tasks.filter(t => t.assignee === m.name && t.status !== 'done').length;
              const icon = getIcon(m.name);
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <div key={m.id} className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPickerFor(pickerFor === m.name ? null : m.name)}
                    className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-stone-700 hover:ring-feature/40 transition-transform hover:scale-110 overflow-hidden flex items-center justify-center"
                    title={`Change ${m.name}'s avatar`}
                  >
                    {icon
                      ? <img src={icon} alt={m.name} className="h-full w-full object-cover object-top" />
                      : <span className={`flex h-full w-full items-center justify-center text-xs font-bold text-white ${color}`}>{initials(m.name)}</span>
                    }
                  </button>
                  <span className="text-xs text-slate-600 dark:text-stone-300">{m.name}</span>
                  <span className="text-xs font-semibold text-slate-400 dark:text-stone-500">({count})</span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-800 active:scale-95 transition-all"
          >
            <span className="text-lg leading-none">+</span> New Task
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* board */}
      <main className="grid grid-cols-4 gap-4">
        {STAGES.map(stage => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter(t => t.status === stage.id)}
            members={members}
            onCardClick={task => setEditing(task)}
            onHandoff={handleHandoff}
            getIcon={getIcon}
            projectName={projectName}
          />
        ))}
      </main>

      {pickerFor && (
        <GhibliPicker
          name={pickerFor}
          current={getIcon(pickerFor)}
          onSelect={img => setIcons(prev => ({ ...prev, [pickerFor]: img }))}
          onClose={() => setPickerFor(null)}
        />
      )}

      {editing !== null && (
        <TaskModal
          task={editing === 'new' ? null : editing}
          members={members}
          projectName={projectName}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
