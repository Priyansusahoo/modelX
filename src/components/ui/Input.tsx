import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftElement?: ReactNode
  rightElement?: ReactNode
}

export function Input({
  id,
  label,
  error,
  hint,
  className,
  leftElement,
  rightElement,
  ...props
}: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}

      <div
        className={[
          styles.inputWrapper,
          error ? styles.hasError : '',
          props.disabled ? styles.disabled : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {leftElement && <div className={styles.leftElement}>{leftElement}</div>}
        <input
          id={inputId}
          className={[styles.input, className ?? ''].filter(Boolean).join(' ')}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {rightElement && <div className={styles.rightElement}>{rightElement}</div>}
      </div>

      {error ? (
        <span id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}
