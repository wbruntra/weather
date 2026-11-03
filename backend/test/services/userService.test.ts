import { describe, test, expect, beforeEach } from 'bun:test'
import { userService } from '../../services/userService'
import { authService } from '../../services/authService'
import { resetUsers } from '../helpers'

beforeEach(resetUsers)

async function createUser(overrides: Partial<{ name: string; email: string }> = {}) {
  return userService.createUser({
    name: overrides.name ?? 'Ada Lovelace',
    email: overrides.email ?? 'ada@example.com',
    passwordHash: await authService.hashPassword('password123'),
  })
}

describe('userService', () => {
  test('getAllUsers returns an empty array when there are no users', async () => {
    expect(await userService.getAllUsers()).toEqual([])
  })

  test('createUser persists and returns the new row', async () => {
    const user = await createUser()

    expect(user.id).toBeNumber()
    expect(user.email).toBe('ada@example.com')
    expect(user.role).toBe('user')
  })

  test('createUser applies a real timestamp, not a literal string', async () => {
    const user = await createUser()

    expect(user.createdAt).not.toBe('CURRENT_TIMESTAMP')
    expect(Number.isNaN(new Date(user.createdAt!).getTime())).toBe(false)
  })

  test('getAllUsers omits the password hash', async () => {
    await createUser()
    const [user] = await userService.getAllUsers()

    expect(user).not.toHaveProperty('passwordHash')
  })

  test('getUserById returns the matching user', async () => {
    const created = await createUser()
    const found = await userService.getUserById(created.id)

    expect(found?.id).toBe(created.id)
  })

  test('getUserById returns undefined when the id is unknown', async () => {
    expect(await userService.getUserById(9999)).toBeUndefined()
  })

  test('getUserByEmail includes the hash so credentials can be verified', async () => {
    await createUser()
    const user = await userService.getUserByEmail('ada@example.com')

    expect(user?.passwordHash).toBeString()
    expect(await authService.comparePassword('password123', user!.passwordHash)).toBe(true)
  })

  test('getUserByEmail returns undefined for an unknown address', async () => {
    expect(await userService.getUserByEmail('nobody@example.com')).toBeUndefined()
  })

  test('rejects a duplicate email at the database level', async () => {
    await createUser()
    expect(createUser()).rejects.toThrow()
  })
})

describe('authService', () => {
  test('hashing produces a verifiable, non-plaintext value', async () => {
    const hash = await authService.hashPassword('password123')

    expect(hash).not.toBe('password123')
    expect(await authService.comparePassword('password123', hash)).toBe(true)
    expect(await authService.comparePassword('wrong', hash)).toBe(false)
  })

  test('round-trips a token', async () => {
    const user = await createUser()
    const payload = authService.verifyToken(authService.generateToken(user))

    expect(payload?.id).toBe(user.id)
    expect(payload?.email).toBe(user.email)
  })

  test('rejects a tampered token', () => {
    expect(authService.verifyToken('not.a.token')).toBeNull()
  })
})
