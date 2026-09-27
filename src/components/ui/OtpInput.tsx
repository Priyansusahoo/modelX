import {
  useRef,
  useState,
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
  'aria-describedby'?: string
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
  'aria-describedby': ariaDescribedBy,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const [prevValue, setPrevValue] = useState(value)
  const [prevLength, setPrevLength] = useState(length)
  const [slots, setSlots] = useState<string[]>(() =>
    Array.from({ length }, (_, i) => value[i] || ''),
  )

  if (value !== prevValue || length !== prevLength) {
    setPrevValue(value)
    setPrevLength(length)
    setSlots(Array.from({ length }, (_, i) => value[i] || ''))
  }

  function focusInput(index: number) {
    const target = inputsRef.current[index]
    if (target) {
      target.focus()
      target.select()
    }
  }

  function updateSlots(nextSlots: string[], focusIndex?: number) {
    setSlots(nextSlots)
    const joined = nextSlots.join('')
    onChange(joined)

    if (focusIndex !== undefined && focusIndex >= 0 && focusIndex < length) {
      focusInput(focusIndex)
    }

    if (nextSlots.length === length && nextSlots.every(Boolean) && onComplete) {
      onComplete(joined)
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>, index: number) {
    const rawVal = e.target.value
    const cleanDigits = rawVal.replace(/\D/g, '')

    if (!cleanDigits) {
      const nextSlots = [...slots]
      nextSlots[index] = ''
      updateSlots(nextSlots)
      return
    }

    const char = cleanDigits[cleanDigits.length - 1]
    const nextSlots = [...slots]
    nextSlots[index] = char
    const nextFocusIndex = index < length - 1 ? index + 1 : index
    updateSlots(nextSlots, nextFocusIndex)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number) {
    if (disabled) return

    if (e.key === 'Backspace') {
      if (!slots[index] && index > 0) {
        e.preventDefault()
        const nextSlots = [...slots]
        nextSlots[index - 1] = ''
        updateSlots(nextSlots, index - 1)
      } else if (slots[index]) {
        e.preventDefault()
        const nextSlots = [...slots]
        nextSlots[index] = ''
        updateSlots(nextSlots)
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
      const nextSlots = Array.from({ length }, (_, i) => numericData[i] || '')
      const nextFocusIndex = Math.min(numericData.length, length - 1)
      updateSlots(nextSlots, nextFocusIndex)
    }
  }

  return (
    <div
      className={[styles.container, className ?? ''].filter(Boolean).join(' ')}
      role="group"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {slots.map((digit, index) => (
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
          aria-invalid={hasError}
          aria-describedby={ariaDescribedBy}
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
