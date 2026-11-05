import type { Forecast } from '@/lib/openMeteo'
import { describeWeather } from '@/lib/weatherCodes'
import WeatherIcon from './WeatherIcon'
import WindGlyph from './WindGlyph'
import { formatHour, formatTemp } from './format'

const HOURS = 24

export default function HourlyForecast({ forecast }: { forecast: Forecast }) {
  const { hourly, current } = forecast
  // Both are place-local wall-clock strings, so the current hour's slot is the
  // one sharing current.time's "YYYY-MM-DDTHH" prefix.
  const start = Math.max(
    0,
    hourly.time.findIndex((t) => t.slice(0, 13) === current.time.slice(0, 13)),
  )
  const hours = hourly.time.slice(start, start + HOURS).map((time, i) => ({
    time,
    temp: hourly.temperature_2m[start + i],
    sky: describeWeather(hourly.weather_code[start + i]).sky,
    isDay: hourly.is_day[start + i] === 1,
    rain: hourly.precipitation_probability[start + i] ?? 0,
    wind: hourly.wind_speed_10m[start + i],
  }))

  return (
    <section aria-labelledby="hourly-heading">
      <h2
        id="hourly-heading"
        class="mb-2 font-mono text-[0.65rem] uppercase tracking-widest text-ink-dim"
      >
        Next 24 hours
      </h2>
      <ol class="-mx-4 flex snap-x gap-px overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        {hours.map((h, i) => (
          <li
            key={h.time}
            class="flex w-14 shrink-0 snap-start flex-col items-center gap-1.5 border border-void-line bg-void-raised/80 py-2.5"
          >
            <span class="font-mono text-[0.7rem] text-ink-dim">
              {i === 0 ? 'Now' : formatHour(h.time)}
            </span>
            <WeatherIcon sky={h.sky} isDay={h.isDay} class="h-6 w-6" />
            <span class="text-base text-ink">{formatTemp(h.temp)}</span>
            {/* Rain chance as a small bar so wet hours stand out at a glance. */}
            <span class="flex h-7 w-full flex-col items-center justify-end gap-1">
              <span
                class="w-1.5 bg-sky"
                style={{ height: `${Math.max(h.rain, 2) / 5}px`, opacity: h.rain ? 1 : 0.3 }}
              />
              <span class={`font-mono text-[0.65rem] ${h.rain ? 'text-sky' : 'text-ink-dim/60'}`}>
                {h.rain}%
              </span>
            </span>
            <span class="flex items-center gap-0.5 font-mono text-[0.65rem] text-ink-dim">
              <WindGlyph />
              {Math.round(h.wind)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
