import { hc } from 'hono/client'
import type { InferRequestType, InferResponseType } from 'hono/client'
import type { AppType } from '@scaffold/backend'

/**
 * Typed RPC client generated from the backend's route definitions.
 *
 * Request and response shapes are inferred directly from backend/index.ts, so
 * changing a route's payload surfaces as a frontend type error rather than a
 * runtime surprise. Requests go to a relative path; Vite proxies /api to the
 * backend in development (see vite.config.ts).
 */
export const client = hc<AppType>('/')

export const api = client.api

/** Attaches the bearer token when one is present. */
export function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Error envelope produced by backend/lib/errors.ts. */
export interface ApiErrorBody {
  error: {
    message: string
    status: number
    issues?: { field?: string; message: string }[]
  }
}

export class ApiError extends Error {
  // Declared as fields rather than constructor parameter properties, which
  // `erasableSyntaxOnly` disallows.
  status: number
  issues?: { field?: string; message: string }[]

  constructor(message: string, status: number, issues?: { field?: string; message: string }[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.issues = issues
  }
}

/**
 * Unwraps a Hono RPC response, converting the backend's error envelope into a
 * thrown ApiError so callers only deal with success payloads.
 */
// Structural type rather than `Response`: Hono's ClientResponse does not implement
// every member Bun's global Response adds (e.g. `textStream`).
export async function unwrap<T>(response: Pick<Response, 'ok' | 'status' | 'json'>): Promise<T> {
  if (response.ok) return (await response.json()) as T

  let message = `Request failed with status ${response.status}`
  let issues: { field?: string; message: string }[] | undefined

  try {
    const body = (await response.json()) as ApiErrorBody
    if (body?.error?.message) message = body.error.message
    issues = body?.error?.issues
  } catch {
    // Non-JSON error body — keep the status-based message.
  }

  throw new ApiError(message, response.status, issues)
}

export type SignupRequest = InferRequestType<typeof api.auth.signup.$post>['json']
export type SigninRequest = InferRequestType<typeof api.auth.signin.$post>['json']
export type SigninResponse = InferResponseType<typeof api.auth.signin.$post, 200>
export type UsersResponse = InferResponseType<typeof api.users.$get, 200>
export type ApiUser = UsersResponse['users'][number]
export type TodosResponse = InferResponseType<typeof api.todos.$get, 200>
export type ApiTodo = TodosResponse['todos'][number]
