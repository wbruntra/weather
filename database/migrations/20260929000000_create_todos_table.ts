import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('todos')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('title', 'text', (col) => col.notNull())
    // SQLite has no boolean type; 0/1 by convention.
    .addColumn('done', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'text', (col) => col.defaultTo(sql`(CURRENT_TIMESTAMP)`))
    .execute()

  await db.schema.createIndex('todos_user_id_idx').on('todos').column('user_id').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('todos').execute()
}
