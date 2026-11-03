import { useLocation } from 'preact-iso'
import WeatherView from '@/features/weather/WeatherView'
import type { Place } from '@/lib/openMeteo'
import { href } from '@/lib/paths'
import { placeKey } from '@/store/places'

/** Weather for any place, addressed by URL so the back button and links work. */
export default function PlacePage() {
  const { query } = useLocation()
  const latitude = Number(query.lat)
  const longitude = Number(query.lon)

  if (!query.lat || !query.lon || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return (
      <p class="text-sm text-ink-dim">
        That place link is incomplete.{' '}
        <a href={href('/search')} class="text-lime underline">
          Search for a city
        </a>
        .
      </p>
    )
  }

  const place: Place = {
    name: query.name || 'Unnamed place',
    detail: query.detail || undefined,
    latitude,
    longitude,
  }
  // Keyed so switching cities replays the entrance animation and resets state.
  return <WeatherView key={placeKey(place)} place={place} />
}
