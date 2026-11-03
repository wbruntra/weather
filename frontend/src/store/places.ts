import { effect, signal } from '@preact/signals'
import type { Place, Units } from '@/lib/openMeteo'
import { reverseGeocode } from '@/lib/nominatim'
import { href } from '@/lib/paths'

const SAVED_KEY = 'weather-saved-places'
const UNITS_KEY = 'weather-units'
const LAST_POSITION_KEY = 'weather-last-position'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode, quota); the app still works for this session.
  }
}

/** Two places within ~1 km are treated as the same place. */
export function placeKey(place: Pick<Place, 'latitude' | 'longitude'>) {
  return `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`
}

export function placeHref(place: Place) {
  const params = new URLSearchParams({
    lat: place.latitude.toFixed(4),
    lon: place.longitude.toFixed(4),
    name: place.name,
  })
  if (place.detail) params.set('detail', place.detail)
  return `${href('/place')}?${params}`
}

// --- Saved cities ----------------------------------------------------------

export const savedPlaces = signal<Place[]>(load(SAVED_KEY, []))
effect(() => persist(SAVED_KEY, savedPlaces.value))

export function isSaved(place: Place) {
  const key = placeKey(place)
  return savedPlaces.value.some((p) => placeKey(p) === key)
}

export function toggleSaved(place: Place) {
  const key = placeKey(place)
  savedPlaces.value = isSaved(place)
    ? savedPlaces.value.filter((p) => placeKey(p) !== key)
    : [...savedPlaces.value, place]
}

// --- Units -----------------------------------------------------------------

/** Countries that use Fahrenheit and mph. */
const IMPERIAL_REGIONS = new Set(['US', 'LR', 'MM'])

function defaultUnits(): Units {
  const region = new Intl.Locale(navigator.language).maximize().region
  return region && IMPERIAL_REGIONS.has(region) ? 'imperial' : 'metric'
}

export const units = signal<Units>(load(UNITS_KEY, defaultUnits()))
effect(() => persist(UNITS_KEY, units.value))

// --- Device location -------------------------------------------------------

export type LocationState =
  | { status: 'locating'; place?: Place }
  | { status: 'ready'; place: Place }
  | { status: 'unavailable'; reason: string; place?: Place }

/** Shown until the position has been named, or if naming it fails. */
const UNNAMED = 'My location'

const lastPosition = load<Place | undefined>(LAST_POSITION_KEY, undefined)

/** Replaces the placeholder name with the town at the position, if one is found. */
async function nameMyLocation(place: Place) {
  const found = await reverseGeocode(place.latitude, place.longitude).catch(() => undefined)
  const current = myLocation.value
  // Skip if the position moved on while the lookup was in flight.
  if (!found || !current.place || placeKey(current.place) !== placeKey(place)) return
  const named = { ...current.place, ...found }
  persist(LAST_POSITION_KEY, named)
  myLocation.value = { ...current, place: named }
}

// Start from the last known position so the app renders instantly on launch,
// then refresh it in the background.
export const myLocation = signal<LocationState>({ status: 'locating', place: lastPosition })

export function locate() {
  const previous = myLocation.value.place
  if (!('geolocation' in navigator)) {
    myLocation.value = {
      status: 'unavailable',
      reason: 'Location is not supported',
      place: previous,
    }
    return
  }
  myLocation.value = { status: 'locating', place: previous }
  // Callbacks read the state when they fire, not `previous`: another locate() may
  // have finished in the meantime, and its result must not be overwritten.
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const position = { latitude: coords.latitude, longitude: coords.longitude }
      const latest = myLocation.value.place
      // Still within ~1 km of the last lookup: keep its town name.
      const known = latest && placeKey(latest) === placeKey(position) ? latest : undefined
      const place: Place =
        known && known.name !== UNNAMED
          ? { ...known, ...position }
          : { name: UNNAMED, ...position }
      persist(LAST_POSITION_KEY, place)
      myLocation.value = { status: 'ready', place }
      if (place.name === UNNAMED) void nameMyLocation(place)
    },
    (error) => {
      // A newer request already succeeded; this stale failure changes nothing.
      if (myLocation.value.status === 'ready') return
      const reason =
        error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied'
          : 'Could not determine your location'
      myLocation.value = { status: 'unavailable', reason, place: myLocation.value.place }
    },
    { maximumAge: 10 * 60 * 1000, timeout: 15_000 },
  )
}
