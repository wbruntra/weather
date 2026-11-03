import { CamelCasePlugin, Kysely } from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-dialects'
import { Database } from 'bun:sqlite'
import type { DB } from './schema'
import { resolveDbPath } from './paths'

export const dbPath = resolveDbPath()

const sqlite = new Database(dbPath, { create: true })

// WAL gives markedly better concurrent read performance and is the right
// default for a server process holding a long-lived connection.
sqlite.run('PRAGMA journal_mode = WAL;')
sqlite.run('PRAGMA foreign_keys = ON;')

export const db = new Kysely<DB>({
  dialect: new BunSqliteDialect({ database: sqlite }),
  // Table/column names in schema.ts and migrations stay snake_case in SQLite;
  // this maps them to the camelCase fields the rest of the app reads/writes.
  plugins: [new CamelCasePlugin()],
})

export { sqlite }
