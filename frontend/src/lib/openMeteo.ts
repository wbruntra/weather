/**
 * Client for the Open-Meteo forecast and geocoding APIs (https://open-meteo.com).
 * Both are keyless and CORS-enabled, so the browser calls them directly rather
 * than going through the backend.
 */

export type Units = 'metric' | 'imperial'

export interface Place {
  name: string
  /** Region and country, e.g. "Oregon, United States". */
  detail?: string
  latitude: number
  longitude: number
}

export class WeatherApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'WeatherApiError'
    this.status = status
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    // Open-Meteo reports failures as { error: true, reason: string }.
    const body = (await response.json().catch(() => null)) as { reason?: string } | null
    throw new WeatherApiError(
      body?.reason ?? `Request failed (${response.status})`,
      response.status,
    )
  }
  return (await response.json()) as T
}

interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({ name: query, count: '10', language: 'en', format: 'json' })
  const body = await getJson<{ results?: GeocodingResult[] }>(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    signal,
  )
  return (body.results ?? []).map((r) => ({
    name: r.name,
    detail: [r.admin1, r.country].filter(Boolean).join(', ') || undefined,
    latitude: r.latitude,
    longitude: r.longitude,
  }))
}

const CURRENT = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'weather_code',
  'is_day',
  'precipitation',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
] as const

const HOURLY = [
  'temperature_2m',
  'weather_code',
  'is_day',
  'precipitation_probability',
  'wind_speed_10m',
] as const

const DAILY = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'precipitation_sum',
  'wind_speed_10m_max',
  'sunrise',
  'sunset',
  'uv_index_max',
] as const

type Series<K extends string> = { time: string[] } & Record<K, number[]>

/**
 * Times are local to the place (`timezone=auto`) and carry no offset, e.g.
 * "2026-11-03T14:00". Compare them as strings; never pass them to `new Date`
 * expecting the viewer's timezone.
 */
export interface Forecast {
  timezone: string
  current: { time: string } & Record<(typeof CURRENT)[number], number>
  hourly: Series<(typeof HOURLY)[number]>
  daily: Omit<Series<(typeof DAILY)[number]>, 'sunrise' | 'sunset'> & {
    sunrise: string[]
    sunset: string[]
  }
}

export function fetchForecast(place: Place, units: Units, signal?: AbortSignal) {
  const params = new URLSearchParams({
    latitude: place.latitude.toFixed(4),
    longitude: place.longitude.toFixed(4),
    current: CURRENT.join(','),
    hourly: HOURLY.join(','),
    daily: DAILY.join(','),
    timezone: 'auto',
    forecast_days: '7',
  })
  if (units === 'imperial') {
    params.set('temperature_unit', 'fahrenheit')
    params.set('wind_speed_unit', 'mph')
    params.set('precipitation_unit', 'inch')
  }
  return getJson<Forecast>(`https://api.open-meteo.com/v1/forecast?${params}`, signal)
}
