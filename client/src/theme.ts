import { createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig, {
  globalCss: {
    body: {
      background:
        'radial-gradient(ellipse at center, #18181b 60%, #111112 100%)', // deep vignette
      color: 'var(--chakra-colors-gray-100)',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
  theme: {
    tokens: {
      colors: {
        // NightfallMUD core palette
        gloom: {
          500: { value: '#3a4a4a' }, // The Gloom accent
        },
        night: {
          900: { value: '#18181b' }, // Deepest background
          800: { value: '#23232a' },
          700: { value: '#23283a' },
        },
        danger: {
          700: { value: '#7f1d1d' }, // Deep red for combat
          500: { value: '#b91c1c' },
        },
        pale: {
          200: { value: '#b6e0fe' }, // Ghostly blue highlight
        },
        gold: {
          500: { value: '#ffd700' },
          700: { value: '#bfa100' },
        },
        gray: {
          900: { value: '#18181b' },
          800: { value: '#23232a' },
          700: { value: '#3a3a3a' },
          600: { value: '#444' },
          500: { value: '#666' },
          400: { value: '#a1a1aa' },
          100: { value: '#e0e0e0' },
        },
      },
      fonts: {
        heading: { value: 'Merriweather, Georgia, serif' }, // Gothic/gloomy
        body: { value: 'Inter, system-ui, sans-serif' },
      },
    },
    // Add more theme customizations here as needed
  },
});

export default system; 