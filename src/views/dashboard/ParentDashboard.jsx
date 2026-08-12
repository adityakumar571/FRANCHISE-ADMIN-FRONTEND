/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import {
  Bell, CalendarCheck, IndianRupee, GraduationCap,
  AlertTriangle, CheckCircle, User, BookOpen,
  TrendingUp, Star, ShieldCheck, Clock,
} from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { SessionContext } from '../../Context/Seesion'
import { AppContext } from '../../Context/AppContext'
import { getRequest } from '../../Helpers'
import { Skeleton } from 'antd'

/* ─── helpers ─── */
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return setVal(0)
    let s = 0; const step = target / (duration / 16)
    const t = setInterval(() => { s += step; if (s >= target) { setVal(target); clearInterval(t) } else setVal(Math.floor(s)) }, 16)
    return () => clearInterval(t)
  }, [target])
  return val
}
function Num({ v, pre = '', suf = '' }) {
  const d = useCountUp(typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0)
  return <>{pre}{d.toLocaleString('en-IN')}{suf}</>
}

/* ─── Ring ─── */
function Ring({ pct, color, size = 80, stroke = 8 }) {
  const [p, setP] = useState(0)
  useEffect(() => { const t = setTimeout(() => setP(pct), 400); return () => clearTimeout(t) }, [pct])
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (p / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  )
}

function getGrade(pct) {
  if (pct >= 90) return { grade: 'A+', color: '#6366f1' }
  if (pct >= 80) return { grade: 'A', color: '#10b981' }
  if (pct >= 70) return { grade: 'B', color: '#3b82f6' }
  if (pct >= 60) return { grade: 'C', color: '#f59e0b' }
  return { grade: 'D/F', color: '#f43f5e' }
}

/* ─── skeleton ─── */
function PageSkeleton() {
  return (
    <div className="p-5 space-y-5 bg-[#f8fafc] min-h-screen">
      <div className="flex justify-between"><Skeleton.Input style={{ width: 220, height: 28 }} active /><Skeleton.Input style={{ width: 160, height: 36 }} active /></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2"><Skeleton.Input style={{ width: 60, height: 11 }} active size="small" /><Skeleton.Input style={{ width: 80, height: 26 }} active /></div>)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden"><div className="h-16 bg-slate-200" /><div className="p-4 space-y-3"><Skeleton.Avatar size={56} active /><Skeleton.Input style={{ width: 160, height: 18 }} active />{[...Array(3)].map((_, j) => <Skeleton.Input key={j} style={{ width: '100%', height: 40 }} active />)}</div></div>)}
      </div>
    </div>
  )
}

/* ─── ChildCard ─── */
function ChildCard({ child }) {
  const attendColor = child.attendance.percentage >= 75 ? '#10b981' : child.attendance.percentage >= 50 ? '#f59e0b' : '#f43f5e'
  const { grade, color: gradeColor } = getGrade(child.latestExamPercentage)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Cover */}
      <div className="h-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 60%, #7c3aed 100%)' }}>
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute top-2.5 left-4 text-white/80 text-[10px] font-semibold flex items-center gap-1.5">
          <BookOpen className="w-3 h-3" />
          Class {child.currentClass?.name || '—'} · {child.currentSection?.name || '—'}
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Avatar + name */}
        <div className="flex items-end gap-3 -mt-7 mb-3">
          <img
            src={child.profilePic || `https://ui-avatars.com/api/?name=${child.firstName}+${child.lastName}&background=4f46e5&color=fff&size=80&bold=true`}
            className="w-14 h-14 rounded-xl border-4 border-white shadow-lg object-cover flex-shrink-0"
            alt={child.firstName}
          />
          <div className="pb-1">
            <h3 className="text-sm font-black text-slate-800">{child.firstName} {child.lastName}</h3>
            <p className="text-[10px] text-slate-400">Roll #{child.rollNumber || '—'} · {child.gender || '—'}</p>
          </div>
        </div>

        {/* 3 metric boxes */}
        <div className="grid grid-cols-3 gap-2 mb-3">

          {/* Attendance */}
          <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center gap-1">
            <div className="relative">
              <Ring pct={child.attendance.percentage} color={attendColor} size={56} stroke={6} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black" style={{ color: attendColor }}>{child.attendance.percentage}%</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold text-center">Attendance</p>
          </div>

          {/* Exam */}
          <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center gap-1">
            <div className="relative">
              <Ring pct={child.latestExamPercentage} color={gradeColor} size={56} stroke={6} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black" style={{ color: gradeColor }}>{grade}</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold text-center">Exam</p>
          </div>

          {/* Fees */}
          <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1">
            <IndianRupee className="w-4 h-4 text-amber-500" />
            <div className="text-center">
              <p className="text-[10px] font-black text-emerald-600">₹{(child.fees?.totalPaid || 0).toLocaleString('en-IN')}</p>
              <p className="text-[8px] text-slate-400">Paid</p>
            </div>
            {child.fees?.totalDue > 0 && (
              <div className="text-center">
                <p className="text-[10px] font-black text-rose-500">₹{child.fees.totalDue.toLocaleString('en-IN')}</p>
                <p className="text-[8px] text-slate-400">Due</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance detail */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-slate-400">Present</p>
              <p className="text-xs font-black text-emerald-700">{child.attendance.present}d</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-slate-400">Absent</p>
              <p className="text-xs font-black text-rose-600">{child.attendance.absent}d</p>
            </div>
          </div>
        </div>

        {child.attendance.percentage < 75 && (
          <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 font-semibold">Attendance below 75%!</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function ParentDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const { currentSession } = useContext(SessionContext)
  const { user } = useContext(AppContext)

  const sessionId = currentSession?._id
  const parentUserId = user?.profile?._id || user?._id

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!sessionId) return
    setLoading(true); setError(null)
    getRequest(`admin/parent/dashboard?sessionId=${sessionId}${parentUserId ? `&parentUserId=${parentUserId}` : ''}`)
      .then(r => { if (r?.data?.success) setData(r.data.data); else throw new Error() })
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [sessionId, parentUserId])

  if (loading) return <PageSkeleton />
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <AlertTriangle className="w-12 h-12 text-rose-400" />
      <p className="text-base font-semibold text-slate-700">{error}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow hover:bg-indigo-700 transition">Retry</button>
    </div>
  )

  const children = data?.children || []
  const totalNotices = data?.totalNotices || 0
  const totalPaid = children.reduce((s, c) => s + (c.fees?.totalPaid || 0), 0)
  const totalDue = children.reduce((s, c) => s + (c.fees?.totalDue || 0), 0)
  const avgAttend = children.length > 0
    ? +(children.reduce((s, c) => s + c.attendance.percentage, 0) / children.length).toFixed(1) : 0

  const summaryCards = [
    { label: 'Children', value: children.length, icon: GraduationCap, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    { label: 'Notices', value: totalNotices, icon: Bell, color: 'violet', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    { label: 'Avg Attendance', value: avgAttend, suf: '%', icon: CalendarCheck, bg: avgAttend >= 75 ? 'bg-emerald-50' : 'bg-amber-50', text: avgAttend >= 75 ? 'text-emerald-600' : 'text-amber-600', border: avgAttend >= 75 ? 'border-emerald-100' : 'border-amber-100' },
    { label: 'Fee Due', value: totalDue, pre: '₹', icon: IndianRupee, bg: totalDue > 0 ? 'bg-rose-50' : 'bg-emerald-50', text: totalDue > 0 ? 'text-rose-600' : 'text-emerald-600', border: totalDue > 0 ? 'border-rose-100' : 'border-emerald-100' },
  ]

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 sm:p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Parent Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome, <span className="font-semibold text-slate-700">{user?.name || 'Parent'}</span> 👋 · {currentSession?.sessionName || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600">{today}</span>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl border ${card.border} p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden`}>
            <div className={`absolute -top-5 -right-5 w-16 h-16 rounded-full ${card.bg} opacity-60 group-hover:scale-125 transition-transform duration-500`} />
            <div className="relative">
              <div className={`inline-flex p-2 rounded-xl ${card.bg} mb-2`}>
                <card.icon className={`w-4 h-4 ${card.text}`} />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{card.label}</p>
              <p className={`text-2xl font-black ${card.text}`}>
                <Num v={card.value} pre={card.pre || ''} suf={card.suf || ''} />
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── NOTICES BANNER ── */}
      {totalNotices > 0 && (
        <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-3.5">
          <div className="p-2 bg-violet-100 rounded-xl flex-shrink-0">
            <Bell className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-800">{totalNotices} new notice{totalNotices > 1 ? 's' : ''} from school</p>
            <p className="text-xs text-violet-500">Check the notices section for details</p>
          </div>
        </div>
      )}

      {/* ── CHILDREN ── */}
      {children.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <User className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No children enrolled in this session</p>
          <p className="text-xs text-slate-400 mt-1">Contact school admin if this seems incorrect</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-slate-700">My Children</h2>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{children.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {children.map(child => <ChildCard key={child._id} child={child} />)}
          </div>
        </div>
      )}

      {/* ── FEE SUMMARY ── */}
      {children.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Fee Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">Total Paid</p>
              <p className="text-2xl font-black text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</p>
              <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: totalPaid + totalDue > 0 ? `${(totalPaid / (totalPaid + totalDue)) * 100}%` : '0%' }} />
              </div>
            </div>
            <div className={`${totalDue > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'} border rounded-2xl p-4`}>
              <p className="text-xs text-slate-400 font-medium mb-1">Total Due</p>
              <p className={`text-2xl font-black ${totalDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>₹{totalDue.toLocaleString('en-IN')}</p>
              {totalDue > 0 && <p className="text-[10px] text-rose-500 font-semibold mt-1">⚠ Payment pending</p>}
            </div>
            <div className={`${avgAttend >= 75 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} border rounded-2xl p-4`}>
              <p className="text-xs text-slate-400 font-medium mb-1">Avg Attendance</p>
              <p className={`text-2xl font-black ${avgAttend >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{avgAttend}%</p>
              {avgAttend < 75 && <p className="text-[10px] text-amber-600 font-semibold mt-1">⚠ Below 75% required</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
