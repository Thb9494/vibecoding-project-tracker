import { useState } from 'react';
import { STAGES, CONTEXT_TOOLS, CONTEXT_TEMPLATE, INPUT_BASE } from '../../constants';
import { newId, today, timeAgo } from '../../utils/ids';
import { CopyContextButton } from '../shared/CopyContextButton';

export function TaskModal({ task, members, projectName, onClose, onSave, onDelete }) {
  const isNew = !task;
  const firstMember = members[0]?.name ?? '';

  const [form, setForm] = useState(
    isNew
      ? { title: '', description: '', type: 'feature', status: 'todo', assignee: firstMember, dueDate: '', context: CONTEXT_TEMPLATE, contextTool: '' }
      : { title: task.title, description: task.description, type: task.type, status: task.status, assignee: task.assignee, dueDate: task.dueDate ?? '', context: task.context ?? '', contextTool: task.contextTool ?? '' }
  );
  const [errors, setErrors] = useState({});

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function handleSave() {
    if (!form.title.trim()) { setErrors({ title: 'Title is required' }); return; }
    const prevContext = task?.context ?? '';
    const contextChanged = form.context !== prevContext;
    const contextUpdatedAt = contextChanged && form.context.trim()
      ? new Date().toISOString()
      : (task?.contextUpdatedAt ?? null);
    const saved = isNew
      ? { ...form, id: newId(), createdDate: today(), dueDate: form.dueDate || null, contextTool: form.contextTool || null, contextUpdatedAt }
      : { ...task, ...form, dueDate: form.dueDate || null, contextTool: form.contextTool || null, contextUpdatedAt };
    onSave(saved);
    onClose();
  }

  function handleDelete() {
    if (window.confirm('Delete this task?')) { onDelete(task.id); onClose(); }
  }

  const L = 'text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-stone-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-stone-100">{isNew ? '✦ New Task' : 'Edit Task'}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition">✕</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className={L}>Title <span className="text-red-400">*</span></label>
            <input className={`px-3 py-2 text-sm ${INPUT_BASE} ${errors.title ? '!border-red-400' : ''}`}
              placeholder="What needs to be done?" value={form.title} onChange={e => set('title', e.target.value)} />
            {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className={L}>Description</label>
            <textarea rows={3} className={`px-3 py-2 text-sm resize-none ${INPUT_BASE}`}
              placeholder="Add more context…" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={L}>Type</label>
              <select className={`px-3 py-2 text-sm ${INPUT_BASE}`} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="feature">⚡ Feature</option>
                <option value="bug">🐛 Bug</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={L}>Status</label>
              <select className={`px-3 py-2 text-sm ${INPUT_BASE}`} value={form.status} onChange={e => set('status', e.target.value)}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={L}>Assignee</label>
              <select className={`px-3 py-2 text-sm ${INPUT_BASE}`} value={form.assignee} onChange={e => set('assignee', e.target.value)}>
                {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={L}>Due Date</label>
              <input type="date" className={`px-3 py-2 text-sm dark:[color-scheme:dark] ${INPUT_BASE}`}
                value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-stone-700 pt-4">
            <div className="flex items-center justify-between">
              <label className={L}>✦ Context <span className="font-normal normal-case text-slate-400 dark:text-stone-500">· paste-ready for any AI</span></label>
              {!isNew && task.contextUpdatedAt && <span className="text-xs text-slate-400 dark:text-stone-500">updated {timeAgo(task.contextUpdatedAt)}</span>}
            </div>
            <textarea rows={6} className={`px-3 py-2 text-sm font-mono leading-relaxed resize-y ${INPUT_BASE}`}
              placeholder={CONTEXT_TEMPLATE} value={form.context} onChange={e => set('context', e.target.value)} />
            <div className="mt-1 flex items-center gap-2">
              <label className="text-xs text-slate-500 dark:text-stone-400">AI tool</label>
              <select className={`px-2 py-1 text-xs ${INPUT_BASE}`} value={form.contextTool} onChange={e => set('contextTool', e.target.value)}>
                <option value="">— none —</option>
                {CONTEXT_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {!isNew && <p className="text-xs text-slate-400 dark:text-stone-500">Created: {task.createdDate}</p>}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-stone-700">
          {!isNew ? (
            <div className="flex items-center gap-2">
              <button onClick={handleDelete} className="rounded-lg px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition">🗑 Delete</button>
              <CopyContextButton task={task} projectName={projectName} />
            </div>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-slate-200 dark:border-stone-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-stone-800 transition">Cancel</button>
            <button onClick={handleSave} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition">{isNew ? '+ Add Task' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
