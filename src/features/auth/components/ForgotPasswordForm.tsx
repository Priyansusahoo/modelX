import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ROUTES } from '../../../app/routes'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import styles from './ForgotPasswordForm.module.css'

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
})

export function ForgotPasswordForm() {
  const navigate = useNavigate()
  const { forgotPassword, isLoading, error: authError, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearError()

    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message || 'Invalid email')
      return
    }

    setFieldError(null)

    try {
      await forgotPassword({ email: result.data.email })
      setIsSubmitted(true)
    } catch {
      // Backend error displayed via authError
    }
  }

  function handleGoToReset() {
    navigate(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className={styles.form}>
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.header}>
            <div className={styles.iconBadge}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className={styles.title}>Forgot password?</h1>
            <p className={styles.subtitle}>
              No worries! Enter your registered account email and we'll send you a password reset code.
            </p>
          </div>

          {authError && (
            <div className={[styles.alert, styles.errorAlert].join(' ')} role="alert">
              <svg className={styles.alertIcon} viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <div className={styles.fields}>
            <Input
              name="email"
              type="email"
              label="Email address"
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              error={fieldError || undefined}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldError) setFieldError(null)
                if (authError) clearError()
              }}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            Send Reset Code
          </Button>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Sign in</span>
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.successBox}>
          <div className={styles.successBadge}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className={styles.successTitle}>Check your inbox</h2>
          <p className={styles.successDesc}>
            We have sent a verification code to <span className={styles.emailHighlight}>{email}</span>.
            Use it to choose a new password.
          </p>

          <div className={styles.actionRow}>
            <Button size="lg" onClick={handleGoToReset} className={styles.submitBtn}>
              Enter Reset Code & Set Password
            </Button>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => {
                setIsSubmitted(false)
                clearError()
              }}
            >
              Didn't receive email? Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
