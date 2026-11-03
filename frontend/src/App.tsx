import { ErrorBoundary, Route, Router } from 'preact-iso'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import PlacePage from '@/pages/PlacePage'
import SearchPage from '@/pages/SearchPage'

export default function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Router>
          <Route path="/" component={HomePage} />
          <Route path="/place" component={PlacePage} />
          <Route path="/search" component={SearchPage} />
          {/* Unknown paths (e.g. a stale bookmark) fall back to local weather. */}
          <Route default component={HomePage} />
        </Router>
      </ErrorBoundary>
    </Layout>
  )
}
