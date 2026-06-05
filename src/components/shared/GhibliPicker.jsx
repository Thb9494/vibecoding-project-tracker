import { GHIBLI_ICONS } from '../../constants';

export function GhibliPicker({ name, current, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-6" onClick={onClose}>
      <div
        className="w-72 rounded-2xl bg-white dark:bg-surface-page-dark shadow-2xl border border-slate-100 dark:border-stone-700 p-4 flex flex-col gap-3"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide">
          {name}'s character
        </p>
        <div className="grid grid-cols-5 gap-2">
          {GHIBLI_ICONS.map(({ img, name: charName }) => (
            <button
              key={img}
              onClick={() => { onSelect(img); onClose(); }}
              className={`flex flex-col items-center gap-1 rounded-xl p-1.5 transition-all hover:bg-indigo-50 dark:hover:bg-stone-800
                ${current === img ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-400' : ''}`}
              title={charName}
            >
              <img src={img} alt={charName} className="h-10 w-10 rounded-full object-cover object-top" />
              <span className="text-[9px] text-slate-400 leading-tight text-center">{charName}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => { onSelect(null); onClose(); }}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-stone-300 transition text-center"
        >
          ↩ Reset to initials
        </button>
      </div>
    </div>
  );
}
