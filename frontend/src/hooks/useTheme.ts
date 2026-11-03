import { signal } from '@preact/signals'

export type Theme = 'dark' | 'light' | 'solarized'

export interface ThemeInfo {
  id: Theme
  label: string
}

export const THEMES: readonly ThemeInfo[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'solarized', label: 'Solarized' },
] as const

const STORAGE_KEY = 'scaffold-theme'

function isValidTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light' || value === 'solarized'
}

function readTheme(): Theme {
  const datasetTheme = document.documentElement.dataset.theme
  if (isValidTheme(datasetTheme)) {
    return datasetTheme
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (isValidTheme(stored)) {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

// Module-level so every component shares one source of truth; anything that
// reads `theme.value` while rendering updates when it changes.
const theme = signal<Theme>(readTheme())

/** Browser chrome color (status bar on phones) for each theme's background. */
const THEME_COLORS: Record<Theme, string> = {
  dark: '#0a0a0b',
  light: '#f6f3e8',
  solarized: '#002b36',
}

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[next])
}

function setTheme(next: Theme) {
  applyTheme(next)
  localStorage.setItem(STORAGE_KEY, next)
  theme.value = next
}

function cycleTheme() {
  const currentIndex = THEMES.findIndex((t) => t.id === theme.value)
  setTheme(THEMES[(currentIndex + 1) % THEMES.length].id)
}

// Keep tabs in sync.
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY && isValidTheme(event.newValue)) {
    applyTheme(event.newValue)
    theme.value = event.newValue
  }
})

export function useTheme() {
  return {
    theme: theme.value,
    setTheme,
    cycleTheme,
    toggleTheme: cycleTheme,
    themes: THEMES,
  }
}
