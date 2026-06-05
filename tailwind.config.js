/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── System palette ──────────────────────────────────────────────
        // Each category owns a distinct hue band so team / type / status
        // never read as the same colour. `DEFAULT` = light mode (solid fills
        // and text); `soft` = lighter shade for legible text on dark surfaces.

        // Brand — olive green (header, "+" button, primary fills)
        brand: {
          primary: '#5B7E3C',
          dark:    '#4D6B33', // hover
          ring:    '#7FA05E', // focus rings
        },

        // Surface — warm, paper-like page background
        surface: {
          page: '#f7f4ed', // light: brighter warm off-white
        },

        // Type / tag (M6) — cool indigo vs warm orange
        feature: { DEFAULT: '#4f4ad1', soft: '#a8a4f2' }, // indigo
        bug:     { DEFAULT: '#dd6011', soft: '#f3a468' }, // orange

        // Due-date status (M8) — red → gold → emerald → grey
        due: {
          overdue: { DEFAULT: '#cf3b3b', soft: '#f08a8a' },
          warning: { DEFAULT: '#b5870f', soft: '#e3bb55' },
          safe:    { DEFAULT: '#2f9e74', soft: '#62d3a4' },
          neutral: { DEFAULT: '#6b665e', soft: '#a8a299' },
        },

        // Team avatars — teal / cobalt / plum (no overlap with type or status)
        team: {
          theresa: '#0e8a8a', // teal
          murtaza: '#2f63c9', // cobalt
          makram:  '#9648c4', // plum
        },
      },
    },
  },
  plugins: [],
};
