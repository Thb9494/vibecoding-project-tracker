import { today } from '../../utils/ids';

const DAY_MS = 86_400_000;

function getDue(task) {
  if (!task.dueDate) return null;

  const nowMs     = Date.now();
  const dueMs     = Date.parse(`${task.dueDate}T23:59:59`);
  const createdMs = task.createdDate
    ? Date.parse(`${task.createdDate}T00:00:00`)
    : nowMs - 7 * DAY_MS;
  const total = dueMs - createdMs;

  // pct = how far through the created→due window we are (0–100)
  const pct = total > 0
    ? Math.min(100, Math.max(2, ((nowMs - createdMs) / total) * 100))
    : 100;

  // Done → neutral grey full bar
  if (task.status === 'done') {
    return {
      pct: 100,
      label: 'Done',
      barColor: 'bg-zinc-500',
      trackColor: 'bg-zinc-700/40',
      textColor: 'text-zinc-400',
      borderColor: 'border-zinc-600/30',
    };
  }

  const t = today();

  // Overdue → red
  if (task.dueDate < t) {
    const daysLate = Math.floor((nowMs - dueMs) / DAY_MS);
    return {
      pct: 100,
      label: daysLate >= 1 ? `${daysLate}d late` : 'Overdue',
      barColor: 'bg-red-500',
      trackColor: 'bg-red-900/30',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/40',
    };
  }

  const daysLeft = Math.round(
    (Date.parse(`${task.dueDate}T12:00:00`) - Date.parse(`${t}T12:00:00`)) / DAY_MS
  );

  // 0–7 days → orange
  if (daysLeft <= 7) {
    return {
      pct,
      label: daysLeft === 0 ? 'Due today' : `${daysLeft}d left`,
      barColor: 'bg-orange-400',
      trackColor: 'bg-orange-900/30',
      textColor: 'text-orange-300',
      borderColor: 'border-orange-400/40',
    };
  }

  // >7 days → green
  return {
    pct,
    label: `${daysLeft}d left`,
    barColor: 'bg-emerald-500',
    trackColor: 'bg-emerald-900/30',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  };
}

export function DueTag({ task }) {
  const due = getDue(task);
  if (!due) return null;

  return (
    <span
      className={`relative inline-flex h-5 w-[86px] shrink-0 items-center justify-center overflow-hidden rounded-full border ${due.borderColor} ${due.trackColor}`}
      title={`Due ${task.dueDate}`}
    >
      {/* animated fill bar */}
      <span
        className={`absolute inset-y-0 left-0 ${due.barColor} transition-all duration-700 ease-out`}
        style={{ width: `${due.pct}%` }}
      />
      {/* label on top */}
      <span className={`relative z-10 px-1 text-[11px] font-semibold leading-none ${due.textColor}`}>
        {due.label}
      </span>
    </span>
  );
}
