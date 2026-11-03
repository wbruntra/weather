import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { FileMigrationProvider, Migrator } from 'kysely/migration'
import { db } from './db'

/**
 * Applies pending migrations to the connected database.
 *
 * Exported so consumers (the CLI in migrate.ts, the test harness) can run
 * migrations without depending on the CLI script directly. Kysely tracks
 * applied migrations in its own `kysely_migration`/`kysely_migration_lock`
 * tables, created automatically on first run.
 */
export async function runMigrations() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(import.meta.dir, 'migrations'),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  for (const result of results ?? []) {
    if (result.status === 'Success') {
      console.log(`Migration "${result.migrationName}" applied successfully`)
    } else if (result.status === 'Error') {
      console.error(`Migration "${result.migrationName}" failed`)
    }
  }

  if (error) {
    throw error
  }
}
