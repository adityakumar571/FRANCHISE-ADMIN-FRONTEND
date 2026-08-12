/* eslint-disable prettier/prettier */
/**
 * feeUtils.js
 * ─────────────────────────────────────────────────────────────────
 * Shared fee utility functions used across:
 *   - Admin Fee Collection  (Feecollection.jsx)
 *   - Admin Student Ledger  (StudentLedger.jsx)
 *   - Student Fee Page      (StudentFeeCollection.jsx)
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Derive the row-level status for a ledger period group.
 *
 * Rules (in priority order):
 *  1. WAIVED             — every non-concession item is waived (isWaived: true)
 *  2. CONCESSION         — totalDue=0, has concession item, totalPaid=0
 *  3. PAID               — totalDue=0 (fully settled by payment)
 *  4. PARTIAL_WAIVED     — some items have isWaived/isPartialWaiver (actual waiver)
 *  5. PARTIAL_CONCESSION — some items have concession/partial-concession but no actual waiver
 *  6. PARTIAL            — some paid, some still due
 *  7. DUE                — nothing paid yet
 *
 * NOTE: Concession and Waiver are intentionally kept separate.
 *   - Waiver  → admin manually waived the fee (isWaived / isPartialWaiver flags)
 *   - Concession → fee reduced via concession rule (status CONCESSION / PARTIAL_CONCESSION)
 */
export function getLedgerRowStatus(group) {
  const items = group.items || []

  const regularItems = items.filter((it) => it.type !== 'CONCESSION')
  const hasConcession = items.some((it) => it.type === 'CONCESSION')

  // Actual waiver flags (isWaived / isPartialWaiver set by admin)
  const allWaived = regularItems.length > 0 && regularItems.every((it) => it.isWaived)
  const hasActualWaiver = regularItems.some(
    (it) => it.isWaived || it.isPartialWaiver || it.status === 'PARTIAL_WAIVED'
  )

  // Concession-based reduction (no waiver involved)
  const hasConcessionReduction = regularItems.some(
    (it) => it.status === 'CONCESSION' || it.status === 'PARTIAL_CONCESSION'
  )

  const totalDue  = Number(group.totalDue  || 0)
  const totalPaid = Number(group.totalPaid || 0)

  if (allWaived)                                          return 'WAIVED'
  if (totalDue === 0 && hasConcession && totalPaid === 0) return 'CONCESSION'
  if (totalDue === 0)                                     return 'PAID'
  if (hasActualWaiver)                                    return 'PARTIAL_WAIVED'
  if (hasConcessionReduction)                             return 'PARTIAL_CONCESSION'
  if (totalPaid > 0)                                      return 'PARTIAL'
  return 'DUE'
}

/** Tailwind CSS classes for each row-level status badge. */
export const STATUS_COLORS = {
  PAID:                'bg-green-100 text-green-700',
  CONCESSION:          'bg-blue-100 text-blue-700',
  WAIVED:              'bg-purple-100 text-purple-700',
  PARTIAL_WAIVED:      'bg-violet-100 text-violet-700',
  PARTIAL_CONCESSION:  'bg-blue-50 text-blue-600',
  PARTIAL:             'bg-orange-100 text-orange-700',
  DUE:                 'bg-red-100 text-red-700',
}

/** Human-readable labels for row-level status badges. */
export const STATUS_LABELS = {
  PAID:                'Paid',
  CONCESSION:          'Concession',
  WAIVED:              'Waived',
  PARTIAL_WAIVED:      'Partially Waived',
  PARTIAL_CONCESSION:  'Part. Concession',
  PARTIAL:             'Partially Paid',
  DUE:                 'Unpaid',
}

/**
 * Derive display status for a single fee line item inside a period group.
 *
 * Backend sends item.status based on that item alone — it doesn't know
 * that a CONCESSION entry in the same group has covered the due amount.
 * This function corrects that:
 *   - CONCESSION type items → "Concession" label
 *   - Waived items → "Waived"
 *   - If group.totalDue === 0 and group has concession, but item.status
 *     is still "DUE" → the concession covered it → show "Covered"
 *   - Everything else → readable label from item.status
 *
 * @param {object} item   - single fee line item
 * @param {object} group  - the parent period group
 * @returns {{ label: string, color: string }}
 */
export function getItemDisplayStatus(item, group) {
  if (item.type === 'CONCESSION') {
    return { label: 'Concession', color: 'bg-blue-100 text-blue-700' }
  }

  if (item.isWaived) {
    return { label: 'Waived', color: 'bg-purple-100 text-purple-700' }
  }

  // Partial waiver — some amount was waived but not full
  if (item.isPartialWaiver || item.status === 'PARTIAL_WAIVED') {
    return { label: 'Partially Waived', color: 'bg-violet-100 text-violet-700' }
  }

  // Item backend status is DUE but the whole group is settled via concession
  const groupTotalDue = Number(group?.totalDue || 0)
  const hasConcession = (group?.items || []).some((it) => it.type === 'CONCESSION')
  if (groupTotalDue === 0 && hasConcession && item.status === 'DUE') {
    return { label: 'Covered', color: 'bg-blue-100 text-blue-700' }
  }

  const map = {
    PAID:               { label: 'Paid',              color: 'bg-green-100 text-green-700' },
    PARTIAL:            { label: 'Partially Paid',    color: 'bg-orange-100 text-orange-700' },
    PARTIAL_WAIVED:     { label: 'Partially Waived',  color: 'bg-violet-100 text-violet-700' },
    WAIVED:             { label: 'Waived',            color: 'bg-purple-100 text-purple-700' },
    CONCESSION:         { label: 'Concession',        color: 'bg-blue-100 text-blue-700' },
    PARTIAL_CONCESSION: { label: 'Part. Concession',  color: 'bg-blue-50 text-blue-600' },
    ADJUSTMENT:         { label: 'Adjustment',        color: 'bg-blue-100 text-blue-700' },
    DUE:                { label: 'Unpaid',            color: 'bg-red-100 text-red-700' },
  }

  return map[item.status] || { label: item.status || '-', color: 'bg-gray-100 text-gray-600' }
}
