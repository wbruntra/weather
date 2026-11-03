/**
 * Reverse geocoding through OpenStreetMap's Nominatim, which Open-Meteo lacks.
 * Usage policy (https://operations.osmfoundation.org/policies/nominatim/): at most
 * one request per second, identified by the browser's Referer. Callers look a
 * position up once and cache the result.
 */

interface ReverseResult {
  name?: string
  address?: Partial<
    Record<
      'city' | 'town' | 'village' | 'municipality' | 'hamlet' | 'county' | 'state' | 'country',
      string
    >
  >
}

/** Names the town at a position, or undefined if Nominatim finds nothing there (e.g. at sea). */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{ name: string; detail?: string } | undefined> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    // Two decimals (~1 km) is plenty to name a town and keeps the exact position private.
    lat: latitude.toFixed(2),
    lon: longitude.toFixed(2),
    // City/town level, rather than the nearest street.
    zoom: '10',
    'accept-language': navigator.language,
  })
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`)
  if (!response.ok) throw new Error(`Reverse geocoding failed (${response.status})`)

  const { name, address = {} } = (await response.json()) as ReverseResult
  const town =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.hamlet ??
    name
  if (!town) return undefined
  return {
    name: town,
    detail: [address.state, address.country].filter(Boolean).join(', ') || undefined,
  }
}
