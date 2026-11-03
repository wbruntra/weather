import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { todoService } from '../services/todoService'
import { requireAuth, type AppEnv } from '../middleware/auth'
import { validate } from '../lib/validate'
import { createTodoSchema, todoIdParam, updateTodoSchema } from './schemas'

/** Full CRUD over the signed-in user's own todos. */
export const todoRoutes = new Hono<AppEnv>()
  .use('*', requireAuth)

  // Read
  .get('/', async (c) => {
    return c.json({ todos: await todoService.list(c.get('user').id) })
  })

  // Create
  .post('/', validate('json', createTodoSchema), async (c) => {
    const { title } = c.req.valid('json')
    const todo = await todoService.create(c.get('user').id, title)
    return c.json({ todo }, 201)
  })

  // Update
  .patch('/:id', validate('param', todoIdParam), validate('json', updateTodoSchema), async (c) => {
    const { id } = c.req.valid('param')
    const todo = await todoService.update(c.get('user').id, id, c.req.valid('json'))
    if (!todo) throw new HTTPException(404, { message: 'Todo not found' })
    return c.json({ todo })
  })

  // Delete
  .delete('/:id', validate('param', todoIdParam), async (c) => {
    const { id } = c.req.valid('param')
    if (!(await todoService.remove(c.get('user').id, id))) {
      throw new HTTPException(404, { message: 'Todo not found' })
    }
    return c.json({ deleted: id })
  })
