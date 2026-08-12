import React, { useEffect, useState, useCallback } from 'react'
import { CalendarDays, Download, RefreshCw } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty } from 'antd'
import Loader from '../../../components/Loading/Loader'

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const STATUS_META = {
  'Present':      { code: 'P',  cls: 'bg-green-100 text-green-700' },
  'Absent':       { code: 'A',  cls: 'bg-red-100 text-red-700' },
  'Half Day':     { code: 'H',  cls: 'bg-yellow-100 text-yellow-700' },
  'Paid Leave':   { code: 'PL', cls: 'bg-blue-100 text-blue-700' },
  'Unpaid Leave': { code: 'UL', cls: 'bg-orange-100 text-orange-700' },
  'Holiday':      { code: 'HO', cls: 'bg-purple-100 text-purple-700' },
  'Weekly Off':   { code: 'WO', cls: 'bg-gray-100 text-gray-600' },
}

const AttendanceRegister = () => {
  const [month, setMonth]               = useState(getCurrentMonth())
  const [departments, setDepartments]   = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [register, setRegister]         = useState([])
  const [daysInMonth, setDaysInMonth]   = useState([])
  const [loading, setLoading]           = useState(false)

  /* ── MUST be defined before the useEffect that calls it ── */
  const handleLoad = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ month })
      if (selectedDept) params.set('department', selectedDept)
      const res = await getRequest(`hr/attendance/register?${params.toString()}`)
      // backend returns { month, staff: [...], workingDays }
      setRegister(res?.data?.data?.staff || [])
    } catch {
      toast.error('Failed to load attendance register')
    } finally {
      setLoading(false)
    }
  }, [month, selectedDept])

  /* ── fetch departments once on mount ── */
  useEffect(() => {
    getRequest('hr/departments?limit=200')
      .then((res) => setDepartments(res?.data?.data?.departments || []))
      .catch(() => {})
  }, [])

  /* ── compute days array when month changes ── */
  useEffect(() => {
    const [yr, mo] = month.split('-').map(Number)
    const total = new Date(yr, mo, 0).getDate()
    setDaysInMonth(Array.from({ length: total }, (_, i) => i + 1))
  }, [month])

  /* ── auto-load: on mount + whenever month or department changes ── */
  useEffect(() => {
    handleLoad()
  }, [handleLoad])

  /* ── Summary per employee ── */
  const getSummary = (att) => {
    const counts = { P: 0, A: 0, H: 0 }
    Object.values(att || {}).forEach((s) => {
      if      (s === 'Present')  counts.P++
      else if (s === 'Absent')   counts.A++
      else if (s === 'Half Day') counts.H++
    })
    return counts
  }

  /* ── Day-column totals (bottom row) ── */
  const getDayTotal = (day) => {
    const counts = { P: 0, A: 0 }
    register.forEach((row) => {
      const s = row.attendance?.[day]
      if      (s === 'Present' || s === 'Half Day') counts.P++
      else if (s === 'Absent')                      counts.A++
    })
    return counts
  }

  return (
    <div className="min-h-screen space-y-4">

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="text-[#e24028] w-5 h-5" />
            Attendance Register
          </h1>
          <p className="text-xs text-gray-500">Monthly attendance summary for all staff</p>
        </div>
        <button
          className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded text-sm"
          title="Export (coming soon)"
        >
          <Download size={15} /> Export
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-3 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Manual refresh */}
        <button
          onClick={handleLoad}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded text-sm disabled:opacity-60"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* LEGEND — always visible once we have data */}
      {register.length > 0 && (
        <div className="bg-white border rounded p-3 flex flex-wrap gap-3 text-xs">
          {Object.entries(STATUS_META).map(([label, { code, cls }]) => (
            <span key={label} className={`px-2 py-1 rounded font-medium ${cls}`}>
              {code} = {label}
            </span>
          ))}
          <span className="px-2 py-1 rounded bg-gray-50 text-gray-400">— = Not Marked</span>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center">
            <Loader />
            <p className="text-sm text-gray-500 mt-2">Loading register...</p>
          </div>
        ) : register.length === 0 ? (
          <div className="py-10 text-center">
            <Empty description="No attendance records found for this month" />
          </div>
        ) : (
          <table className="text-xs min-w-max w-full">
            <thead className="bg-[#EEF2F7] text-gray-700">
              <tr>
                <th className="sticky left-0 z-10 bg-[#EEF2F7] px-4 py-2.5 font-semibold text-center w-10">Sr</th>
                <th className="sticky left-10 z-10 bg-[#EEF2F7] px-4 py-2.5 font-semibold text-left min-w-[160px]">Employee Name</th>
                <th className="sticky left-[210px] z-10 bg-[#EEF2F7] px-4 py-2.5 font-semibold text-left min-w-[100px]">Emp Code</th>
                {daysInMonth.map((d) => (
                  <th key={d} className="px-2 py-2.5 font-semibold text-center w-9">{d}</th>
                ))}
                <th className="px-4 py-2.5 font-semibold text-center min-w-[100px]">P / A / H</th>
              </tr>
            </thead>
            <tbody>
              {register.map((row, idx) => {
                const summary = getSummary(row.attendance)
                return (
                  <tr key={row._id || idx} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-3 py-2 text-center text-gray-500">{idx + 1}</td>
                    <td className="sticky left-10 bg-white px-3 py-2 font-medium text-gray-800 whitespace-nowrap">
                      {row.employeeName || row.staff?.employeeName || '—'}
                    </td>
                    <td className="sticky left-[210px] bg-white px-3 py-2 font-mono text-gray-600">
                      {row.employeeCode || row.staff?.employeeCode || '—'}
                    </td>
                    {daysInMonth.map((d) => {
                      const status = row.attendance?.[d]
                      const meta   = STATUS_META[status]
                      return (
                        <td key={d} className="px-1 py-2 text-center">
                          {meta ? (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${meta.cls}`}>
                              {meta.code}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <span className="text-green-700 font-bold">{summary.P}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600 font-bold">{summary.A}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-yellow-600 font-bold">{summary.H}</span>
                    </td>
                  </tr>
                )
              })}

              {/* DAY TOTALS ROW */}
              <tr className="bg-gray-100 font-semibold border-t-2">
                <td className="sticky left-0 bg-gray-100 px-3 py-2 text-center" colSpan={3}>
                  <span className="text-gray-700 text-xs">Day Totals</span>
                </td>
                {daysInMonth.map((d) => {
                  const { P, A } = getDayTotal(d)
                  return (
                    <td key={d} className="px-1 py-2 text-center text-xs">
                      <div className="text-green-700">{P}</div>
                      <div className="text-red-500">{A}</div>
                    </td>
                  )
                })}
                <td />
              </tr>
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}

export default AttendanceRegister
