import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../../../app/routes'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { OtpInput } from '../../../components/ui/OtpInput'
import { useAuthStore } from '../../../store/authStore'
import { useAuth } from '../hooks/useAuth'
import styles from './VerifyEmailForm.module.css'

export function VerifyEmailForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    verifyEmail,
    resendEmailVerification,
    isLoading,
    error: authError,
    clearError,
  } = useAuth()

  const storePendingEmail = useAuthStore(
    (state) => state.pendingEmailVerification,
  )
  const initialEmail =
    searchParams.get('email') || storePendingEmail || ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(60)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  // Countdown timer for resend
  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  async function handleVerify(e?: FormEvent, completedCode?: string) {
    if (e) e.preventDefault()
    const activeCode = completedCode || code
    if (!email || activeCode.length !== 6 || isLoading) return

    clearError()
    setResendMessage(null)

    try {
      const result = await verifyEmail({ email, code: activeCode })
      if (result.session) {
        navigate(ROUTES.DASHBOARD, { replace: true })
      } else {
        setIsVerified(true)
      }
    } catch {
      // Backend error displayed through authError
    }
  }

  async function handleResend() {
    if (!email || resendCooldown > 0 || isResending) return

    setIsResending(true)
    clearError()
    setResendMessage(null)

    try {
      const result = await resendEmailVerification(email)
      setResendMessage(result.message || 'Verification code resent successfully.')
      setResendCooldown(60)
      setCode('')
    } catch {
      // Handled by authError
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className={styles.form}>
      {!isVerified ? (
        <form onSubmit={handleVerify} noValidate>
          <div className={styles.header}>
            <div className={styles.iconBadge}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h1 className={styles.title}>Complete your Registration</h1>
            <p className={styles.subtitle}>
              {email ? (
                <>
                  We've sent a 6-digit verification code to{' '}
                  <span className={styles.emailHighlight}>{email}</span>.
                  Enter the code below to activate your ModelX account.
                </>
              ) : (
                'Please enter your email and the 6-digit verification code sent to your inbox to activate your account.'
              )}
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

          {!initialEmail && (
            <div style={{ marginBottom: 16 }}>
              <Input
                name="email"
                type="email"
                label="Email address"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
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
                handleVerify(undefined, val)
              }}
              disabled={isLoading}
              hasError={Boolean(authError)}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            disabled={!email || code.length !== 6}
            className={styles.submitBtn}
          >
            Verify & Complete Registration
          </Button>

          <div className={styles.footer}>
            <div className={styles.resendRow}>
              <span>Didn't receive the code?</span>
              <button
                type="button"
                className={styles.resendBtn}
                disabled={!email || resendCooldown > 0 || isResending}
                onClick={handleResend}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : isResending
                    ? 'Sending...'
                    : 'Resend code'}
              </button>
            </div>

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
          <h2 className={styles.successTitle}>Email Verified!</h2>
          <p className={styles.successDesc}>
            Your email address has been successfully verified. You can now access your account.
          </p>

          <Button size="lg" onClick={() => navigate(ROUTES.LOGIN)} className={styles.submitBtn}>
            Proceed to Sign in
          </Button>
        </div>
      )}
    </div>
  )
}
