import { BACKEND_LOCAL_PORT } from '@scaffold/shared/config'
import app from './app'

export type { AppType } from './app'

const server = Bun.serve({
  port: BACKEND_LOCAL_PORT,
  fetch: app.fetch,
})

console.log(`Backend listening on http://localhost:${server.port}`)

// PM2 sends SIGINT on restart/reload and SIGTERM on stop; without handling
// these the process dies mid-request and can leave the port held open,
// causing the next start to fail or race the old process for it.
function shutdown() {
  server.stop()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
