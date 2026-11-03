/** Icon shapes drawn by `WeatherIcon`. */
export type Sky = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunder'

/** WMO weather interpretation codes, as returned in Open-Meteo's `weather_code`. */
const CODES: Record<number, [label: string, sky: Sky]> = {
  0: ['Clear', 'clear'],
  1: ['Mostly clear', 'clear'],
  2: ['Partly cloudy', 'partly'],
  3: ['Overcast', 'cloudy'],
  45: ['Fog', 'fog'],
  48: ['Freezing fog', 'fog'],
  51: ['Light drizzle', 'drizzle'],
  53: ['Drizzle', 'drizzle'],
  55: ['Heavy drizzle', 'drizzle'],
  56: ['Freezing drizzle', 'drizzle'],
  57: ['Freezing drizzle', 'drizzle'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Light showers', 'rain'],
  81: ['Showers', 'rain'],
  82: ['Violent showers', 'rain'],
  85: ['Snow showers', 'snow'],
  86: ['Heavy snow showers', 'snow'],
  95: ['Thunderstorm', 'thunder'],
  96: ['Thunderstorm, hail', 'thunder'],
  99: ['Thunderstorm, hail', 'thunder'],
}

export function describeWeather(code: number): { label: string; sky: Sky } {
  const [label, sky] = CODES[code] ?? ['Unknown', 'cloudy']
  return { label, sky }
}
