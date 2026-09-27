import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ROUTES } from '../../../app/routes'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import styles from './LoginForm.module.css'

type AuthMode = 'login' | 'register'

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FieldErrors = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
}

export function LoginForm() {
  const navigate = useNavigate()
  const { login, register, isLoading, error: authError, clearError } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function switchMode(newMode: AuthMode) {
    if (newMode === mode) return
    setMode(newMode)
    setFieldErrors({})
    setSuccessMessage(null)
    clearError()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccessMessage(null)

    if (mode === 'login') {
      const result = loginSchema.safeParse({ email, password })
      if (!result.success) {
        const nextErrors: FieldErrors = {}
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof FieldErrors
          if (field && !nextErrors[field]) {
            nextErrors[field] = issue.message
          }
        }
        setFieldErrors(nextErrors)
        return
      }

      setFieldErrors({})

      try {
        const loginResult = await login(result.data)
        if (loginResult.type === 'MFA_REQUIRED') {
          navigate(ROUTES.MFA_VERIFY, {
            state: { challenge: loginResult.challenge },
          })
        } else {
          navigate(ROUTES.DASHBOARD, { replace: true })
        }
      } catch {
        // Backend error handled by authError
      }
    } else {
      const result = registerSchema.safeParse({ firstName, lastName, email, password })
      if (!result.success) {
        const nextErrors: FieldErrors = {}
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof FieldErrors
          if (field && !nextErrors[field]) {
            nextErrors[field] = issue.message
          }
        }
        setFieldErrors(nextErrors)
        return
      }

      setFieldErrors({})

      try {
        await register(result.data)
        navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(result.data.email)}`)
      } catch {
        // Backend error handled by authError
      }
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <div className={styles.logoBadge}>MX</div>
        <h1 className={styles.title}>
          {mode === 'login' ? 'Sign in to ModelX' : 'Create your ModelX Account'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'login'
            ? 'Enter your credentials to access your eCommerce workspace'
            : 'Get started with your ModelX store and catalog manager'}
        </p>
      </div>

      <div className={styles.tabGroup} role="tablist">
        <div
          className={[
            styles.tabIndicator,
            mode === 'register' ? styles.indicatorRegister : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={[styles.tab, mode === 'login' ? styles.activeTab : ''].join(' ')}
          onClick={() => switchMode('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={[styles.tab, mode === 'register' ? styles.activeTab : ''].join(' ')}
          onClick={() => switchMode('register')}
        >
          Register
        </button>
      </div>

      {successMessage && (
        <div className={styles.successAlert} role="status">
          <svg className={styles.alertIcon} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {authError && (
        <div className={styles.errorAlert} role="alert">
          <svg className={styles.alertIcon} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <span>{authError}</span>
            {/disabled|verify|unverified/i.test(authError) && email && (
              <button
                type="button"
                className={styles.switchModeBtn}
                style={{ marginLeft: 6, textDecoration: 'underline' }}
                onClick={() =>
                  navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(email)}`)
                }
              >
                Verify email now
              </button>
            )}
          </div>
        </div>
      )}

      <div className={styles.fields}>
        <div
          className={[
            styles.collapsibleSection,
            mode === 'register' ? styles.expanded : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.collapsibleInner}>
            <div className={styles.row}>
              <Input
                name="firstName"
                type="text"
                label="First name"
                placeholder="Alex"
                autoComplete="given-name"
                value={firstName}
                error={fieldErrors.firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  if (fieldErrors.firstName) {
                    setFieldErrors((prev) => ({ ...prev, firstName: undefined }))
                  }
                }}
                disabled={isLoading}
              />

              <Input
                name="lastName"
                type="text"
                label="Last name"
                placeholder="Morgan"
                autoComplete="family-name"
                value={lastName}
                error={fieldErrors.lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  if (fieldErrors.lastName) {
                    setFieldErrors((prev) => ({ ...prev, lastName: undefined }))
                  }
                }}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="name@example.com"
          autoComplete="email"
          value={email}
          error={fieldErrors.email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }))
            }
          }}
          disabled={isLoading}
        />

        <Input
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="••••••••"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          error={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }))
            }
          }}
          disabled={isLoading}
          rightElement={
            <button
              type="button"
              className={styles.toggleVisibility}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          }
        />
      </div>

      <div
        className={[
          styles.optionsCollapse,
          mode === 'login' ? styles.optionsExpanded : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.optionsInner}>
          <div className={styles.optionsRow}>
            <label className={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className={styles.forgotPassword}
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={isLoading}
        className={styles.submitBtn}
      >
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>

      <div className={styles.switchModeRow}>
        <span>
          {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
        </span>
        <button
          type="button"
          className={styles.switchModeBtn}
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Register now' : 'Sign in instead'}
        </button>
      </div>
    </form>
  )
}
