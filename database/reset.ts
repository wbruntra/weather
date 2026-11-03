/**
 * Drops the SQLite database file and rebuilds it from migrations + seed.
 * Development convenience — never point this at production data.
 */
import { $ } from 'bun'
import { unlink } from 'node:fs/promises'
import { resolveDbPath } from './paths'

const dbPath = resolveDbPath()

if (process.env.NODE_ENV === 'production') {
  throw new Error('db:reset refuses to run with NODE_ENV=production')
}

for (const suffix of ['', '-shm', '-wal']) {
  await unlink(`${dbPath}${suffix}`).catch(() => {})
}
console.log(`Dropped ${dbPath}`)

await $`bun run ./migrate.ts`
await $`bun run ./seed.ts`
