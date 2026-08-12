/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import {
  Users, GraduationCap, IndianRupeeIcon,
  UserCheck, CreditCard, CalendarDays, BookOpen, ClipboardList,
  Bell, AlertCircle, CheckCircle2, UserMinus, UserPlus, Layers,
  Wallet, BarChart2, ChevronLeft, ChevronRight,
  Banknote, Globe, Smartphone, FileText,
  Download,
  Mars,
  Venus,
  UserRound,
  User,
} from 'lucide-react'
import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMale, FaFemale } from 'react-icons/fa'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
  AreaChart, Area,
} from 'recharts'
import { SessionContext } from '../../Context/Seesion'
import { AppContext } from '../../Context/AppContext'
import { getRequest } from '../../Helpers'
import { DatePicker, Skeleton, Pagination, Modal } from 'antd'
import dayjs from 'dayjs'
import DashboardStatCard from './Stats/DashboardStatCard'
import QuickActionCard from './Stats/QuickActionCard'
import NoticeHomeWorkStatsCard from './Stats/NoticeHomeWorkStats'
import Loader from '../../components/Loading/Loader'

/* ─────────────────────── AnimatedNumber ─────────────────────────── */
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

  // Smart formatting: ₹5,23,450 → show as ₹5.23L if >= 1L, ₹52.3K if >= 1K
  const format = (n) => {
    if (prefix === '₹') {
      if (n >= 10000000) return `${prefix}${(n / 10000000).toFixed(2)} Cr`
      if (n >= 100000) return `${prefix}${(n / 100000).toFixed(2)} L`
      if (n >= 1000) return `${prefix}${(n / 1000).toFixed(1)} K`
      return `${prefix}${Math.floor(n).toLocaleString('en-IN')}`
    }
    return `${prefix}${Math.floor(n).toLocaleString('en-IN')}`
  }

  return <span title={prefix + numeric.toLocaleString('en-IN')}>{format(display)}</span>
}

/* ─────────────────────── DonutCanvas ────────────────────────────── */
function DonutCanvas({ data, colors, size = 130, label = 'Total' }) {
  const ref = useRef(null)
  const total = data.reduce((s, d) => s + d.value, 0)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cx = canvas.width / 2, cy = canvas.height / 2
    const r = Math.min(cx, cy) - 6, inner = r * 0.62
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let start = -Math.PI / 2
    data.forEach((seg, i) => {
      const angle = total > 0 ? (seg.value / total) * 2 * Math.PI : (2 * Math.PI) / data.length
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, start + angle)
      ctx.closePath(); ctx.fillStyle = colors[i % colors.length]; ctx.fill()
      start += angle
    })
    ctx.beginPath(); ctx.arc(cx, cy, inner, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.textAlign = 'center'; ctx.fillStyle = '#111'
    ctx.font = `700 ${size > 110 ? 18 : 14}px DM Sans,system-ui`
    ctx.fillText(total, cx, cy + 5)
    ctx.fillStyle = '#bbb'; ctx.font = `500 9px DM Sans,system-ui`
    ctx.fillText(label, cx, cy + 17)
  }, [data, colors, total, size, label])
  return <canvas ref={ref} width={size} height={size} style={{ display: 'block' }} />
}

/* ─────────────────────── BarChart (canvas) ──────────────────────── */
function BarChartCanvas({ data, color = '#042954', height = 180 }) {
  const ref = useRef(null)
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)
  const hoveredRef = useRef(-1)
  const animRef = useRef(null)
  const progressRef = useRef(0)

  const PAD = { top: 52, bottom: 36, left: 52, right: 16 }

  const drawFrame = (canvas, w, progress = 1, hoveredIdx = -1) => {
    if (!canvas || !data.length) return
    const dpr = window.devicePixelRatio || 1
    const H = height
    canvas.width = w * dpr
    canvas.height = H * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${H}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, H)

    const chartW = w - PAD.left - PAD.right
    const chartH = H - PAD.top - PAD.bottom
    const maxVal = Math.max(...data.map(d => d.value), 1)
    const now = new Date()
    const currentMonthLabel = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()]
    const peakBar = data.reduce((a, b) => b.value > a.value ? b : a, data[0])

    // ── Background subtle gradient ──
    const bgGrad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH)
    bgGrad.addColorStop(0, 'rgba(248,250,252,0.6)')
    bgGrad.addColorStop(1, 'rgba(241,245,249,0)')
    ctx.fillStyle = bgGrad
    ctx.fillRect(PAD.left, PAD.top, chartW, chartH)

    // ── Grid lines + Y labels ──
    const gridCount = 5
    for (let i = 0; i <= gridCount; i++) {
      const y = PAD.top + (chartH / gridCount) * i
      const val = maxVal - (maxVal / gridCount) * i

      ctx.strokeStyle = i === gridCount ? '#cbd5e1' : '#e2e8f0'
      ctx.lineWidth = i === gridCount ? 1.5 : 1
      ctx.setLineDash(i === gridCount ? [] : [3, 4])
      ctx.beginPath()
      ctx.moveTo(PAD.left, y)
      ctx.lineTo(w - PAD.right, y)
      ctx.stroke()
      ctx.setLineDash([])

      const yLabel = val >= 10000000
        ? `${(val / 10000000).toFixed(1)}Cr`
        : val >= 100000
          ? `${(val / 100000).toFixed(1)}L`
          : val >= 1000
            ? `${(val / 1000).toFixed(0)}K`
            : `${Math.round(val)}`
      ctx.fillStyle = '#94a3b8'
      ctx.font = '500 9px DM Sans,system-ui'
      ctx.textAlign = 'right'
      ctx.fillText(yLabel, PAD.left - 8, y + 3.5)
    }

    const barW = chartW / data.length
    const barPad = Math.max(barW * 0.28, 5)
    const bw = barW - barPad

    data.forEach((d, i) => {
      const fullBarH = maxVal > 0 ? (d.value / maxVal) * chartH : 0
      const animBarH = fullBarH * progress
      const x = PAD.left + i * barW + barPad / 2
      const y = PAD.top + chartH - animBarH
      const radius = Math.min(7, bw / 2, animBarH)
      const isCurrentMonth = d.label === currentMonthLabel
      const isPeak = d.label === peakBar.label && d.value > 0
      const isHovered = i === hoveredIdx
      const hasValue = d.value > 0

      if (hasValue) {
        // ── Shadow for hovered / current bar ──
        if (isHovered || isCurrentMonth) {
          ctx.save()
          ctx.shadowColor = isCurrentMonth ? `${color}44` : 'rgba(0,0,0,0.12)'
          ctx.shadowBlur = isHovered ? 14 : 8
          ctx.shadowOffsetY = 3
        }

        // ── Bar gradient ──
        const grad = ctx.createLinearGradient(x, y, x, y + animBarH)
        if (isCurrentMonth) {
          grad.addColorStop(0, color)
          grad.addColorStop(0.6, color + 'cc')
          grad.addColorStop(1, color + '55')
        } else if (isHovered) {
          grad.addColorStop(0, '#1a4a7a')
          grad.addColorStop(1, '#1a4a7a55')
        } else if (isPeak) {
          grad.addColorStop(0, '#2d6a4f')
          grad.addColorStop(1, '#2d6a4f44')
        } else {
          grad.addColorStop(0, color + 'aa')
          grad.addColorStop(1, color + '22')
        }
        ctx.fillStyle = grad

        // ── Rounded top bar ──
        ctx.beginPath()
        if (animBarH > radius) {
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + bw - radius, y)
          ctx.quadraticCurveTo(x + bw, y, x + bw, y + radius)
          ctx.lineTo(x + bw, y + animBarH)
          ctx.lineTo(x, y + animBarH)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
        } else {
          ctx.rect(x, y, bw, animBarH)
        }
        ctx.closePath()
        ctx.fill()

        if (isHovered || isCurrentMonth) ctx.restore()

        // ── Sheen stripe on top ──
        if (animBarH > 8) {
          ctx.fillStyle = 'rgba(255,255,255,0.18)'
          ctx.beginPath()
          ctx.rect(x + bw * 0.15, y + 2, bw * 0.3, Math.min(animBarH - 4, 10))
          ctx.fill()
        }

        // ── Value label above bar (only when animation done) ──
        if (progress >= 0.98) {
          const lbl = d.value >= 10000000
            ? `${(d.value / 10000000).toFixed(1)}Cr`
            : d.value >= 100000
              ? `${(d.value / 100000).toFixed(2)}L`
              : d.value >= 1000
                ? `${(d.value / 1000).toFixed(0)}K`
                : `${d.value}`

          const labelY = y - 8
          const isInsideBar = labelY < PAD.top + 4
          const finalLabelY = isInsideBar ? y + 16 : labelY
          const finalColor = isInsideBar
            ? 'rgba(255,255,255,0.92)'
            : isCurrentMonth ? '#0f172a' : isHovered ? '#1e293b' : '#475569'

          ctx.fillStyle = finalColor
          ctx.font = (isCurrentMonth || isHovered) ? `700 11px DM Sans,system-ui` : `600 10px DM Sans,system-ui`
          ctx.textAlign = 'center'
          ctx.fillText(lbl, x + bw / 2, finalLabelY)
        }

        // ── Peak badge ──
        if (isPeak && !isCurrentMonth && progress >= 0.98) {
          const badgeX = x + bw / 2
          const badgeTop = y - 28
          const isInside = badgeTop < PAD.top
          const badgeY = isInside ? y + 28 : badgeTop + 8
          ctx.fillStyle = isInside ? 'rgba(255,255,255,0.25)' : '#2d6a4f'
          ctx.beginPath()
          ctx.roundRect(badgeX - 14, badgeY - 9, 28, 13, 4)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = '700 7.5px DM Sans,system-ui'
          ctx.textAlign = 'center'
          ctx.fillText('PEAK', badgeX, badgeY)
        }
      } else {
        // ── Empty bar placeholder ──
        ctx.fillStyle = isHovered ? '#e2e8f0' : '#f1f5f9'
        ctx.beginPath()
        ctx.roundRect(x, PAD.top + chartH - 4, bw, 4, 2)
        ctx.fill()
      }

      // ── Month label ──
      ctx.fillStyle = isCurrentMonth ? color : isHovered ? '#334155' : '#94a3b8'
      ctx.font = (isCurrentMonth || isHovered) ? `700 10px DM Sans,system-ui` : `500 9px DM Sans,system-ui`
      ctx.textAlign = 'center'
      ctx.fillText(d.label, x + bw / 2, H - 12)

      // ── Current month dot ──
      if (isCurrentMonth) {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x + bw / 2, H - 5, 2.5, 0, 2 * Math.PI)
        ctx.fill()
      }
    })
  }

  const startAnimation = (canvas, w) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    progressRef.current = 0
    const duration = 700
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3)
      progressRef.current = ease
      drawFrame(canvas, w, ease, hoveredRef.current)
      if (t < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      if (w > 0) startAnimation(ref.current, w)
    })
    ro.observe(container)
    startAnimation(ref.current, container.offsetWidth || 400)
    return () => { ro.disconnect(); if (animRef.current) cancelAnimationFrame(animRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, color, height])

  const getHoveredIdx = (e) => {
    const canvas = ref.current
    if (!canvas || !data.length) return -1
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const w = rect.width
    const chartW = w - PAD.left - PAD.right
    const barW = chartW / data.length
    const idx = Math.floor((mx - PAD.left) / barW)
    return idx >= 0 && idx < data.length ? idx : -1
  }

  const handleMouseMove = (e) => {
    const tooltip = tooltipRef.current
    const canvas = ref.current
    const container = containerRef.current
    if (!canvas || !container || !tooltip) return

    const idx = getHoveredIdx(e)
    if (idx !== hoveredRef.current) {
      hoveredRef.current = idx
      drawFrame(canvas, canvas.getBoundingClientRect().width, progressRef.current, idx)
    }

    if (idx >= 0) {
      const d = data[idx]
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      tooltip.style.display = 'block'
      tooltip.style.left = `${Math.min(mx + 12, rect.width - 140)}px`
      tooltip.style.top = `${Math.max(my - 44, 4)}px`
      const full = `₹${(d.value || 0).toLocaleString('en-IN')}`
      tooltip.innerHTML = `<span style="color:#94a3b8;font-size:10px">${d.label} ${d.year || ''}</span><br/><span style="font-size:13px">${full}</span>`
    } else {
      tooltip.style.display = 'none'
    }
  }

  const handleMouseLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = 'none'
    if (hoveredRef.current !== -1) {
      hoveredRef.current = -1
      const canvas = ref.current
      if (canvas) drawFrame(canvas, canvas.getBoundingClientRect().width, progressRef.current, -1)
    }
  }

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      <canvas
        ref={ref}
        style={{ display: 'block', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <div
        ref={tooltipRef}
        style={{
          display: 'none',
          position: 'absolute',
          background: '#0f172a',
          color: '#f1f5f9',
          fontSize: '12px',
          fontWeight: 600,
          padding: '7px 13px',
          borderRadius: '10px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          lineHeight: 1.5,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
    </div>
  )
}

/* ─────────────────────── AttendanceRing ────────────────────────── */
function AttendanceRing({ present, absent, holiday, size = 100 }) {
  const ref = useRef(null)
  const total = present + absent + holiday
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cx = canvas.width / 2, cy = canvas.height / 2
    const r = Math.min(cx, cy) - 8, lw = 14
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = lw; ctx.stroke()
    if (total > 0) {
      const segments = [
        { value: present, color: '#2d6a4f' },
        { value: absent, color: '#7a2d2d' },
        { value: holiday, color: '#94a3b8' },
      ]
      let start = -Math.PI / 2
      segments.forEach(seg => {
        if (!seg.value) return
        const angle = (seg.value / total) * 2 * Math.PI
        ctx.beginPath(); ctx.arc(cx, cy, r, start, start + angle)
        ctx.strokeStyle = seg.color; ctx.lineWidth = lw
        ctx.lineCap = 'round'; ctx.stroke()
        start += angle
      })
    }
    const pct = total > 0 ? Math.round((present / total) * 100) : 0
    ctx.textAlign = 'center'; ctx.fillStyle = '#1e293b'
    ctx.font = `700 ${size > 90 ? 18 : 14}px DM Sans,system-ui`
    ctx.fillText(`${pct}%`, cx, cy + 5)
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px DM Sans,system-ui'
    ctx.fillText('Present', cx, cy + 17)
  }, [present, absent, holiday, total, size])
  return <canvas ref={ref} width={size} height={size} style={{ display: 'block' }} />
}

/* ─────────────────────── Skeleton ───────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton.Input style={{ width: 220, height: 28 }} active />
          <Skeleton.Input style={{ width: 160, height: 16 }} active size="small" />
        </div>
        <Skeleton.Input style={{ width: 200, height: 40 }} active />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200">
            <Skeleton.Input style={{ width: 90, height: 12 }} active size="small" />
            <Skeleton.Input style={{ width: 120, height: 36 }} active className="mt-3" />
            <Skeleton.Input style={{ width: 140, height: 12 }} active size="small" className="mt-3" />
            <Skeleton.Input style={{ width: '100%', height: 6 }} active size="small" className="mt-3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
            <Skeleton.Avatar size={40} active shape="square" style={{ borderRadius: 10 }} />
            <div className="space-y-2">
              <Skeleton.Input style={{ width: 55, height: 11 }} active size="small" />
              <Skeleton.Input style={{ width: 40, height: 22 }} active />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 h-52">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ))}
      </div>
    </div>
  )
}


/* ─────────────────────── ClassAttendanceChart ──────────────────── */

/* Dark tooltip */
const AttTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ color: '#64748b', fontSize: 10, fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.stroke, display: 'inline-block' }} />
          <span style={{ color: '#64748b', fontSize: 10 }}>{p.name}:</span>
          <span style={{ color: '#1e293b', fontSize: 11, fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function ClassAttendanceChart({ classWiseAttendance: initialData, sessionId }) {
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [data, setData] = useState(initialData)
  const [loadingDate, setLoadingDate] = useState(false)
  const isToday = selectedDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')

  useEffect(() => {
    if (isToday) setData(initialData)
  }, [initialData, isToday])

  const fetchForDate = async (date) => {
    const dateStr = date.format('YYYY-MM-DD')
    const todayStr = dayjs().format('YYYY-MM-DD')
    if (dateStr === todayStr) {
      setData(initialData)
      return
    }
    try {
      setLoadingDate(true)
      const res = await getRequest(`admin/dashboard/attendance?sessionId=${sessionId}&date=${dateStr}`)
      if (res?.data?.success) {
        setData(res.data.data?.classWiseAttendance || [])
      } else {
        setData([])
      }
    } catch {
      setData([])
    } finally {
      setLoadingDate(false)
    }
  }

  const handleDateChange = (date) => {
    if (!date) return
    setSelectedDate(date)
    fetchForDate(date)
  }

  const handlePrev = () => {
    const prev = selectedDate.subtract(1, 'day')
    setSelectedDate(prev)
    fetchForDate(prev)
  }

  const handleNext = () => {
    const next = selectedDate.add(1, 'day')
    if (next.isAfter(dayjs(), 'day')) return
    setSelectedDate(next)
    fetchForDate(next)
  }

  if (!data.length && !loadingDate) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {/* Header with date picker */}
        <div className="flex items-center gap-3 mb-3">
          <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">
            Class Attendance</p>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={handlePrev} className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400">
              <ChevronLeft size={14} />
            </button>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              disabledDate={(d) => d && d.isAfter(dayjs(), 'day')}
              format="DD MMM YYYY"
              size="small"
              allowClear={false}
              style={{ borderRadius: 6, fontSize: 11, width: 120 }}
            />
            <button
              onClick={handleNext}
              disabled={isToday}
              className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 py-6">
          <CheckCircle2 className="w-5 h-5 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">No attendance marked for this date</p>
        </div>
      </div>
    )
  }

  const totals = data.reduce(
    (acc, c) => ({ present: acc.present + c.present, absent: acc.absent + c.absent, holiday: acc.holiday + c.holiday, total: acc.total + c.total }),
    { present: 0, absent: 0, holiday: 0, total: 0 }
  )
  const overallPct = totals.total > 0 ? Math.round((totals.present / totals.total) * 100) : 0

  const lineData = data.map(c => ({
    name: c.className,
    Present: c.present,
    Absent: c.absent,
    ...(totals.holiday > 0 ? { Holiday: c.holiday } : {}),
  }))

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">

      {/* ── Header with date picker ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-shrink-0">
          <p className="text-lg font-bold text-slate-800 tracking-tight leading-none flex justify-center items-center">Class Attendance</p>
        </div>
        <div className="w-px h-6 flex-shrink-0 bg-gray-200" />
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {[
            { label: 'Overall', value: `${overallPct}%`, color: '#042954' },
            { label: 'Present', value: totals.present, color: '#2d6a4f' },
            { label: 'Absent', value: totals.absent, color: '#7a2d2d' },
            { label: 'Holiday', value: totals.holiday, color: '#5c6b73' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-gray-400">{s.label}</span>
              <span className="text-sm font-medium" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={handlePrev} className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400">
            <ChevronLeft size={14} />
          </button>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            disabledDate={(d) => d && d.isAfter(dayjs(), 'day')}
            format="DD MMM YYYY"
            size="small"
            allowClear={false}
            style={{ borderRadius: 6, fontSize: 11, width: 120 }}
          />
          <button
            onClick={handleNext}
            disabled={isToday}
            className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <span className="text-[10px] flex-shrink-0 text-gray-300">
          {data.length} classes
        </span>
      </div>

      {/* ── Chart or loader ── */}
      {loadingDate ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#042954', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          <div className="px-3 pt-3 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={lineData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a2d2d" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7a2d2d" stopOpacity={0} />
                  </linearGradient>
                  {totals.holiday > 0 && (
                    <linearGradient id="gradHoliday" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5c6b73" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#5c6b73" stopOpacity={0} />
                    </linearGradient>
                  )}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<AttTooltip />} />
                <Area type="monotone" dataKey="Present" stroke="#2d6a4f" strokeWidth={2} fill="url(#gradPresent)"
                  dot={{ r: 3, fill: '#fff', stroke: '#2d6a4f', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#2d6a4f', stroke: '#fff', strokeWidth: 1.5 }} />
                <Area type="monotone" dataKey="Absent" stroke="#7a2d2d" strokeWidth={2} fill="url(#gradAbsent)"
                  dot={{ r: 3, fill: '#fff', stroke: '#7a2d2d', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#7a2d2d', stroke: '#fff', strokeWidth: 1.5 }} />
                {totals.holiday > 0 && (
                  <Area type="monotone" dataKey="Holiday" stroke="#5c6b73" strokeWidth={1.5} fill="url(#gradHoliday)"
                    dot={{ r: 2.5, fill: '#fff', stroke: '#5c6b73', strokeWidth: 1.5 }}
                    activeDot={{ r: 4, fill: '#5c6b73', stroke: '#fff', strokeWidth: 1.5 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Legend ── */}
          <div className="flex items-center gap-5 px-4 pb-3">
            {[
              { label: 'Present', color: '#2d6a4f' },
              { label: 'Absent', color: '#7a2d2d' },
              ...(totals.holiday > 0 ? [{ label: 'Holiday', color: '#5c6b73' }] : []),
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="inline-block w-5 h-0.5 rounded-full" style={{ background: l.color }} />
                <span className="text-[13px] font-medium text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════════ */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const { currentSession } = useContext(SessionContext)
  const [showFeeCollection, setShowFeeCollection] = useState(true)
  const { user } = useContext(AppContext)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(4)
  const [total, setTotal] = useState(0)
  const [dueData, setDueData] = useState([])
  const [dueLoading, setDueLoading] = useState(false)
  // STATES
  const [noticeModal, setNoticeModal] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState(null)

  const [noticePage, setNoticePage] = useState(1)
  const noticeLimit = 5
  const isSuperAdmin = user?.role === 'SuperAdmin'
  const navigate = useNavigate()
  const [d, setD] = useState({
    totalStudents: 0, totalLeft: 0, totalPassed: 0,
    totalTeachers: 0, activeTeachers: 0,
    totalEarnings: 0, pendingFees: 0, pendingCount: 0,
    totalClasses: 0, totalSections: 0, totalNotices: 0, collectionRate: 0, expectedFees: 0,
    totalExams: 0, totalHomework: 0, todayNewAdmissions: 0,
    genderStats: { male: 0, female: 0, other: 0 },
    teacherGenderStats: { male: 0, female: 0, other: 0 },
    categoryStats: [], religionStats: [], classWiseStudents: [],
    classWiseAttendance: [],
    paymentModeStats: [],
    todayAttendance: { present: 0, absent: 0, holiday: 0, total: 0, percentage: 0 },
    monthlyEarnings: [],
    recentStudents: [], recentPayments: [], recentNotices: [],
    subscription: null,
  })
  const currentMonth = new Date().toLocaleString(
    "default",
    {
      month: "long",
    }
  );
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    if (!currentSession?._id) return
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const res = await getRequest(`admin/dashboard?sessionId=${currentSession._id}`)
        if (res?.data?.success) {
          const raw = res.data.data || {}
          setD(prev => ({
            ...prev,
            ...raw,
            // Always guarantee numbers so .toFixed() never crashes
            expectedFees: raw.expectedFees ?? 0,
            totalEarnings: raw.totalEarnings ?? 0,
            pendingFees: raw.pendingFees ?? 0,
            collectionRate: raw.collectionRate ?? 0,
            // Always guarantee arrays/objects so .length never crashes
            genderStats: raw.genderStats || { male: 0, female: 0, other: 0 },
            teacherGenderStats: raw.teacherGenderStats || { male: 0, female: 0, other: 0 },
            categoryStats: Array.isArray(raw.categoryStats) ? raw.categoryStats : [],
            religionStats: Array.isArray(raw.religionStats) ? raw.religionStats : [],
            classWiseAttendance: Array.isArray(raw.classWiseAttendance) ? raw.classWiseAttendance : [],
            paymentModeStats: Array.isArray(raw.paymentModeStats) ? raw.paymentModeStats : [],
            monthlyEarnings: Array.isArray(raw.monthlyEarnings) ? raw.monthlyEarnings : [],
            recentStudents: Array.isArray(raw.recentStudents) ? raw.recentStudents : [],
            recentPayments: Array.isArray(raw.recentPayments) ? raw.recentPayments : [],
            recentNotices: Array.isArray(raw.recentNotices)
              ? raw.recentNotices
              : [],
            todayAttendance: raw.todayAttendance || { present: 0, absent: 0, holiday: 0, total: 0, percentage: 0 },
          }))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [currentSession])

  useEffect(() => {

    if (!currentSession?._id) return

    const fetchDueSummary = async () => {

      try {

        setDueLoading(true)

   const res = await getRequest(
  `admin/dashboard/defaulter-summary?sessionId=${currentSession._id}&page=${page}&limit=${limit}`
)

if (res?.data?.success) {

  setDueData(res?.data?.data?.list || [])

  setTotal(
    res?.data?.data?.pagination?.totalRows || 0
  )
}

      } catch (error) {

        console.error(error)

      } finally {

        setDueLoading(false)
      }
    }

    fetchDueSummary()

}, [currentSession, page, limit])

  if (loading) return <DashboardSkeleton />

  const {
    totalStudents, totalLeft, totalPassed,
    totalTeachers, activeTeachers,
    totalEarnings, pendingFees, pendingCount,
    totalClasses, totalSections, totalNotices, collectionRate, expectedFees,
    totalExams, totalHomework, todayNewAdmissions,
    genderStats, teacherGenderStats, categoryStats, religionStats, classWiseStudents, classWiseAttendance, paymentModeStats,
    todayAttendance, monthlyEarnings,
    recentStudents, recentPayments, subscription, recentNotices,

  } = d

  const male = genderStats?.male || 0
  const female = genderStats?.female || 0
  const other = genderStats?.other || 0
  const totalGender = male + female + other
  const malePercent = totalGender > 0 ? +((male / totalGender) * 100).toFixed(1) : 0
  const femalePercent = totalGender > 0 ? +((female / totalGender) * 100).toFixed(1) : 0
  const teacherRatio = totalTeachers > 0 ? (totalStudents / totalTeachers).toFixed(1) : '--'
  const earningsPerStudent = totalStudents > 0 ? Math.round(totalEarnings / totalStudents) : 0
  const inactiveTeachers = totalTeachers - activeTeachers

  // Teacher gender stats
  const teacherMale   = teacherGenderStats?.male   || 0
  const teacherFemale = teacherGenderStats?.female || 0
  const teacherOther  = teacherGenderStats?.other  || 0
  const totalTeacherGender = teacherMale + teacherFemale + teacherOther

  /* ── Subscription ── */
  const sub = subscription || {}
  const planName = sub.activePlan?.name || '--'
  const billingCycle = sub.activePlan?.billingCycle || '--'
  const planPrice = sub.activePlan?.price ?? '--'
  const studentLimit = sub.totalStudentLimit ?? 0
  const usedStudents = sub.usedStudents ?? 0
  const remaining = sub.remainingStudents ?? 0
  const usagePct = studentLimit > 0 ? Math.round((usedStudents / studentLimit) * 100) : 0
  const isPlanActive = sub.isPlanActive ?? false
  const endDate = sub.activePlan?.endDate
    ? new Date(sub.activePlan.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '--'

  /* ── Monthly bar data — last 12 months, zero-filled ── */
  const barData = (() => {
    if (!monthlyEarnings.length) return []
    // If data spans multiple years, show all; otherwise show all 12 months of the year
    return monthlyEarnings.map(m => ({
      label: m.month,
      value: m.earnings,
      year: m.year,
    }))
  })()
  const totalStaff = 25
  const activeStaff = 22

  const totalPeons = 10
  const activePeons = 8


  /* ── Payment mode colors — theme-aligned muted blues ── */
  const modeColors = { CASH: '#2d6a4f', ONLINE: '#1a4a7a', UPI: '#3d5a80', CHEQUE: '#5c6b73' }

  /* ── Category colors — muted, theme-consistent palette ── */
  const catColors = ['#1a4a7a', '#2d6a4f', '#5c6b73', '#3d5a80', '#4a6fa5', '#2c5f4a']

  return (
    // <div className="min-h-screen bg-slate-50/60 space-y-4  md:p-5">
    <div className="min-h-screen space-y-4">
      {/* ══ HEADER ══ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* <h1 className="text-xl font-bold text-slate-800 tracking-tight">School Dashboard</h1> */}
          </div>

        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm">
            <span className="text-xs font-medium text-slate-600">{today}</span>
          </div>
        </div>
      </div>

      {/* ══ QUICK ACTIONS ══ */}
      {/* {!isSuperAdmin && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: 'New Admission', icon: UserPlus, path: '/student/admission' },
            { label: 'Fee Collection', icon: Wallet, path: '/fee/feescollection' },
            { label: 'Attendance', icon: CheckCircle2, path: '/attendance' },
            { label: 'Student List', icon: GraduationCap, path: '/student/studentlist' },
            { label: 'Fee Reports', icon: BarChart2, path: '/fee/feesreport' },
            { label: 'Notice Board', icon: Bell, path: '/communication' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-1.5 py-2.5 px-2 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0" style={{ background: '#eef2f7' }}>
                <action.icon style={{ color: '#042954', width: 16, height: 16 }} />
              </div>
              <span className="text-[10px] font-semibold text-slate-600 leading-tight text-center">{action.label}</span>
            </button>
          ))}
        </div>
      )} */}

      {!isSuperAdmin && (

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">

          <QuickActionCard
            label="New Admission"
            icon={UserPlus}
            path="/student/admission"
            navigate={navigate}
            color="#042954"
          />

          <QuickActionCard
            label="Fee Collection"
            icon={Wallet}
            path="/fee/feescollection"
            navigate={navigate}
            color="#1a4a7a"
          />

          <QuickActionCard
            label="Attendance"
            icon={CheckCircle2}
            path="/attendance"
            navigate={navigate}
            color="#2d6a4f"
          />

          <QuickActionCard
            label="Student List"
            icon={GraduationCap}
            path="/student/studentlist"
            navigate={navigate}
            color="#3d5a80"
          />

          <QuickActionCard
            label="Fee Reports"
            icon={BarChart2}
            path="/fee/feesreport"
            navigate={navigate}
            color="#4a6fa5"
          />

          <QuickActionCard
            label="Notice Board"
            icon={Bell}
            path="/communication"
            navigate={navigate}
            color="#7a2d2d"
          />

        </div>

      )}
      {/* ═════════════ SCHOOL STATS ═════════════ */}
      <div className="space-y-1">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          {/* LEFT */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              School Stats
            </h2>
          </div>

        </div>

   
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* ═════ STUDENTS ═════ */}
          <DashboardStatCard
            title="Students"
            value={totalStudents}
            icon={GraduationCap}
            color="#042954"

            badge={
              <div className="flex items-center gap-3">

                {/* Male */}
                <div className="flex items-center gap-1.5">

                  <div className="w-4 h-4 flex items-center justify-center">
                    <FaMale className="w-4 h-4 text-blue-600" />
                  </div>

                  <span className="text-[11px] font-semibold text-slate-700">
                    {male} Male
                  </span>

                </div>

                {/* Female */}
                <div className="flex items-center gap-1.5">

                  <div className="w-4 h-4 flex items-center justify-center">
                    <FaFemale className="w-4 h-4 text-pink-600" />
                  </div>

                  <span className="text-[11px] font-semibold text-slate-700">
                    {female} Female
                  </span>

                </div>

              </div>
            }

            sub={`${totalClasses} Classes • ${totalSections} Sections`}
            // 40 Male / 50 Students
            // = 80%
            progress={
              totalStudents > 0
                ? Math.round((male / totalStudents) * 100)
                : 0
            }
          />

          {/* ═════ TEACHERS ═════ */}
          <DashboardStatCard
            title="Teachers"
            value={totalTeachers}
            icon={Users}
            color="#1a4a7a"

            badge={`${activeTeachers} Active Teachers`}

            sub={`Managing ${totalStudents} students`}
            // Active teachers percentage
            progress={
              totalTeachers > 0
                ? Math.round((activeTeachers / totalTeachers) * 100)
                : 0
            }
          />

          {/* ═════ CLASSES ═════ */}
          <DashboardStatCard
            title="Classes"
            value={totalClasses}
            icon={BookOpen}
            color="#2d6a4f"

            badge={`${totalClasses} Active Classes`}

            sub={`${totalStudents} students enrolled`}
            // Average class occupancy
            progress={
              totalClasses > 0
                ? Math.min(
                  Math.round((totalStudents / totalClasses) * 10),
                  100
                )
                : 0
            }
          />

          {/* ═════ SECTIONS ═════ */}
          <DashboardStatCard
            title="Sections"
            value={totalSections}
            icon={Layers}
            color="#7a2d2d"

            badge={`${totalClasses} Sections`}

            sub="Academic section management"
            // Expected 4 sections per class
            progress={
              totalClasses > 0
                ? Math.min(
                  Math.round((totalSections / (totalClasses * 4)) * 100),
                  100
                )
                : 0
            }
          />

        </div>
      </div>



      {/* ═════════════ FEE COLLECTION SECTION ═════════════ */}

      <div className="space-y-4 mt-3">

        {/* HEADER */}
        {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"> */}
        <div className="flex items-center justify-between mb-2">

          {/* LEFT */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Fee Collection Till {currentMonth}
            </h2>
          </div>

          {/* RIGHT */}
          <div className="flex items-center flex-wrap gap-3">

            <label className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm cursor-pointer hover:border-[#042954] transition-all">

              <input
                type="checkbox"
                checked={showFeeCollection}
                onChange={() =>
                  setShowFeeCollection(!showFeeCollection)
                }
                className="w-4 h-4 accent-[#042954]"
              />

              <span className="text-sm font-semibold text-slate-700">
                Show Collection
              </span>
            </label>
          </div>
        </div>

        {/* FEE CARDS */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 transition-all duration-500 overflow-hidden ${showFeeCollection
            ? 'max-h-[1000px] opacity-100'
            : 'max-h-0 opacity-0'
            }`}
        >
          <DashboardStatCard
            title="Expected Fees"
            value={Number(expectedFees.toFixed(0))}
            prefix="₹"
            icon={Wallet}
            color="#1a4a7a"

            badge="Till Current Month"

            sub={`${totalClasses} classes included`}

            progress={100}
          />

          <DashboardStatCard
            title="Collected Fees"
            value={Number(totalEarnings.toFixed(0))}
            prefix="₹"
            icon={IndianRupeeIcon}
            color="#2d6a4f"

            badge={`${collectionRate}% Recovery Achieved`}

            sub={`${totalStudents} students contributed`}

            progress={collectionRate}
          />

          <DashboardStatCard
            title="Pending Fees"
            value={Number(pendingFees.toFixed(0))}
            prefix="₹"
            icon={AlertCircle}
            color="#7a2d2d"

            badge={`${pendingCount} Students Pending`}

            sub="Outstanding fee balance"

            progress={
              expectedFees > 0
                ? Math.round(
                  (pendingFees / expectedFees) * 100
                )
                : 0
            }
          />

          <DashboardStatCard
            title="Collection Rate"
            value={collectionRate}
            suffix="%"
            icon={BarChart2}
            color="#5c6b73"

            badge="Current Fee Recovery"

            sub="Collected vs expected fees"

            progress={collectionRate}
          />
        </div>
      </div>

      {/* ══ ROW 2 — 4 STATS ══ */}
      {/* <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
 
          { label: 'Notices', value: totalNotices, color: '#3d5a80', icon: Bell },
          { label: 'Exams', value: totalExams, color: '#4a6fa5', icon: ClipboardList },
          { label: 'Homework', value: totalHomework, color: '#2d6a4f', icon: BookOpen },
          { label: "Today's Admissions", value: todayNewAdmissions, color: '#042954', icon: UserPlus },
        ].map((q, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-3 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-200 text-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#eef2f7' }}>
              <q.icon className="w-3.5 h-3.5" style={{ color: q.color }} />
            </div>
            <p className="text-xl font-black text-slate-800 leading-none tabular-nums">
              <AnimatedNumber value={q.value} />
            </p>
            <p className="text-[10px] font-medium text-slate-400 leading-tight">{q.label}</p>
          </div>
        ))}
      </div> */}
      {/* ══ ROW 2 — QUICK SCHOOL STATS ══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        <NoticeHomeWorkStatsCard
          title="Notices"
          value={totalNotices}
          icon={Bell}
          color="#3d5a80"

          badge={`${totalNotices} Active Notices`}

          sub="Recent announcements & circulars"
        />

        <NoticeHomeWorkStatsCard
          title="Exams"
          value={totalExams}
          icon={ClipboardList}
          color="#4a6fa5"

          badge={`${totalExams} Scheduled Exams`}

          sub="Current academic examinations"
        />

        <NoticeHomeWorkStatsCard
          title="Homework"
          value={totalHomework}
          icon={BookOpen}
          color="#2d6a4f"

          badge={`${totalHomework} Assign Tasks`}

          sub="Assignments & class activities"
        />

        <NoticeHomeWorkStatsCard
          title="Today's Admissions"
          value={todayNewAdmissions}
          icon={UserPlus}
          color="#042954"

          badge={`${todayNewAdmissions} New Admissions`}

          sub="Students joined today"
        />

      </div>


      {/* ═════════════ DEFAULTER / DUE SECTION ═════════════ */}
      {/* ═════════════ DEFAULTER / DUE TABLE ═════════════ */}

      <div className="mt-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">

          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Defaulter fee Till {currentMonth}
            </h2>


          </div>


        </div>

        {/* TABLE */}
        {/* TABLE */}
        <div className="relative overflow-x-auto">


          {/* LOADING */}
          {dueLoading && (
            <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
              <Loader /> Loading Due Data ....
            </div>
          )}

          {/* EMPTY */}
          {dueData.length === 0 && !loading ? (
            <div className="flex flex-col justify-center items-center py-20">

              <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />

              <p className="text-gray-500 text-sm">
                No due records found
              </p>
            </div>
          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full border border-gray-300 overflow-hidden table-fixed">

                {/* COLUMN WIDTH */}
                <colgroup>
                  <col className="min-w-[120px]" />
                  <col className="min-w-[100px]" />
                  <col className="min-w-[160px]" />
                  <col className="min-w-[160px]" />
                  <col className="min-w-[160px]" />
                  <col className="min-w-[130px]" />
                  <col className="min-w-[180px]" />
                </colgroup>

                {/* HEADER */}
                <thead className="bg-gray-200 text-gray-600">

                  <tr>

                    <th className="px-3 py-2 text-center text-sm font-semibold">Class</th>

                    <th className="px-3 py-2 text-center text-sm font-semibold">Section</th>

                    <th className="px-3 py-2 text-center text-sm font-semibold">Expected Fee</th>

                    <th className="px-3 py-2 text-center text-sm font-semibold">Received Fee</th>

                    <th className="px-3 py-2 text-center text-sm font-semibold">Pending Fee</th>

                    <th className="px-3 py-2 text-center text-sm font-semibold">Pending %</th>

                    <th className="px-3 py-2 text-center text-sm font-semibold">Class Teacher Name</th>

                  </tr>
                </thead>

                {/* BODY */}
                <tbody className="bg-white divide-y divide-gray-200">

                  {dueData.map((item, index) => (

                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >

                      {/* CLASS */}
                      <td className="px-2 py-2 text-center text-sm font-medium">
                        {item.className}
                      </td>

                      {/* SECTION */}
                      <td className="px-2 py-2 text-center text-sm">
                        <span className="inline-flex items-center justify-center font-medium">
                          {item.section}
                        </span>
                      </td>

                      {/* EXPECTED FEE */}
                      <td className="px-2 py-2 text-center text-sm">
                        <span className="font-medium text-slate-700">
                          ₹{item.expectedFee?.toLocaleString('en-IN') || 0}
                        </span>
                      </td>

                      {/* RECEIVED FEE */}
                      <td className="px-2 py-2 text-center text-sm">
                        <span className="font-medium text-green-600">
                          ₹{item.paidAmount?.toLocaleString('en-IN') || 0}
                        </span>
                      </td>

                      {/* PENDING FEE */}
                      <td className="px-2 py-2 text-center text-sm">
                        <span className="font-medium text-red-600">
                          ₹{item.dueAmount?.toLocaleString('en-IN') || 0}
                        </span>
                      </td>

                      {/* PENDING % */}
                      <td className="px-2 py-2 text-center text-sm">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.defaulterPct <= 10
                            ? 'bg-green-100 text-green-700'
                            : item.defaulterPct <= 30
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.defaulterPct ?? 0}%
                        </span>
                      </td>

                      {/* CLASS TEACHER */}
                      <td className="px-2 py-2 text-center text-sm">
                        {item.teacherName}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          )}


          <div className="flex items-center justify-between px-3 py-3 border-slate-100 bg-white">

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {dueData.length}
              </span>{" "}
              records
            </p>

            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              showSizeChanger
              pageSizeOptions={['5', '10', '20', '50']}
              onChange={(currentPage, pageSize) => {
                setPage(currentPage)
                setLimit(pageSize)
              }}
            />

          </div>
        </div>
      </div>
      {/* ══ ROW 3.5 — CLASS-WISE ATTENDANCE CHART ══ */}
      <ClassAttendanceChart classWiseAttendance={classWiseAttendance} sessionId={currentSession?._id} />
      {/* ══ ROW 3 — ATTENDANCE + GENDER + STUDENTS vs TEACHERS ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Today Attendance */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">

          <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">
            Today's Attendance
          </p>

          <p className="text-[11px] text-slate-400 mt-1 mb-3">
            Daily attendance overview
          </p>

          {/* Ring centered */}
          <div className="flex justify-center mb-3">

            <AttendanceRing
              present={todayAttendance.present}
              absent={todayAttendance.absent}
              holiday={todayAttendance.holiday}
              size={105}
            />

          </div>

          {/* Stats below */}
          <div className="flex flex-col gap-1.5">

            {[
              {
                label: 'Present',
                value: todayAttendance.present,
                color: '#2d6a4f',
                bg: '#f0f7f4',
                border: '#c8e6d8',
              },
              {
                label: 'Absent',
                value: todayAttendance.absent,
                color: '#7a2d2d',
                bg: '#f7f0f0',
                border: '#e6c8c8',
              },
              {
                label: 'Holiday',
                value: todayAttendance.holiday,
                color: '#5c6b73',
                bg: '#f5f6f7',
                border: '#dde1e3',
              },
            ].map(s => (

              <div
                key={s.label}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border"
                style={{
                  background: s.bg,
                  borderColor: s.border,
                }}
              >

                <div className="flex items-center gap-1.5">

                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: s.color }}
                  />

                  <span className="text-[11px] text-slate-600 font-medium">
                    {s.label}
                  </span>

                </div>

                <span
                  className="text-[13px] font-black tabular-nums"
                  style={{ color: s.color }}
                >
                  {s.value}
                </span>

              </div>
            ))}

            <p className="text-[10px] text-slate-400 text-center mt-1">

              <span className="font-bold text-slate-600">
                {todayAttendance.total}
              </span>

              {' '}total marked

            </p>

          </div>

        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">

          <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">
            Gender Distribution
          </p>

          <p className="text-[11px] text-slate-400 mt-1 mb-3">
            Students ratio overview
          </p>

          {/* Ring centered */}
          <div className="flex justify-center mb-3">

            <DonutCanvas
              data={[
                { label: 'Female', value: female },
                { label: 'Male', value: male },
                { label: 'Other', value: other },
              ]}
              colors={['#3d5a80', '#042954', '#5c6b73']}
              size={105}
            />

          </div>

          {/* Stats below */}
          <div className="flex flex-col gap-1.5">

            {[
              {
                label: 'Female',
                value: female,
                pct: femalePercent,
                color: '#3d5a80',
                bg: '#eef2f7',
                border: '#c8d4e3',
              },
              {
                label: 'Male',
                value: male,
                pct: malePercent,
                color: '#042954',
                bg: '#e8edf4',
                border: '#b8c6d8',
              },
              {
                label: 'Other',
                value: other,
                pct:
                  totalGender > 0
                    ? +(
                      (other / totalGender) *
                      100
                    ).toFixed(1)
                    : 0,
                color: '#5c6b73',
                bg: '#f5f6f7',
                border: '#dde1e3',
              },
            ].map(s => (

              <div
                key={s.label}
                className="px-2.5 py-1.5 rounded-lg border"
                style={{
                  background: s.bg,
                  borderColor: s.border,
                }}
              >

                <div className="flex items-center justify-between mb-1">

                  <span className="text-[11px] text-slate-600 font-medium">
                    {s.label}
                  </span>

                  <span
                    className="text-[11px] font-black tabular-nums"
                    style={{ color: s.color }}
                  >

                    {s.value}

                    <span className="font-normal text-slate-400 text-[9px] ml-0.5">
                      ({s.pct}%)
                    </span>

                  </span>

                </div>

                <div className="h-1 bg-white/70 rounded-full overflow-hidden">

                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${s.pct}%`,
                      backgroundColor: s.color,
                    }}
                  />

                </div>

              </div>
            ))}

          </div>

        </div>

        {/* Teacher Gender Distribution */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">

          <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">
            Teacher Distribution
          </p>

          <p className="text-[11px] text-slate-400 mt-1 mb-3">
            Teachers ratio overview
          </p>

          {/* Ring centered */}
          <div className="flex justify-center mb-3">

            <DonutCanvas
              data={[
                { label: 'Female', value: teacherFemale },
                { label: 'Male', value: teacherMale },
                { label: 'Other', value: teacherOther },
              ]}
              colors={['#3d5a80', '#042954', '#5c6b73']}
              size={105}
            />

          </div>

          {/* Stats below */}
          <div className="flex flex-col gap-1.5">

            {[
              {
                label: 'Female',
                value: teacherFemale,
                pct: totalTeacherGender > 0 ? +((teacherFemale / totalTeacherGender) * 100).toFixed(1) : 0,
                color: '#3d5a80',
                bg: '#eef2f7',
                border: '#c8d4e3',
              },
              {
                label: 'Male',
                value: teacherMale,
                pct: totalTeacherGender > 0 ? +((teacherMale / totalTeacherGender) * 100).toFixed(1) : 0,
                color: '#042954',
                bg: '#e8edf4',
                border: '#b8c6d8',
              },
              {
                label: 'Other',
                value: teacherOther,
                pct: totalTeacherGender > 0 ? +((teacherOther / totalTeacherGender) * 100).toFixed(1) : 0,
                color: '#5c6b73',
                bg: '#f5f6f7',
                border: '#dde1e3',
              },
            ].map(s => (

              <div
                key={s.label}
                className="px-2.5 py-1.5 rounded-lg border"
                style={{
                  background: s.bg,
                  borderColor: s.border,
                }}
              >

                <div className="flex items-center justify-between mb-1">

                  <span className="text-[11px] text-slate-600 font-medium">
                    {s.label}
                  </span>

                  <span
                    className="text-[11px] font-black tabular-nums"
                    style={{ color: s.color }}
                  >

                    {s.value}

                    <span className="font-normal text-slate-400 text-[9px] ml-0.5">
                      ({s.pct}%)
                    </span>

                  </span>

                </div>

                <div className="h-1 bg-white/70 rounded-full overflow-hidden">

                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${s.pct}%`,
                      backgroundColor: s.color,
                    }}
                  />

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

      {/* ══ ROW 4 — MONTHLY EARNINGS (wide) + PAYMENT MODE ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Monthly Earnings Bar Chart — spans 2 cols */}
        {/* Monthly Earnings Bar Chart — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-3 sm:p-4 overflow-hidden">

          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">

            {/* LEFT */}
            <div className="min-w-0">

              <p className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-none">
                Monthly Fee Collection
              </p>

              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                {barData.length > 0
                  ? `${barData[0]?.year} · All months`
                  : 'Session trend'}
              </p>

            </div>

            {/* RIGHT STATS */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto">

              {/* COLLECTED */}
              <div className="text-center lg:text-right min-w-0">

                <p className="text-[10px] sm:text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                  Collected
                </p>

                <p
                  className="text-[13px] sm:text-[13px] font-black font-medium truncate"
                  style={{ color: '#042954' }}
                >
                  {totalEarnings >= 10000000
                    ? `₹${(totalEarnings / 10000000).toFixed(2)} Cr`
                    : totalEarnings >= 100000
                      ? `₹${(totalEarnings / 100000).toFixed(2)} L`
                      : `₹${totalEarnings.toLocaleString('en-IN')}`}
                </p>

              </div>

              {/* PENDING */}
              <div className="text-center lg:text-right min-w-0 border-x border-slate-100 px-2">

                <p className="text-[10px] sm:text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                  Pending
                </p>

                <p className="text-[13px] sm:text-[13px] font-black font-medium text-rose-500 truncate">

                  {pendingFees >= 100000
                    ? `₹${(pendingFees / 100000).toFixed(2)} L`
                    : `₹${(pendingFees || 0).toLocaleString('en-IN')}`}

                </p>

              </div>

              {/* PEAK */}
              <div className="text-center lg:text-right min-w-0">

                <p className="text-[10px] sm:text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                  Peak
                </p>

                <p
                  className="text-[13px] sm:text-[13px] font-black truncate font-medium"
                  style={{ color: '#2d6a4f' }}
                >
                  {barData.length > 0
                    ? barData.reduce(
                      (a, b) => (b.value > a.value ? b : a),
                      barData[0]
                    ).label
                    : '--'}
                </p>

              </div>

            </div>

          </div>

          {/* CHART */}
          {barData.length > 0 ? (

            <>

              <div className="w-full overflow-hidden">

                <BarChartCanvas
                  data={barData}
                  color="#042954"
                  height={150}
                />

              </div>

              {/* FOOTER */}
              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] sm:text-[11px] text-slate-400 border-t border-slate-100 pt-2.5">

                {/* LEGENDS */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">

                  <span className="flex items-center gap-1.5">

                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: '#042954' }}
                    />

                    <span>Collected</span>

                  </span>

                  <span className="flex items-center gap-1.5">

                    <span className="w-2.5 h-2.5 rounded-sm inline-block bg-slate-200" />

                    <span>No data</span>

                  </span>

                  <span className="flex items-center gap-1.5">

                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: '#042954' }}
                    />

                    <span>Current month</span>

                  </span>

                </div>

                {/* BUTTON */}
                {!isSuperAdmin && (

                  <button
                    onClick={() => navigate('/fee/feesreport')}
                    className="font-semibold hover:opacity-70 transition-opacity text-[10px] sm:text-[11px] text-left sm:text-right"
                    style={{ color: '#042954' }}
                  >
                    View full report →
                  </button>

                )}

              </div>

            </>

          ) : (

            <div className="h-32 sm:h-36 flex flex-col items-center justify-center text-[11px] sm:text-xs text-slate-400 bg-slate-50 rounded-xl gap-2">

              <IndianRupeeIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-300" />

              No payment data for this session

            </div>

          )}

        </div>

        {/* Payment Mode Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">

          <div className="flex items-center justify-between mb-1">

            <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">
              Payment Modes
            </p>

            <span className="text-[9px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">

              {paymentModeStats.reduce((s, p) => s + p.count, 0)} txns

            </span>

          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            Collection by method
          </p>

          {paymentModeStats.length > 0 ? (

            <div className="flex flex-col gap-2.5 flex-1">

              {paymentModeStats.map((pm, i) => {

                const pct =
                  totalEarnings > 0
                    ? +((pm.total / totalEarnings) * 100).toFixed(1)
                    : 0

                const color =
                  modeColors[pm._id] || '#5c6b73'

                const modeIcons = {
                  CASH: Banknote,
                  ONLINE: Globe,
                  UPI: Smartphone,
                  CHEQUE: FileText,
                }

                const ModeIcon =
                  modeIcons[pm._id] || CreditCard

                const amtFormatted =
                  pm.total >= 10000000
                    ? `₹${(pm.total / 10000000).toFixed(2)} Cr`
                    : pm.total >= 100000
                      ? `₹${(pm.total / 100000).toFixed(2)} L`
                      : `₹${pm.total.toLocaleString('en-IN')}`

                return (

                  <div
                    key={i}
                    className="group rounded-lg border border-slate-100 p-2.5 hover:border-slate-200 hover:shadow-sm transition-all duration-200"
                    style={{
                      background:
                        'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    }}
                  >

                    <div className="flex items-center gap-2 mb-1.5">

                      <span
                        className="p-1.5 rounded-lg"
                        style={{
                          background: `${color}18`,
                        }}
                      >

                        <ModeIcon
                          size={12}
                          style={{ color }}
                        />

                      </span>

                      <span className="text-[11px] font-bold text-slate-700 flex-1">
                        {pm._id}
                      </span>

                      <span className="text-[9px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">

                        {pm.count} txns

                      </span>

                    </div>

                    <div className="flex items-end justify-between mb-1">

                      <span
                        className="text-[13px] font-medium tabular-nums"
                        style={{ color }}
                      >
                        {amtFormatted}
                      </span>

                      <span
                        className="text-[13px] font-medium"
                        style={{ color }}
                      >
                        {pct}%
                      </span>

                    </div>

                    <div className="h-1.5 bg-white rounded-full overflow-hidden shadow-inner">

                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(pct, 1)}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}99)`,
                        }}
                      />

                    </div>

                  </div>
                )
              })}

            </div>

          ) : (

            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No payment data
            </div>

          )}

        </div>

      </div>

      {/* ══ ROW 5 — CATEGORY + CLASS-WISE + RELIGION ══ */}
      {/* ══ ROW 5 — CATEGORY + CLASS-WISE + RELIGION ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Student Categories */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">

          <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">
            Student Categories
          </p>

          <p className="text-[11px] text-slate-600 mt-0 mb-2">
            Breakdown by category
          </p>

          {categoryStats.length > 0 ? (

            <div className="space-y-2.5">

              {categoryStats.map((cat, i) => {

                const pct =
                  totalStudents > 0
                    ? +((cat.count / totalStudents) * 100).toFixed(1)
                    : 0

                return (

                  <div key={i}>

                    <div className="flex items-center justify-between mb-1">

                      <div className="flex items-center gap-1.5">

                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              catColors[i % catColors.length],
                          }}
                        />

                        <span className="text-[12px] font-medium text-slate-700">
                          {cat._id || 'Unknown'}
                        </span>

                      </div>

                      <span className="text-[11px] font-bold text-slate-700">

                        {cat.count}

                        <span className="text-slate-600 font-normal ml-0.5">
                          ({pct}%)
                        </span>

                      </span>

                    </div>

                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            catColors[i % catColors.length],
                        }}
                      />

                    </div>

                  </div>
                )
              })}

            </div>

          ) : (

            <div className="h-24 flex items-center justify-center text-xs text-slate-600 bg-slate-50 rounded-xl">
              No category data
            </div>

          )}

        </div>

        {/* Class-wise Students */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">

          <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">
            Class-wise Students
          </p>

          <p className="text-[11px] text-slate-600 mt-0 mb-2">
            Top classes by enrollment
          </p>

          {classWiseStudents.length > 0 ? (

            <div className="space-y-2">

              {classWiseStudents.slice(0, 8).map((cls, i) => {

                const pct =
                  totalStudents > 0
                    ? +((cls.count / totalStudents) * 100).toFixed(1)
                    : 0

                return (

                  <div
                    key={i}
                    className="flex items-center gap-2.5"
                  >

                    <span className="text-[11px] text-slate-600 font-medium w-16 truncate">
                      {cls.className}
                    </span>

                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: '#042954',
                        }}
                      />

                    </div>

                    <span className="text-[11px] font-bold text-slate-700 w-7 text-right">
                      {cls.count}
                    </span>

                  </div>
                )
              })}

            </div>

          ) : (

            <div className="h-24 flex items-center justify-center text-xs text-slate-800 bg-slate-50 rounded-xl">
              No class data
            </div>

          )}

        </div>

        {/* Religion Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">

          <p className="text-lg font-bold text-slate-800 tracking-tight leading-none">
            Religion Breakdown
          </p>

          <p className="text-[11px] text-slate-600 mt-0 mb-2">
            Students by religion
          </p>

          {religionStats.length > 0 ? (

            <div className="flex items-center gap-3">

              <DonutCanvas
                data={religionStats.map(r => ({
                  label: r._id || 'Unknown',
                  value: r.count,
                }))}
                colors={[
                  '#042954',
                  '#1a4a7a',
                  '#3d5a80',
                  '#4a6fa5',
                  '#5c6b73',
                ]}
                size={90}
                label="Total"
              />

              <div className="flex flex-col gap-2 flex-1">

                {religionStats.map((r, i) => {

                  const pct =
                    totalStudents > 0
                      ? +((r.count / totalStudents) * 100).toFixed(1)
                      : 0

                  return (

                    <div key={i}>

                      <div className="flex items-center justify-between mb-0.5">

                        <div className="flex items-center gap-1.5">

                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              background:
                                catColors[i % catColors.length],
                            }}
                          />

                          <span className="text-[11px] text-slate-600">
                            {r._id || 'Unknown'}
                          </span>

                        </div>

                        <span className="text-[11px] font-bold text-slate-700">
                          {r.count}
                        </span>

                      </div>

                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">

                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              catColors[i % catColors.length],
                          }}
                        />

                      </div>

                    </div>
                  )
                })}

              </div>

            </div>

          ) : (

            <div className="h-24 flex items-center justify-center text-xs text-slate-800 bg-slate-50 rounded-xl">
              No religion data
            </div>

          )}

        </div>

      </div>

      {/* ══ ROW 6 — RECENT STUDENTS + RECENT PAYMENTS ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">

        {/* ── Recent Admissions ── */}
        {/* ────────────────────────────────
        RECENT ADMISSIONS
──────────────────────────────── */}
        <div className="relative overflow-x-auto">

          <div className="bg-white overflow-hidden rounded-lg border border-blue-100 relative min-h-[300px]">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100">




              {/* TITLE */}
              <div className="leading-none">

                <p className="text-xl font-bold text-slate-800 tracking-tight leading-none m-2">
                  Recent Admissions
                </p>

                <p className="text-[13px] text-slate-400 leading-none mt-2 mx-2">
                  Latest {recentStudents.length} enrolled students
                </p>

              </div>



              {!isSuperAdmin && (
                <button
                  onClick={() => navigate('/student/studentlist')}
                  className="
            flex items-center gap-1
            text-xs font-semibold
            px-3 py-1.5
            rounded-lg
            transition-colors
          "
                  style={{
                    color: '#042954',
                    background: '#eef2f7',
                  }}
                >
                  View All

                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>

                </button>
              )}

            </div>

            {/* EMPTY */}
            {recentStudents.length === 0 ? (

              <div className="flex flex-col justify-center items-center py-20">

                <GraduationCap className="w-16 h-16 text-gray-300 mb-4" />

                <p className="text-gray-500 text-sm">
                  No admissions available
                </p>

                {!isSuperAdmin && (
                  <button
                    onClick={() => navigate('/student/admission')}
                    className="
              mt-4
              px-4 py-2
              rounded-lg
              text-sm
              font-medium
              transition
            "
                    style={{
                      background: '#eef2f7',
                      color: '#042954',
                    }}
                  >
                    + Add first student
                  </button>
                )}

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="min-w-full border border-gray-300 overflow-hidden table-fixed">

                  {/* COLUMN WIDTH */}
                  <colgroup>
                    <col className="w-[100px]" />
                    <col className="w-[200px]" />
                    <col className="w-[100px]" />
                    <col className="w-[150px]" />
                    <col className="w-[150px]" />
                  </colgroup>

                  {/* HEADER */}
                  <thead className="bg-gray-200 text-gray-600">

                    <tr>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Sr No
                      </th>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Student
                      </th>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Class
                      </th>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Gender
                      </th>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Date
                      </th>

                    </tr>

                  </thead>

                  {/* BODY */}
                  <tbody className="bg-white divide-y divide-gray-200">

                    {recentStudents.map((s, i) => {

                      const initials =
                        `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`

                      const avatarColors = [
                        ['#e8edf4', '#042954'],
                        ['#eef2f7', '#1a4a7a'],
                        ['#e8edf4', '#3d5a80'],
                        ['#f0f3f7', '#4a6fa5'],
                        ['#eef2f7', '#042954'],
                        ['#e8edf4', '#1a4a7a'],
                      ]

                      const [abg, afg] =
                        avatarColors[i % avatarColors.length]

                      const isMale = s.gender === 'Male'

                      return (

                        <tr
                          key={i}
                          className="
                    border-t
                    hover:bg-gray-50
                    transition-colors
                    cursor-pointer
                  "
                        >

                          {/* SR NO */}
                          <td className="px-2 py-2 text-center text-sm font-semibold text-slate-600">

                            {i + 1}

                          </td>

                          {/* STUDENT */}
                          <td className="px-2 py-2 text-center">

                            {/* STUDENT */}


                            {/* INFO */}

                            <p
                              className="
          text-sm
          font-medium
          text-slate-800
          truncate
          leading-tight
        "
                            >
                              {s.firstName} {s.lastName}
                            </p>



                          </td>

                          {/* CLASS */}
                          <td className="px-2 py-2 text-center">

                            <span className="
    text-sm
    font-medium
    text-slate-700
  ">

                              {s.currentClass?.name || '--'}

                              {s.currentSection?.name
                                ? ` - ${s.currentSection.name}`
                                : ''}

                            </span>

                          </td>

                          {/* GENDER */}
                          <td className="px-3 py-2 text-center">

                            <span
                              className="
      text-sm
      font-medium
      text-slate-700
    "
                            >
                              {isMale ? '♂ Male' : '♀ Female'}
                            </span>

                          </td>
                          {/* DATE */}
                          <td className="px-3 py-2 text-center text-sm text-gray-600">

                            {s.createdAt
                              ? new Date(s.createdAt).toLocaleDateString(
                                'en-IN',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                }
                              )
                              : '--'}

                          </td>

                        </tr>

                      )
                    })}

                  </tbody>

                </table>

              </div>

            )}

            {/* FOOTER */}
            {recentStudents.length > 0 && (

              <div className="
        px-4 py-2.5
        bg-slate-50
        border-t border-slate-100
        flex items-center justify-between
      ">

                <p className="text-sm text-slate-500">

                  Total enrolled :

                  <span className="font-bold text-slate-700 ml-1">
                    {totalStudents}
                  </span>

                </p>

                {!isSuperAdmin && (
                  <button
                    onClick={() => navigate('/student/admission')}
                    className="
              text-sm
              font-semibold
              hover:opacity-70
              transition-opacity
              flex items-center gap-1
            "
                    style={{ color: '#042954' }}
                  >
                    + New Admission
                  </button>
                )}

              </div>

            )}

          </div>

        </div>

        {/* ── Recent Payments ── */}
        {/* ────────────────────────────────
        RECENT PAYMENTS
──────────────────────────────── */}
        <div className="relative overflow-x-auto">

          <div className="bg-white overflow-hidden rounded-lg border border-blue-100 relative min-h-[300px]">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100">

              {/* TITLE */}
              <div className="leading-none">

                <p className="text-xl font-bold text-slate-800 tracking-tight leading-none m-2">
                  Recent Payments
                </p>

                <p className="text-[13px] text-slate-400 leading-none mt-2 mx-2">
                  Latest {recentPayments.length} fee collections
                </p>

              </div>

              {/* BUTTON */}
              {!isSuperAdmin && (
                <button
                  onClick={() => navigate('/fee/feescollection')}
                  className="
        flex items-center gap-1
        text-[11px] font-semibold
        px-2 py-1
        rounded-md
        leading-none
        transition-colors
      "
                  style={{
                    color: '#2d6a4f',
                    background: '#eef5f1',
                  }}
                >
                  Collect Fee

                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>

                </button>
              )}

            </div>

            {/* EMPTY */}
            {recentPayments?.length === 0 ? (

              <div className="flex flex-col justify-center items-center py-20">

                <IndianRupeeIcon className="w-16 h-16 text-gray-300 mb-4" />

                <p className="text-gray-500 text-sm">
                  No payments available
                </p>

                {!isSuperAdmin && (
                  <button
                    onClick={() => navigate('/fee/feescollection')}
                    className="
              mt-4
              px-4 py-2
              rounded-lg
              text-sm
              font-medium
              transition
            "
                    style={{
                      background: '#eef5f1',
                      color: '#2d6a4f',
                    }}
                  >
                    + Collect Fee
                  </button>
                )}

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="min-w-full border border-gray-300 overflow-hidden table-fixed">

                  {/* COLUMN WIDTH */}
                  <colgroup>
                    <col className="w-[10%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[20%]" />
                  </colgroup>

                  {/* HEADER */}
                  <thead className="bg-gray-200 text-gray-600">

                    <tr>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Sr No
                      </th>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Student
                      </th>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Payment Mode
                      </th>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Amount
                      </th>

                      <th className="px-3 py-2 text-center text-sm font-semibold">
                        Date
                      </th>

                    </tr>

                  </thead>

                  {/* BODY */}
                  <tbody className="bg-white divide-y divide-gray-200">

                    {(recentPayments || []).map((p, index) => {

                      const modeColor =
                        modeColors[p.paymentMode] || '#5c6b73'

                      const modeBg = '#f0f3f7'

                      const modeIconMap = {
                        CASH: Banknote,
                        ONLINE: Globe,
                        UPI: Smartphone,
                        CHEQUE: FileText,
                      }

                      const ModeRowIcon =
                        modeIconMap[p.paymentMode] || CreditCard

                      const firstName =
                        p.studentId?.firstName || '--'

                      const lastName =
                        p.studentId?.lastName || ''

                      const initials =
                        `${firstName[0] || ''}${lastName[0] || ''}`

                      const rollNo =
                        p.studentId?.rollNumber

                      const showRoll =
                        rollNo &&
                        rollNo !== 'null' &&
                        rollNo !== 'N/A' &&
                        rollNo !== ''

                      return (

                        <tr
                          key={p?._id || index}
                          className="
                    border-t
                    hover:bg-gray-50
                    transition-colors
                    cursor-pointer
                  "
                        >

                          {/* SR NO */}
                          <td className="px-2 py-2 text-center text-sm font-semibold text-slate-600">

                            {index + 1}

                          </td>

                          {/* STUDENT */}
                          <td className="px-2 py-2 text-center">




                            {/* INFO */}

                            {/* NAME */}
                            <h3 className="
                          text-sm
                         font-medium
                          text-slate-800
                          leading-tight
                          truncate
                        ">
                              {firstName} {lastName}
                            </h3>



                          </td>

                          {/* PAYMENT MODE */}
                          <td className="px-2 py-2 text-center">

                            <span
                              className="
      inline-block
      px-3 py-1
      rounded-full
      text-sm
      font-medium
    "

                            >
                              {p.paymentMode || '--'}
                            </span>

                          </td>

                          {/* AMOUNT */}
                          <td className="px-2 py-2 text-center">

                            <p
                              className="text-sm font-medium"
                              style={{ color: '#2d6a4f' }}
                            >
                              ₹{(p.amountPaid || 0).toLocaleString('en-IN')}
                            </p>

                          </td>

                          {/* DATE */}
                          <td className="px-2 py-2 text-center text-sm text-gray-600">

                            {p?.createdAt
                              ? new Date(p.createdAt).toLocaleDateString('en-IN')
                              : '--'}

                          </td>

                        </tr>

                      )
                    })}

                  </tbody>

                </table>

              </div>

            )}

            {/* FOOTER */}
            {recentPayments.length > 0 && (

              <div className="
        px-3 py-2
        border-t border-gray-200
        flex items-center justify-between
        bg-slate-50
      ">

                <div className="flex items-center gap-4">

                  <p className="text-sm text-slate-500">

                    Total Collected :

                    <span
                      className="font-bold ml-1"
                      style={{ color: '#2d6a4f' }}
                    >
                      ₹{totalEarnings.toLocaleString('en-IN')}
                    </span>

                  </p>

                  {pendingFees > 0 && (

                    <p className="text-sm text-slate-500">

                      Pending :

                      <span
                        className="font-bold ml-1"
                        style={{ color: '#7a2d2d' }}
                      >
                        ₹{pendingFees.toLocaleString('en-IN')}
                      </span>

                    </p>

                  )}

                </div>

                {!isSuperAdmin && (

                  <button
                    onClick={() => navigate('/fee/feesreport')}
                    className="
              text-sm
              font-semibold
              hover:opacity-70
              transition
              flex items-center gap-1
            "
                    style={{ color: '#2d6a4f' }}
                  >
                    Fee Report →
                  </button>

                )}

              </div>

            )}

          </div>

        </div>
      </div>

      {/* ══ ROW 7 — SUBSCRIPTION BANNER ══ */}
      {/* <div className="rounded-2xl overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)' }}>
        <div className="p-6 flex flex-col sm:flex-row gap-6 justify-between">

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-white/10">
                <CreditCard className="w-4 h-4 text-blue-300" />
              </div>
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Current Plan</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
                style={{ background: isPlanActive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', color: isPlanActive ? '#6ee7b7' : '#94a3b8' }}>
                {isPlanActive ? '● Active' : '○ Inactive'}
              </span>
            </div>
            <p className="text-2xl font-black text-white leading-tight">{planName}</p>
            <p className="text-sm text-blue-300 mt-1">
              {billingCycle !== '--' ? `${billingCycle} billing` : '--'}
              {planPrice !== '--' ? ` · ₹${Number(planPrice).toLocaleString('en-IN')}` : ''}
            </p>
          </div>

   
          <div className="flex-1 space-y-2.5">
            {[
              { label: 'Student Limit',    value: studentLimit > 0 ? studentLimit.toLocaleString('en-IN') : '--' },
              { label: 'Used / Remaining', value: `${usedStudents} / ${remaining}` },
              { label: 'Expires',          value: endDate, icon: CalendarDays },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/10 last:border-0">
                <span className="text-xs text-blue-300 flex items-center gap-1.5 font-medium">
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {label}
                </span>
                <span className="text-xs font-bold text-white">{value}</span>
              </div>
            ))}
          </div>


          <div className="flex-1">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-blue-300 font-medium">Student usage</span>
              <span className="text-white font-black">{usagePct}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(usagePct, 2)}%`, background: usagePct > 80 ? '#f87171' : '#85B7EB' }}
              />
            </div>
            <p className="text-xs text-blue-300 mt-2">
              {usedStudents} of {studentLimit > 0 ? studentLimit : '--'} seats used
            </p>
            {usagePct > 80 && (
              <p className="text-xs text-red-300 mt-1 font-medium">⚠ Approaching student limit</p>
            )}
          </div>
        </div>
      </div> */}

      {/* ================= RECENT NOTICE SECTION ================= */}

      {/* RECENT NOTICE TABLE UI */}
      <div className="relative overflow-x-auto">


        <div className="bg-white overflow-hidden rounded-lg border border-blue-100 relative min-h-[300px]">
          <div className="flex items-center gap-2.5">

            <div>
              <p className="text-xl font-bold text-slate-800 tracking-tight mx-4 mt-3">              Recents Notices</p>

            </div>
          </div>
          {/* LOADING */}
          {loading ? (
            <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
              <Loader /> Loading Notices....
            </div>
          ) : recentNotices?.length === 0 ? (

            /* EMPTY */
            <div className="flex flex-col justify-center items-center py-20">

              <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />

              <p className="text-gray-500 text-sm">
                No notices available
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full border border-gray-300 overflow-hidden table-fixed">

                {/* COLUMN WIDTH */}
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[40%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                </colgroup>

                {/* HEADER */}
                <thead className="bg-gray-200 text-gray-600">

                  <tr>
                    <th className="px-3 py-2 text-center text-sm font-semibold">
                      Sr No
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold">
                      Notice
                    </th>

                    <th className="px-3 py-2 text-center text-sm font-semibold">
                      Receiver
                    </th>

                    <th className="px-3 py-2 text-center text-sm font-semibold">
                      Sender
                    </th>

                    <th className="px-3 py-2 text-center text-sm font-semibold">
                      Date
                    </th>

                  </tr>

                </thead>

                {/* BODY */}
                <tbody className="bg-white divide-y divide-gray-200">

                  {(d?.recentNotices || []).map((notice, index) => {

                    console.log('NOTICE => ', notice)

                    return (

                      <tr
                        key={notice?._id || index}
                        onClick={() => {
                          setSelectedNotice(notice)
                          setNoticeModal(true)
                        }}
                        className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-2 py-2 text-center text-sm font-semibold text-slate-600">

                          {(noticePage - 1) * noticeLimit + index + 1}

                        </td>
                        {/* NOTICE */}
                        {/* NOTICE */}
                        <td className="px-2 py-2 text-center">



                          {/* TITLE */}
                          <p className="
      text-sm
      font-medium
      text-slate-800
      leading-tight
    ">
                            {notice?.title || '--'}
                          </p>





                        </td>

                        {/* RECEIVER */}
                        <td className="px-2 py-2 text-center">

                          <span className="
        
            text-sm
            font-medium
          ">

                            {notice?.recipients?.roles?.length > 0
                              ? notice?.recipients?.roles?.join(', ')
                              : 'Specific Users'}

                          </span>

                        </td>

                        {/* SENDER */}
                        <td className="px-2 py-2 text-center">

                          <p className="font-medium text-gray-900">
                            {notice?.senderName || '--'}
                          </p>

                          {/* <p className="text-xs text-gray-500">
                            {notice?.senderRole || '--'}
                          </p> */}

                        </td>

                        {/* DATE */}
                        <td className="px-2 py-2 text-center text-sm text-gray-600">

                          {notice?.createdAt
                            ? new Date(notice.createdAt).toLocaleDateString('en-IN')
                            : '--'}

                        </td>

                      </tr>

                    )
                  })}

                </tbody>

              </table>

            </div>

          )}

          {/* PAGINATION */}
   

        </div>

      </div>

      {/* ================= NOTICE MODAL ================= */}
      <Modal
        open={noticeModal}
        footer={null}
        onCancel={() => setNoticeModal(false)}
        width={900}
        centered
        bodyStyle={{
          maxHeight: '75vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {selectedNotice && (

          <div className="bg-white rounded-xl overflow-hidden">

            {/* HEADER */}
            <div className="border-b border-slate-200 pb-1">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-bold text-slate-800 leading-snug">
                    {selectedNotice?.title}
                  </h2>

                  <div className="flex items-center gap-3 mt-2">

                    <div className="w-11 h-11 rounded-full bg-[#042954]/10 flex items-center justify-center">

                      <Bell className="w-5 h-5 text-[#042954]" />

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-700">
                        {selectedNotice?.senderName || 'Admin'}
                      </p>

                      <p className="text-xs text-slate-400">
                        {selectedNotice?.senderRole}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="text-right">

                  {/* <p className="text-xs text-slate-400">
                    {new Date(
                      selectedNotice?.createdAt
                    ).toLocaleString('en-IN')}
                  </p> */}

                </div>

              </div>

            </div>

            {/* BODY */}
            <div className="py-6">

              {/* DESCRIPTION */}
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-7">

                {selectedNotice?.description}

              </div>

              {/* RECIPIENTS */}
              <div className="mt-6">

                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Recipients
                </p>

                <div className="flex flex-wrap gap-2">

                  {selectedNotice?.recipients?.roles?.map((role, idx) => (

                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                    >
                      {role}
                    </span>

                  ))}

                </div>

              </div>

              {/* ATTACHMENT */}
              {selectedNotice?.attachment && (

                <div className="mt-6">

                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Attachment
                  </p>

                  <a
                    href={selectedNotice?.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-all"
                  >

                    <div className="w-11 h-11 rounded-xl bg-[#eef2f7] flex items-center justify-center">

                      <FileText className="w-5 h-5 text-[#042954]" />

                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold text-slate-700">
                        View Attachment
                      </p>

                      <p className="text-xs text-slate-400 truncate">
                        {selectedNotice?.attachment}
                      </p>

                    </div>

                    {/* <Download className="w-5 h-5 text-slate-500" /> */}

                  </a>

                </div>

              )}

            </div>

          </div>

        )}

      </Modal>


    </div>
  )
}
