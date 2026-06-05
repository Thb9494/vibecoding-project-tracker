import { useState } from 'react';
import { TaskCard } from './TaskCard';

export function Column({ stage, tasks, members, onCardClick, onHandoff, getIcon, projectName, onDragStart, onDragEnd, onDrop, draggingId }) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className="flex flex-col gap-3 min-w-0 flex-1"
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={e => { e.preventDefault(); setIsOver(false); onDrop(stage.id); }}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-stone-400">
          {stage.label}
        </h2>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-stone-700 text-xs font-semibold text-slate-600 dark:text-stone-300">
          {tasks.length}
        </span>
      </div>

      <div className={`flex flex-col gap-2 rounded-2xl p-1.5 min-h-24 transition-all duration-150
        ${isOver && draggingId
          ? 'bg-indigo-950/30 ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900'
          : 'bg-transparent'}`}
      >
        {tasks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-stone-700 p-4 text-center text-xs text-slate-400 dark:text-stone-500">
            Nothing here yet — keep going.
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              onClick={() => onCardClick(task)}
              onHandoff={onHandoff}
              getIcon={getIcon}
              projectName={projectName}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingId === task.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
