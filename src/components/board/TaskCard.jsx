import { TYPE_CONFIG, AVATAR_COLORS } from '../../constants';
import { initials } from '../../utils/ids';
import { DueTag } from '../shared/DueTag';
import { CopyContextButton } from '../shared/CopyContextButton';

export function TaskCard({ task, members, onClick, onHandoff, getIcon, projectName }) {
  const typeConfig = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.feature;
  const memberIdx = members.findIndex(m => m.name === task.assignee);
  const avatarColor = AVATAR_COLORS[memberIdx % AVATAR_COLORS.length] ?? 'bg-slate-400';
  const icon = getIcon(task.assignee);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-3 shadow-sm flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all ${typeConfig.stripe} bg-white dark:bg-stone-800 border-slate-200 dark:border-stone-700`}
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
          <span className="text-xs font-medium text-slate-700 dark:text-stone-300">{task.assignee}</span>
        </div>

        <select
          value=""
          onClick={e => e.stopPropagation()}
          onChange={e => { if (e.target.value) onHandoff(task, e.target.value); }}
          className="text-xs text-slate-400 dark:text-stone-400 bg-transparent dark:[color-scheme:dark] border border-slate-200 dark:border-stone-600 rounded-lg px-1.5 py-0.5 cursor-pointer hover:border-slate-400 focus:outline-none focus:border-brand-ring transition-colors"
        >
          <option value="" disabled>Hand off →</option>
          {members.filter(m => m.name !== task.assignee).map(m => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
      </div>

      <div onClick={e => e.stopPropagation()}>
        <CopyContextButton task={task} projectName={projectName} stopClick />
      </div>
    </div>
  );
}
