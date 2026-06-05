import { useState, useEffect } from 'react';
import { useProjects } from './hooks/useProjects';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { migrateOnce } from './utils/migrate';
import { BottomNav } from './components/nav/BottomNav';
import { NewProjectModal } from './components/nav/NewProjectModal';
import { BoardView } from './components/board/BoardView';
import { DocumentsView } from './components/documents/DocumentsView';
import { CalendarView } from './components/calendar/CalendarView';
import { DeliverablesView } from './components/deliverables/DeliverablesView';
import { SettingsView } from './components/settings/SettingsView';
import { Toast } from './components/shared/Toast';

// run once before first render
migrateOnce();

export default function App() {
  const { projects, updateProject, createProject, deleteProject } = useProjects();
  const [icons, setIcons] = useLocalStorage('vibetracker.icons', {});
  const [theme, toggleTheme] = useTheme();
  const [toast, setToast] = useState(null);

  // ── routing ──────────────────────────────────────────────────────────────────
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const hash = window.location.hash;
    const m = hash.match(/^#\/project\/([^/]+)/);
    return m ? m[1] : null;
  });
  const [activeView, setActiveView] = useState(() => {
    const hash = window.location.hash;
    const m = hash.match(/^#\/project\/[^/]+\/(\w+)/);
    return m ? m[1] : 'board';
  });

  useEffect(() => {
    if (!activeProjectId) {
      window.history.replaceState(null, '', '#/');
    } else {
      window.history.replaceState(null, '', `#/project/${activeProjectId}/${activeView}`);
    }
  }, [activeProjectId, activeView]);

  useEffect(() => {
    function onPop() {
      const hash = window.location.hash;
      const m = hash.match(/^#\/project\/([^/]+)\/(\w+)/);
      if (m) { setActiveProjectId(m[1]); setActiveView(m[2]); }
      else { setActiveProjectId(null); setActiveView('board'); }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ── active project ────────────────────────────────────────────────────────────
  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;

  // if stored id no longer exists (deleted), reset
  useEffect(() => {
    if (activeProjectId && !activeProject) setActiveProjectId(null);
  }, [activeProjectId, activeProject]);

  function handleSelectProject(id) {
    setActiveProjectId(id);
    setActiveView('board');
  }

  function handleDeleteProject(id) {
    deleteProject(id);
    setActiveProjectId(null);
  }

  // ── empty state ───────────────────────────────────────────────────────────────
  const [showNewProject, setShowNewProject] = useState(false);

  function handleCreate(project) {
    createProject(project);
    setActiveProjectId(project.id);
    setActiveView('board');
  }

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf9fe] dark:bg-zinc-900 transition-colors">

      {/* main content */}
      {!activeProject ? (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 pb-24">
          <p className="text-5xl">▦</p>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-stone-100">Vibecoding Project Tracker</h1>
          <p className="text-slate-500 dark:text-stone-400 text-sm">
            {projects.length === 0 ? 'Create your first project to get started.' : 'Select a project from the menu below.'}
          </p>
          {projects.length === 0 && (
            <button
              onClick={() => setShowNewProject(true)}
              className="mt-2 flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-dark transition-all"
            >
              + New Project
            </button>
          )}
        </div>
      ) : activeView === 'board' ? (
        <BoardView
          project={activeProject}
          icons={icons}
          setIcons={setIcons}
          onUpdateProject={updateProject}
          onToast={setToast}
        />
      ) : activeView === 'deliverables' ? (
        <DeliverablesView
          project={activeProject}
          onUpdateProject={updateProject}
        />
      ) : activeView === 'documents' ? (
        <DocumentsView
          project={activeProject}
          onUpdateProject={updateProject}
        />
      ) : activeView === 'calendar' ? (
        <CalendarView
          project={activeProject}
          onUpdateProject={updateProject}
        />
      ) : activeView === 'settings' ? (
        <SettingsView
          project={activeProject}
          onUpdateProject={updateProject}
          onDeleteProject={handleDeleteProject}
          theme={theme}
          onToggleTheme={toggleTheme}
          icons={icons}
          setIcons={setIcons}
        />
      ) : null}

      {/* bottom nav */}
      <BottomNav
        projects={projects}
        activeProjectId={activeProjectId}
        activeView={activeView}
        onSelectProject={handleSelectProject}
        onSelectView={setActiveView}
        onCreate={handleCreate}
      />

      {/* global toast — appears above the nav bar */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* new project modal from empty state */}
      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreate={project => { handleCreate(project); setShowNewProject(false); }}
        />
      )}
    </div>
  );
}
