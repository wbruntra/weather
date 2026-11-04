import type { ComponentChildren } from 'preact'
import { useLocation } from 'preact-iso'
import { useEffect, useRef, useState } from 'preact/hooks'
import { appPath, href } from '@/lib/paths'
import { placeHref, placeKey, savedPlaces, units } from '@/store/places'
import ThemeToggle from '@/components/ThemeToggle'

interface LayoutProps {
  children?: ComponentChildren
}

const rowClass = (isActive: boolean) =>
  `flex items-center gap-2 border-b border-void-line px-3 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors last:border-b-0 ${
    isActive ? 'bg-lime text-accent-ink' : 'text-ink hover:bg-void'
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      class={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="m3.5 6 4.5 4.5L12.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const location = useLocation()
  const { query } = location
  const path = appPath(location.path)
  const activeKey =
    path === '/place' && query.lat && query.lon
      ? placeKey({ latitude: Number(query.lat), longitude: Number(query.lon) })
      : undefined

  const current =
    path === '/search'
      ? { icon: <SearchIcon />, label: 'Search cities' }
      : path === '/place'
        ? { icon: null, label: query.name || 'Place' }
        : { icon: <LocationIcon />, label: 'Here' }

  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Close after navigating, on Escape, and on a tap anywhere outside the menu.
  useEffect(() => setOpen(false), [location.url])
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div class="flex min-h-dvh flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <nav
        ref={navRef}
        class="sticky top-0 z-20 border-b border-void-line/80 bg-void/85 backdrop-blur"
      >
        <div class="mx-auto flex max-w-xl items-center gap-2 px-4 py-3">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="place-menu"
            onClick={() => setOpen(!open)}
            class="flex min-w-0 flex-1 items-center gap-2 border border-void-line px-3 py-1.5 text-left font-mono text-xs uppercase tracking-widest transition-colors hover:border-lime"
          >
            {current.icon}
            <span class="min-w-0 flex-1 truncate">{current.label}</span>
            <ChevronIcon open={open} />
          </button>
          <a
            href={href('/search')}
            aria-label="Search cities"
            class={`flex shrink-0 items-center border px-2.5 py-1.5 transition-colors ${
              path === '/search'
                ? 'border-lime bg-lime text-accent-ink'
                : 'border-void-line text-ink-dim hover:border-lime hover:text-ink'
            }`}
          >
            <SearchIcon />
          </a>
          <UnitsToggle />
        </div>
        {open && (
          <div id="place-menu" class="absolute inset-x-0 top-full">
            <div class="mx-auto max-w-xl px-4">
              <div
                onClick={() => setOpen(false)}
                class="max-h-[60dvh] overflow-y-auto border border-void-line bg-void-raised shadow-2xl"
              >
                <a href={href('/')} class={rowClass(path === '/')}>
                  <LocationIcon />
                  Here
                </a>
                {savedPlaces.value.map((place) => (
                  <a
                    key={placeKey(place)}
                    href={placeHref(place)}
                    class={rowClass(activeKey === placeKey(place))}
                  >
                    <span class="min-w-0 truncate">{place.name}</span>
                    {place.detail && (
                      <span class="min-w-0 truncate text-[0.65rem] normal-case tracking-normal opacity-60">
                        {place.detail}
                      </span>
                    )}
                  </a>
                ))}
                <a href={href('/search')} class={rowClass(path === '/search')}>
                  <SearchIcon />
                  Search cities
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main class="mx-auto w-full max-w-xl flex-1 px-4 py-4">{children}</main>

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
