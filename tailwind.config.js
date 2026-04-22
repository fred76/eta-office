/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        naval: {
          primary:    '#0f172a',
          secondary:  '#334155',
          accent:     '#38bdf8',
          neutral:    '#1e293b',
          'base-100': '#f1f5f9',
          'base-200': '#e2e8f0',
          'base-300': '#cbd5e1',
          info:       '#0ea5e9',
          success:    '#22c55e',
          warning:    '#f59e0b',
          error:      '#ef4444',
        },
      },
    ],
    darkTheme: false,
  },
}

