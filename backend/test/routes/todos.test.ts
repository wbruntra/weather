import { describe, test, expect, beforeEach } from 'bun:test'
import { createUserAndSignIn, getJson, postJson, readJson, request, resetUsers } from '../helpers'

beforeEach(resetUsers)

function send(method: 'PATCH' | 'DELETE', path: string, token: string, body?: object) {
  return request(path, {
    method,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function addTodo(token: string, title = 'Ride a camel') {
  const { todo } = await readJson(await postJson('/api/todos', { title }, token))
  return todo
}

describe('todos', () => {
  test('requires authentication', async () => {
    expect((await getJson('/api/todos')).status).toBe(401)
  })

  test('creates, lists, updates and deletes', async () => {
    const { token } = await createUserAndSignIn()

    const created = await postJson('/api/todos', { title: '  See the aurora ' }, token)
    expect(created.status).toBe(201)
    const { todo } = await readJson(created)
    expect(todo).toMatchObject({ title: 'See the aurora', done: false })

    const listed = await readJson(await getJson('/api/todos', token))
    expect(listed.todos).toHaveLength(1)

    const updated = await readJson(
      await send('PATCH', `/api/todos/${todo.id}`, token, { done: true }),
    )
    expect(updated.todo).toMatchObject({ title: 'See the aurora', done: true })

    expect((await send('DELETE', `/api/todos/${todo.id}`, token)).status).toBe(200)
    expect((await readJson(await getJson('/api/todos', token))).todos).toHaveLength(0)
  })

  test('rejects an empty title and an empty update', async () => {
    const { token } = await createUserAndSignIn()
    expect((await postJson('/api/todos', { title: '   ' }, token)).status).toBe(400)

    const todo = await addTodo(token)
    expect((await send('PATCH', `/api/todos/${todo.id}`, token, {})).status).toBe(400)
  })

  test("cannot see, change or delete another user's todo", async () => {
    const owner = await createUserAndSignIn()
    const other = await createUserAndSignIn({ email: 'grace@example.com' })
    const todo = await addTodo(owner.token)

    expect((await readJson(await getJson('/api/todos', other.token))).todos).toHaveLength(0)
    expect(
      (await send('PATCH', `/api/todos/${todo.id}`, other.token, { done: true })).status,
    ).toBe(404)
    expect((await send('DELETE', `/api/todos/${todo.id}`, other.token)).status).toBe(404)
    expect((await readJson(await getJson('/api/todos', owner.token))).todos).toHaveLength(1)
  })

  test('returns 404 for a missing todo', async () => {
    const { token } = await createUserAndSignIn()
    expect((await send('DELETE', '/api/todos/9999', token)).status).toBe(404)
  })
})
