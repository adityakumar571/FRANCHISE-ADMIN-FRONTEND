/* eslint-disable prettier/prettier */
/**
 * PTRInput - Intelligent PTR input with validation
 */
import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { validatePTR, comparePTR } from '../utils/ptrValidation'

const PTRInput = ({
  value,
  onChange,
  mrp,
  lastPTR,
  medicineName,
  disabled = false,
  required = false,
  style = {},
  showMargin = true,
  showComparison = true,
  config = {},
}) => {
  const [validation, setValidation] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (value && mrp) {
      const result = validatePTR(value, mrp, config)
      setValidation(result)

      if (lastPTR && showComparison) {
        const comp = comparePTR(value, lastPTR)
        setComparison(comp)
      }
    } else {
      setValidation(null)
      setComparison(null)
    }
  }, [value, mrp, lastPTR, showComparison, config])

  const handleBlur = () => {
    setTouched(true)
  }

  const hasError = touched && validation && !validation.valid
  const hasWarning = touched && validation && validation.valid && validation.warnings.length > 0

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Input */}
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        placeholder="0.00"
        style={{
          width: '100%',
          padding: '8px 10px',
          border: `2px solid ${
            hasError ? '#dc2626' : hasWarning ? '#d97706' : validation?.valid ? '#16a34a' : '#e5e7eb'
          }`,
          borderRadius: 6,
          fontSize: 13,
          outline: 'none',
          background: disabled ? '#f3f4f6' : '#fff',
          transition: 'border-color 0.2s',
        }}
      />

      {/* Validation Icon */}
      {touched && validation && (
        <div
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          {hasError && <AlertTriangle size={16} color="#dc2626" />}
          {!hasError && hasWarning && <AlertTriangle size={16} color="#d97706" />}
          {validation.valid && !hasWarning && <CheckCircle2 size={16} color="#16a34a" />}
        </div>
      )}

      {/* Error Messages */}
      {touched && validation && validation.errors.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {validation.errors.map((err, idx) => (
            <p
              key={idx}
              style={{
                fontSize: 11,
                color: '#dc2626',
                margin: '2px 0',
                display: 'flex',
                alignItems: 'start',
                gap: 4,
              }}
            >
              <AlertTriangle size={11} style={{ flexShrink: 0, marginTop: 2 }} />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Warning Messages */}
      {touched && validation && validation.warnings.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {validation.warnings.map((warn, idx) => (
            <p
              key={idx}
              style={{
                fontSize: 11,
                color: '#d97706',
                margin: '2px 0',
                display: 'flex',
                alignItems: 'start',
                gap: 4,
              }}
            >
              <Info size={11} style={{ flexShrink: 0, marginTop: 2 }} />
              {warn}
            </p>
          ))}
        </div>
      )}

      {/* Margin Display */}
      {touched && showMargin && validation && validation.margin && validation.valid && (
        <div
          style={{
            marginTop: 6,
            padding: '6px 10px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>Margin:</span>
          <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>{validation.margin}%</span>
        </div>
      )}

      {/* Profit per unit */}
      {touched && showMargin && validation && validation.details?.profitPerUnit && (
        <div style={{ marginTop: 4, fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
          Profit: ₹{validation.details.profitPerUnit} per unit
        </div>
      )}

      {/* Price Comparison */}
      {touched && showComparison && comparison && comparison.changed && (
        <div
          style={{
            marginTop: 6,
            padding: '6px 10px',
            background:
              comparison.severity === 'success'
                ? '#f0fdf4'
                : comparison.severity === 'warning'
                  ? '#fef3c7'
                  : '#eff6ff',
            border: `1px solid ${
              comparison.severity === 'success'
                ? '#bbf7d0'
                : comparison.severity === 'warning'
                  ? '#fde047'
                  : '#bfdbfe'
            }`,
            borderRadius: 6,
            fontSize: 11,
            color:
              comparison.severity === 'success'
                ? '#166534'
                : comparison.severity === 'warning'
                  ? '#92400e'
                  : '#1e3a8a',
            fontWeight: 600,
          }}
        >
          {comparison.message}
        </div>
      )}

      {/* Last Purchase Info */}
      {lastPTR && showComparison && !comparison?.changed && touched && (
        <div style={{ marginTop: 4, fontSize: 11, color: '#6b7280' }}>
          Last purchase: ₹{lastPTR}
        </div>
      )}
    </div>
  )
}

export default PTRInput
