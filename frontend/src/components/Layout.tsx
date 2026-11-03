import type { ComponentChildren } from 'preact'
import { useLocation } from 'preact-iso'
import { placeHref, placeKey, savedPlaces, units } from '@/store/places'
import ThemeToggle from '@/components/ThemeToggle'

interface LayoutProps {
  children?: ComponentChildren
}

const chipClass = (isActive: boolean) =>
  `flex shrink-0 items-center gap-1.5 border px-3 py-1.5 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${
    isActive
      ? 'border-lime bg-lime text-accent-ink'
      : 'border-void-line text-ink-dim hover:border-lime hover:text-ink'
  }`

function LocationIcon() {
  return (
    <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M14 2 2 7.2l5.2 1.6L8.8 14Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="m10.5 10.5 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function UnitsToggle() {
  return (
    <div role="radiogroup" aria-label="Units" class="flex shrink-0 border border-void-line">
      {(['metric', 'imperial'] as const).map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={units.value === id}
          onClick={() => (units.value = id)}
          class={`px-2 py-1.5 font-mono text-xs transition-colors ${
            units.value === id ? 'bg-lime text-accent-ink' : 'text-ink-dim hover:text-ink'
          }`}
        >
          {id === 'metric' ? '°C' : '°F'}
        </button>
      ))}
    </div>
  )
}

export default function Layout({ children }: LayoutProps) {
  const { path, query } = useLocation()
  const activeKey =
    path === '/place' && query.lat && query.lon
      ? placeKey({ latitude: Number(query.lat), longitude: Number(query.lon) })
      : undefined

  return (
    <div class="flex min-h-dvh flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <nav class="sticky top-0 z-20 border-b border-void-line/80 bg-void/85 backdrop-blur">
        <div class="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          <div class="-my-1 flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 [scrollbar-width:none]">
            <a href="/" class={chipClass(path === '/')} aria-label="My location">
              <LocationIcon />
              Here
            </a>
            {savedPlaces.value.map((place) => (
              <a
                key={placeKey(place)}
                href={placeHref(place)}
                class={chipClass(activeKey === placeKey(place))}
              >
                {place.name}
              </a>
            ))}
            <a href="/search" class={chipClass(path === '/search')} aria-label="Search cities">
              <SearchIcon />
            </a>
          </div>
          <UnitsToggle />
        </div>
      </nav>

      <main class="mx-auto w-full max-w-xl flex-1 px-4 py-6">{children}</main>

      <footer class="mx-auto flex w-full max-w-xl items-center justify-between gap-4 px-4 py-6">
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          class="font-mono text-[0.65rem] uppercase tracking-widest text-ink-dim hover:text-ink"
        >
          Weather data by Open-Meteo
        </a>
        <ThemeToggle />
      </footer>
    </div>
  )
}
