/**
 * The app may be served from a subpath (GitHub Pages serves it at /weather/),
 * set at build time through Vite's `base`. Every in-app URL goes through
 * `href`, and route comparisons go through `appPath`, so nothing hard-codes "/".
 */
const BASE = import.meta.env.BASE_URL // always ends with "/"

/** Prefixes an app path ("/search") with the deployment base ("/weather/search"). */
export const href = (path: string) => BASE + path.replace(/^\//, '')

/** Strips the deployment base from a location path, giving the app path ("/search"). */
export function appPath(locationPath: string) {
  const path = `${locationPath.replace(/\/$/, '')}/`.startsWith(BASE)
    ? locationPath.slice(BASE.length - 1)
    : locationPath
  return path.replace(/\/$/, '') || '/'
}
