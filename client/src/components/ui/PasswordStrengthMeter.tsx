import React, { useMemo } from 'react'
import { Check, X } from 'lucide-react'

export interface PasswordRule {
  id: string
  label: string
  met: boolean
}

export interface PasswordStrengthResult {
  score: number // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | ''
  color: string
  rules: PasswordRule[]
  isValid: boolean
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: '',
      color: 'var(--border-default)',
      rules: [
        { id: 'length', label: '8+ characters', met: false },
        { id: 'letters', label: 'Uppercase and lowercase letters', met: false },
        { id: 'number', label: 'At least one number', met: false },
        { id: 'special', label: 'At least one symbol', met: false },
      ],
      isValid: false,
    }
  }

  const hasLength = password.length >= 8
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  const rules: PasswordRule[] = [
    { id: 'length', label: '8+ characters', met: hasLength },
    { id: 'letters', label: 'Uppercase and lowercase letters', met: hasMixedCase },
    { id: 'number', label: 'At least one number', met: hasNumber },
    { id: 'special', label: 'At least one symbol', met: hasSpecial },
  ]

  const metCount = rules.filter((r) => r.met).length

  let score = 1
  let label: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak'
  let color = 'var(--status-danger)'

  if (!hasLength) {
    score = 1
    label = 'Weak'
    color = 'var(--status-danger)'
  } else if (metCount <= 2) {
    score = 2
    label = 'Fair'
    color = 'var(--status-warning)'
  } else if (metCount === 3) {
    score = 3
    label = 'Good'
    color = 'var(--brand-primary)'
  } else {
    score = 4
    label = 'Strong'
    color = 'var(--status-online)'
  }

  return {
    score,
    label,
    color,
    rules,
    isValid: hasLength,
  }
}

interface PasswordStrengthMeterProps {
  password: string
  showRules?: boolean
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showRules = true,
}) => {
  const result = useMemo(() => evaluatePasswordStrength(password), [password])

  if (!password) {
    return null
  }

  return (
    <div
      role="meter"
      aria-label="Password strength"
      aria-valuenow={result.score}
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuetext={result.label || 'Empty'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginTop: 6,
        marginBottom: 4,
      }}
    >
      {/* Progress Track and Status Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {[1, 2, 3, 4].map((step) => {
            const isFilled = result.score >= step
            return (
              <div
                key={step}
                style={{
                  height: 4,
                  flex: 1,
                  borderRadius: 2,
                  background: isFilled ? result.color : 'var(--bg-subtle)',
                  border: isFilled ? 'none' : '1px solid var(--border-default)',
                  transition: 'background-color 0.25s ease, border-color 0.25s ease',
                }}
              />
            )
          })}
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            color: result.color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            minWidth: 46,
            textAlign: 'right',
            transition: 'color 0.25s ease',
          }}
        >
          {result.label}
        </span>
      </div>

      {/* Dynamic Requirements Checklist */}
      {showRules && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 4,
            paddingTop: 4,
          }}
        >
          {result.rules.map((rule) => (
            <div
              key={rule.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontFamily: 'var(--font-sans)',
                color: rule.met ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'color 0.2s ease',
              }}
            >
              {rule.met ? (
                <Check size={12} color="var(--status-online)" strokeWidth={2.5} />
              ) : (
                <X size={12} color="var(--text-muted)" strokeWidth={2} />
              )}
              <span
                style={{
                  textDecoration: rule.met ? 'none' : 'none',
                }}
              >
                {rule.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PasswordStrengthMeter
