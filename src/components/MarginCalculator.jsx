/* eslint-disable prettier/prettier */
/**
 * MarginCalculator - Visual margin and profit calculator with scheme support
 */
import { TrendingUp, Percent, IndianRupee, Tag } from 'lucide-react'
import { calculateMarginWithScheme } from '../utils/schemeCalculator'

const MarginCalculator = ({ ptr, mrp, scheme, gst = 0, compact = false }) => {
  if (!ptr || !mrp || ptr === 0 || mrp === 0) {
    return null
  }

  const margins = calculateMarginWithScheme(ptr, mrp, scheme)
  const hasScheme = scheme && margins.effectiveMargin !== margins.basicMargin

  // Colors based on margin
  const getMarginColor = (margin) => {
    if (margin < 5) return { color: '#dc2626', bg: '#fee2e2', border: '#fecaca' }
    if (margin < 10) return { color: '#d97706', bg: '#fef3c7', border: '#fde68a' }
    if (margin < 20) return { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' }
    return { color: '#0891b2', bg: '#e0f2fe', border: '#bae6fd' }
  }

  const basicColors = getMarginColor(margins.basicMargin)
  const effectiveColors = hasScheme ? getMarginColor(margins.effectiveMargin) : basicColors

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 10px',
          background: effectiveColors.bg,
          border: `1px solid ${effectiveColors.border}`,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          color: effectiveColors.color,
        }}
      >
        <Percent size={12} />
        {hasScheme ? margins.effectiveMargin : margins.basicMargin}%
        {hasScheme && (
          <span style={{ fontSize: 10, fontWeight: 400 }}>
            (Base: {margins.basicMargin}%)
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: 14,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <TrendingUp size={16} color="#0c3b73" />
        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Margin Analysis</h4>
      </div>

      {/* Basic Margin */}
      <div style={{ marginBottom: hasScheme ? 10 : 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Basic Margin</span>
          <div
            style={{
              padding: '3px 10px',
              background: basicColors.bg,
              border: `1px solid ${basicColors.border}`,
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              color: basicColors.color,
            }}
          >
            {margins.basicMargin}%
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
          <span>PTR: ₹{Number(ptr).toFixed(2)}</span>
          <span>MRP: ₹{Number(mrp).toFixed(2)}</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
          Profit: ₹{margins.profitPerUnit} per unit
        </div>
      </div>

      {/* Scheme Applied Margin */}
      {hasScheme && (
        <>
          <div
            style={{
              margin: '10px 0',
              height: 1,
              background: 'linear-gradient(to right, #e5e7eb, transparent)',
            }}
          />
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Tag size={12} color="#7c3aed" />
              <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
                {scheme}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Effective Margin</span>
              <div
                style={{
                  padding: '3px 10px',
                  background: effectiveColors.bg,
                  border: `1px solid ${effectiveColors.border}`,
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 800,
                  color: effectiveColors.color,
                }}
              >
                {margins.effectiveMargin}%
              </div>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
              Profit: ₹{margins.effectiveProfitPerUnit} per unit
            </div>
            {margins.additionalProfit > 0 && (
              <div
                style={{
                  marginTop: 6,
                  padding: '6px 10px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#166534',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IndianRupee size={11} />
                Additional profit: ₹{margins.additionalProfit} per unit
              </div>
            )}
          </div>
        </>
      )}

      {/* GST Information (if provided) */}
      {gst > 0 && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid #f3f4f6',
            fontSize: 11,
            color: '#6b7280',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>GST ({gst}%)</span>
            <span style={{ fontWeight: 600 }}>
              ₹{((mrp * gst) / (100 + gst)).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarginCalculator
