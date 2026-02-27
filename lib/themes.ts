import { ThemeName } from './config'

export interface ThemeDefinition {
  name: ThemeName
  label: string
  description: string
  preview: {
    bg: string
    card: string
    text: string
    accent: string
  }
}

export const THEMES: ThemeDefinition[] = [
  {
    name: 'dark-gradient',
    label: 'Dark Gradient',
    description: 'Deep blue/purple gradient with glowing cards',
    preview: {
      bg: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      card: 'rgba(255,255,255,0.08)',
      text: '#ffffff',
      accent: '#818cf8',
    },
  },
  {
    name: 'minimal-light',
    label: 'Minimal Light',
    description: 'Clean white background, professional look',
    preview: {
      bg: '#f8fafc',
      card: '#ffffff',
      text: '#0f172a',
      accent: '#6366f1',
    },
  },
  {
    name: 'glassmorphism',
    label: 'Glassmorphism',
    description: 'Frosted glass cards on colorful gradient',
    preview: {
      bg: 'linear-gradient(135deg, #667eea, #764ba2)',
      card: 'rgba(255,255,255,0.15)',
      text: '#ffffff',
      accent: '#e879f9',
    },
  },
  {
    name: 'neon-dark',
    label: 'Neon Dark',
    description: 'Cyberpunk aesthetic with glowing borders',
    preview: {
      bg: '#0a0a0f',
      card: '#111118',
      text: '#f0f0ff',
      accent: '#00ff88',
    },
  },
  {
    name: 'warm-gradient',
    label: 'Warm Gradient',
    description: 'Coral, peach and amber tones — friendly feel',
    preview: {
      bg: 'linear-gradient(135deg, #f093fb, #f5576c, #fda085)',
      card: 'rgba(255,255,255,0.85)',
      text: '#3d1a00',
      accent: '#f5576c',
    },
  },
]

export function getTheme(name: ThemeName): ThemeDefinition {
  return THEMES.find(t => t.name === name) ?? THEMES[0]
}

// CSS class applied to the body based on theme selection
export function getThemeClass(name: ThemeName): string {
  return `theme-${name}`
}
