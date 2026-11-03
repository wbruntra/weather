import { db, type Todo } from '@scaffold/database'

/** A todo as the API returns it: `done` is a real boolean, not SQLite's 0/1. */
export type PublicTodo = Omit<Todo, 'userId' | 'done'> & { done: boolean }

const columns = ['id', 'title', 'done', 'createdAt'] as const

function toPublic(row: Pick<Todo, (typeof columns)[number]>): PublicTodo {
  return { ...row, done: row.done === 1 }
}

/**
 * Every query is scoped by `userId`, so one user can never read or change
 * another's todos — a missing row and someone else's row look the same.
 */
export const todoService = {
  async list(userId: number): Promise<PublicTodo[]> {
    const rows = await db
      .selectFrom('todos')
      .select(columns)
      .where('userId', '=', userId)
      .orderBy('id')
      .execute()
    return rows.map(toPublic)
  },

  async create(userId: number, title: string): Promise<PublicTodo> {
    const row = await db
      .insertInto('todos')
      .values({ userId, title })
      .returning(columns)
      .executeTakeFirstOrThrow()
    return toPublic(row)
  },

  async update(
    userId: number,
    id: number,
    changes: { title?: string; done?: boolean },
  ): Promise<PublicTodo | undefined> {
    const row = await db
      .updateTable('todos')
      .set({
        ...(changes.title !== undefined && { title: changes.title }),
        ...(changes.done !== undefined && { done: changes.done ? 1 : 0 }),
      })
      .where('id', '=', id)
      .where('userId', '=', userId)
      .returning(columns)
      .executeTakeFirst()
    return row && toPublic(row)
  },

  /** Returns whether a row was actually deleted. */
  async remove(userId: number, id: number): Promise<boolean> {
    const result = await db
      .deleteFrom('todos')
      .where('id', '=', id)
      .where('userId', '=', userId)
      .executeTakeFirst()
    return result.numDeletedRows > 0n
  },
}
