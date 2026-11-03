import type { Context, ErrorHandler, NotFoundHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { config } from '../config'

/**
 * Single source of truth for the API error envelope:
 *
 *   { "error": { "message": string, "status": number, ...extra } }
 *
 * Handlers throw `HTTPException` (or anything else) and this shapes the
 * response, so no route needs its own try/catch.
 */
export interface ErrorBody {
  error: {
    message: string
    status: number
    path?: string
    issues?: unknown
  }
}

export const notFoundHandler: NotFoundHandler = (c) =>
  c.json<ErrorBody>(
    {
      error: {
        message: 'Not Found',
        status: 404,
        path: new URL(c.req.url).pathname,
      },
    },
    404,
  )

export const errorHandler: ErrorHandler = (err, c: Context) => {
  if (err instanceof HTTPException) {
    // Validation failures attach their zod issues to `cause`.
    const issues = (err.cause as { issues?: unknown } | undefined)?.issues
    return c.json<ErrorBody>(
      {
        error: {
          message: err.message,
          status: err.status,
          ...(issues ? { issues } : {}),
        },
      },
      err.status,
    )
  }

  // Unexpected failure: log it server-side, but never leak internals to the
  // client in production.
  console.error('Unhandled error:', err)

  return c.json<ErrorBody>(
    {
      error: {
        message: config.isProduction ? 'Internal Server Error' : String(err?.message ?? err),
        status: 500,
      },
    },
    500,
  )
}
