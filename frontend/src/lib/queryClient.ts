import { QueryClient } from '@tanstack/preact-query'
import { WeatherApiError } from '@/lib/openMeteo'

/**
 * Client errors (4xx) will not succeed on retry, so fail fast and let the UI
 * show the error; only transient failures are retried.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        !(error instanceof WeatherApiError && error.status < 500) && failureCount < 2,
    },
  },
})
