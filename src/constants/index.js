export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

export const CONTEXT_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

export const CONTEXT_TEMPLATE = `## Background


## Constraints


## Tried so far


## Pick up
`;

export const INPUT_BASE =
  'rounded-lg border border-stone-700 bg-stone-800 ' +
  'text-stone-100 placeholder-stone-500 ' +
  'outline-none transition-colors duration-150 ' +
  'hover:border-stone-500 focus:border-brand-ring';

export const TYPE_CONFIG = {
  feature: {
    badge:  'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/30 dark:text-indigo-200',
    stripe: 'border-l-4 border-l-indigo-500',
    icon:   '⚡',
  },
  bug: {
    badge:  'bg-orange-100 text-orange-800 dark:bg-orange-500/30 dark:text-orange-200',
    stripe: 'border-l-4 border-l-orange-500',
    icon:   '🐛',
  },
};

export const AVATAR_COLORS = [
  'bg-team-theresa', 'bg-team-murtaza', 'bg-team-makram',
  'bg-violet-500', 'bg-cyan-500', 'bg-pink-500', 'bg-lime-500',
];

export const GHIBLI_ICONS = [
  { img: '/avatars/chihiro.png',       name: 'Chihiro' },
  { img: '/avatars/no-face.png',       name: 'No-Face' },
  { img: '/avatars/yubaba.png',        name: 'Yubaba' },
  { img: '/avatars/frosch-diener.png', name: 'Frosch-Diener' },
  { img: '/avatars/totoro.png',        name: 'Totoro' },
  { img: '/avatars/chibi-totoro.png',  name: 'Chibi-Totoro' },
  { img: '/avatars/catbus.png',        name: 'Catbus' },
  { img: '/avatars/calcifer.png',      name: 'Calcifer' },
  { img: '/avatars/sophie.png',        name: 'Sophie' },
  { img: '/avatars/howls-castle.png',  name: 'Howls Schloss' },
];

export const DUE_STYLES = {
  overdue: { track: 'bg-due-overdue/10', fill: 'bg-due-overdue/35', text: 'text-due-overdue dark:text-due-overdue-soft', border: 'border-due-overdue/30' },
  warning: { track: 'bg-due-warning/10', fill: 'bg-due-warning/35', text: 'text-due-warning dark:text-due-warning-soft', border: 'border-due-warning/30' },
  safe:    { track: 'bg-due-safe/10',    fill: 'bg-due-safe/30',    text: 'text-due-safe dark:text-due-safe-soft',       border: 'border-due-safe/30' },
  neutral: { track: 'bg-due-neutral/10', fill: 'bg-due-neutral/25', text: 'text-due-neutral dark:text-due-neutral-soft', border: 'border-due-neutral/30' },
};

export const PROJECT_COLORS = [
  '#5B7E3C', '#2f63c9', '#9648c4', '#0e8a8a',
  '#c64f00', '#b5870f', '#cf3b3b', '#1a6b5a',
];
