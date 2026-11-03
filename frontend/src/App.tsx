import { ErrorBoundary, Route, Router } from 'preact-iso'
import Layout from '@/components/Layout'
import { href } from '@/lib/paths'
import HomePage from '@/pages/HomePage'
import PlacePage from '@/pages/PlacePage'
import SearchPage from '@/pages/SearchPage'

export default function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Router>
          <Route path={href('/')} component={HomePage} />
          <Route path={href('/place')} component={PlacePage} />
          <Route path={href('/search')} component={SearchPage} />
          {/* Unknown paths (e.g. a stale bookmark) fall back to local weather. */}
          <Route default component={HomePage} />
        </Router>
      </ErrorBoundary>
    </Layout>
  )
}
