import { useLocalStorage } from './useLocalStorage';

export function useProjects() {
  const [projects, setProjects] = useLocalStorage('vibetracker.projects', []);

  function updateProject(updated) {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  function createProject(project) {
    setProjects(prev => [...prev, project]);
  }

  function deleteProject(id) {
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  return { projects, setProjects, updateProject, createProject, deleteProject };
}
