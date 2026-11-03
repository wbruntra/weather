import type { Sky } from '@/lib/weatherCodes'

interface WeatherIconProps {
  sky: Sky
  isDay?: boolean
  class?: string
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const

function Sun({ cx = 12, cy = 12, r = 4 }: { cx?: number; cy?: number; r?: number }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const rad = (deg * Math.PI) / 180
    const [a, b] = [r + 2.2, r + 4]
    return `M${cx + a * Math.cos(rad)} ${cy + a * Math.sin(rad)}L${cx + b * Math.cos(rad)} ${cy + b * Math.sin(rad)}`
  })
  return (
    <g class="text-sun">
      <circle cx={cx} cy={cy} r={r} {...stroke} />
      <path d={rays.join('')} {...stroke} />
    </g>
  )
}

function Moon({ dx = 0, dy = 0 }: { dx?: number; dy?: number }) {
  return (
    <path
      class="text-ink-dim"
      transform={`translate(${dx} ${dy})`}
      d="M17 13.6A6 6 0 1 1 10.4 7a4.7 4.7 0 0 0 6.6 6.6Z"
      {...stroke}
    />
  )
}

/** A cloud whose base sits at y=17. */
const CLOUD = 'M7 17a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6 1.4A3.3 3.3 0 0 1 17 17Z'

function Cloud({ dy = 0, filled = false }: { dy?: number; filled?: boolean }) {
  return (
    <path
      d={CLOUD}
      transform={`translate(0 ${dy})`}
      {...stroke}
      class="text-ink"
      fill={filled ? 'var(--color-void)' : 'none'}
    />
  )
}

function Drops({ count, length }: { count: number; length: number }) {
  const xs = count === 2 ? [10, 14] : [8, 12, 16]
  return (
    <path
      class="text-sky"
      d={xs.map((x) => `M${x} 16.5l-1 ${length}`).join('')}
      {...stroke}
      transform="translate(0 2)"
    />
  )
}

/** Line-art weather icons drawn on a 24×24 grid, matching the theme toggle's stroke style. */
export default function WeatherIcon({ sky, isDay = true, class: className }: WeatherIconProps) {
  return (
    <svg viewBox="0 0 24 24" class={className} aria-hidden="true">
      {sky === 'clear' && (isDay ? <Sun /> : <Moon dx={1} dy={-0.5} />)}
      {sky === 'partly' && (
        <>
          {isDay ? <Sun cx={9} cy={8} r={3} /> : <Moon dx={-3} dy={-3} />}
          <Cloud dy={3} filled />
        </>
      )}
      {sky === 'cloudy' && <Cloud dy={1} />}
      {sky === 'fog' && (
        <>
          <Cloud dy={-3} />
          <path class="text-ink-dim" d="M5 17.5h14M7 20.5h10" {...stroke} />
        </>
      )}
      {sky === 'drizzle' && (
        <>
          <Cloud dy={-3} />
          <Drops count={3} length={1.5} />
        </>
      )}
      {sky === 'rain' && (
        <>
          <Cloud dy={-3} />
          <Drops count={3} length={3.5} />
        </>
      )}
      {sky === 'snow' && (
        <>
          <Cloud dy={-3} />
          <g class="text-ink">
            {[8, 12, 16].map((x, i) => (
              <circle key={x} cx={x} cy={i === 1 ? 21 : 18.5} r={0.9} fill="currentColor" />
            ))}
          </g>
        </>
      )}
      {sky === 'thunder' && (
        <>
          <Cloud dy={-3} />
          <path class="text-sun" d="M12.5 15l-2 3.5h3l-2 3.5" {...stroke} />
        </>
      )}
    </svg>
  )
}
