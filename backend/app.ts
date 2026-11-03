import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { config } from './config'
import { withLogging } from './middleware/logger'
import { errorHandler, notFoundHandler } from './lib/errors'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { todoRoutes } from './routes/todos'

/**
 * Builds the application without binding a port, so tests can drive it via
 * `app.request(...)` and the frontend can import `AppType` for RPC typing
 * without pulling in server startup.
 */
const app = new Hono()

app.use('*', withLogging)
app.use('*', secureHeaders())

// In development the Vite proxy makes API calls same-origin, so CORS is only
// needed once the frontend is served from a different host.
if (config.corsOrigins.length > 0) {
  app.use(
    '/api/*',
    cors({
      origin: config.corsOrigins,
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  )
}

/**
 * The route chain is assigned so its type can be exported: `AppType` is what
 * gives the frontend's RPC client end-to-end type safety. Adding a route here
 * automatically propagates its types to the client.
 */
const routes = app
  .get('/api/health', (c) => c.json({ health: 'OK' }))
  .route('/api/auth', authRoutes)
  .route('/api/users', userRoutes)
  .route('/api/todos', todoRoutes)

app.notFound(notFoundHandler)
app.onError(errorHandler)

export type AppType = typeof routes
export { app }
export default app
