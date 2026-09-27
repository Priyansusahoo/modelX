import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../app/routes'
import { Button } from '../../../components/ui/Button'
import { OtpInput } from '../../../components/ui/OtpInput'
import { useAuthStore } from '../../../store/authStore'
import { useAuth } from '../hooks/useAuth'
import styles from './MfaVerifyForm.module.css'

export function MfaVerifyForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    verifyMfa,
    resendMfa,
    isLoading,
    error: authError,
    clearError,
  } = useAuth()

  const storeChallenge = useAuthStore((state) => state.pendingMfaChallenge)
  const challenge =
    storeChallenge || (location.state as any)?.challenge

  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(60)
  const [expiresIn, setExpiresIn] = useState(300) // 5 minutes
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  // Countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  async function handleVerify(e?: FormEvent, completedCode?: string) {
    if (e) e.preventDefault()
    const activeCode = completedCode || code
    if (activeCode.length !== 6 || isLoading || !challenge) return

    clearError()
    setResendMessage(null)

    try {
      await verifyMfa(activeCode, challenge.challengeToken)
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch {
      // Backend error displayed through authError
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || isResending || !challenge) return

    setIsResending(true)
    clearError()
    setResendMessage(null)

    try {
      const result = await resendMfa(challenge.challengeToken)
      setResendMessage(result.message || 'A fresh verification code has been dispatched.')
      setResendCooldown(60)
      setExpiresIn(300)
      setCode('')
    } catch {
      // Handled by authError
    } finally {
      setIsResending(false)
    }
  }

  function handleBackToLogin() {
    useAuthStore.getState().setPendingMfaChallenge(null)
    navigate(ROUTES.LOGIN)
  }

  if (!challenge) {
    return (
      <div className={styles.form}>
        <div className={styles.header}>
          <div className={styles.iconBadge}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className={styles.title}>No Active Challenge</h1>
          <p className={styles.subtitle}>
            We couldn't find an active MFA challenge session. Please sign in with your email and password first.
          </p>
        </div>
        <Button onClick={handleBackToLogin} size="lg" className={styles.submitBtn}>
          Return to Sign in
        </Button>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleVerify} noValidate>
      <div className={styles.header}>
        <div className={styles.iconBadge}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 className={styles.title}>Two-Factor Authentication</h1>
        <p className={styles.subtitle}>
          Enter the 6-digit verification code dispatched to{' '}
          <span className={styles.destination}>
            {challenge.maskedDestination || challenge.email || 'your destination'}
          </span>
        </p>
      </div>

      {resendMessage && (
        <div className={[styles.alert, styles.successAlert].join(' ')} role="status">
          <svg className={styles.alertIcon} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{resendMessage}</span>
        </div>
      )}

      {authError && (
        <div id="mfa-code-error" className={[styles.alert, styles.errorAlert].join(' ')} role="alert">
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

      <div className={styles.otpSection}>
        <OtpInput
          length={6}
          value={code}
          onChange={(val) => {
            setCode(val)
            if (authError) clearError()
          }}
          onComplete={(val) => {
            // Auto submit when all 6 digits entered
            handleVerify(undefined, val)
          }}
          disabled={isLoading || expiresIn === 0}
          hasError={Boolean(authError)}
          aria-describedby={authError ? 'mfa-code-error' : undefined}
        />

        <div className={styles.timerBar}>
          <span className={styles.expiryTimer}>
            <svg className={styles.clockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {expiresIn > 0 ? (
              <span>Expires in {formatTime(expiresIn)}</span>
            ) : (
              <span className={styles.expiredText}>Code has expired</span>
            )}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={isLoading}
        disabled={code.length !== 6 || expiresIn === 0}
        className={styles.submitBtn}
      >
        Verify & Sign In
      </Button>

      <div className={styles.footer}>
        <div className={styles.resendRow}>
          <span>Didn't receive the code?</span>
          <button
            type="button"
            className={styles.resendBtn}
            disabled={resendCooldown > 0 || isResending}
            onClick={handleResend}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : isResending
                ? 'Sending...'
                : 'Resend code'}
          </button>
        </div>

        <button type="button" className={styles.backBtn} onClick={handleBackToLogin}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Sign in with a different account</span>
        </button>
      </div>
    </form>
  )
}
