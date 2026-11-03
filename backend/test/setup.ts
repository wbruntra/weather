/**
 * Preloaded before every test file (see bunfig.toml).
 *
 * Each run gets its own throwaway SQLite file built from migrations, so tests
 * never read the development database and never depend on leftover state from
 * a previous run. The environment must be configured before anything imports
 * @scaffold/database, which resolves its path at module load.
 */
import { afterAll } from 'bun:test'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const testDbPath = join(tmpdir(), `scaffold-test-${process.pid}-${Date.now()}.sqlite3`)

process.env.NODE_ENV = 'test'
process.env.DB_URL = testDbPath
process.env.JWT_SECRET ||= 'test-only-secret'

// Imported dynamically so the env vars above are set first.
const { runMigrations } = await import('@scaffold/database')

await runMigrations()

afterAll(() => {
  for (const suffix of ['', '-shm', '-wal']) {
    rmSync(`${testDbPath}${suffix}`, { force: true })
  }
})
