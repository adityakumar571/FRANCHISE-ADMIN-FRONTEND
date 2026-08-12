import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, IndianRupee, CheckCircle, Clock, PauseCircle,
  FileText, CreditCard, BarChart2, ListChecks, AlertCircle,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import DashboardStatCard from '../../dashboard/Stats/DashboardStatCard'
import QuickActionCard from '../../dashboard/Stats/QuickActionCard'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

/* ─── AnimatedNumber (exact copy from AdminDashboard) ────────────── */
function AnimatedNumber({ value, prefix = '' }) {
  const [display, setDisplay] = useState(0)
  const numeric = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : (value || 0)
  useEffect(() => {
    setDisplay(0)
    if (!numeric) return
    let start = 0
    const duration = 1200
    const increment = numeric / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= numeric) { setDisplay(numeric); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [numeric])
  const format = (n) => {
    if (prefix === '₹') {
      if (n >= 10000000) return `${prefix}${(n / 10000000).toFixed(2)} Cr`
      if (n >= 100000)   return `${prefix}${(n / 100000).toFixed(2)} L`
      if (n >= 1000)     return `${prefix}${(n / 1000).toFixed(1)} K`
      return `${prefix}${Math.floor(n).toLocaleString('en-IN')}`
    }
    return `${prefix}${Math.floor(n).toLocaleString('en-IN')}`
  }
  return <span title={prefix + numeric.toLocaleString('en-IN')}>{format(display)}</span>
}

/* ─── BarChartCanvas (exact same style as AdminDashboard) ─────────── */
function BarChartCanvas({ data, color = '#042954', height = 180 }) {
  const ref          = useRef(null)
  const containerRef = useRef(null)
  const tooltipRef   = useRef(null)
  const hoveredRef   = useRef(-1)
  const animRef      = useRef(null)
  const progressRef  = useRef(0)
  const PAD = { top: 40, bottom: 36, left: 52, right: 16 }

  const drawFrame = useCallback((canvas, w, progress = 1, hoveredIdx = -1) => {
    if (!canvas || !data.length) return
    const dpr = window.devicePixelRatio || 1
    const H = height
    canvas.width  = w * dpr; canvas.height = H * dpr
    canvas.style.width = `${w}px`; canvas.style.height = `${H}px`
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, H)
    const chartW = w - PAD.left - PAD.right
    const chartH = H - PAD.top - PAD.bottom
    const maxVal = Math.max(...data.map(d => Math.max(d.paid || 0, d.unpaid || 0, 0)), 1)
    const currentLabel = new Date().toLocaleString('en-IN', { month: 'short' })

    // grid lines
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (chartH / 4) * i
      const val = maxVal - (maxVal / 4) * i
      ctx.strokeStyle = i === 4 ? '#cbd5e1' : '#e2e8f0'
      ctx.lineWidth = i === 4 ? 1.5 : 1
      ctx.setLineDash(i === 4 ? [] : [3, 4])
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(w - PAD.right, y); ctx.stroke()
      ctx.setLineDash([])
      const lbl = val >= 100000 ? `₹${(val/100000).toFixed(0)}L` : val >= 1000 ? `₹${(val/1000).toFixed(0)}K` : `₹${Math.round(val)}`
      ctx.fillStyle = '#94a3b8'; ctx.font = '500 9px DM Sans,system-ui'
      ctx.textAlign = 'right'; ctx.fillText(lbl, PAD.left - 6, y + 3.5)
    }

    const groupW  = chartW / data.length
    const barW    = Math.max(groupW * 0.32, 6)
    const gap     = 3
    const groupPad = (groupW - barW * 2 - gap) / 2

    data.forEach((d, i) => {
      const x0   = PAD.left + i * groupW
      const isHov = i === hoveredIdx
      const isCur = d.month === currentLabel

      // paid bar
      const paidH = maxVal > 0 ? (d.paid / maxVal) * chartH * progress : 0
      if (paidH > 0) {
        const x = x0 + groupPad
        const y = PAD.top + chartH - paidH
        const r = Math.min(5, barW / 2)
        const g = ctx.createLinearGradient(x, y, x, y + paidH)
        g.addColorStop(0, isCur ? '#2d6a4f' : isHov ? '#3a8a68' : '#2d6a4faa')
        g.addColorStop(1, isCur ? '#2d6a4f55' : '#2d6a4f22')
        ctx.fillStyle = g
        ctx.beginPath()
        if (paidH > r) {
          ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y)
          ctx.quadraticCurveTo(x + barW, y, x + barW, y + r)
          ctx.lineTo(x + barW, y + paidH); ctx.lineTo(x, y + paidH); ctx.lineTo(x, y + r)
          ctx.quadraticCurveTo(x, y, x + r, y)
        } else { ctx.rect(x, y, barW, paidH) }
        ctx.closePath(); ctx.fill()
        if (progress >= 0.98 && d.paid > 0) {
          const lbl = d.paid >= 100000 ? `${(d.paid/100000).toFixed(1)}L` : d.paid >= 1000 ? `${(d.paid/1000).toFixed(0)}K` : `${d.paid}`
          ctx.fillStyle = '#2d6a4f'; ctx.font = '600 9px DM Sans,system-ui'; ctx.textAlign = 'center'
          ctx.fillText(lbl, x + barW / 2, y - 5)
        }
      }

      // unpaid bar
      const upH = maxVal > 0 ? (d.unpaid / maxVal) * chartH * progress : 0
      if (upH > 0) {
        const x = x0 + groupPad + barW + gap
        const y = PAD.top + chartH - upH
        const r = Math.min(5, barW / 2)
        const g = ctx.createLinearGradient(x, y, x, y + upH)
        g.addColorStop(0, isCur ? '#b45309' : isHov ? '#c56510' : '#b45309aa')
        g.addColorStop(1, '#b4530922')
        ctx.fillStyle = g
        ctx.beginPath()
        if (upH > r) {
          ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y)
          ctx.quadraticCurveTo(x + barW, y, x + barW, y + r)
          ctx.lineTo(x + barW, y + upH); ctx.lineTo(x, y + upH); ctx.lineTo(x, y + r)
          ctx.quadraticCurveTo(x, y, x + r, y)
        } else { ctx.rect(x, y, barW, upH) }
        ctx.closePath(); ctx.fill()
      }

      // month label
      ctx.fillStyle = isCur ? color : isHov ? '#334155' : '#94a3b8'
      ctx.font = (isCur || isHov) ? '700 10px DM Sans,system-ui' : '500 9px DM Sans,system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(d.month, x0 + groupW / 2, H - 10)
      if (isCur) {
        ctx.fillStyle = color; ctx.beginPath()
        ctx.arc(x0 + groupW / 2, H - 4, 2.5, 0, 2 * Math.PI); ctx.fill()
      }
    })
  }, [data, color, height])

  const startAnim = useCallback((canvas, w) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    progressRef.current = 0
    const duration = 700, start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      progressRef.current = ease
      drawFrame(canvas, w, ease, hoveredRef.current)
      if (t < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
  }, [drawFrame])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      if (w > 0) startAnim(ref.current, w)
    })
    ro.observe(container)
    startAnim(ref.current, container.offsetWidth || 400)
    return () => { ro.disconnect(); if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [data, startAnim])

  const getIdx = (e) => {
    const canvas = ref.current; if (!canvas || !data.length) return -1
    const rect = canvas.getBoundingClientRect()
    const mx   = e.clientX - rect.left
    const w    = rect.width
    const gW   = (w - PAD.left - PAD.right) / data.length
    const idx  = Math.floor((mx - PAD.left) / gW)
    return idx >= 0 && idx < data.length ? idx : -1
  }

  const handleMouseMove = (e) => {
    const canvas = ref.current, tooltip = tooltipRef.current
    if (!canvas || !tooltip) return
    const idx = getIdx(e)
    if (idx !== hoveredRef.current) { hoveredRef.current = idx; drawFrame(canvas, canvas.getBoundingClientRect().width, progressRef.current, idx) }
    if (idx >= 0) {
      const d = data[idx]; const rect = canvas.getBoundingClientRect()
      tooltip.style.display = 'block'
      tooltip.style.left = `${Math.min(e.clientX - rect.left + 12, rect.width - 150)}px`
      tooltip.style.top  = `${Math.max(e.clientY - rect.top  - 44,  4)}px`
      tooltip.innerHTML  = `<span style="color:#94a3b8;font-size:10px">${d.month}</span><br/><span style="color:#2d6a4f">Paid: ₹${fmt(d.paid)}</span><br/><span style="color:#b45309">Unpaid: ₹${fmt(d.unpaid)}</span>`
    } else { tooltip.style.display = 'none' }
  }
  const handleMouseLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = 'none'
    if (hoveredRef.current !== -1) { hoveredRef.current = -1; const c = ref.current; if (c) drawFrame(c, c.getBoundingClientRect().width, progressRef.current, -1) }
  }

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      <canvas ref={ref} style={{ display: 'block', cursor: 'crosshair' }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
      <div ref={tooltipRef} style={{ display: 'none', position: 'absolute', background: '#0f172a', color: '#f1f5f9', fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 10, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 6px 20px rgba(0,0,0,0.25)', lineHeight: 1.6, border: '1px solid rgba(255,255,255,0.08)' }} />
    </div>
  )
}

/* ─── AttendanceRing style — Donut Canvas ────────────────────────── */
function DonutCanvas({ data, size = 120 }) {
  const ref   = useRef(null)
  const total = data.reduce((s, d) => s + d.value, 0)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cx = canvas.width / 2, cy = canvas.height / 2
    const r = Math.min(cx, cy) - 8, lw = 16
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = lw; ctx.stroke()
    if (total > 0) {
      let start = -Math.PI / 2
      data.forEach(seg => {
        if (!seg.value) return
        const angle = (seg.value / total) * 2 * Math.PI
        ctx.beginPath(); ctx.arc(cx, cy, r, start, start + angle)
        ctx.strokeStyle = seg.color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke()
        start += angle
      })
    }
    ctx.textAlign = 'center'; ctx.fillStyle = '#1e293b'
    ctx.font = `700 ${size > 100 ? 18 : 14}px DM Sans,system-ui`
    ctx.fillText(total, cx, cy + 5)
    ctx.fillStyle = '#94a3b8'; ctx.font = '500 9px DM Sans,system-ui'
    ctx.fillText('TOTAL', cx, cy + 17)
  }, [data, total, size])
  return <canvas ref={ref} width={size} height={size} style={{ display: 'block' }} />
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════════ */
const PayrollDashboard = () => {
  const navigate              = useNavigate()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [barData, setBarData] = useState([])
  const [barLoading, setBarLoading] = useState(false)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    setLoading(true)
    getRequest('hr/payroll/dashboard')
      .then((res) => setStats(res?.data?.data))
      .catch(() => toast.error('Failed to load payroll dashboard'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setBarLoading(true)
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    Promise.all(
      months.map((m) =>
        getRequest(`hr/payroll?salaryMonth=${m}&limit=500`)
          .then((r) => {
            const list   = r?.data?.data?.payrolls || []
            const paid   = list.filter((p) => p.paymentStatus === 'Paid').reduce((s, p) => s + (p.netSalary || 0), 0)
            const unpaid = list.filter((p) => p.paymentStatus !== 'Paid').reduce((s, p) => s + (p.netSalary || 0), 0)
            return { month: new Date(m + '-01').toLocaleString('en-IN', { month: 'short' }), paid, unpaid }
          })
          .catch(() => ({ month: new Date(m + '-01').toLocaleString('en-IN', { month: 'short' }), paid: 0, unpaid: 0 }))
      )
    ).then(setBarData).finally(() => setBarLoading(false))
  }, [])

  const totalGenerated = stats?.payrollGenerated || 0
  const paidPct   = totalGenerated > 0 ? Math.round(((stats?.paidCount   || 0) / totalGenerated) * 100) : 0
  const unpaidPct = totalGenerated > 0 ? Math.round(((stats?.unpaidCount || 0) / totalGenerated) * 100) : 0

  const donutData = stats ? [
    { name: 'Paid',          value: stats.paidCount   || 0, color: '#2d6a4f' },
    { name: 'Unpaid',        value: stats.unpaidCount || 0, color: '#b45309' },
    { name: 'Partially Paid',value: Math.max(0, totalGenerated - (stats.paidCount||0) - (stats.unpaidCount||0) - (stats.onHold||0)), color: '#0369a1' },
    { name: 'On Hold',       value: stats.onHold      || 0, color: '#7a2d2d' },
  ].filter(d => d.value > 0) : []

  const quickActions = [
    { label: 'Salary Structure', path: '/hr/payroll/salary-structure', color: '#042954',  icon: IndianRupee },
    { label: 'Monthly Payroll',  path: '/hr/payroll/monthly',          color: '#5b21b6',  icon: ListChecks  },
    { label: 'Salary Payment',   path: '/hr/payroll/payments',         color: '#2d6a4f',  icon: CreditCard  },
    { label: 'Salary Slips',     path: '/hr/payroll/slip',             color: '#b45309',  icon: FileText    },
    { label: 'Payroll Reports',  path: '/hr/payroll/reports',          color: '#0369a1',  icon: BarChart2   },
  ]

  return (
    <div className="min-h-screen space-y-4">

      {/* ══ HEADER — exact AdminDashboard style ══ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Payroll Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {stats?.month ? `Current Month: ${stats.month}` : 'Current month payroll overview'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm">
          <span className="text-xs font-medium text-slate-600">{today}</span>
        </div>
      </div>

      {/* ══ QUICK ACTIONS — exact AdminDashboard grid ══ */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {quickActions.map(({ label, icon, path, color }) => (
          <QuickActionCard key={label} label={label} icon={icon} path={path} navigate={navigate} color={color} />
        ))}
      </div>

      {/* ══ SECTION HEADER ══ */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Payroll Stats</h2>
      </div>

      {/* ══ STAT CARDS — 2xl:4 grid exactly like AdminDashboard ══ */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 h-[180px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardStatCard
            title="Total Active Staff"
            value={stats?.totalStaff ?? 0}
            icon={Users}
            color="#042954"
            badge={`${stats?.totalStaff || 0} Active Employees`}
            sub="In payroll this month"
            progress={100}
          />
          <DashboardStatCard
            title="Payroll Generated"
            value={totalGenerated}
            icon={ListChecks}
            color="#5b21b6"
            badge={`${stats?.month || ''}`}
            sub="Salary records this month"
            progress={stats?.totalStaff > 0 ? Math.min(100, Math.round((totalGenerated / (stats?.totalStaff||1)) * 100)) : 0}
          />
          <DashboardStatCard
            title="Total Salary"
            value={stats?.totalSalary ?? 0}
            prefix="₹"
            icon={IndianRupee}
            color="#0369a1"
            badge="Gross payroll amount"
            sub="All staff combined"
            progress={100}
          />
          <DashboardStatCard
            title="On Hold"
            value={stats?.onHold ?? 0}
            icon={PauseCircle}
            color="#7a2d2d"
            badge="Salary held this month"
            sub="Pending resolution"
            progress={totalGenerated > 0 ? Math.min(100, Math.round(((stats?.onHold||0) / totalGenerated) * 100)) : 0}
          />
        </div>
      )}

      {/* ══ PAID / UNPAID — AdminDashboard fee card style ══ */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-3">Payment Status — {stats?.month || ''}</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 h-[180px] animate-pulse" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Paid amount */}
          <div onClick={() => navigate('/hr/payroll/payments')}
            className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-[180px] flex flex-col justify-between cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-700 leading-tight mb-2">Paid Salary</p>
                <h3 className="text-[18px] font-black font-medium text-slate-700">
                  <AnimatedNumber value={stats.paidSalary || 0} prefix="₹" />
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: '#2d6a4f' }}>
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-bold leading-relaxed mb-1" style={{ color: '#2d6a4f' }}>
                {stats.paidCount || 0} staff paid — {paidPct}% complete
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mb-3">Salary disbursed this month</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${paidPct}%`, background: '#2d6a4f' }} />
              </div>
            </div>
          </div>

          {/* Unpaid amount */}
          <div onClick={() => navigate('/hr/payroll/monthly')}
            className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-[180px] flex flex-col justify-between cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-700 leading-tight mb-2">Unpaid Salary</p>
                <h3 className="text-[18px] font-black font-medium text-slate-700">
                  <AnimatedNumber value={stats.unpaidSalary || 0} prefix="₹" />
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: '#b45309' }}>
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-bold leading-relaxed mb-1" style={{ color: '#b45309' }}>
                {stats.unpaidCount || 0} staff pending — {unpaidPct}%
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mb-3">Outstanding salary this month</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${unpaidPct}%`, background: '#b45309' }} />
              </div>
            </div>
          </div>

          {/* Paid count */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-[180px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-700 leading-tight mb-2">Paid Staff</p>
                <h3 className="text-[18px] font-black font-medium text-slate-700">{stats.paidCount ?? 0}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: '#2d6a4f' }}>
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-bold leading-relaxed mb-1" style={{ color: '#2d6a4f' }}>{paidPct}% of total generated</div>
              <div className="text-[11px] text-slate-400 leading-relaxed mb-3">Employees received salary</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${paidPct}%`, background: '#2d6a4f' }} />
              </div>
            </div>
          </div>

          {/* Unpaid count */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-[180px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-700 leading-tight mb-2">Pending Staff</p>
                <h3 className="text-[18px] font-black font-medium text-slate-700">{stats.unpaidCount ?? 0}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: '#b45309' }}>
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-bold leading-relaxed mb-1" style={{ color: '#b45309' }}>{unpaidPct}% of total generated</div>
              <div className="text-[11px] text-slate-400 leading-relaxed mb-3">Employees awaiting payment</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${unpaidPct}%`, background: '#b45309' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CHARTS ROW — AdminDashboard 3-col layout ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Canvas bar chart — 6-month trend (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">6-Month Salary Trend</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full inline-block" style={{ background: '#2d6a4f' }} /><span className="text-[13px] font-medium text-slate-400">Paid</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full inline-block" style={{ background: '#b45309' }} /><span className="text-[13px] font-medium text-slate-400">Unpaid</span></div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4 font-medium">Paid vs Unpaid salary over last 6 months</p>
          {barLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-7 h-7 border-[3px] border-t-transparent rounded-full animate-spin" style={{ borderColor: '#042954', borderTopColor: 'transparent' }} />
            </div>
          ) : barData.every(d => d.paid === 0 && d.unpaid === 0) ? (
            <div className="h-[180px] flex flex-col items-center justify-center gap-2 text-slate-400">
              <BarChart2 className="w-8 h-8 opacity-30" />
              <p className="text-sm font-medium">No payroll data for last 6 months</p>
            </div>
          ) : (
            <BarChartCanvas data={barData} color="#042954" height={180} />
          )}
        </div>

        {/* Donut — canvas ring like AdminDashboard AttendanceRing */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-1">Payment Status</h3>
          <p className="text-xs text-slate-400 mb-4 font-medium">{stats?.month || 'This month'} breakdown</p>
          {loading ? (
            <div className="h-[180px] animate-pulse bg-slate-100 rounded-xl" />
          ) : donutData.length === 0 ? (
            <div className="h-[180px] flex flex-col items-center justify-center gap-2 text-slate-400">
              <PauseCircle className="w-8 h-8 opacity-30" />
              <p className="text-sm font-medium">No payroll generated yet</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <DonutCanvas data={donutData} size={130} />
              <div className="w-full grid grid-cols-2 gap-2">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <div>
                      <p className="text-[13px] font-medium text-slate-400">{d.name}</p>
                      <p className="text-sm font-black" style={{ color: d.color }}>{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default PayrollDashboard
