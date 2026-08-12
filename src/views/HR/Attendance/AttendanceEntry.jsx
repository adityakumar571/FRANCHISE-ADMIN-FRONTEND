import React, { useEffect, useState, useCallback } from 'react'
import { ClipboardList, RefreshCw } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty } from 'antd'
import Loader from '../../../components/Loading/Loader'

const STATUS_OPTIONS = [
  'Present',
  'Absent',
  'Half Day',
  'Paid Leave',
  'Unpaid Leave',
  'Holiday',
  'Weekly Off',
]

const getToday = () => new Date().toISOString().slice(0, 10)

const rowBg = (status) => {
  switch (status) {
    case 'Present':   return 'bg-green-50'
    case 'Absent':    return 'bg-red-50'
    case 'Half Day':  return 'bg-yellow-50'
    default:          return 'bg-blue-50'
  }
}

const AttendanceEntry = () => {
  const [date, setDate]                 = useState(getToday())
  const [departments, setDepartments]   = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [staffRows, setStaffRows]       = useState([])
  const [loading, setLoading]           = useState(false)
  const [saving, setSaving]             = useState(false)

  /* ── MUST be defined before the useEffect that calls it ── */
  const handleLoad = useCallback(async () => {
    setLoading(true)
    try {
      const staffParams = new URLSearchParams({ limit: 200, isActive: true })
      if (selectedDept) staffParams.set('department', selectedDept)

      const [staffRes, attRes] = await Promise.all([
        getRequest(`hr/staff?${staffParams.toString()}`),
        getRequest(`hr/attendance/by-date?date=${date}`),
      ])

      const staffList = staffRes?.data?.data?.staff || []
      // backend returns { date, records:[...], total } — extract records array
      const attList   = attRes?.data?.data?.records || []
      const attMap    = {}
      attList.forEach((a) => {
        attMap[a.staff?._id || a.staff] = a
      })

      const rows = staffList.map((s) => {
        const existing = attMap[s._id]
        return {
          _id:          s._id,
          employeeName: s.employeeName,
          employeeCode: s.employeeCode || '—',
          department:   s.department?.name  || '—',
          designation:  s.designation?.name || '—',
          status:       existing?.status  || 'Present',
          remarks:      existing?.remarks || '',
        }
      })
      setStaffRows(rows)
    } catch {
      toast.error('Failed to load staff / attendance data')
    } finally {
      setLoading(false)
    }
  }, [date, selectedDept])

  /* ── fetch departments once on mount ── */
  useEffect(() => {
    getRequest('hr/departments?limit=200')
      .then((res) => setDepartments(res?.data?.data?.departments || []))
      .catch(() => {})
  }, [])

  /* ── auto-load: on mount + whenever date or department changes ── */
  useEffect(() => {
    handleLoad()
  }, [handleLoad])

  /* ── Mark All Present ── */
  const markAllPresent = () =>
    setStaffRows((prev) => prev.map((r) => ({ ...r, status: 'Present' })))

  /* ── Update a single row field ── */
  const updateRow = (id, field, value) =>
    setStaffRows((prev) =>
      prev.map((r) => (r._id === id ? { ...r, [field]: value } : r))
    )

  /* ── Save Attendance ── */
  const handleSave = async () => {
    if (!staffRows.length) return toast.error('No staff loaded')
    setSaving(true)
    try {
      const records = staffRows.map((r) => ({
        staff:   r._id,
        status:  r.status,
        remarks: r.remarks,
      }))
      await postRequest({ url: 'hr/attendance/bulk', cred: { date, records } })
      toast.success('Attendance saved successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen space-y-4">

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border">
        <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="text-[#e24028] w-5 h-5" />
          Attendance Entry
        </h1>
        <p className="text-xs text-gray-500">Mark daily attendance for staff</p>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-3 flex flex-wrap gap-3 items-end">

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Date</label>
          <input
            type="date"
            value={date}
            max={getToday()}
            onChange={(e) => setDate(e.target.value)}
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

        {staffRows.length > 0 && (
          <>
            <button
              onClick={markAllPresent}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
            >
              Mark All Present
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#e24028] hover:bg-red-700 text-white px-5 py-2 rounded text-sm disabled:opacity-60 ml-auto"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </>
        )}
      </div>

      {/* TABLE */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center">
            <Loader />
            <p className="text-sm text-gray-500 mt-2">Loading staff...</p>
          </div>
        ) : staffRows.length === 0 ? (
          <div className="py-10 text-center">
            <Empty description="No active staff found" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#EEF2F7] text-gray-700">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-center w-10">Sr</th>
                <th className="px-4 py-2.5 font-semibold text-left">Employee Name</th>
                <th className="px-4 py-2.5 font-semibold text-left">Emp Code</th>
                <th className="px-4 py-2.5 font-semibold text-left">Department</th>
                <th className="px-4 py-2.5 font-semibold text-left">Designation</th>
                <th className="px-4 py-2.5 font-semibold text-center w-44">Status</th>
                <th className="px-4 py-2.5 font-semibold text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {staffRows.map((row, idx) => (
                <tr
                  key={row._id}
                  className={`border-t border-gray-100 ${rowBg(row.status)} transition-colors`}
                >
                  <td className="px-4 py-2.5 text-center text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{row.employeeName}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{row.employeeCode}</td>
                  <td className="px-4 py-2.5 text-gray-600">{row.department}</td>
                  <td className="px-4 py-2.5 text-gray-600">{row.designation}</td>
                  <td className="px-4 py-2.5">
                    <select
                      value={row.status}
                      onChange={(e) => updateRow(row._id, 'status', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      value={row.remarks}
                      onChange={(e) => updateRow(row._id, 'remarks', e.target.value)}
                      placeholder="Optional remarks"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* BOTTOM SAVE — only shown when list is long */}
      {staffRows.length > 5 && (
        <div className="flex justify-end gap-3 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#e24028] hover:bg-red-700 text-white px-6 py-2 rounded text-sm disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      )}

    </div>
  )
}

export default AttendanceEntry
