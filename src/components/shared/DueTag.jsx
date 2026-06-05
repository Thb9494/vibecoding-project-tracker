import { today } from '../../utils/ids';
import { DUE_STYLES } from '../../constants';

const DAY_MS = 86_400_000;

export function getDue(task) {
  if (!task.dueDate) return null;
  const nowMs     = Date.now();
  const dueMs     = Date.parse(`${task.dueDate}T23:59:59`);
  const createdMs = task.createdDate ? Date.parse(`${task.createdDate}T00:00:00`) : nowMs - 3 * DAY_MS;
  const total     = dueMs - createdMs;
  const pct       = total > 0 ? Math.min(100, Math.max(0, ((nowMs - createdMs) / total) * 100)) : 100;

  if (task.status === 'done') return { ...DUE_STYLES.neutral, pct: 100, label: 'Done' };

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

export function DueTag({ task }) {
  const due = getDue(task);
  if (!due) return null;
  return (
    <span
      className={`relative inline-flex h-5 w-[86px] shrink-0 items-center justify-center overflow-hidden rounded-full border ${due.border} ${due.track}`}
      title={`Due ${task.dueDate}`}
    >
      <span className={`absolute inset-y-0 left-0 ${due.fill}`} style={{ width: `${due.pct}%` }} />
      <span className={`relative z-10 px-1 text-[11px] font-semibold leading-none ${due.text}`}>{due.label}</span>
    </span>
  );
}
