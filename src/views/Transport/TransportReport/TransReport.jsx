/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Bus, Filter, Users, IndianRupee, ArrowRightLeft, ArrowRight, ArrowLeft } from 'lucide-react'
import { Select, Pagination, Empty } from 'antd'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Loader from '../../../components/Loading/Loader'
import { SessionContext } from '../../../Context/Seesion'
import ExportButton from '../../../components/ExportButton'

const { Option } = Select

/* ── Animated counter ── */
function AnimatedNumber({ value, prefix = '' }) {
  const [display, setDisplay] = React.useState(0)
  React.useEffect(() => {
    let start = 0
    const end = Number(value) || 0
    const duration = 800
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <span>{prefix}{display.toLocaleString('en-IN')}</span>
}

/* ── Stat Card — exact same as FeeReportsStats ── */
function StatCard({ title, value, icon: Icon, color, bgColor, delay, prefix }) {
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border-t-4 transition-all duration-500 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-105 hover:shadow-lg`}
      style={{ borderColor: color.replace('text-', '#') }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold" style={{ color: color.replace('text-', '#') }}>
            <AnimatedNumber value={value} prefix={prefix} />
          </p>
        </div>
        <div className={`${bgColor} p-3 rounded-full`}>
          <Icon className="w-6 h-6" style={{ color: color.replace('text-', '#') }} />
        </div>
      </div>
    </div>
  )
}

const TypeBadge = ({ type }) => {
  const map = {
    HOME_TO_SCHOOL: { label: 'Home to School', cls: 'bg-[#0c3b73]/10 text-[#0c3b73]' },
    SCHOOL_TO_HOME: { label: 'School to Home', cls: 'bg-[#0c3b73]/20 text-[#0c3b73]' },
    BOTH:           { label: 'Both',           cls: 'bg-[#0c3b73]/30 text-[#0c3b73]' },
  }
  const t = map[type] || { label: '-', cls: 'bg-gray-100 text-gray-600' }
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.cls}`}>{t.label}</span>
}

const TransReport = () => {
  const { currentSession } = useContext(SessionContext)

  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [limit, setLimit]         = useState(10)
  const [loading, setLoading]     = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [summary, setSummary]     = useState({ total: 0, homeToSchool: 0, schoolToHome: 0, both: 0, totalAmount: 0 })

  const [routes,  setRoutes]  = useState([])
  const [stops,   setStops]   = useState([])
  const [classes, setClasses] = useState([])
  const [buses,   setBuses]   = useState([])

  const emptyFilters = { routeId: null, stopId: null, classId: null, transportType: null, busId: null }
  const [draft,   setDraft]   = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)

  useEffect(() => {
    getRequest('transport?isPagination=false').then((r) => setRoutes(r?.data?.data?.routes || []))
    getRequest('transport/buses?isPagination=false').then((r) => setBuses(r?.data?.data?.buses || []))
  }, [])

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession._id}&isPagination=false`)
      .then((r) => setClasses(r?.data?.data?.classes || []))
  }, [currentSession])

  useEffect(() => {
    if (!draft.routeId) { setStops([]); return }
    getRequest(`transport/stops?routeId=${draft.routeId}&isPagination=false`)
      .then((r) => setStops(r?.data?.data?.stops || []))
  }, [draft.routeId])

  const fetchReport = (filters, pageNo, pageSize) => {
    if (!currentSession?._id) return
    setLoading(true)
    const params = new URLSearchParams({ sessionId: currentSession._id, page: pageNo || page, limit: pageSize || limit })
    if (filters.routeId)       params.append('routeId', filters.routeId)
    if (filters.stopId)        params.append('stopId', filters.stopId)
    if (filters.classId)       params.append('classId', filters.classId)
    if (filters.transportType) params.append('transportType', filters.transportType)
    if (filters.busId)         params.append('busId', filters.busId)
    getRequest(`transport/report?${params.toString()}`)
      .then((r) => {
        setData(r?.data?.data?.students || [])
        setTotal(r?.data?.data?.pagination?.totalRows || 0)
        setSummary(r?.data?.data?.summary || { total: 0, homeToSchool: 0, schoolToHome: 0, both: 0, totalAmount: 0 })
      })
      .catch(() => toast.error('Failed to fetch report'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (currentSession?._id) fetchReport(applied, page, limit)
  }, [currentSession, applied, page, limit])

  const handleApply = () => { setIsApplied(true); setPage(1); setApplied({ ...draft }) }
  const handleClear = () => { setDraft(emptyFilters); setApplied(emptyFilters); setStops([]); setIsApplied(false); setPage(1) }

  const exportData = data.map((s, i) => ({
    'Sr.': i + 1,
    'Student Name': `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.trim(),
    'Father Name': s.fatherName || '-',
    'Phone': s.phone || '-',
    'Class': s.class?.name || '-',
    'Section': s.section?.name || '-',
    'Route': s.route?.routeName || '-',
    'Stop': s.stop?.stopName || '-',
    'Transport Type': s.transportType === 'HOME_TO_SCHOOL' ? 'Home to School' :
                      s.transportType === 'SCHOOL_TO_HOME' ? 'School to Home' :
                      s.transportType === 'BOTH' ? 'Both' : '-',
    'Amount (Rs)': s.transportAmount || 0,
  }))

  const stats = [
    { title: 'Total Students',  value: summary.total,        icon: Users,          color: 'text-blue-600',   bgColor: 'bg-blue-50',   delay: 0   },
    { title: 'Home to School',  value: summary.homeToSchool, icon: ArrowRight,     color: 'text-yellow-600', bgColor: 'bg-yellow-50', delay: 100 },
    { title: 'School to Home',  value: summary.schoolToHome, icon: ArrowLeft,      color: 'text-orange-600', bgColor: 'bg-orange-50', delay: 200 },
    { title: 'Both Ways',       value: summary.both,         icon: ArrowRightLeft, color: 'text-green-600',  bgColor: 'bg-green-50',  delay: 300 },
    { title: 'Total Amount',    value: summary.totalAmount,  icon: IndianRupee,    color: 'text-purple-600', bgColor: 'bg-purple-50', delay: 400, prefix: '₹' },
  ]

  return (
    <div className="min-h-screen text-sm text-gray-700">

      {/* HEADER */}
      <div className="mb-4 px-4 py-2 bg-white border border-blue-100 rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Bus className="text-[#e24028]" /> Transport Report
          </h1>
          <p className="text-sm text-gray-500">Route-wise, station-wise, bus-wise, class-wise student list</p>
        </div>
        <ExportButton data={exportData} fileName="TransportReport.xlsx" sheetName="Transport" />
      </div>

      {/* SUMMARY STATS — same wrapper as FeeReportsStats */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm mb-4 border">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-lg border border-blue-100 p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700 mb-0">Filters & Search</h3>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col w-full sm:w-[180px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Route</label>
            <Select allowClear placeholder="Select Route" value={draft.routeId}
              onChange={(v) => setDraft((p) => ({ ...p, routeId: v || null, stopId: null }))}>
              {routes.map((r) => <Option key={r._id} value={r._id}>{r.routeName}</Option>)}
            </Select>
          </div>

          <div className="flex flex-col w-full sm:w-[180px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Stop / Station</label>
            <Select allowClear placeholder="Select Stop" value={draft.stopId} disabled={!stops.length}
              onChange={(v) => setDraft((p) => ({ ...p, stopId: v || null }))}>
              {stops.map((s) => <Option key={s._id} value={s._id}>{s.stopName}</Option>)}
            </Select>
          </div>

          <div className="flex flex-col w-full sm:w-[180px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Bus</label>
            <Select allowClear placeholder="Select Bus" value={draft.busId}
              onChange={(v) => setDraft((p) => ({ ...p, busId: v || null }))}>
              {buses.map((b) => <Option key={b._id} value={b._id}>{b.busNumber}</Option>)}
            </Select>
          </div>

          <div className="flex flex-col w-full sm:w-[160px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Class</label>
            <Select allowClear placeholder="Select Class" value={draft.classId}
              onChange={(v) => setDraft((p) => ({ ...p, classId: v || null }))}>
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>

          <div className="flex flex-col w-full sm:w-[160px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Transport Type</label>
            <Select allowClear placeholder="All Types" value={draft.transportType}
              onChange={(v) => setDraft((p) => ({ ...p, transportType: v || null }))}>
              <Option value="HOME_TO_SCHOOL">Home to School</Option>
              <Option value="SCHOOL_TO_HOME">School to Home</Option>
              <Option value="BOTH">Both</Option>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex flex-col">
              <label className="text-xs opacity-0 mb-1">x</label>
              <button disabled={loading} onClick={handleApply} className="px-4 py-1.5 rounded-md text-sm font-semibold text-white bg-[#0c3b73] hover:bg-blue-900 disabled:opacity-60">Apply</button>
            </div>
            {isApplied && (
              <div className="flex flex-col">
                <label className="text-xs opacity-0 mb-1">x</label>
                <button onClick={handleClear} className="px-4 py-1.5 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">Clear</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader /> Loading...
          </div>
        )}

        <table className="min-w-max border-collapse w-full table-fixed">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center font-semibold" style={{ minWidth: 60 }}>#</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200 font-semibold" style={{ minWidth: 180 }}>Student Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200 font-semibold" style={{ minWidth: 100 }}>Class</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200 font-semibold" style={{ minWidth: 100 }}>Section</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200 font-semibold" style={{ minWidth: 150 }}>Route</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200 font-semibold" style={{ minWidth: 130 }}>Stop</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200 font-semibold" style={{ minWidth: 140 }}>Type</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200 font-semibold" style={{ minWidth: 110 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10">
                  <Empty description="No transport students found." />
                </td>
              </tr>
            ) : (
              data.map((s, i) => (
                <tr key={s._id || i} className="border-t hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ minWidth: 60 }}>{(page - 1) * limit + i + 1}</td>
                  <td className="px-3 py-2 text-sm bg-white" style={{ minWidth: 180 }}>
                    <div className="font-semibold text-gray-800">
                      {`${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.trim()}
                    </div>
                    {s.fatherName && <div className="text-xs text-gray-500">S/o {s.fatherName}</div>}
                  </td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>{s.class?.name || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>{s.section?.name || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 150 }}>{s.route?.routeName || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 130 }}>{s.stop?.stopName || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 140 }}><TypeBadge type={s.transportType} /></td>
                  <td className="px-3 py-2 text-sm text-center bg-white font-semibold text-green-600" style={{ minWidth: 110 }}>₹{s.transportAmount || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          showSizeChanger
          pageSizeOptions={['5','10','20','50','100']}
          onChange={(p) => setPage(p)}
          onShowSizeChange={(_, size) => { setLimit(size); setPage(1) }}
        />
      </div>

    </div>
  )
}

export default TransReport
