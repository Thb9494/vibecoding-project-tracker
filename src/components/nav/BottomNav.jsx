import { ProjectSwitcher } from './ProjectSwitcher';

const VIEWS = [
  { id: 'board',     icon: '▦',  label: 'Board' },
  { id: 'documents', icon: '📄', label: 'Docs' },
  { id: 'calendar',  icon: '📅', label: 'Calendar' },
  { id: 'settings',  icon: '⚙️', label: 'Settings' },
];

export function BottomNav({ projects, activeProjectId, activeView, onSelectProject, onSelectView, onCreate }) {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-3 py-2 rounded-2xl border border-white/30 dark:border-stone-700/50 bg-white/75 dark:bg-stone-900/80 backdrop-blur-md shadow-xl">
      {/* project switcher badge */}
      <ProjectSwitcher
        projects={projects}
        activeProjectId={activeProjectId}
        onSelect={onSelectProject}
        onCreate={onCreate}
      />

      {/* divider — only show when project is active */}
      {activeProjectId && (
        <>
          <span className="mx-1 h-6 w-px bg-slate-200 dark:bg-stone-700" />
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => onSelectView(v.id)}
              title={v.label}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors
                ${activeView === v.id
                  ? 'bg-brand-primary/10 text-brand-primary dark:text-brand-ring'
                  : 'text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-stone-800'
                }`}
            >
              <span>{v.icon}</span>
              <span className="text-xs">{v.label}</span>
            </button>
          ))}
        </>
      )}
    </nav>
  );
}
