import type { MiddlewareHandler } from 'hono'

// Morgan "dev" style logger
// Format: :method :url :status :response-time ms - :res[content-length]

const colorize = {
  reset: '\x1b[0m',
  green: '\x1b[32m', // 2xx
  yellow: '\x1b[33m', // 3xx
  cyan: '\x1b[36m', // 1xx, info
  red: '\x1b[31m', // 4xx, 5xx
}

function getStatusColor(status: number): string {
  if (status >= 500) return colorize.red
  if (status >= 400) return colorize.red
  if (status >= 300) return colorize.yellow
  if (status >= 200) return colorize.green
  return colorize.cyan
}

/** Silenced under `bun test` so request noise does not bury assertion output. */
const enabled = process.env.NODE_ENV !== 'test'

export const withLogging: MiddlewareHandler = async (c, next) => {
  if (!enabled) return next()

  const start = Date.now()
  const method = c.req.method
  const pathname = new URL(c.req.url).pathname

  try {
    await next()
    const duration = Date.now() - start
    const status = c.res.status
    const contentLength = c.res.headers.get('content-length') || '-'
    const statusColor = getStatusColor(status)

    console.log(
      `${method} ${pathname} ${statusColor}${status}${colorize.reset} ${duration}ms - ${contentLength}`,
    )
  } catch (error) {
    const duration = Date.now() - start
    console.log(`${method} ${pathname} ${colorize.red}500${colorize.reset} ${duration}ms - -`)
    throw error
  }
}
