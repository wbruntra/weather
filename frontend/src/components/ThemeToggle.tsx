import { useTheme, type Theme } from '@/hooks/useTheme'

function MoonIcon({ class: className }: { class?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" class={className} aria-hidden="true">
      <path
        d="M13.5 9.3A6 6 0 1 1 6.7 2.5a4.6 4.6 0 0 0 6.8 6.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon({ class: className }: { class?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" class={className} aria-hidden="true">
      <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.15 1.15M4.25 11.75 3.1 12.9M12.9 12.9l-1.15-1.15M4.25 4.25 3.1 3.1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SolarIcon({ class: className }: { class?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" class={className} aria-hidden="true">
      <circle cx="8" cy="8" r="2.75" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle
        cx="8"
        cy="8"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeDasharray="2 2"
      />
    </svg>
  )
}

const themeOptions: { id: Theme; label: string; icon: typeof MoonIcon }[] = [
  { id: 'dark', label: 'Dark', icon: MoonIcon },
  { id: 'light', label: 'Light', icon: SunIcon },
  { id: 'solarized', label: 'Solarized', icon: SolarIcon },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const activePositionClass =
    theme === 'dark' ? 'left-0' : theme === 'light' ? 'left-8' : 'left-16'

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      class="relative flex h-8 w-24 shrink-0 border border-void-line bg-void-raised transition-colors hover:border-lime/60"
    >
      <span
        aria-hidden="true"
        class={`absolute top-0 h-full w-8 border border-lime bg-lime transition-[left] duration-200 ease-out ${activePositionClass}`}
      />
      {themeOptions.map(({ id, label, icon: Icon }) => {
        const isActive = theme === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => setTheme(id)}
            class="relative z-10 flex h-full w-8 items-center justify-center transition-colors focus-visible:outline-none"
          >
            <Icon
              class={`h-4 w-4 transition-colors ${
                isActive ? 'text-accent-ink' : 'text-ink-dim hover:text-ink'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
