/** CLI entry point: `bun run db:migrate`. */
import { dbPath } from './db'
import { runMigrations } from './migrator'

await runMigrations()

console.log(`Migrations applied to ${dbPath}`)
