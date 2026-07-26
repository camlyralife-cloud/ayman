/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        border: 'var(--border)'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        script: ['"Pinyon Script"', 'cursive'],
        'serif-sc': ['"Cormorant SC"', 'serif'],
        sans: ['Inter', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: 'var(--radius)'
      }
    }
  },
  plugins: []
};
