import { db, type User, type NewUser } from '@scaffold/database'

/** A user safe to return over the API — never includes the password hash. */
export type PublicUser = Omit<User, 'passwordHash'>

/**
 * Explicit column list rather than `selectAll()`, so a future sensitive
 * column added to the schema is not silently exposed through the API.
 */
const publicColumns = ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'] as const

export const userService = {
  async getAllUsers(): Promise<PublicUser[]> {
    return db.selectFrom('users').select(publicColumns).orderBy('id').execute()
  },

  async getUserById(id: number): Promise<PublicUser | undefined> {
    return db.selectFrom('users').select(publicColumns).where('id', '=', id).executeTakeFirst()
  },

  /** Includes the password hash — for authentication only, never for responses. */
  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst()
  },

  async createUser(userData: Pick<NewUser, 'name' | 'email' | 'passwordHash'>): Promise<User> {
    const inserted = await db
      .insertInto('users')
      .values(userData)
      .returningAll()
      .executeTakeFirst()

    if (!inserted) {
      throw new Error('Failed to create user')
    }

    return inserted
  },
}
