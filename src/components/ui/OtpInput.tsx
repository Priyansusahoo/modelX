import {
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react'
import styles from './OtpInput.module.css'

export interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  hasError?: boolean
  className?: string
  'aria-label'?: string
}

export function OtpInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  hasError = false,
  className,
  'aria-label': ariaLabel = 'One-time verification code',
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Pad or slice string to array of characters
  const digits = Array.from({ length }, (_, i) => value[i] || '')

  function focusInput(index: number) {
    const target = inputsRef.current[index]
    if (target) {
      target.focus()
      target.select()
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>, index: number) {
    const rawVal = e.target.value
    // Extract only digits
    const cleanDigits = rawVal.replace(/\D/g, '')

    if (!cleanDigits) {
      // Cleared input
      const nextDigits = [...digits]
      nextDigits[index] = ''
      const nextValue = nextDigits.join('')
      onChange(nextValue)
      return
    }

    // Single digit entry
    const char = cleanDigits[cleanDigits.length - 1]
    const nextDigits = [...digits]
    nextDigits[index] = char
    const nextValue = nextDigits.join('')
    onChange(nextValue)

    // Advance focus if not last digit
    if (index < length - 1) {
      focusInput(index + 1)
    }

    // If all digits filled, fire onComplete
    if (nextValue.length === length && onComplete) {
      onComplete(nextValue)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number) {
    if (disabled) return

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current empty, back up and clear previous
        e.preventDefault()
        const nextDigits = [...digits]
        nextDigits[index - 1] = ''
        onChange(nextDigits.join(''))
        focusInput(index - 1)
      } else if (digits[index]) {
        // Clear current
        e.preventDefault()
        const nextDigits = [...digits]
        nextDigits[index] = ''
        onChange(nextDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      focusInput(index + 1)
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    if (disabled) return

    const pasteData = e.clipboardData.getData('text/plain')
    const numericData = pasteData.replace(/\D/g, '').slice(0, length)

    if (numericData.length > 0) {
      onChange(numericData)
      const nextFocusIndex = Math.min(numericData.length, length - 1)
      focusInput(nextFocusIndex)

      if (numericData.length === length && onComplete) {
        onComplete(numericData)
      }
    }
  }

  return (
    <div
      className={[styles.container, className ?? ''].filter(Boolean).join(' ')}
      role="group"
      aria-label={ariaLabel}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete="one-time-code"
          autoFocus={autoFocus && index === 0}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleInputChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={[
            styles.digitInput,
            digit ? styles.hasValue : '',
            hasError ? styles.hasError : '',
            disabled ? styles.disabled : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  )
}
