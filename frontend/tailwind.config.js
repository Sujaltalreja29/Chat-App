// tailwind.config.js
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Enhanced responsive breakpoints
      screens: {
        'xs': '375px',     // Small mobile
        'sm': '640px',     // Large mobile
        'md': '768px',     // Tablet
        'lg': '1024px',    // Small laptop
        'xl': '1280px',    // Desktop
        '2xl': '1536px',   // Large desktop
        // Custom breakpoints for chat
        'mobile': {'max': '767px'},     // Mobile-only styles
        'tablet': {'min': '768px', 'max': '1023px'}, // Tablet-only
        'desktop': {'min': '1024px'},   // Desktop and up
      },
      
      // Safe area insets for mobile devices
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      // Chat-specific heights
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'chat-mobile': 'calc(100vh - 4rem)', // Minus mobile header
        'chat-desktop': 'calc(100vh - 5rem)', // Minus desktop navbar
      },

      // Enhanced animations
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out infinite 2s',
        'float-slow': 'float 8s ease-in-out infinite 1s',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'bounce-in': 'bounceIn 0.4s ease-out',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        'mobile': '0 -2px 10px rgba(0, 0, 0, 0.1)',
        'chat': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },

      // Chat-specific z-index layers
      zIndex: {
        'navbar': '50',
        'sidebar': '40',
        'modal': '60',
        'dropdown': '70',
        'toast': '80',
        'overlay': '30',
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", 
      "synthwave", "retro", "cyberpunk", "valentine", "halloween", 
      "garden", "forest", "aqua", "lofi", "pastel", "fantasy", 
      "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", 
      "business", "acid", "lemonade", "night", "coffee", "winter", 
      "dim", "nord", "sunset",
    ],
  },
};