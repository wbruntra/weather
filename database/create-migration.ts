/**
 * CLI entry point: `bun run db:generate <name>`.
 *
 * Kysely has no schema-diffing tool like `drizzle-kit generate` — migrations
 * are always hand-written. This just scaffolds a timestamped file so
 * migrations sort in the order they were created.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const name = process.argv[2]

if (!name) {
  console.error('Usage: bun run db:generate <migration_name>')
  process.exit(1)
}

const migrationsDir = join(import.meta.dir, 'migrations')
mkdirSync(migrationsDir, { recursive: true })

const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\.\d+Z$/, '')
const fileName = `${timestamp}_${name}.ts`
const filePath = join(migrationsDir, fileName)

writeFileSync(
  filePath,
  `import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {}

export async function down(db: Kysely<any>): Promise<void> {}
`,
)

console.log(`Created migrations/${fileName}`)
