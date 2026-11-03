import { render } from 'preact'
import { LocationProvider } from 'preact-iso'
import { QueryClientProvider } from '@tanstack/preact-query'
import { queryClient } from '@/lib/queryClient'
import { locate } from '@/store/places'
import App from '@/App.tsx'
import '@/styles/app.css'

locate()

// The service worker caches the app shell and last forecasts so the installed
// app opens offline. Skipped in dev, where it would serve stale modules.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js')
}

render(
  <QueryClientProvider client={queryClient}>
    <LocationProvider>
      <App />
    </LocationProvider>
  </QueryClientProvider>,
  document.getElementById('root')!,
)
