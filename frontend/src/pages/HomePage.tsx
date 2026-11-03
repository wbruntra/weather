import WeatherView from '@/features/weather/WeatherView'
import { locate, myLocation, savedPlaces } from '@/store/places'

export default function HomePage() {
  const location = myLocation.value
  const fallback = savedPlaces.value[0]

  if (location.place) {
    return (
      <WeatherView
        key="here"
        place={location.place}
        saveable={false}
        note={
          location.status === 'locating'
            ? 'Updating location…'
            : location.status === 'unavailable'
              ? `${location.reason} — showing your last known location`
              : undefined
        }
      />
    )
  }

  // Narrows the union: a 'ready' state always carries a place, so it was handled above.
  if (location.status !== 'unavailable') {
    return (
      <p class="font-mono text-xs uppercase tracking-widest text-ink-dim">
        Finding your location…
      </p>
    )
  }

  if (fallback) {
    return <WeatherView place={fallback} note={`${location.reason} — showing ${fallback.name}`} />
  }

  return (
    <div class="animate-rise space-y-4">
      <h1 class="font-display text-3xl text-ink">Where are you?</h1>
      <p class="text-sm text-ink-dim">
        {location.reason}. Search for your city and star it — your first saved city is shown here
        whenever your location isn't available.
      </p>
      <div class="flex flex-wrap gap-3">
        <a
          href="/search"
          class="border border-lime bg-lime px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-accent-ink"
        >
          Search cities
        </a>
        <button
          type="button"
          onClick={locate}
          class="border border-void-line px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-ink hover:border-lime hover:text-lime"
        >
          Try location again
        </button>
      </div>
    </div>
  )
}
