import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { ROUTES } from '../../../app/routes'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { OtpInput } from '../../../components/ui/OtpInput'
import { useAuth } from '../hooks/useAuth'
import styles from './ResetPasswordForm.module.css'

const resetSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address'),
    code: z.string().length(6, 'Verification code must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPassword, isLoading, error: authError, clearError } = useAuth()

  const initialEmail = searchParams.get('email') || ''
  const isEmailPrepopulated = Boolean(initialEmail)
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSuccess, setIsSuccess] = useState(false)

  // Calculate password strength
  function getPasswordStrength(pwd: string): { score: number; label: string } {
    if (!pwd) return { score: 0, label: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 1) return { score: 1, label: 'Weak' }
    if (score <= 3) return { score: 2, label: 'Moderate' }
    return { score: 3, label: 'Strong' }
  }

  const strength = getPasswordStrength(newPassword)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearError()

    const result = resetSchema.safeParse({
      email,
      code,
      newPassword,
      confirmPassword,
    })

    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})

    try {
      await resetPassword({
        email: result.data.email,
        code: result.data.code,
        newPassword: result.data.newPassword,
      })
      setIsSuccess(true)
    } catch {
      // Backend error shown through authError
    }
  }

  return (
    <div className={styles.form}>
      {!isSuccess ? (
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.header}>
            <div className={styles.iconBadge}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-1-1l-3 3m2-2l-3 3m-4 1l-1 1-2-2-4 4 2 2-3 3 2 2 3-3 2 2 4-4-2-2 1-1" />
              </svg>
            </div>
            <h1 className={styles.title}>Reset your password</h1>
            <p className={styles.subtitle}>
              Enter the 6-digit verification code sent to your email and pick a secure new password.
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
              value={email}
              error={fieldErrors.email}
              hint={
                isEmailPrepopulated
                  ? 'Account email locked for this password reset session'
                  : undefined
              }
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: '' }))
                }
                if (authError) clearError()
              }}
              disabled={isLoading || isEmailPrepopulated}
              rightElement={
                isEmailPrepopulated ? (
                  <button
                    type="button"
                    className={styles.changeEmailBtn}
                    onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                    title="Change email address"
                  >
                    Change
                  </button>
                ) : undefined
              }
            />

            <div className={styles.otpSection}>
              <label className={styles.fieldLabel}>Verification code</label>
              <OtpInput
                length={6}
                value={code}
                onChange={(val) => {
                  setCode(val)
                  if (fieldErrors.code) {
                    setFieldErrors((prev) => ({ ...prev, code: '' }))
                  }
                  if (authError) clearError()
                }}
                disabled={isLoading}
                hasError={Boolean(fieldErrors.code)}
                aria-describedby={fieldErrors.code ? 'code-error' : undefined}
              />
              {fieldErrors.code && (
                <span
                  id="code-error"
                  className={styles.alertIcon}
                  style={{ color: 'var(--color-danger)', fontSize: 12 }}
                  role="alert"
                >
                  {fieldErrors.code}
                </span>
              )}
            </div>

            <Input
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              label="New password"
              placeholder="••••••••"
              value={newPassword}
              error={fieldErrors.newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (fieldErrors.newPassword) {
                  setFieldErrors((prev) => ({ ...prev, newPassword: '' }))
                }
                if (authError) clearError()
              }}
              disabled={isLoading}
              rightElement={
                <button
                  type="button"
                  className={styles.toggleVisibility}
                  onClick={() => setShowPassword(!showPassword)}
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

            {newPassword && (
              <div className={styles.strengthMeter}>
                <div className={styles.strengthBars}>
                  <div className={[styles.bar, strength.score >= 1 ? styles.barWeak : ''].join(' ')} />
                  <div className={[styles.bar, strength.score >= 2 ? styles.barMedium : ''].join(' ')} />
                  <div className={[styles.bar, strength.score >= 3 ? styles.barStrong : ''].join(' ')} />
                </div>
                <span className={styles.strengthLabel}>Password strength: {strength.label}</span>
              </div>
            )}

            <Input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              label="Confirm new password"
              placeholder="••••••••"
              value={confirmPassword}
              error={fieldErrors.confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }))
                }
                if (authError) clearError()
              }}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            Reset Password
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
          <h2 className={styles.successTitle}>Password reset successful!</h2>
          <p className={styles.successDesc}>
            Your password has been securely updated. You can now sign in to your ModelX workspace.
          </p>

          <Button size="lg" onClick={() => navigate(ROUTES.LOGIN)} className={styles.submitBtn}>
            Sign in with New Password
          </Button>
        </div>
      )}
    </div>
  )
}
