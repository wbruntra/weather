/**
 * Validated environment configuration.
 *
 * Importing this module fails fast when required settings are missing, so a
 * misconfigured deployment crashes on boot instead of silently running with an
 * insecure fallback.
 */
const isProduction = process.env.NODE_ENV === 'production'

const DEV_JWT_SECRET = 'dev-only-insecure-secret'

function requireInProduction(name: string, devFallback: string): string {
  const value = process.env[name]
  if (value) return value

  if (isProduction) {
    throw new Error(
      `${name} is required when NODE_ENV=production. Refusing to start with an insecure default.`,
    )
  }

  console.warn(`⚠  ${name} not set — using an insecure development default.`)
  return devFallback
}

export const config = {
  isProduction,
  jwtSecret: requireInProduction('JWT_SECRET', DEV_JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  /** Comma-separated list; empty means same-origin only (dev uses the Vite proxy). */
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
} as const
