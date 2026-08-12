/**
 * useSubscriptionStatus
 *
 * Polls GET /api/subscription-status every 5 minutes.
 * Also merges any extra warnings from X-Subscription-Warnings
 * response header so they surface immediately on any API call.
 *
 * Returns:
 *  {
 *    loading          : boolean
 *    hasSubscription  : boolean
 *    status           : string          — ACTIVE | TRIAL | EXPIRED | CANCELLED | PENDING
 *    planName         : string
 *    billingCycle     : string
 *    endDate          : string | null
 *    daysLeft         : number | null
 *    totalStudentLimit: number
 *    usedStudents     : number
 *    remaining        : number | "unlimited"
 *    usagePercent     : number          — 0-100
 *    paidStatus       : string          — PAID | UNPAID | PENDING | OVERDUE
 *    dueDate          : string | null
 *    warnings         : string[]        — EXPIRING_SOON | EXPIRED | LIMIT_CRITICAL |
 *                                         LIMIT_WARNING | PAYMENT_OVERDUE | PAYMENT_UNPAID |
 *                                         SESSION_BILLING_OVERDUE | ADMISSIONS_RESTRICTED |
 *                                         REGISTRATION_RESTRICTED | TRIAL_EXPIRING_SOON |
 *                                         NO_SUBSCRIPTION
 *    refresh          : () => void
 *  }
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getRequest } from '../Helpers'

const POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export const useSubscriptionStatus = () => {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const intervalRef           = useRef(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res     = await getRequest('subscription-status')
      const payload = res?.data?.data

      if (!payload || payload.hasSubscription === false) {
        setData({ hasSubscription: false, warnings: ['NO_SUBSCRIPTION'] })
      } else {
        // Merge warnings from header (header may include session billing flags)
        const headerWarnings = res?.headers?.['x-subscription-warnings']
        const extraWarnings  = headerWarnings
          ? headerWarnings.split(',').map((w) => w.trim()).filter(Boolean)
          : []

        const allWarnings = [...new Set([...(payload.warnings || []), ...extraWarnings])]
        setData({ ...payload, warnings: allWarnings, hasSubscription: true })
      }
    } catch {
      // Keep last known state on network error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchStatus])

  return {
    loading,
    hasSubscription:   data?.hasSubscription  ?? null,
    status:            data?.status           ?? null,
    planName:          data?.planName         ?? null,
    billingCycle:      data?.billingCycle     ?? null,
    endDate:           data?.endDate          ?? null,
    daysLeft:          data?.daysLeft         ?? null,
    totalStudentLimit: data?.totalStudentLimit ?? 0,
    usedStudents:      data?.usedStudents     ?? 0,
    remaining:         data?.remaining        ?? 0,
    usagePercent:      data?.usagePercent     ?? 0,
    paidStatus:        data?.paidStatus       ?? null,
    dueDate:           data?.dueDate          ?? null,
    warnings:          data?.warnings         ?? [],
    refresh:           fetchStatus,
  }
}
