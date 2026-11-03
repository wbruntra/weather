import { db } from '@scaffold/database'
import app from '../app'

/** Removes all rows so each test starts from a known state. */
export async function resetUsers() {
  await db.deleteFrom('todos').execute()
  await db.deleteFrom('users').execute()
}

type Json = Record<string, unknown>

/**
 * `Response.json()` is typed `unknown`. Assertions in tests are the check, so
 * this reads the body at a convenient type instead of casting at every site.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJson<T = any>(response: Response): Promise<T> {
  return (await response.json()) as T
}

/** Issues a request against the app in-process — no port binding required. */
export function request(path: string, init: RequestInit = {}) {
  return app.fetch(new Request(`http://localhost${path}`, init))
}

export function postJson(path: string, body: Json, token?: string) {
  return request(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

export function getJson(path: string, token?: string) {
  return request(path, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })
}

export const validSignup = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'password123',
}

/** Creates a user through the public API and returns its auth token. */
export async function createUserAndSignIn(overrides: Partial<typeof validSignup> = {}) {
  const payload = { ...validSignup, ...overrides }
  const response = await postJson('/api/auth/signup', payload)
  const body = (await response.json()) as { token: string; user: { id: number } }
  return { token: body.token, user: body.user, payload }
}
