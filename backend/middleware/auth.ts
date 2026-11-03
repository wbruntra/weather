import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { authService, type TokenPayload } from '../services/authService'

/**
 * Variables added to the Hono context by `requireAuth`. Declaring them here and
 * threading `AppEnv` through `new Hono<AppEnv>()` makes `c.get("user")`
 * type-safe at every call site.
 */
export type AppEnv = {
  Variables: {
    user: TokenPayload
  }
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token
}

/**
 * Rejects unauthenticated requests and exposes the decoded token as
 * `c.get("user")` for downstream handlers.
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = extractBearerToken(c.req.header('authorization'))

  if (!token) {
    throw new HTTPException(401, { message: 'Authorization token required' })
  }

  const payload = authService.verifyToken(token)
  if (!payload) {
    throw new HTTPException(401, { message: 'Invalid or expired token' })
  }

  c.set('user', payload)
  await next()
})
