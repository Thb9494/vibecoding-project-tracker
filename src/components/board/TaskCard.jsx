import { useState } from 'react';
import { TYPE_CONFIG, AVATAR_COLORS } from '../../constants';
import { initials } from '../../utils/ids';
import { DueTag } from '../shared/DueTag';
import { CopyContextButton } from '../shared/CopyContextButton';

export function TaskCard({ task, members, onClick, onHandoff, getIcon, projectName, onDragStart, onDragEnd, isDragging }) {
  const typeConfig = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;
  const memberIdx  = members.findIndex(m => m.name === task.assignee);
  const avatarColor = AVATAR_COLORS[memberIdx % AVATAR_COLORS.length] ?? 'bg-slate-400';
  const icon = getIcon(task.assignee);

  // handoff popover state
  const [showHandoff, setShowHandoff] = useState(false);
  const teammates = members.filter(m => m.name !== task.assignee);

  function handleHandoff(name) {
    onHandoff(task, name);
    setShowHandoff(false);
  }

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart?.(task); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`cursor-grab active:cursor-grabbing rounded-xl border-t border-r border-b p-3 shadow-sm flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all select-none
        ${typeConfig.stripe}
        bg-white dark:bg-zinc-800
        border-t-slate-200 border-r-slate-200 border-b-slate-200
        dark:border-t-stone-700 dark:border-r-stone-700 dark:border-b-stone-700
        ${isDragging ? 'opacity-40 scale-95 rotate-1' : ''}`}
    >
      {/* row 1: type badge + due tag */}
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${typeConfig.badge}`}>
          {typeConfig.icon} {task.type}
        </span>
        <DueTag task={task} />
      </div>

      {/* row 2: title */}
      <p className="text-sm font-semibold text-slate-800 dark:text-stone-100 leading-snug">{task.title}</p>

      {/* row 3: description */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* row 4+5: footer — copy context left, avatar+name right */}
      <div className="mt-1 flex items-center justify-between gap-2">

        {/* left: copy context */}
        <div onClick={e => e.stopPropagation()}>
          <CopyContextButton task={task} projectName={projectName} stopClick />
        </div>

        {/* right: avatar (with handoff popover) + name */}
        <div className="relative flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <span className="text-xs font-medium text-slate-400 dark:text-stone-500">{task.assignee}</span>
          <button
            onClick={() => setShowHandoff(v => !v)}
            title="Hand off to a teammate"
            className="relative rounded-full ring-2 ring-white dark:ring-stone-800 hover:ring-indigo-400 transition-all focus:outline-none"
          >
            {icon
              ? <img src={icon} alt={task.assignee} className="h-7 w-7 rounded-full object-cover object-top" />
              : <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor}`}>{initials(task.assignee)}</span>
            }
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white dark:bg-zinc-800 text-[8px] leading-none border border-slate-200 dark:border-stone-600">
              ↕
            </span>
          </button>

          {/* handoff popover */}
          {showHandoff && teammates.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 z-20 flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-stone-600 bg-white dark:bg-zinc-800 shadow-lg p-2 min-w-[130px]">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wide px-1 pb-1">
                Hand off to
              </p>
              {teammates.map(m => {
                const tIdx  = members.findIndex(x => x.name === m.name);
                const tColor = AVATAR_COLORS[tIdx % AVATAR_COLORS.length] ?? 'bg-slate-400';
                const tIcon  = getIcon(m.name);
                return (
                  <button
                    key={m.id}
                    onClick={() => handleHandoff(m.name)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-700 transition-colors"
                  >
                    {tIcon
                      ? <img src={tIcon} alt={m.name} className="h-5 w-5 rounded-full object-cover object-top" />
                      : <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${tColor}`}>{initials(m.name)}</span>
                    }
                    {m.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
