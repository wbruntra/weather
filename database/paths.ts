import { join } from 'node:path'

/**
 * Resolution order:
 *   1. DB_URL            — explicit override (tests, CI, alternate environments)
 *   2. demo_test.sqlite3 — when NODE_ENV=test
 *   3. demo.sqlite3      — development default
 *
 * Kept separate from db.ts so tooling can read the path without opening
 * (and thereby creating) the database file.
 */
export function resolveDbPath(): string {
  if (process.env.DB_URL) return process.env.DB_URL
  const file = process.env.NODE_ENV === 'test' ? 'demo_test.sqlite3' : 'demo.sqlite3'
  return join(import.meta.dir, file)
}
