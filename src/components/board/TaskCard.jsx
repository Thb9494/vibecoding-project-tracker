import { TYPE_CONFIG, AVATAR_COLORS } from '../../constants';
import { initials } from '../../utils/ids';
import { DueTag } from '../shared/DueTag';
import { CopyContextButton } from '../shared/CopyContextButton';

export function TaskCard({ task, members, onClick, onHandoff, getIcon, projectName, onDragStart, onDragEnd, isDragging }) {
  const typeConfig = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;
  const memberIdx = members.findIndex(m => m.name === task.assignee);
  const avatarColor = AVATAR_COLORS[memberIdx % AVATAR_COLORS.length] ?? 'bg-slate-400';
  const icon = getIcon(task.assignee);

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart?.(task); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`cursor-grab active:cursor-grabbing rounded-xl border p-3 shadow-sm flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all select-none
        ${typeConfig.stripe}
        bg-white dark:bg-zinc-800 border-slate-200 dark:border-stone-700
        ${isDragging ? 'opacity-40 scale-95 rotate-1' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${typeConfig.badge}`}>
          {typeConfig.icon} {task.type}
        </span>
        <DueTag task={task} />
      </div>

      <p className="text-sm font-semibold text-slate-800 dark:text-stone-100 leading-snug">{task.title}</p>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          {icon
            ? <img src={icon} alt={task.assignee} className="h-7 w-7 rounded-full object-cover object-top ring-2 ring-white dark:ring-stone-800" />
            : <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white dark:ring-stone-800 ${avatarColor}`}>{initials(task.assignee)}</span>
          }
          <span className="text-xs font-medium text-slate-400 dark:text-stone-500">{task.assignee}</span>
        </div>

        {/* hand-off dropdown with 👉 icon */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <select
            value=""
            onChange={e => { if (e.target.value) onHandoff(task, e.target.value); }}
            className="appearance-none pl-6 pr-2 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all focus:outline-none
              border border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50
              dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300 dark:hover:border-blue-400 dark:hover:text-blue-300 dark:[color-scheme:dark]"
          >
            <option value="" disabled>Hand off</option>
            {members.filter(m => m.name !== task.assignee).map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-sm leading-none">👉</span>
        </div>
      </div>

      <div onClick={e => e.stopPropagation()}>
        <CopyContextButton task={task} projectName={projectName} stopClick />
      </div>
    </div>
  );
}
