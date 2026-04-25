/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Low-saturation, 16-bit-ish palette
        bg: {
          desk: '#3a4a5a',
          deskDark: '#2c3845',
          window: '#dcd0b8',
          windowDark: '#b8a98a',
          taskbar: '#1f2832',
        },
        ink: {
          DEFAULT: '#2b2418',
          muted: '#6b6354',
          dim: '#8a8270',
        },
        accent: {
          plum: '#7a5a78',
          moss: '#6b8268',
          rust: '#a8674a',
          dust: '#c8b890',
          slate: '#4a5868',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', '"VT323"', 'monospace'],
        mono: ['"VT323"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'pixel': '2px 2px 0 0 rgba(0,0,0,0.4)',
        'pixel-lg': '4px 4px 0 0 rgba(0,0,0,0.5)',
        'window': '4px 4px 0 0 rgba(0,0,0,0.4), inset 1px 1px 0 0 rgba(255,255,255,0.3)',
      },
    },
  },
  plugins: [],
};
