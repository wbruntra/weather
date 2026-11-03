import type { ComponentChildren } from 'preact'
import type { Place } from '@/lib/openMeteo'
import { isSaved, toggleSaved } from '@/store/places'
import CurrentConditions from './CurrentConditions'
import DailyForecast from './DailyForecast'
import HourlyForecast from './HourlyForecast'
import { useForecast } from './useForecast'

interface WeatherViewProps {
  place: Place
  /** Shown under the place name, e.g. location status. */
  note?: ComponentChildren
  /** Whether the place can be starred; "My location" moves, so it cannot. */
  saveable?: boolean
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" class="h-5 w-5" aria-hidden="true">
      <path
        d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function WeatherView({ place, note, saveable = true }: WeatherViewProps) {
  const { data, error, isPending, isFetching, refetch } = useForecast(place)
  const saved = saveable && isSaved(place)

  return (
    <div class="animate-rise space-y-6">
      <header class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h1 class="truncate font-display text-2xl text-ink">{place.name}</h1>
          {place.detail && <p class="truncate text-sm text-ink-dim">{place.detail}</p>}
          {note && <p class="mt-1 font-mono text-xs text-ink-dim">{note}</p>}
        </div>
        {saveable && (
          <button
            type="button"
            onClick={() => toggleSaved(place)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${place.name} from saved` : `Save ${place.name}`}
            class={`shrink-0 border p-2 transition-colors ${
              saved
                ? 'border-sun/60 text-sun'
                : 'border-void-line text-ink-dim hover:border-sun/60 hover:text-sun'
            }`}
          >
            <StarIcon filled={saved} />
          </button>
        )}
      </header>

      {isPending ? (
        <p class="font-mono text-xs uppercase tracking-widest text-ink-dim">Loading forecast…</p>
      ) : error && !data ? (
        <div class="border border-flame/40 bg-flame/10 p-4">
          <p class="text-sm text-flame">Couldn't load the forecast: {error.message}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            class="mt-3 font-mono text-xs uppercase tracking-widest text-ink underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <CurrentConditions forecast={data} />
          <HourlyForecast forecast={data} />
          <DailyForecast forecast={data} />
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            class="font-mono text-[0.65rem] uppercase tracking-widest text-ink-dim hover:text-ink disabled:opacity-50"
          >
            {isFetching ? 'Refreshing…' : error ? 'Offline — tap to retry' : 'Refresh'}
          </button>
        </>
      )}
    </div>
  )
}
