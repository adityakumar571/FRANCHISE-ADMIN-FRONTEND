/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useMemo } from 'react'
import { IndianRupee, CheckCircle, AlertCircle } from 'lucide-react'

/* ================= Animated Stat Cards ================= */
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

export default function FeeReportStats({ summary, loading }) {
  const stats = [
    {
      title: 'Total Collection',
      value: summary?.totalCollection || 0,
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      delay: 0,
    },
    {
      title: 'Total Receipts',
      value: summary?.totalReceipts || 0,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      delay: 100,
    },
  ]

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm mb-6 border">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Fee Summary</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
      </div>
    </div>
  )
}
