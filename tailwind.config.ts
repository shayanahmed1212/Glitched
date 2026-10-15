import { staticGenerationAsyncStorage } from 'next/dist/client/components/static-generation-async-storage-instance';
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',         // pure pitch-black base
        paper: '#F5F3EE',       // off-white for text on black
        crimson: '#C9302C',     // destructive actions, blocks, large badges
        'crimson-lt': '#E8574F', // text-safe crimson (5.9:1) — small red copy + errors
        moss: '#3E5C3A',        // success fills / calmer accent
        'moss-lt': '#6FA45E',   // text-safe moss (7:1) — success copy
        gold: '#B98A2E',        // primary action / active / selection
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        // the reading system — didone for headlines, newsprint for the measure
        mag: ['"Playfair Display"', 'Georgia', 'serif'],
        read: ['Newsreader', 'Georgia', 'serif'],
        // chrome: every label, button, tag and count. Arcade cabinet voice.
        mono: ['"Silkscreen"', 'ui-monospace', 'monospace'],
        // wordmark only — blocky 8-bit face for the "Glitched" lockup
        logo: ['"Press Start 2P"', '"Silkscreen"', 'ui-monospace', 'monospace'],
      },
      // arcade cabinets and photocopied zines have no rounded corners. None.
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '0',
      },
      boxShadow: {
        // hard-edged, zero-blur ink offsets — the screen-print language
        arc: '3px 3px 0 0 #C9302C',
        'arc-sm': '2px 2px 0 0 #C9302C',
        'arc-gold': '3px 3px 0 0 #B98A2E',
        'arc-paper': '3px 3px 0 0 #F5F3EE',
      },
      aspectRatio: {  
        cover: '3 / 4',
      },
    },
  },
  plugins: [],
} satisfies Config;
