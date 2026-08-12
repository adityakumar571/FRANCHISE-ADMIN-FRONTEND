/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useMemo } from 'react'
import { IndianRupee, CheckCircle, AlertCircle } from 'lucide-react'

function AnimatedNumber({ value }) {
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    let start = 0
    const end = value
    const duration = 800
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplay(end)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return <span>₹{display.toLocaleString()}</span>
}

function StatCard({ title, value, icon: Icon, color, bgColor, delay }) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border-t-4 transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } hover:scale-105 hover:shadow-lg`}
      style={{ borderColor: color.replace('text-', '#') }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold" style={{ color: color.replace('text-', '#') }}>
            <AnimatedNumber value={value} />
          </p>
        </div>

        <div className={`${bgColor} p-3 rounded-full`}>
          <Icon className={`${color} w-6 h-6`} />
        </div>
      </div>
    </div>
  )
}

/* ================= Skeleton Card ================= */

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  )
}
// ============================
// 🎯 MAIN COMPONENT
// ============================

/**
 * Props:
 *   ledgerData  — array of period groups (fallback calculation ke liye)
 *   summary     — backend summary object (preferred — concession-adjusted)
 *                 { totalFee, concession, netPayable, totalPaid, totalDue, lateFee, lateFeeDue }
 *   loading     — boolean
 */
export default function FeeStats({ ledgerData = [], summary = null, loading }) {
  const { totalAmount, totalPaid, totalDue, totalTransport, totalWaived } = useMemo(() => {
    // ── If backend summary available, use it (concession-adjusted) ──
    if (summary) {
      const transport = ledgerData.reduce((sum, m) => {
        const tItems = (m.items || []).filter(i => i.type === 'TRANSPORT')
        return sum + tItems.reduce((s, i) => s + Number(i.totalAmount || 0), 0)
      }, 0)

      const waived = ledgerData.reduce((sum, m) => {
        const wItems = (m.items || []).filter(i => i.type === 'LATE_FEE' && i.isWaived)
        return sum + wItems.reduce((s, i) => s + Number(i.totalAmount || 0), 0)
      }, 0)

      return {
        totalAmount: parseFloat(summary.netPayable  || 0),
        totalPaid:   parseFloat(summary.totalPaid   || 0),
        // Use currentDue (only past/current months) if available, else fall back to totalDue
        totalDue:    parseFloat(summary.currentDue ?? summary.totalDue ?? 0),
        totalTransport: transport,
        totalWaived: waived,
      }
    }

    // ── Fallback: calculate from ledgerData ──
    const amount = ledgerData.reduce((sum, m) => sum + Number(m.totalAmount || 0), 0)
    const paid   = ledgerData.reduce((sum, m) => sum + Number(m.totalPaid   || 0), 0)
    const due    = ledgerData.reduce((sum, m) => sum + Number(m.totalDue    || 0), 0)

    const transport = ledgerData.reduce((sum, m) => {
      const tItems = (m.items || []).filter(i => i.type === 'TRANSPORT')
      return sum + tItems.reduce((s, i) => s + Number(i.totalAmount || 0), 0)
    }, 0)

    const waived = ledgerData.reduce((sum, m) => {
      const wItems = (m.items || []).filter(i => i.type === 'LATE_FEE' && i.isWaived)
      return sum + wItems.reduce((s, i) => s + Number(i.totalAmount || 0), 0)
    }, 0)

    return { totalAmount: amount, totalPaid: paid, totalDue: due, totalTransport: transport, totalWaived: waived }
  }, [ledgerData, summary])

  const stats = [
    { title: 'Net Payable',    value: totalAmount,   icon: IndianRupee,  color: 'text-blue-600',   bgColor: 'bg-blue-50',   delay: 0   },
    { title: 'Total Paid',     value: totalPaid,     icon: CheckCircle,  color: 'text-green-600',  bgColor: 'bg-green-50',  delay: 100 },
    { title: 'Total Due',      value: totalDue,      icon: AlertCircle,  color: 'text-red-600',    bgColor: 'bg-red-50',    delay: 200 },
    ...(totalTransport > 0
      ? [{ title: 'Transport Fee', value: totalTransport, icon: IndianRupee, color: 'text-indigo-600', bgColor: 'bg-indigo-50', delay: 300 }]
      : []),
    ...(totalWaived > 0
      ? [{ title: 'Late Fee Waived', value: totalWaived, icon: CheckCircle, color: 'text-purple-600', bgColor: 'bg-purple-50', delay: 400 }]
      : []),
  ]

  // Concession info row (only if summary available and concession > 0)
  const concessionAmount = summary ? parseFloat(summary.concession || 0) : 0
  const grossAmount      = summary ? parseFloat(summary.totalFee   || 0) : 0

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm mb-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Fee Summary</h2>
        {/* Concession info — only shown when backend summary has concession */}
        {concessionAmount > 0 && (
          <div className="text-xs text-gray-500 text-right">
            <span className="mr-3">Gross Total: <b className="text-gray-700">₹{grossAmount.toLocaleString()}</b></span>
            <span className="text-green-600 font-semibold">Concession: -₹{concessionAmount.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>
    </div>
  )
}
