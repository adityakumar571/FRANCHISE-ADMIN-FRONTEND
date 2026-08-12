/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import {
  Bell, CalendarCheck, TrendingUp, CheckCircle,
  BookOpen, MapPin, Phone, User, AlertTriangle, Award, AlertCircle, CreditCard, Clock, Check
} from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { SessionContext } from '../../Context/Seesion'
import { AppContext } from '../../Context/AppContext'
import { getRequest } from '../../Helpers'
import { Modal, Skeleton } from 'antd'
import Loader from '../../components/Loading/Loader'

/* ─────────────────────────────────────────
   DESIGN TOKENS  — Keep color values safe
───────────────────────────────────────── */
const C = {
  brand: '#042954',
  brandDark: '#021933',
  brandMid: '#0a4a8a',
  brandBg: '#eef3fa',
  brandBorder: '#c5d6ee',
  brandText: '#042954',

  good: '#1a7f5a',
  goodBg: '#edfaf4',
  goodBorder: '#b6e8d4',

  warn: '#b45309',
  warnBg: '#fef9ec',
  warnBorder: '#f5d98a',

  danger: '#b91c1c',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',

  bg: '#ffffff',
  cardBg: '#ffffff',
  cardBorder: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  divider: '#f1f5f9',

  font: "'Inter','Segoe UI',system-ui,sans-serif",
}

/* ─── helpers ─── */
function useCountUp(target, dur = 1200) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!target) return setV(0)
    let s = 0; const step = target / (dur / 16)
    const t = setInterval(() => { s += step; if (s >= target) { setV(target); clearInterval(t) } else setV(Math.floor(s)) }, 16)
    return () => clearInterval(t)
  }, [target])
  return v
}
function Num({ v, suf = '' }) {
  const d = useCountUp(typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0)
  return <>{d.toLocaleString('en-IN')}{suf}</>
}

/* ─── Ring ─── */
function Ring({ pct, color, size = 120, stroke = 11 }) {
  const [p, setP] = useState(0)
  useEffect(() => { const t = setTimeout(() => setP(pct), 400); return () => clearTimeout(t) }, [pct])
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (p / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  )
}

/* ─── grade ─── */
function getGrade(pct) {
  if (pct >= 90) return { grade: 'A+', label: 'Outstanding', color: C.brand, bg: C.brandBg, border: C.brandBorder }
  if (pct >= 80) return { grade: 'A', label: 'Excellent', color: C.brand, bg: C.brandBg, border: C.brandBorder }
  if (pct >= 70) return { grade: 'B', label: 'Good', color: C.good, bg: C.goodBg, border: C.goodBorder }
  if (pct >= 60) return { grade: 'C', label: 'Average', color: C.warn, bg: C.warnBg, border: C.warnBorder }
  if (pct >= 50) return { grade: 'D', label: 'Below Avg', color: C.warn, bg: C.warnBg, border: C.warnBorder }
  return { grade: 'F', label: 'Failing', color: C.danger, bg: C.dangerBg, border: C.dangerBorder }
}

/* ─── skeleton ─── */
function PageSkeleton() {
  return (
    <div className="p-4 bg-white min-h-screen">
      <Skeleton active paragraph={{ rows: 1 }} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[0, 1, 2].map(i => <Skeleton key={i} active paragraph={{ rows: 3 }} />)}
      </div>
    </div>
  )
}

/* ─── InfoRow ─── */
function InfoRow({ label, value, icon: Icon }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 gap-3">
      <div className="flex items-center gap-2 shrink-0">
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <Icon size={14} className="text-slate-700" />
          </div>
        )}
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-sm text-slate-500 font-medium text-right break-words max-w-[55%]">{value}</span>
    </div>
  )
}

/* ─── KPI Card ─── */
function KpiCard({
  icon: Icon,
  iconColor,
  iconBg,
  borderColor,
  badge,
  badgeColor,
  badgeBg,
  badgeBorder,
  label,
  value,
  valueColor,
  sub,
  subColor,
}) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      {/* TOP CIRCLE */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-40" style={{ background: iconBg }} />

      <div className="relative z-10">
        {/* TOP */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0" style={{ background: iconBg, borderColor }}>
            <Icon size={20} color={iconColor} />
          </div>

          {badge && (
            <span className="text-xs font-medium rounded-full px-2.5 py-0.5 whitespace-nowrap" style={{ color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}` }}>
              {badge}
            </span>
          )}
        </div>

        {/* LABEL Theme Style */}
        <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1">
          {label}
        </p>

        {/* VALUE Theme Style */}
        <h2 className="text-2xl font-medium text-slate-800 tracking-tight mb-1" style={{ color: valueColor }}>
          <Num v={value} suf={label === 'Attendance' || label === 'Exam Score' ? '%' : ''} />
        </h2>

        {/* SUB Theme Style */}
        {sub && (
          <p className="text-sm text-slate-500" style={{ color: subColor }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════ MAIN ══════════════════════ */
export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentSession } = useContext(SessionContext)
  const { user, tenantDetails } = useContext(AppContext)
  const [data, setData] = useState(null)
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [noticeModal, setNoticeModal] = useState(false)
  const [noticeLoading, setNoticeLoading] = useState(false)

  const profile = user?.profile
  const studentId = profile?._id
  const sessionId = currentSession?._id
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!studentId || !sessionId) return
    setLoading(true); setError(null)
    getRequest(`admin/student/dashboard?sessionId=${sessionId}&studentId=${studentId}`)
      .then(r => { if (r?.data?.success) setData(r.data.data); else throw new Error() })
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [studentId, sessionId])

  if (!sessionId || !studentId || loading) return <PageSkeleton />
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 bg-white">
      <AlertTriangle size={48} className="text-red-600" />
      <p className="text-base text-slate-800 font-semibold">{error}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-[#042954] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#021933] transition-colors">
        Retry
      </button>
    </div>
  )

  const present = data?.attendance?.present || 0
  const absent = data?.attendance?.absent || 0
  const totalDays = data?.attendance?.totalDays || (present + absent)
  const attendPct = data?.attendance?.percentage || 0
  const examPct = data?.latestExamPercentage || 0
  const notices = data?.unreadNotices || 0
  const recentNotices = data?.recentNotices || []
  const subjectPerformance = data?.subjectPerformance || []
  const examHistory = data?.examHistory || []
  const totalFeesPaid = data?.fees?.totalPaid || 0
  const recentPayments = data?.fees?.recentPayments || []

  const g = getGrade(examPct)

  /* attendance semantic — muted palette */
  const att = attendPct >= 75
    ? { color: C.good, bg: C.goodBg, border: C.goodBorder, label: attendPct >= 90 ? '⭐ Excellent' : '✓ Good' }
    : attendPct >= 50
      ? { color: C.warn, bg: C.warnBg, border: C.warnBorder, label: '⚠ Average' }
      : { color: C.danger, bg: C.dangerBg, border: C.dangerBorder, label: '✗ Low' }

  const addr = profile?.address?.present
  const fullAddr = addr ? [addr.Address1, addr.City, addr.State, addr.Pin].filter(Boolean).join(', ') : null

  return (
    <div className="min-h-screen ">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        {/* LEFT */}
        <div>
          {/* HEADING Theme Style */}

        </div>

        {/* RIGHT DATE */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 shadow-sm self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
          <span className="text-xs text-slate-600 font-semibold tracking-wide">
            {today}
          </span>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Bell} iconColor={C.brand} iconBg={C.brandBg} borderColor={C.brandBorder}
          badge={notices > 0 ? 'NEW' : null} badgeColor="#fff" badgeBg={C.brand} badgeBorder={C.brand}
          label="Notices" value={notices} valueColor={C.brand}
          sub={notices > 0 ? 'Unread notices' : 'All caught up!'} subColor={C.brand}
        />
        <KpiCard
          icon={CalendarCheck} iconColor={att.color} iconBg={att.bg} borderColor={att.border}
          badge={att.label} badgeColor={att.color} badgeBg={att.bg} badgeBorder={att.border}
          label="Attendance" value={attendPct} valueColor={att.color}
          sub={`${present}P · ${absent}A · ${totalDays} days`} subColor={C.textMuted}
        />
        <KpiCard
          icon={TrendingUp} iconColor={g.color} iconBg={g.bg} borderColor={g.border}
          badge={g.grade} badgeColor={g.color} badgeBg={g.bg} badgeBorder={g.border}
          label="Exam Score" value={examPct} valueColor={g.color}
          sub={g.label} subColor={g.color}
        />
        <KpiCard
          icon={CreditCard} iconColor={C.good} iconBg={C.goodBg} borderColor={C.goodBorder}
          badge="PAID" badgeColor={C.good} badgeBg={C.goodBg} badgeBorder={C.goodBorder}
          label="Total Fees Paid" value={totalFeesPaid} valueColor={C.good}
          sub="Recent receipts below" subColor={C.textSecondary}
        />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">

        {/* ── PROFILE CARD ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Top identity strip */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={profile?.profilePic || data?.schoolInfo?.schoolLogo || `https://ui-avatars.com/api/?name=${profile?.firstName || 'S'}+${profile?.lastName || 'T'}&background=042954&color=fff&size=120&bold=true`}
                className="w-16 h-16 rounded-xl border-2 border-slate-200 object-cover block"
                alt="Student"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-600 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              {/* HEADING Style */}
              <h3 className="text-xl font-bold text-slate-800 tracking-tight truncate">
                {profile?.firstName} {profile?.middleName || ''} {profile?.lastName}
              </h3>
              {/* SMALL TEXT Style */}
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <BookOpen size={13} className="text-slate-400" />
                Class: {profile?.currentClass?.name || '—'} · Section {profile?.currentSection?.name || '—'}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs font-semibold bg-slate-50 text-slate-700 rounded-full px-3 py-0.5 border border-slate-200">
                  ID: {profile?.studentId || '—'}
                </span>
                <span className="text-xs font-semibold bg-slate-50 text-slate-700 rounded-full px-3 py-0.5 border border-slate-200">
                  Roll:{profile?.rollNumber || '—'}
                </span>
                <span className="text-xs font-semibold bg-slate-50 text-slate-700 rounded-full px-3 py-0.5 border border-slate-200">
                  Medium: {profile?.medium || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="p-4 pt-2">
            {/* LABEL Style */}
            <p className="text-sm font-medium text-slate-700 uppercase tracking-wide mt-2 mb-1">Personal Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <InfoRow label="Gender" value={profile?.gender} icon={User} />
              <InfoRow label="Religion" value={profile?.religion || '—'} icon={User} />
              <InfoRow label="Father" value={profile?.fatherName} icon={User} />
              <InfoRow label="Mother" value={profile?.motherName} icon={User} />
              <InfoRow label="Date of Birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN') : null} icon={CalendarCheck} />
              <InfoRow label="Phone" value={profile?.phone || user?.phone} icon={Phone} />
              <InfoRow label="Apar ID" value={profile?.aparId} icon={Award} />
              <InfoRow label="PEN No" value={profile?.penNo} icon={Award} />
              <InfoRow label="Category" value={profile?.category?.toUpperCase()} icon={User} />
              <InfoRow label="Handicapped" value={profile?.handicapped} icon={AlertTriangle} />
            </div>
            {fullAddr && (
              <div className="mt-2">
                <InfoRow label="Address" value={fullAddr} icon={MapPin} />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-4">

          {/* Attendance Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Attendance</h2>
                <p className="text-sm text-slate-500 mt-0.5">This session overview</p>
              </div>
              <span className="text-xs font-bold rounded-full px-2.5 py-0.5 border" style={{ color: att.color, background: att.bg, borderColor: att.border }}>
                {att.label}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <Ring pct={attendPct} color={att.color} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-medium" style={{ color: att.color }}>{attendPct}%</span>
                  <span className="text-xs text-slate-400 font-medium">Rate</span>
                </div>
              </div>
              <div className="w-full flex-1 flex flex-col gap-2">
                {[
                  { label: 'Present', value: present, color: C.good, bg: C.goodBg, border: C.goodBorder, Icon: CheckCircle },
                  { label: 'Absent', value: absent, color: C.danger, bg: C.dangerBg, border: C.dangerBorder, Icon: AlertTriangle },
                  { label: 'Holiday', value: data?.attendance?.holiday || 0, color: C.brand, bg: C.brandBg, border: C.brandBorder, Icon: CalendarCheck },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between p-2 rounded-xl border bg-white border-slate-100">
                    <div className="flex items-center gap-2">
                      <row.Icon size={14} color={row.color} />
                      <span className="text-xs font-medium text-slate-600">{row.label}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-800">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Exam Grade Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Latest Result</h2>
                <p className="text-sm text-slate-500 mt-0.5">Overall Status</p>
              </div>
              <span className="text-lg font-medium rounded-xl px-3.5 py-0.5 border" style={{ color: g.color, background: g.bg, borderColor: g.border }}>{g.grade}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <Ring pct={examPct} color={g.color} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-medium" style={{ color: g.color }}>{examPct}%</span>
                  <span className="text-xs text-slate-400 font-medium">Score</span>
                </div>
              </div>
              <div className="w-full flex-1 flex flex-col gap-1.5">
                {[
                  { range: '90–100%', label: 'A+  Outstanding', color: C.brand, bg: C.brandBg, border: C.brandBorder, active: examPct >= 90 },
                  { range: '80–89%', label: 'A   Excellent', color: C.brand, bg: C.brandBg, border: C.brandBorder, active: examPct >= 80 && examPct < 90 },
                  { range: '70–79%', label: 'B   Good', color: C.good, bg: C.goodBg, border: C.goodBorder, active: examPct >= 70 && examPct < 80 },
                  { range: '60–69%', label: 'C   Average', color: C.warn, bg: C.warnBg, border: C.warnBorder, active: examPct >= 60 && examPct < 70 },
                  { range: 'Below 60', label: 'D/F Needs Work', color: C.danger, bg: C.dangerBg, border: C.dangerBorder, active: examPct < 60 },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-2.5 py-1 rounded-lg border text-[13px]" style={{ background: row.bg, borderColor: row.border, opacity: row.active ? 1 : 0.25 }}>
                    <span className="font-bold" style={{ color: row.color }}>{row.label}</span>
                    <span className="text-slate-400 font-medium">{row.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SUBJECT PERFORMANCE LIST ── */}
      {subjectPerformance.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mt-4">
          <div className="mb-3">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Subject Performance</h2>
            <p className="text-sm text-slate-500 mt-0.5">Individual subject analysis break-up</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {subjectPerformance.map((sub, i) => {
              const subGrade = getGrade(sub.percentage);
              return (
                <div key={i} className="border border-slate-100 rounded-xl p-2.5 text-center bg-slate-50/50 flex flex-col justify-between">
                  <p className="text-xs font-medium text-slate-700 uppercase tracking-wider truncate mb-1">
                    {sub.subjectName === '—' ? `Subject ${i + 1}` : sub.subjectName}
                  </p>
                  <div className="my-1">
                    <span className="text-lg font-black font-medium text-slate-800">{sub.percentage}%</span>
                  </div>
                  <div className="text-[13px] font-medium rounded-md px-1 py-0.5 mt-1" style={{ color: subGrade.color, background: subGrade.bg, border: `1px solid ${subGrade.border}` }}>
                    Grade {subGrade.grade}
                  </div>
                  <p className="text-[13px] text-slate-400 mt-1 font-medium">{sub.marksObtained}/{sub.maxMarks}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── SECONDARY MATRIX GRID (TABLES) ── */}
      {/* ── SECONDARY MATRIX GRID (TABLES) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

        {/* ── EXAM HISTORY TABLE ── */}
        <div className="relative overflow-x-auto">
          <div className="bg-white overflow-hidden rounded-lg border border-blue-100 relative min-h-[300px]">
            <div className="flex items-center gap-2.5">
              <div>
                <p className="text-xl font-bold text-slate-800 tracking-tight mx-4 mt-3">Exam Term History</p>
              </div>
            </div>

            {/* LOADING STATE */}
            {loading ? (
              <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
                <Loader /> Loading Exams....
              </div>
            ) : examHistory?.length === 0 ? (
              /* EMPTY STATE */
              <div className="flex flex-col justify-center items-center py-20">
                <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">No previous term records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 overflow-hidden table-fixed">
                  {/* COLUMN WIDTH */}
                  <colgroup>
                    <col className="w-[10%]" />
                    <col className="w-[35%]" />
                    <col className="w-[15%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                  </colgroup>

                  {/* HEADER */}
                  <thead className="bg-gray-200 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Sr No</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Exam Type</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Percentage</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Result</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Declared On</th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody className="bg-white divide-y divide-gray-200">
                 {examHistory.slice(0, 5).map((ex, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50 transition-colors">
                        {/* SERIAL NUMBER */}
                        <td className="px-2 py-2 text-center text-sm font-medium text-slate-600">
                          {index + 1}
                        </td>

                        {/* EXAM NAME */}
                        <td className="px-2 py-2 text-center">
                          <p className="text-sm font-medium text-slate-800 leading-tight">
                            {ex.examName || '--'}
                          </p>
                        </td>

                        {/* PERCENTAGE */}
                        <td className="px-2 py-2 text-center text-sm font-medium text-slate-800">
                          {ex.percentage}%
                        </td>

                        {/* RESULT BADGE */}
                        <td className="px-2 py-2 text-center">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-block ${ex.result === 'PASS'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                            {ex.result}
                          </span>
                        </td>

                        {/* DATE */}
                        <td className="px-2 py-2 text-center text-sm text-gray-600">
                          {ex.createdAt ? new Date(ex.createdAt).toLocaleDateString('en-IN') : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RECENT FEE PAYMENTS HISTORY */}
        {/* ── RECENT FEE PAYMENTS HISTORY ── */}
        <div className="relative overflow-x-auto ">
          <div className="bg-white overflow-hidden rounded-lg border border-blue-100 relative min-h-[300px]">
            <div className="flex items-center gap-2.5">
              <div>
                <p className="text-xl font-bold text-slate-800 tracking-tight mx-4 mt-3">Recent Fee Receipts</p>
              </div>
            </div>

            {/* LOADING STATE */}
            {loading ? (
              <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
                <Loader /> Loading Receipts....
              </div>
            ) : recentPayments.length === 0 ? (
              /* EMPTY STATE */
              <div className="flex flex-col justify-center items-center py-20">
                <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">No payment transaction found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 overflow-hidden table-fixed">
                  {/* COLUMN WIDTH */}
                  <colgroup>
                    <col className="w-[10%]" />
                    <col className="w-[35%]" />
                    <col className="w-[15%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                  </colgroup>

                  {/* HEADER */}
                  <thead className="bg-gray-200 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Sr No</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Receipt No</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Mode</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Paid Date</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold">Amount</th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPayments.slice(0, 5).map((pay, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50 transition-colors">
                        {/* SERIAL NUMBER */}
                        <td className="px-2 py-2 text-center text-sm font-medium text-slate-600">
                          {index + 1}
                        </td>

                        {/* RECEIPT NO */}
                        <td className="px-2 py-2 text-center">
                          <p className="text-sm font-mono font-medium text-slate-800 leading-tight truncate">
                            {pay.receiptNo || '--'}
                          </p>
                        </td>

                        {/* PAYMENT MODE */}
                        <td className="px-2 py-2 text-center">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {pay.mode}
                          </span>
                        </td>

                        {/* PAID DATE */}
                        <td className="px-2 py-2 text-center text-sm text-gray-600">
                          {pay.date ? new Date(pay.date).toLocaleDateString('en-IN') : '--'}
                        </td>

                        {/* AMOUNT */}
                        <td className="px-2 py-2 text-center">
                          <p className="text-sm font-black font-medium text-emerald-700">
                            ₹{pay.amount?.toLocaleString('en-IN') || '--'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT NOTICE TABLE UI */}







      {/* ── RECENT NOTICE TABLE UI ── */}
      <div className="relative overflow-x-auto mt-4">
        <div className="bg-white overflow-hidden rounded-lg border border-blue-100 relative min-h-[300px]">
          <div className="flex items-center gap-2.5">
            <div>
              <p className="text-xl font-bold text-slate-800 tracking-tight mx-4 mt-3">Recents Notices</p>
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
              <p className="text-gray-500 text-sm">No notices available</p>
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
                    <th className="px-3 py-2 text-center text-sm font-semibold">Sr No</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold">Notice</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold">Receiver</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold">Sender</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold">Date</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentNotices.slice(0, 5).map((notice, index) => {
                    // Console log is safe inside block wrapper now
                    console.log('NOTICE => ', notice);

                    // Safe fallback handling for pagination variables if undefined
                    const currentPage = typeof noticePage !== 'undefined' ? noticePage : 1;
                    const currentLimit = typeof noticeLimit !== 'undefined' ? noticeLimit : 10;

                    return (
                      <tr
                        key={notice?._id || index}
                        onClick={() => {
                          setSelectedNotice(notice);
                          setNoticeModal(true);
                        }}
                        className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* SERIAL NUMBER */}
                        <td className="px-2 py-2 text-center text-sm font-medium text-slate-600">
                          {(currentPage - 1) * currentLimit + index + 1}
                        </td>

                        {/* NOTICE TITLE */}
                        <td className="px-2 py-2 text-center">
                          <p className="text-sm font-medium text-slate-800 leading-tight">
                            {notice?.title || '--'}
                          </p>
                        </td>

                        {/* RECEIVER */}
                        <td className="px-2 py-2 text-center">
                          <span className="text-sm font-medium text-slate-600">
                            {notice?.recipients?.roles?.length > 0
                              ? notice?.recipients?.roles?.join(', ')
                              : 'Specific Users'}
                          </span>
                        </td>

                        {/* SENDER */}
                        <td className="px-2 py-2 text-center">
                          <p className="text-sm font-medium text-gray-900">
                            {notice?.senderName || '--'}
                          </p>
                        </td>

                        {/* DATE */}
                        <td className="px-2 py-2 text-center text-sm text-gray-600">
                          {notice?.createdAt
                            ? new Date(notice.createdAt).toLocaleDateString('en-IN')
                            : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {/* NOTICE MODAL */}
      <Modal
        open={noticeModal}
        footer={null}
        onCancel={() => setNoticeModal(false)}
        centered
        width={600}
      >
        <div className="space-y-4 pt-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {selectedNotice?.title || '--'}
            </h2>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
              {selectedNotice?.description || 'No Description'}
            </p>
          </div>
          <div className="flex justify-end items-center pt-3 border-t border-slate-100 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <span>
              Posted: {selectedNotice?.createdAt ? new Date(selectedNotice.createdAt).toLocaleDateString('en-IN') : '--'}
            </span>
          </div>
        </div>
      </Modal>
    </div>
  )
}