import type { Units } from '@/lib/openMeteo'

/**
 * Open-Meteo returns wall-clock times local to the place with no offset
 * ("2026-11-03T14:00"). Parsing them as UTC and formatting in UTC prints the
 * same wall-clock time regardless of the viewer's own timezone.
 */
function asWallClock(localTime: string) {
  return new Date(`${localTime.length === 10 ? `${localTime}T00:00` : localTime}Z`)
}

const hourFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', timeZone: 'UTC' })
const clockFormat = new Intl.DateTimeFormat(undefined, { timeStyle: 'short', timeZone: 'UTC' })
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' })

export const formatHour = (localTime: string) => hourFormat.format(asWallClock(localTime))
export const formatClock = (localTime: string) => clockFormat.format(asWallClock(localTime))
export const formatWeekday = (localDate: string) => weekdayFormat.format(asWallClock(localDate))

export const formatTemp = (value: number) => `${Math.round(value)}°`

export const windUnit = (units: Units) => (units === 'imperial' ? 'mph' : 'km/h')
export const precipUnit = (units: Units) => (units === 'imperial' ? 'in' : 'mm')

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

/** Meteorological degrees (direction the wind blows *from*) to a compass point. */
export const compass = (degrees: number) => COMPASS[Math.round(degrees / 45) % 8]
