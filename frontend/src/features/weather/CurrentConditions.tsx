import type { ComponentChildren } from 'preact'
import type { Forecast } from '@/lib/openMeteo'
import { describeWeather } from '@/lib/weatherCodes'
import { units } from '@/store/places'
import WeatherIcon from './WeatherIcon'
import { compass, formatClock, formatTemp, precipUnit, windUnit } from './format'

function Stat({ label, children }: { label: string; children: ComponentChildren }) {
  return (
    <div class="bg-void-raised/80 px-3.5 py-2.5">
      <dt class="font-mono text-[0.65rem] uppercase tracking-widest text-ink-dim">{label}</dt>
      <dd class="mt-0.5 text-[0.95rem] text-ink">{children}</dd>
    </div>
  )
}

export default function CurrentConditions({ forecast }: { forecast: Forecast }) {
  const { current, daily } = forecast
  const { label, sky } = describeWeather(current.weather_code)
  const u = units.value

  return (
    <section aria-label="Current conditions">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="font-display text-[5.25rem] leading-none font-light tracking-tight text-ink">
            {formatTemp(current.temperature_2m)}
          </p>
          <p class="mt-1 font-display text-xl italic text-ink">{label}</p>
          <p class="mt-1 font-mono text-xs text-ink-dim">
            H {formatTemp(daily.temperature_2m_max[0])} · L{' '}
            {formatTemp(daily.temperature_2m_min[0])} · Feels{' '}
            {formatTemp(current.apparent_temperature)}
          </p>
        </div>
        <WeatherIcon sky={sky} isDay={current.is_day === 1} class="h-24 w-24 shrink-0" />
      </div>

      <dl class="mt-5 grid grid-cols-2 gap-px border border-void-line bg-void-line">
        <Stat label="Wind">
          {Math.round(current.wind_speed_10m)} {windUnit(u)}{' '}
          <span class="text-ink-dim">{compass(current.wind_direction_10m)}</span>
          <span class="block font-mono text-xs text-ink-dim">
            Gusts {Math.round(current.wind_gusts_10m)}
          </span>
        </Stat>
        <Stat label="Rain today">
          {daily.precipitation_probability_max[0] ?? 0}%
          <span class="block font-mono text-xs text-ink-dim">
            {daily.precipitation_sum[0].toFixed(u === 'imperial' ? 2 : 1)} {precipUnit(u)}
          </span>
        </Stat>
        <Stat label="Sun">
          ↑ {formatClock(daily.sunrise[0])}
          <span class="block text-ink">↓ {formatClock(daily.sunset[0])}</span>
        </Stat>
        <Stat label="Humidity · UV">
          {current.relative_humidity_2m}%
          <span class="block text-ink">UV {Math.round(daily.uv_index_max[0])}</span>
        </Stat>
      </dl>
    </section>
  )
}
