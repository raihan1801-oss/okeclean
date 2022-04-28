module.exports = {
  darkMode: 'class',
  theme: {
    extend: {},
  },
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [require('daisyui')],
  daisyui: {
    styled: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
    themes: [
      "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
      {
      	dark: {
      		primary: '#456BBA',
      		'primary-focus': '#3f73c0',
      		'primary-content': '#ffffff',
      		secondary: '#BA45A5',
      		'secondary-focus': '#c23daf',
      		'secondary-content': '#ffffff',
      		accent: '#37cdbe',
      		'accent-focus': '#2aa79b',
      		'accent-content': '#ffffff',
      		neutral: '#111827',
      		'neutral-focus': '#6b7280',
      		'neutral-content': '#f9fafb',
      		'base-100': '#1F2937',
      		'base-200': '#374151',
      		'base-300': '#4B5563',
      		'base-content': '#F9FAFB',
      		info: '#2094f3',
      		success: '#009485',
      		warning: '#ff9900',
      		error: '#ff5724'
      	},
      	light: {
      		primary: '#456BBA',
      		'primary-focus': '#3f73c0',
      		'primary-content': '#ffffff',
      		secondary: '#BA45A5',
      		'secondary-focus': '#c23daf',
      		'secondary-content': '#ffffff',
      		accent: '#37cdbe',
      		'accent-focus': '#2aa79b',
      		'accent-content': '#ffffff',
      		neutral: '#f9fafb',
      		'neutral-focus': '#9ca3af',
      		'neutral-content': '#111827',
      		'base-100': '#F3F4F6',
      		'base-200': '#E5E7EB',
      		'base-300': '#D1D5DB',
      		'base-content': '#111827',
      		info: '#2094f3',
      		success: '#009485',
      		warning: '#ff9900',
      		error: '#ff5724'
      	}
      }
    ]
  }
}
