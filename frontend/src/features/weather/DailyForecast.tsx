import type { Forecast } from '@/lib/openMeteo'
import { describeWeather } from '@/lib/weatherCodes'
import WeatherIcon from './WeatherIcon'
import { formatTemp, formatWeekday } from './format'

export default function DailyForecast({ forecast }: { forecast: Forecast }) {
  const { daily } = forecast
  // Scale every day's low–high bar against the week's overall range.
  const weekLow = Math.min(...daily.temperature_2m_min)
  const weekHigh = Math.max(...daily.temperature_2m_max)
  const span = Math.max(weekHigh - weekLow, 1)

  return (
    <section aria-labelledby="daily-heading">
      <h2
        id="daily-heading"
        class="mb-3 font-mono text-[0.65rem] uppercase tracking-widest text-ink-dim"
      >
        7 days
      </h2>
      <ol class="divide-y divide-void-line border border-void-line bg-void-raised/80">
        {daily.time.map((day, i) => {
          const { label, sky } = describeWeather(daily.weather_code[i])
          const low = daily.temperature_2m_min[i]
          const high = daily.temperature_2m_max[i]
          const rain = daily.precipitation_probability_max[i] ?? 0
          return (
            <li
              key={day}
              class="grid grid-cols-[3rem_2rem_2.5rem_1fr] items-center gap-3 px-4 py-3"
            >
              <span class="text-ink">{i === 0 ? 'Today' : formatWeekday(day)}</span>
              <WeatherIcon sky={sky} class="h-7 w-7" />
              <span class={`font-mono text-xs ${rain >= 20 ? 'text-sky' : 'text-ink-dim/60'}`}>
                {rain}%
              </span>
              <span class="flex items-center gap-2" title={label}>
                <span class="w-8 text-right font-mono text-sm text-ink-dim">
                  {formatTemp(low)}
                </span>
                <span class="relative h-1 flex-1 bg-void-line">
                  <span
                    class="absolute inset-y-0 bg-gradient-to-r from-sky to-sun"
                    style={{
                      left: `${((low - weekLow) / span) * 100}%`,
                      right: `${((weekHigh - high) / span) * 100}%`,
                    }}
                  />
                </span>
                <span class="w-8 font-mono text-sm text-ink">{formatTemp(high)}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
