# Database Migrations

Kysely over SQLite, using `bun:sqlite` directly (via `kysely-bun-dialects`) —
no native-module database driver.

## Workflow

```bash
# 1. Scaffold a migration file
bun run db:generate add_something

# 2. Fill in up()/down() in the new file under database/migrations/
# 3. Apply pending migrations
bun run db:migrate
```

Run both from the repo root. Kysely has no schema-diffing tool like
`drizzle-kit generate` — there is no `schema.ts` to diff against, so every
migration is hand-written. `database/schema.ts` only holds the TypeScript
`Database` interface used for query type-checking; it does not generate SQL
and editing it has no effect on the database.

## Why not `drizzle-kit` / `better-sqlite3`-backed tools?

Any tool that drives SQLite through `better-sqlite3` — a native Node addon —
fails whenever the Node ABI it was compiled against drifts:

```
NODE_MODULE_VERSION 137. This version of Node.js requires NODE_MODULE_VERSION 147.
```

`database/db.ts` opens the database with `bun:sqlite` and wraps it with
`kysely-bun-dialects`' `BunSqliteDialect`, so there is no native dependency at
all. `database/migrator.ts` runs migrations through Kysely's own `Migrator` +
`FileMigrationProvider` against that same connection.

## Writing a migration

```ts
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('widgets')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull())
    // Wrap SQL expressions in `sql` — a bare string default is stored literally.
    .addColumn('created_at', 'text', (col) => col.defaultTo(sql`(CURRENT_TIMESTAMP)`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('widgets').execute()
}
```

Always use `Kysely<any>` in migration files, never the app's `DB` type — a
migration must keep working even after `schema.ts` changes later. See
[Kysely's migration docs](https://kysely.dev/docs/migrations) for the full
schema-builder API (`alterTable`, `createIndex`, etc.).

## Keeping `schema.ts` in sync

After writing a migration, update `database/schema.ts` by hand so the query
builder's types match the new columns:

```ts
export interface WidgetsTable {
  id: Generated<number>
  name: string
  createdAt: ColumnType<string | null, string | undefined, never>
}

export interface DB {
  users: UsersTable
  widgets: WidgetsTable
}
```

Table interfaces use camelCase field names even though the actual SQLite
columns are snake_case — `database/db.ts` registers Kysely's `CamelCasePlugin`,
which translates both directions automatically.

## Adding a column

Add it in a new migration with `alterTable`, then add the field to the
matching table interface in `schema.ts`. Provide a default so existing rows
get a valid value:

```ts
// migration
await db.schema
  .alterTable('users')
  .addColumn('role', 'text', (col) => col.notNull().defaultTo('user'))
  .execute()
```

## Rules

- Commit migration files under `database/migrations/` — together with
  `schema.ts` they are the schema history.
- Never edit a migration that has been applied anywhere but your own machine;
  add a new one instead.
- Keep one logical change per migration.
- `bun run db:reset` rebuilds the database from scratch (development only; it
  refuses to run with `NODE_ENV=production`).

## Configuration

`database/paths.ts` resolves the database path in this order:

1. `DB_URL`
2. `demo_test.sqlite3` when `NODE_ENV=test`
3. `demo.sqlite3`
