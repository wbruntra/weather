import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { userService } from '../services/userService'
import { authService } from '../services/authService'
import { validate } from '../lib/validate'
import { signinSchema, signupSchema } from './schemas'

/** Cost-matched hash compared against when no user exists (timing equalisation). */
const DUMMY_HASH = await authService.hashPassword('invalid-placeholder-password')

/**
 * Routes are declared as a single chained expression: Hono derives the RPC
 * client's types from the chain, so breaking it apart would erase end-to-end
 * type safety on the frontend.
 */
export const authRoutes = new Hono()
  .post('/signup', validate('json', signupSchema), async (c) => {
    const { name, email, password } = c.req.valid('json')

    if (await userService.getUserByEmail(email)) {
      throw new HTTPException(409, { message: 'Email already registered' })
    }

    const user = await userService.createUser({
      name,
      email,
      passwordHash: await authService.hashPassword(password),
    })

    return c.json(
      {
        message: 'User created successfully',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token: authService.generateToken(user),
      },
      201,
    )
  })

  .post('/signin', validate('json', signinSchema), async (c) => {
    const { email, password } = c.req.valid('json')

    const user = await userService.getUserByEmail(email)

    // Verify even when the user is missing, so response timing does not reveal
    // which emails are registered.
    const passwordMatches = user
      ? await authService.comparePassword(password, user.passwordHash)
      : await authService.comparePassword(password, DUMMY_HASH).then(() => false)

    if (!user || !passwordMatches) {
      throw new HTTPException(401, { message: 'Invalid credentials' })
    }

    return c.json({
      message: 'Sign in successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: authService.generateToken(user),
    })
  })
