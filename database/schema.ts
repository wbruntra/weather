import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface UsersTable {
  id: Generated<number>
  name: string
  email: string
  passwordHash: string
  role: ColumnType<string, string | undefined, string>
  // Defaulted by the migration's `(CURRENT_TIMESTAMP)` expression; the app
  // never writes these columns, so there is no update type.
  createdAt: ColumnType<string | null, string | undefined, never>
  updatedAt: ColumnType<string | null, string | undefined, never>
}

export interface TodosTable {
  id: Generated<number>
  userId: number
  title: string
  // 0 or 1 — SQLite has no boolean column type.
  done: ColumnType<number, number | undefined, number>
  createdAt: ColumnType<string | null, string | undefined, never>
}

export interface DB {
  users: UsersTable
  todos: TodosTable
}

export type User = Selectable<UsersTable>
export type NewUser = Insertable<UsersTable>
export type UserUpdate = Updateable<UsersTable>

export type Todo = Selectable<TodosTable>
export type NewTodo = Insertable<TodosTable>
