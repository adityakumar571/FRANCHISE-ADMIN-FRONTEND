/**
 * SubscriptionWarningBanner
 *
 * Displays a sticky top banner for the highest-priority active subscription warning.
 * Reads from useSubscriptionStatus hook — no additional API calls.
 *
 * Warning priority order (highest → lowest):
 *  1. NO_SUBSCRIPTION
 *  2. EXPIRED
 *  3. PAYMENT_OVERDUE
 *  4. TRIAL_EXPIRING_SOON
 *  5. EXPIRING_SOON
 *  6. PAYMENT_UNPAID
 */

import { useState } from 'react'

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconCard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

// ─── Warning definitions ──────────────────────────────────────────────────────

const WARNINGS = {
  NO_SUBSCRIPTION: {
    bg: '#fef2f2', border: '#fca5a5', textColor: '#7f1d1d',
    Icon: IconAlert,
    priority: 1,
    message: () =>
      'Your account has not been activated yet. Please contact the administrator to set up your subscription.',
  },
  EXPIRED: {
    bg: '#fef2f2', border: '#fca5a5', textColor: '#7f1d1d',
    Icon: IconAlert,
    priority: 2,
    message: (d) =>
      `Your subscription expired on ${fmt(d.endDate)}. Access to some features may be limited. Contact your administrator to renew.`,
  },
  PAYMENT_OVERDUE: {
    bg: '#fef2f2', border: '#fca5a5', textColor: '#7f1d1d',
    Icon: IconCard,
    priority: 3,
    message: (d) =>
      `Payment is overdue since ${fmt(d.dueDate)}. Access will be suspended after the grace period. Please clear the payment immediately.`,
  },
  TRIAL_EXPIRING_SOON: {
    bg: '#fffbeb', border: '#fde68a', textColor: '#78350f',
    Icon: IconClock,
    priority: 4,
    message: (d) =>
      `Your free trial expires in ${d.daysLeft} day${d.daysLeft === 1 ? '' : 's'}. Contact your administrator to activate a paid plan before access is lost.`,
  },
  EXPIRING_SOON: {
    bg: '#fffbeb', border: '#fde68a', textColor: '#78350f',
    Icon: IconClock,
    priority: 5,
    message: (d) =>
      `Your subscription expires in ${d.daysLeft} day${d.daysLeft === 1 ? '' : 's'} (${fmt(d.endDate)}). Contact your administrator to renew before it lapses.`,
  },
  PAYMENT_UNPAID: {
    bg: '#fff7ed', border: '#fdba74', textColor: '#7c2d12',
    Icon: IconCard,
    priority: 6,
    message: () =>
      'Subscription payment has not been received yet. Please contact your administrator to confirm payment.',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubscriptionWarningBanner({ subscriptionStatus }) {
  const [dismissed, setDismissed] = useState({})

  if (!subscriptionStatus || subscriptionStatus.loading) return null

  const warnings = subscriptionStatus.warnings ?? []
  if (!warnings.length) return null

  const active = warnings
    .map((key) => ({ key, ...(WARNINGS[key] ?? null) }))
    .filter((w) => w.priority && !dismissed[w.key])
    .sort((a, b) => a.priority - b.priority)

  if (!active.length) return null

  const top    = active[0]
  const { Icon } = top

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background:     top.bg,
        borderBottom:   `2px solid ${top.border}`,
        color:          top.textColor,
        padding:        '9px 16px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            12,
        position:       'sticky',
        top:            0,
        zIndex:         1050,
        boxShadow:      '0 2px 6px rgba(0,0,0,0.07)',
        fontSize:       13,
        lineHeight:     1.5,
      }}
    >
      {/* ── Left: icon + message ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
        <span style={{ marginTop: 1, flexShrink: 0, color: top.textColor }}>
          <Icon />
        </span>
        <span style={{ fontWeight: 500 }}>
          {top.message(subscriptionStatus)}
        </span>
      </div>

      {/* ── Right: extra count + dismiss ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {active.length > 1 && (
          <span
            style={{
              fontSize:     11,
              fontWeight:   600,
              background:   top.border,
              color:        top.textColor,
              borderRadius: 20,
              padding:      '2px 8px',
              whiteSpace:   'nowrap',
            }}
          >
            +{active.length - 1} more issue{active.length > 2 ? 's' : ''}
          </span>
        )}
        <button
          aria-label="Dismiss this warning"
          onClick={() => setDismissed((prev) => ({ ...prev, [top.key]: true }))}
          style={{
            background:   'none',
            border:       'none',
            cursor:       'pointer',
            color:        top.textColor,
            opacity:      0.6,
            display:      'flex',
            alignItems:   'center',
            padding:      4,
            borderRadius: 4,
            transition:   'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
        >
          <IconX />
        </button>
      </div>
    </div>
  )
}
