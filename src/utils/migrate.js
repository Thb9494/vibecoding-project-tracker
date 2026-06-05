import { newId, today } from './ids';

const DEFAULT_MEMBERS = [
  { id: 'theresa', name: 'Theresa' },
  { id: 'murtaza', name: 'Murtaza' },
  { id: 'makram',  name: 'Makram'  },
];

export function migrateOnce() {
  try {
    const hasTasks    = window.localStorage.getItem('vibetracker.tasks') !== null;
    const hasProjects = window.localStorage.getItem('vibetracker.projects') !== null;
    if (!hasTasks || hasProjects) return;

    const tasks = JSON.parse(window.localStorage.getItem('vibetracker.tasks')) ?? [];
    const project = {
      id: newId(),
      name: 'GraceBayGarage',
      color: '#5B7E3C',
      initials: 'GB',
      createdDate: today(),
      tasks,
      documents: [],
      members: DEFAULT_MEMBERS,
    };
    window.localStorage.setItem('vibetracker.projects', JSON.stringify([project]));
    window.localStorage.removeItem('vibetracker.tasks');
  } catch { /* ignore */ }
}
