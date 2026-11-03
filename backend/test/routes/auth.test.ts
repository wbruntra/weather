import { describe, test, expect, beforeEach } from 'bun:test'
import { postJson, readJson, resetUsers, validSignup } from '../helpers'

beforeEach(resetUsers)

describe('POST /api/auth/signup', () => {
  test('creates a user and returns a token', async () => {
    const response = await postJson('/api/auth/signup', validSignup)
    expect(response.status).toBe(201)

    const body = await readJson(response)
    expect(body.token).toBeString()
    expect(body.user).toMatchObject({ name: validSignup.name, email: validSignup.email })
  })

  test('never returns the password hash', async () => {
    const response = await postJson('/api/auth/signup', validSignup)
    expect(JSON.stringify(await readJson(response))).not.toContain('password')
  })

  test('rejects a duplicate email with 409', async () => {
    await postJson('/api/auth/signup', validSignup)
    const response = await postJson('/api/auth/signup', validSignup)

    expect(response.status).toBe(409)
    expect((await readJson(response)).error.message).toBe('Email already registered')
  })

  test.each([
    ['missing name', { ...validSignup, name: '' }, 'name'],
    ['malformed email', { ...validSignup, email: 'not-an-email' }, 'email'],
    ['short password', { ...validSignup, password: 'short' }, 'password'],
  ])('rejects %s with a field-level issue', async (_label, payload, field) => {
    const response = await postJson('/api/auth/signup', payload)

    expect(response.status).toBe(400)
    const { error } = await readJson(response)
    expect(error.message).toBe('Validation failed')
    expect(error.issues.map((i: { field: string }) => i.field)).toContain(field)
  })
})

describe('POST /api/auth/signin', () => {
  test('returns a token for valid credentials', async () => {
    await postJson('/api/auth/signup', validSignup)
    const response = await postJson('/api/auth/signin', {
      email: validSignup.email,
      password: validSignup.password,
    })

    expect(response.status).toBe(200)
    expect((await readJson(response)).token).toBeString()
  })

  test('rejects a wrong password with 401', async () => {
    await postJson('/api/auth/signup', validSignup)
    const response = await postJson('/api/auth/signin', {
      email: validSignup.email,
      password: 'wrong-password',
    })

    expect(response.status).toBe(401)
  })

  test('uses an identical message for unknown users, so emails cannot be enumerated', async () => {
    await postJson('/api/auth/signup', validSignup)

    const wrongPassword = await postJson('/api/auth/signin', {
      email: validSignup.email,
      password: 'wrong-password',
    })
    const unknownUser = await postJson('/api/auth/signin', {
      email: 'nobody@example.com',
      password: 'wrong-password',
    })

    expect(unknownUser.status).toBe(wrongPassword.status)
    expect((await readJson(unknownUser)).error.message).toBe(
      (await readJson(wrongPassword)).error.message,
    )
  })
})
