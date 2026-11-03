import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('role', 'text', (col) => col.notNull().defaultTo('user'))
    // Wrapped in `sql` so SQLite evaluates the expression — a bare string
    // default would store the literal text "CURRENT_TIMESTAMP".
    .addColumn('created_at', 'text', (col) => col.defaultTo(sql`(CURRENT_TIMESTAMP)`))
    .addColumn('updated_at', 'text', (col) => col.defaultTo(sql`(CURRENT_TIMESTAMP)`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute()
}
