import { describe, test, expect, beforeEach } from 'bun:test'
import { createUserAndSignIn, getJson, readJson, request, resetUsers } from '../helpers'

beforeEach(resetUsers)

describe('authentication guard', () => {
  test.each([
    ['no header', undefined],
    ['malformed token', 'not-a-jwt'],
  ])('rejects a request with %s', async (_label, token) => {
    const response = await getJson('/api/users', token)
    expect(response.status).toBe(401)
  })

  test('rejects a valid token sent without the Bearer scheme', async () => {
    const { token } = await createUserAndSignIn()
    const response = await request('/api/users', { headers: { authorization: token } })

    expect(response.status).toBe(401)
  })
})

describe('GET /api/users', () => {
  test('returns users for an authenticated caller', async () => {
    const { token } = await createUserAndSignIn()
    const response = await getJson('/api/users', token)

    expect(response.status).toBe(200)
    const { users } = await readJson(response)
    expect(users).toBeArray()
    expect(users).toHaveLength(1)
  })

  test('never exposes password hashes', async () => {
    const { token } = await createUserAndSignIn()
    const response = await getJson('/api/users', token)

    const body = await readJson(response)
    expect(JSON.stringify(body)).not.toContain('passwordHash')
    expect(body.users[0]).not.toHaveProperty('passwordHash')
  })

  test('reflects the number of registered users', async () => {
    const { token } = await createUserAndSignIn()
    await createUserAndSignIn({ email: 'grace@example.com', name: 'Grace Hopper' })

    const { users } = await readJson(await getJson('/api/users', token))
    expect(users).toHaveLength(2)
  })
})

describe('GET /api/users/me', () => {
  test('returns the authenticated user', async () => {
    const { token, payload } = await createUserAndSignIn()
    const response = await getJson('/api/users/me', token)

    expect(response.status).toBe(200)
    const { user } = await readJson(response)
    expect(user.email).toBe(payload.email)
    expect(user).not.toHaveProperty('passwordHash')
  })

  test('requires authentication', async () => {
    expect((await getJson('/api/users/me')).status).toBe(401)
  })
})
