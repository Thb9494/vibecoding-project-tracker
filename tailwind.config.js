/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand (DESIGN.md §2) — replaces the stock Tailwind blue
        brand: {
          primary: '#5B7E3C', // header, "+" button, primary fills
          dark:    '#4D6B33', // hover state (darker shade)
          ring:    '#7FA05E', // focus rings (lighter shade)
        },
        // Warm-grey page background (light mode)
        surface: {
          page: '#f1ede6', // warm grey, replaces the cool slate-50
        },
        // Tweak in M6 (tag-style) and M8 (due-tint)
        feature: '#10B981', // emerald
        bug: '#DC2626',     // crimson
      },
    },
  },
  plugins: [],
};
