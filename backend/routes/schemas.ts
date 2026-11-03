import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  email: z.email('A valid email is required').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
})

export const signinSchema = z.object({
  email: z.email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
})

export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    done: z.boolean(),
  })
  .partial()
  .refine((v) => v.title !== undefined || v.done !== undefined, 'Nothing to update')

export const todoIdParam = z.object({ id: z.coerce.number().int().positive() })

export type SignupInput = z.infer<typeof signupSchema>
export type SigninInput = z.infer<typeof signinSchema>
