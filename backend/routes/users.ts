import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { userService } from '../services/userService'
import { requireAuth, type AppEnv } from '../middleware/auth'

export const userRoutes = new Hono<AppEnv>()
  .use('*', requireAuth)

  .get('/', async (c) => {
    return c.json({ users: await userService.getAllUsers() })
  })

  .get('/me', async (c) => {
    // `user` is populated by requireAuth and typed via AppEnv.
    const { id } = c.get('user')
    const user = await userService.getUserById(id)

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' })
    }

    return c.json({ user })
  })
