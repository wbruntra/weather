// TEMPORARY: design-exploration picker for color palettes and font pairings.
// To remove: delete this folder and the <ThemePicker /> line in App.tsx.
//
// It works by setting CSS variables inline on <html>, which beat the
// :root[data-theme] rules in app.css, so nothing else in the app changes.
import { signal } from '@preact/signals'

interface Palette {
  id: string
  label: string
  ink: string
  inkDim: string
  void: string
  raised: string
  line: string
  accent: string
  accentDim: string
  flame: string
  sky: string
  accentInk: string
  sun: string
}

const p = (
  id: string,
  label: string,
  c: [string, string, string, string, string, string, string, string, string, string, string],
): Palette => ({
  id,
  label,
  ink: c[0],
  inkDim: c[1],
  void: c[2],
  raised: c[3],
  line: c[4],
  accent: c[5],
  accentDim: c[6],
  flame: c[7],
  sky: c[8],
  accentInk: c[9],
  sun: c[10],
})

// Order: ink, inkDim, void, raised, line, accent, accentDim, flame, sky, accentInk, sun
const PALETTES: readonly Palette[] = [
  // Dark
  p('midnight', 'Midnight', [
    '#e6edf7',
    '#8b9bb4',
    '#0b1020',
    '#121a30',
    '#1f2a47',
    '#7aa2ff',
    '#4f73c9',
    '#ff7a7a',
    '#5ad1ff',
    '#0b1020',
    '#ffd166',
  ]),
  p('nord', 'Nord', [
    '#eceff4',
    '#9aa5b8',
    '#2e3440',
    '#3b4252',
    '#4c566a',
    '#88c0d0',
    '#5e81ac',
    '#bf616a',
    '#81a1c1',
    '#2e3440',
    '#ebcb8b',
  ]),
  p('gruvbox', 'Gruvbox', [
    '#ebdbb2',
    '#a89984',
    '#282828',
    '#32302f',
    '#504945',
    '#b8bb26',
    '#98971a',
    '#fb4934',
    '#83a598',
    '#282828',
    '#fabd2f',
  ]),
  p('rose-dusk', 'Rosé dusk', [
    '#f0e6ef',
    '#a99aa8',
    '#1a1423',
    '#241b30',
    '#382b48',
    '#ff8fb1',
    '#c9668a',
    '#ff6b6b',
    '#8fd3ff',
    '#1a1423',
    '#ffd08a',
  ]),
  p('amber', 'Amber CRT', [
    '#ffd9a0',
    '#b08850',
    '#100a02',
    '#1a1105',
    '#33220a',
    '#ffb000',
    '#b37b00',
    '#ff5a36',
    '#ffcf70',
    '#100a02',
    '#ffe08a',
  ]),
  p('mono', 'Mono', [
    '#ffffff',
    '#9a9a9a',
    '#000000',
    '#0f0f0f',
    '#2a2a2a',
    '#ffffff',
    '#bdbdbd',
    '#ff4d4d',
    '#7dd3fc',
    '#000000',
    '#fde047',
  ]),
  // In-between (mid-tone backgrounds)
  p('slate', 'Slate', [
    '#e8ecf1',
    '#a2adb9',
    '#3a4452',
    '#444f5e',
    '#586577',
    '#8fd1c0',
    '#5fa898',
    '#ff8f70',
    '#7cc0f0',
    '#26303b',
    '#f0cd7a',
  ]),
  p('dim', 'Dim', [
    '#cdd9e5',
    '#8b98a7',
    '#22272e',
    '#2d333b',
    '#444c56',
    '#6cb6ff',
    '#4184e4',
    '#f47067',
    '#96d0ff',
    '#1c2128',
    '#daaa3f',
  ]),
  p('twilight', 'Twilight', [
    '#ece9f7',
    '#a9a4c4',
    '#3b3556',
    '#463f66',
    '#5c5483',
    '#ffb86b',
    '#d18f48',
    '#ff7a8a',
    '#7fd0ff',
    '#2a2540',
    '#ffe08a',
  ]),
  p('stone', 'Stone', [
    '#f1ece4',
    '#b5ada1',
    '#4a4640',
    '#55514a',
    '#6b665d',
    '#e8c07a',
    '#b8934f',
    '#f08a6a',
    '#8cc4d8',
    '#2e2b26',
    '#f5d98a',
  ]),
  p('fog', 'Fog', [
    '#1e2733',
    '#566273',
    '#c9d3dd',
    '#dae2ea',
    '#aeb9c6',
    '#2c5fb0',
    '#5a86cf',
    '#b94330',
    '#1d7aa3',
    '#f2f6fa',
    '#94640f',
  ]),
  p('sage', 'Sage', [
    '#1f2a22',
    '#566759',
    '#c3d0bf',
    '#d3ddd0',
    '#a3b49f',
    '#2f6b45',
    '#5a8a6a',
    '#b4452a',
    '#2a6f8c',
    '#eef4ec',
    '#8a6410',
  ]),
  p('sepia', 'Sepia', [
    '#30261b',
    '#6b5a45',
    '#d8c9aa',
    '#e6d9bd',
    '#bfae8c',
    '#5b6b2a',
    '#7f8f45',
    '#a8402a',
    '#2f6a82',
    '#f3ead4',
    '#8c5e12',
  ]),
  // Light
  p('mint', 'Mint', [
    '#12261f',
    '#55705f',
    '#eef7f1',
    '#fcfffd',
    '#cfe3d6',
    '#0f8a5f',
    '#3eac85',
    '#d2492a',
    '#1f7fa6',
    '#ffffff',
    '#b57a06',
  ]),
  p('solar-light', 'Solarized light', [
    '#073642',
    '#586e75',
    '#fdf6e3',
    '#eee8d5',
    '#d9d2bc',
    '#738500',
    '#93a1a1',
    '#cb4b16',
    '#268bd2',
    '#fdf6e3',
    '#b58900',
  ]),
  p('peach', 'Peach', [
    '#2b1a16',
    '#7d625a',
    '#fff3ea',
    '#fffaf6',
    '#f0d5c4',
    '#e0501f',
    '#f08457',
    '#c0312b',
    '#2b7a9b',
    '#fff7f0',
    '#c47a0a',
  ]),
  p('lavender', 'Lavender', [
    '#221b33',
    '#6b6283',
    '#f5f2fc',
    '#ffffff',
    '#ddd5ef',
    '#6c3fd1',
    '#9170e6',
    '#d23f6a',
    '#2b7fc0',
    '#ffffff',
    '#b8760a',
  ]),
]

interface Face {
  name: string
  weights: string
  generic: string
}

interface FontSet {
  id: string
  label: string
  display: Face
  sans: Face
  mono: Face
}

const face = (name: string, weights: string, generic: string): Face => ({ name, weights, generic })

const FONT_SETS: readonly FontSet[] = [
  {
    id: 'grotesk',
    label: 'Space Grotesk',
    display: face('Space Grotesk', '400;500;600;700', 'sans-serif'),
    sans: face('Space Grotesk', '400;500;600;700', 'sans-serif'),
    mono: face('Space Mono', '400;700', 'monospace'),
  },
  {
    id: 'editorial',
    label: 'Playfair + Source',
    display: face('Playfair Display', '400;500;600;700', 'serif'),
    sans: face('Source Sans 3', '400;500;600', 'sans-serif'),
    mono: face('Source Code Pro', '400;500;600', 'monospace'),
  },
  {
    id: 'dm',
    label: 'DM Serif + DM Sans',
    display: face('DM Serif Display', '400', 'serif'),
    sans: face('DM Sans', '400;500;600', 'sans-serif'),
    mono: face('DM Mono', '400;500', 'monospace'),
  },
  {
    id: 'geometric',
    label: 'Sora + Inter',
    display: face('Sora', '400;500;600;700', 'sans-serif'),
    sans: face('Inter', '400;500;600', 'sans-serif'),
    mono: face('JetBrains Mono', '400;500;600', 'monospace'),
  },
  {
    id: 'friendly',
    label: 'Fredoka + Nunito',
    display: face('Fredoka', '400;500;600', 'sans-serif'),
    sans: face('Nunito', '400;500;600', 'sans-serif'),
    mono: face('Roboto Mono', '400;500;600', 'monospace'),
  },
  {
    id: 'swiss',
    label: 'Inter Tight + Plex Mono',
    display: face('Inter Tight', '400;500;600;700', 'sans-serif'),
    sans: face('Inter', '400;500;600', 'sans-serif'),
    mono: face('IBM Plex Mono', '400;500;600', 'monospace'),
  },
  {
    id: 'bricolage',
    label: 'Bricolage + Geist',
    display: face('Bricolage Grotesque', '400;500;600;700', 'sans-serif'),
    sans: face('Instrument Sans', '400;500;600', 'sans-serif'),
    mono: face('Geist Mono', '400;500;600', 'monospace'),
  },
  {
    id: 'all-mono',
    label: 'All mono (JetBrains)',
    display: face('JetBrains Mono', '400;500;600;700', 'monospace'),
    sans: face('JetBrains Mono', '400;500;600', 'monospace'),
    mono: face('JetBrains Mono', '400;500;600', 'monospace'),
  },
  {
    id: 'system',
    label: 'System fonts',
    display: face('', '', 'ui-serif, Georgia, serif'),
    sans: face('', '', 'system-ui, sans-serif'),
    mono: face('', '', 'ui-monospace, SFMono-Regular, Menlo, monospace'),
  },
]

const PALETTE_KEY = 'dev-palette'
const FONTS_KEY = 'dev-fonts'

const root = document.documentElement

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // storage unavailable; the choice just won't survive a reload
  }
}

const COLOR_VARS: Record<string, keyof Palette> = {
  '--color-ink': 'ink',
  '--color-ink-dim': 'inkDim',
  '--color-void': 'void',
  '--color-void-raised': 'raised',
  '--color-void-line': 'line',
  '--color-lime': 'accent',
  '--color-lime-dim': 'accentDim',
  '--color-flame': 'flame',
  '--color-sky': 'sky',
  '--color-accent-ink': 'accentInk',
  '--color-sun': 'sun',
}

const FONT_VARS = ['--font-display', '--font-sans', '--font-mono'] as const

const originalThemeColor = document
  .querySelector('meta[name="theme-color"]')
  ?.getAttribute('content')

function applyPalette(palette: Palette | undefined) {
  for (const [cssVar, key] of Object.entries(COLOR_VARS)) {
    if (palette) root.style.setProperty(cssVar, palette[key as keyof Palette])
    else root.style.removeProperty(cssVar)
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  const color = palette?.void ?? originalThemeColor
  if (color) meta?.setAttribute('content', color)
}

const loadedFonts = new Set<string>()

function loadFonts(set: FontSet) {
  const specs = new Set(
    [set.display, set.sans, set.mono]
      .filter((f) => f.name)
      .map((f) => `family=${f.name.replace(/ /g, '+')}:wght@${f.weights}`),
  )
  const url = `https://fonts.googleapis.com/css2?${[...specs].join('&')}&display=swap`
  if (loadedFonts.has(url)) return
  loadedFonts.add(url)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.append(link)
}

const stack = (f: Face) => (f.name ? `'${f.name}', ${f.generic}` : f.generic)

function applyFonts(set: FontSet | undefined) {
  if (!set) {
    for (const v of FONT_VARS) root.style.removeProperty(v)
    return
  }
  loadFonts(set)
  root.style.setProperty('--font-display', stack(set.display))
  root.style.setProperty('--font-sans', stack(set.sans))
  root.style.setProperty('--font-mono', stack(set.mono))
}

const findPalette = (id: string | null) => PALETTES.find((x) => x.id === id)
const findFonts = (id: string | null) => FONT_SETS.find((x) => x.id === id)

const paletteId = signal<string | null>(findPalette(read(PALETTE_KEY)) ? read(PALETTE_KEY) : null)
const fontsId = signal<string | null>(findFonts(read(FONTS_KEY)) ? read(FONTS_KEY) : null)
const open = signal(false)

// Restore the last choices as soon as this module loads.
applyPalette(findPalette(paletteId.value))
applyFonts(findFonts(fontsId.value))

function choosePalette(id: string | null) {
  paletteId.value = id
  write(PALETTE_KEY, id)
  applyPalette(findPalette(id))
}

function chooseFonts(id: string | null) {
  fontsId.value = id
  write(FONTS_KEY, id)
  applyFonts(findFonts(id))
}

const rowClass = (active: boolean) =>
  `flex w-full items-center gap-2 border px-2 py-1.5 text-left font-mono text-xs transition-colors ${
    active
      ? 'border-lime bg-lime text-accent-ink'
      : 'border-void-line text-ink-dim hover:border-lime hover:text-ink'
  }`

function Swatches({ palette }: { palette: Palette }) {
  return (
    <span
      class="flex shrink-0 overflow-hidden border border-black/20"
      style={{ background: palette.void }}
      aria-hidden="true"
    >
      {[palette.ink, palette.accent, palette.flame, palette.sky, palette.sun].map((color, i) => (
        <span key={i} class="m-0.5 block h-3 w-3" style={{ background: color }} />
      ))}
    </span>
  )
}

export default function ThemePicker() {
  const isOpen = open.value

  return (
    <div class="fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div class="max-h-[70dvh] w-72 max-w-[calc(100vw-1.5rem)] overflow-y-auto border border-void-line bg-void-raised p-3 shadow-2xl">
          <div class="mb-1.5 flex items-center justify-between">
            <h2 class="font-mono text-[0.65rem] tracking-widest text-ink-dim uppercase">Colors</h2>
            <button
              type="button"
              class="font-mono text-[0.65rem] tracking-widest text-ink-dim uppercase hover:text-ink"
              onClick={() => choosePalette(null)}
            >
              Reset
            </button>
          </div>
          <div class="flex flex-col gap-1">
            {PALETTES.map((palette) => (
              <button
                key={palette.id}
                type="button"
                class={rowClass(paletteId.value === palette.id)}
                onClick={() => choosePalette(palette.id)}
              >
                <Swatches palette={palette} />
                {palette.label}
              </button>
            ))}
          </div>

          <div class="mt-4 mb-1.5 flex items-center justify-between">
            <h2 class="font-mono text-[0.65rem] tracking-widest text-ink-dim uppercase">Fonts</h2>
            <button
              type="button"
              class="font-mono text-[0.65rem] tracking-widest text-ink-dim uppercase hover:text-ink"
              onClick={() => chooseFonts(null)}
            >
              Reset
            </button>
          </div>
          <div class="flex flex-col gap-1">
            {FONT_SETS.map((set) => (
              <button
                key={set.id}
                type="button"
                class={rowClass(fontsId.value === set.id)}
                onClick={() => chooseFonts(set.id)}
              >
                {set.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Theme picker"
        onClick={() => (open.value = !isOpen)}
        class="border border-lime bg-lime px-3 py-2 font-mono text-xs tracking-widest text-accent-ink uppercase shadow-lg"
      >
        {isOpen ? 'Close' : 'Theme'}
      </button>
    </div>
  )
}
