import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './guards'
import { ROUTES } from './routes'
import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui'

const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const MfaVerifyPage = lazy(() =>
  import('../pages/MfaVerifyPage').then((m) => ({ default: m.MfaVerifyPage }))
)
const ForgotPasswordPage = lazy(() =>
  import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
)
const ResetPasswordPage = lazy(() =>
  import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
)
const VerifyEmailPage = lazy(() =>
  import('../pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage }))
)
const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)

function PageLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '240px',
        width: '100%',
      }}
      role="status"
      aria-label="Loading page"
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          border: '3px solid var(--color-border, #e2e8f0)',
          borderTopColor: 'var(--color-primary, #0f172a)',
          borderRadius: '50%',
          animation: 'spin 600ms linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

interface RouteErrorBoundaryProps {
  children: ReactNode
}

interface RouteErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  override state: RouteErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route chunk load failure:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '2rem',
            textAlign: 'center',
          }}
          role="alert"
        >
          <div
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '2rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--color-border, #e2e8f0)',
              backgroundColor: 'var(--color-surface, #ffffff)',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-text-primary, #0f172a)',
                marginBottom: '0.75rem',
              }}
            >
              Failed to load page
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary, #64748b)',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              A network error occurred while loading this page, or a new version of the app is available.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Button variant="outline" size="sm" onClick={this.handleRetry}>
                Try again
              </Button>
              <Button variant="primary" size="sm" onClick={this.handleReload}>
                Reload application
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <RouteErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.MFA_VERIFY} element={<MfaVerifyPage />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
                <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  )
}

