/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        }
      },
      backgroundImage: {
        // Primary gradient: indigo → violet → cyan
        'gradient-primary': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
        // Success: emerald → green
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        // Warning: amber → orange
        'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        // Error: rose → red
        'gradient-error': 'linear-gradient(135deg, #f43f5e 0%, #dc2626 100%)',
        // Info: sky → blue
        'gradient-info': 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        // Subtle gradients for cards
        'gradient-card': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        'gradient-accent': 'linear-gradient(to right, #4f46e5, #06b6d4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionDuration: {
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
