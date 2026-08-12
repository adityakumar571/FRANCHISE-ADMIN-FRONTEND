/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import {
  Users, GraduationCap, ClipboardCheck, BookOpen, Award,
  ChevronLeft, ChevronRight, Calendar, Bell, FileText,
  TrendingUp, Briefcase, Clock, CheckCircle, AlertCircle,
  ClipboardList, BarChart2, UserCircle, Mail, Phone, CheckCircle2,
} from 'lucide-react'
import { useContext, useEffect, useRef, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts'
import { SessionContext } from '../../Context/Seesion'
import { AppContext } from '../../Context/AppContext'
import { getRequest } from '../../Helpers'
import { DatePicker, Skeleton, Modal } from 'antd'
import dayjs from 'dayjs'

/* ══════════════════════ HELPERS ══════════════════════ */
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return setVal(0)
    let s = 0
    const step = target / (duration / 16)
    const t = setInterval(() => {
      s += step
      if (s >= target) { setVal(target); clearInterval(t) }
      else setVal(Math.floor(s))
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return val
}

function Num({ v }) {
  const d = useCountUp(typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0)
  return <>{d.toLocaleString('en-IN')}</>
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtShort(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

/* ══════════════════════ SKELETON ══════════════════════ */
function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-5 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton.Input style={{ width: 220, height: 28 }} active />
          <Skeleton.Input style={{ width: 160, height: 16 }} active size="small" />
        </div>
        <Skeleton.Input style={{ width: 200, height: 40 }} active />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200">
              <Skeleton.Input style={{ width: 90, height: 12 }} active size="small" />
              <Skeleton.Input style={{ width: 120, height: 36 }} active className="mt-3" />
              <Skeleton.Input style={{ width: 140, height: 12 }} active size="small" className="mt-3" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-slate-200 h-52">
        <Skeleton active paragraph={{ rows: 4 }} />
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

/* ══════════════════════ STAT CARD ══════════════════════ */
function StatCard({ title, value, icon: Icon, color, sub }) {
  const map = {
    indigo: { light: '#EEF2FF', text: '#4F46E5', border: '#e0e7ff' },
    emerald: { light: '#ECFDF5', text: '#059669', border: '#d1fae5' },
    amber: { light: '#FFFBEB', text: '#D97706', border: '#fde68a' },
    blue: { light: '#EFF6FF', text: '#2563EB', border: '#bfdbfe' },
    rose: { light: '#FFF1F2', text: '#E11D48', border: '#fecdd3' },
    violet: { light: '#F5F3FF', text: '#7C3AED', border: '#ddd6fe' },
    cyan: { light: '#ECFEFF', text: '#0891B2', border: '#a5f3fc' },
  }
  const c = map[color] || map.indigo
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 hover:shadow-md transition-all duration-200 group relative overflow-hidden ">
      <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-40 group-hover:scale-125 transition-transform duration-500"
        style={{ background: c.light }} />
      <div className="relative">
        <div className="inline-flex p-2 rounded-lg mb-1.5" style={{ background: c.light }}>
          <Icon className="w-4 h-4" style={{ color: c.text }} />
        </div>
        <p className="text-[13px] font-semibold  text-slate-400 mb-0.5">{title}</p>
        <p className="text-xl font-medium text-slate-700 leading-none mb-1"><Num v={value} /></p>
        {sub && <p className="text-[11px] font-semibold truncate" style={{ color: c.text }}>{sub}</p>}
      </div>
    </div>
  )
}
/* ══════════════════════ ATTENDANCE SECTION ══════════════════════ */
function AttendanceSection({ classWiseAttendance: init, sessionId, teacherId }) {
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [data, setData] = useState(init || [])
  const [loadingDate, setLoadingDate] = useState(false)
  const isToday = selectedDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')

  useEffect(() => { if (isToday) setData(init || []) }, [init, isToday])

  const fetchDate = async (d) => {
    const ds = d.format('YYYY-MM-DD')
    if (ds === dayjs().format('YYYY-MM-DD')) { setData(init || []); return }
    try {
      setLoadingDate(true)
      const r = await getRequest(`admin/teacher/dashboard?sessionId=${sessionId}&teacherId=${teacherId}&date=${ds}`)
      setData(r?.data?.success ? r.data.data?.classWiseAttendance || [] : [])
    } catch { setData([]) } finally { setLoadingDate(false) }
  }

  const handlePrev = () => { const d = selectedDate.subtract(1, 'day'); setSelectedDate(d); fetchDate(d) }
  const handleNext = () => {
    const d = selectedDate.add(1, 'day')
    if (d.isAfter(dayjs(), 'day')) return
    setSelectedDate(d); fetchDate(d)
  }

  const handleDateChange = (date) => {
    if (!date) return
    setSelectedDate(date)
    fetchDate(date)
  }

  const totals = data.reduce(
    (a, c) => ({ present: a.present + c.present, absent: a.absent + c.absent, holiday: a.holiday + c.holiday, total: a.total + c.total }),
    { present: 0, absent: 0, holiday: 0, total: 0 }
  )
  const overallPct = totals.total > 0 ? Math.round((totals.present / totals.total) * 100) : 0

  const lineData = data.map(c => ({
    name: c.className,
    Present: c.present,
    Absent: c.absent,
    ...(totals.holiday > 0 ? { Holiday: c.holiday } : {}),
  }))

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

  if (!data.length && !loadingDate) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <p className="text-xl font-bold text-slate-800 tracking-tight">Class Attendance</p>
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
            <button onClick={handleNext} disabled={isToday} className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 py-10">
          <CheckCircle2 className="w-5 h-5 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">No attendance marked for this date</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 flex-shrink-0">
          <p className="text-sm font-bold text-slate-800">Class Attendance</p>
        </div>
        <div className="hidden sm:block w-px h-6 flex-shrink-0 bg-gray-200" />
        <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">
          {[
            { label: 'Overall', value: `${overallPct}%`, color: '#042954' },
            { label: 'Present', value: totals.present, color: '#2d6a4f' },
            { label: 'Absent', value: totals.absent, color: '#7a2d2d' },
            { label: 'Holiday', value: totals.holiday, color: '#5c6b73' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400">{s.label}</span>
              <span className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
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
          <button onClick={handleNext} disabled={isToday} className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 disabled:opacity-30">
            <ChevronRight size={14} />
          </button>
        </div>
        <span className="text-[10px] flex-shrink-0 text-gray-300 ml-2">{data.length} classes</span>
      </div>

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
          <div className="flex items-center gap-5 px-4 pb-3">
            {[
              { label: 'Present', color: '#2d6a4f' },
              { label: 'Absent', color: '#7a2d2d' },
              ...(totals.holiday > 0 ? [{ label: 'Holiday', color: '#5c6b73' }] : []),
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="inline-block w-5 h-0.5 rounded-full" style={{ background: l.color }} />
                <span className="text-[10px] text-gray-400 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ══════════════════════ MAIN COMPONENT ══════════════════════ */
export default function TeachersDashboard() {
  const { user } = useContext(AppContext)
  const { currentSession } = useContext(SessionContext)
  const [loading, setLoading] = useState(true)
  const [noticeModal, setNoticeModal] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [d, setD] = useState({
    totalStudents: 0,
    totalAssignedClasses: 0,
    classTeacherClassesCount: 0,
    totalSubjects: 0,
    totalHomework: 0,
    homeworkByType: { HOMEWORK: 0, ASSIGNMENT: 0, PROJECT: 0 },
    noticeCount: 0,
    classWiseAttendance: [],
    weeklyAttendanceTrend: [],
    upcomingExams: [],
    recentHomework: [],
    recentNotices: [],
    subjectPerformance: [],
    teacherProfile: null,
    assignedClasses: [],
    classTeacherOf: [],
    genderStats: { male: 0, female: 0 },
  })

  const teacherId = user?.profile?._id
  const sessionId = currentSession?._id

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    if (!sessionId || !teacherId) return
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const res = await getRequest(`admin/teacher/dashboard?sessionId=${sessionId}&teacherId=${teacherId}`)
        if (res?.data?.success) {
          const raw = res.data.data || {}
          setD(prev => ({
            ...prev,
            ...raw,
            classWiseAttendance: Array.isArray(raw.classWiseAttendance) ? raw.classWiseAttendance : [],
            weeklyAttendanceTrend: Array.isArray(raw.weeklyAttendanceTrend) ? raw.weeklyAttendanceTrend : [],
            upcomingExams: Array.isArray(raw.upcomingExams) ? raw.upcomingExams : [],
            recentHomework: Array.isArray(raw.recentHomework) ? raw.recentHomework : [],
            recentNotices: Array.isArray(raw.recentNotices) ? raw.recentNotices : [],
            subjectPerformance: Array.isArray(raw.subjectPerformance) ? raw.subjectPerformance : [],
            assignedClasses: Array.isArray(raw.assignedClasses) ? raw.assignedClasses : [],
            classTeacherOf: Array.isArray(raw.classTeacherOf) ? raw.classTeacherOf : [],
            homeworkByType: raw.homeworkByType || { HOMEWORK: 0, ASSIGNMENT: 0, PROJECT: 0 },
            genderStats: raw.genderStats || { male: 0, female: 0 },
            teacherProfile: raw.teacherProfile || null,
          }))
        }
      } catch (err) {
        console.error('Teacher dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [sessionId, teacherId])

  if (loading) return <PageSkeleton />

  const {
    totalStudents, totalAssignedClasses, classTeacherClassesCount,
    totalSubjects, totalHomework, homeworkByType, noticeCount,
    classWiseAttendance, weeklyAttendanceTrend,
    upcomingExams, recentHomework, recentNotices,
    subjectPerformance, teacherProfile,
  } = d

  return (
    <div className=" min-h-screen" style={{ background: '#f8fafc' }}>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
     
          {/* <p className="text-xs font-semibold text-slate-400 mt-0.5">{today}</p> */}
          {/* {teacherProfile?.designation && (
            <p className="text-xs text-indigo-500 font-bold mt-0.5">{teacherProfile.designation}</p>
          )} */}
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 shadow-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Session: <span className="font-bold text-slate-700 ml-1">{currentSession?.sessionName || '—'}</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        <StatCard title="My Students" value={totalStudents} icon={Users} color="indigo" sub="Class teacher students" />
        <StatCard title="Assigned Classes" value={totalAssignedClasses} icon={GraduationCap} color="emerald" sub="All assigned classes" />
        <StatCard title="Class Teacher Of" value={classTeacherClassesCount} icon={Award} color="violet" sub="Primary classes" />
        <StatCard title="Subjects" value={totalSubjects} icon={BookOpen} color="blue" sub="Teaching subjects" />
        <StatCard title="Homework" value={homeworkByType.HOMEWORK} icon={ClipboardCheck} color="cyan" sub="Homework given" />
        <StatCard title="Assignments" value={homeworkByType.ASSIGNMENT} icon={ClipboardList} color="amber" sub="Assignments given" />
        <StatCard title="Total HW/Assign" value={totalHomework} icon={FileText} color="rose" sub="This session" />
        <StatCard title="Notices" value={noticeCount} icon={Bell} color="indigo" sub="Active notices" />
      </div>

      {/* ── Attendance Section ── */}
      <AttendanceSection
        classWiseAttendance={classWiseAttendance}
        sessionId={sessionId}
        teacherId={teacherId}
      />

{/* ── Bottom Row: Upcoming Exams + Recent Homework ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 mb-4">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1.5 rounded-lg bg-violet-50">
              <FileText className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Upcoming Exams</h3>
          </div>
          {!upcomingExams.length ? (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">No upcoming exams</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {upcomingExams.slice(0, 5).map((exam, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-violet-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3 h-3 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 leading-snug">{exam.examName || '—'}</p>
                      <p className="text-[10px] font-semibold text-slate-400 leading-none">{exam.className || '—'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${exam.status === 'completed' ? 'text-slate-500 bg-slate-50 border-slate-200' :
                      exam.status === 'ongoing' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        'text-violet-600 bg-violet-50 border-violet-100'
                      }`}>
                      {exam.status || 'upcoming'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{fmtDate(exam.fromDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Homework */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1.5 rounded-lg bg-amber-50">
              <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Recent Homework / Assignments</h3>
          </div>
          {!recentHomework.length ? (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">No recent homework</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentHomework.slice(0, 5).map((hw, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="w-3 h-3 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 leading-snug">{hw.title || '—'}</p>
                      <p className="text-[10px] font-semibold text-slate-400 leading-none">{hw.className} {hw.sectionName ? `- ${hw.sectionName}` : ''} · {hw.subjectName || '—'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                      {hw.type || 'HW'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Due: {fmtShort(hw.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Subject Performance ── */}
      {subjectPerformance.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-blue-50">
              <BarChart2 className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 tracking-tight">Subject-wise Performance</h3>
          </div>
          <div className="space-y-3">
            {subjectPerformance.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-600 w-28 truncate flex-shrink-0">{s.subject}</p>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.avg}%`, background: s.avg >= 75 ? '#10b981' : s.avg >= 50 ? '#f59e0b' : '#ef4444' }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 w-10 text-right">{s.avg}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Notices Table Section ── */}
      <div className="relative overflow-x-auto">


        <div className="bg-white overflow-hidden rounded-lg border border-blue-100 relative min-h-[300px]">
          <div className="flex items-center gap-2.5">

            <div>
              <p className="text-xl font-bold text-slate-800 tracking-tight mx-4 mt-4">              Recents Notices</p>

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

                          {index + 1}

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