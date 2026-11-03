import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import type { ZodType } from 'zod'
import type { ValidationTargets } from 'hono'

/**
 * `zValidator` with a failure hook, so invalid input produces the same error
 * envelope as every other failure instead of zValidator's raw ZodError dump.
 * Always use this rather than importing zValidator directly.
 */
export function validate<T extends ZodType, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) {
  return zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: 'Validation failed',
        cause: {
          issues: result.error.issues.map((issue) => ({
            field: issue.path.join('.') || undefined,
            message: issue.message,
          })),
        },
      })
    }
  })
}
