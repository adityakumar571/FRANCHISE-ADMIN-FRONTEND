import React, { useEffect, useState, useCallback } from 'react'
import { CalendarOff, Trash2, Filter, Plus, X, AlertTriangle, MessageSquare } from 'lucide-react'
import { getRequest, postRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import AppTable, { Td } from '../../../components/AppTable'

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Paid Leave', 'Unpaid Leave']
const DEFAULT_FILTERS = { staffId: '', status: '', month: '' }
const INIT_FORM = { staffId: '', leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '' }

const LEAVE_TYPE_COLOR = {
  'Casual Leave':  'bg-blue-50 text-blue-700 border border-blue-100',
  'Sick Leave':    'bg-orange-50 text-orange-700 border border-orange-100',
  'Paid Leave':    'bg-green-50 text-green-700 border border-green-100',
  'Unpaid Leave':  'bg-red-50 text-red-700 border border-red-100',
}

const diffDays = (from, to) => {
  if (!from || !to) return 0
  const a = new Date(from), b = new Date(to)
  if (b < a) return 0
  return Math.floor((b - a) / 86400000) + 1
}

const StatusBadge = ({ status }) => {
  const map = {
    Pending:  'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Approved: 'bg-green-100 text-green-700 border border-green-200',
    Rejected: 'bg-red-100 text-red-700 border border-red-200',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

const LeaveEntry = () => {
  const [staff, setStaff]             = useState([])
  const [submitting, setSubmitting]   = useState(false)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(INIT_FORM)

  const [leaves, setLeaves]           = useState([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [limit]                       = useState(20)
  const [listLoading, setListLoading] = useState(false)
  const [refresh, setRefresh]         = useState(false)
  const [delItem, setDelItem]         = useState(null)
  const [deleting, setDeleting]       = useState(false)

  // Draft filters
  const [draftStaff, setDraftStaff]   = useState('')
  const [draftStatus, setDraftStatus] = useState('')
  const [draftMonth, setDraftMonth]   = useState('')

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)
  const hasActiveFilters = Object.values(appliedFilters).some(Boolean)

  const totalDays = diffDays(form.fromDate, form.toDate)

  /* ── fetch staff dropdown ── */
  useEffect(() => {
    getRequest('hr/staff?limit=200')
      .then((res) => setStaff(res?.data?.data?.staff || []))
      .catch(() => {})
  }, [])

  /* ── fetch leave list ── */
  const fetchLeaves = useCallback(() => {
    setListLoading(true)
    const params = new URLSearchParams({ page, limit })
    if (appliedFilters.staffId) params.set('staffId', appliedFilters.staffId)
    if (appliedFilters.status)  params.set('status',  appliedFilters.status)
    if (appliedFilters.month)   params.set('month',   appliedFilters.month)
    getRequest(`hr/leaves?${params.toString()}`)
      .then((res) => {
        setLeaves(res?.data?.data?.leaves || [])
        setTotal(res?.data?.data?.total   || 0)
      })
      .catch(() => toast.error('Failed to fetch leaves'))
      .finally(() => setListLoading(false))
  }, [page, limit, appliedFilters, refresh])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  /* ── filter handlers ── */
  const handleApply = () => {
    setAppliedFilters({ staffId: draftStaff, status: draftStatus, month: draftMonth })
    setPage(1)
  }

  const handleClear = () => {
    setDraftStaff(''); setDraftStatus(''); setDraftMonth('')
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  /* ── open / close modal ── */
  const openModal  = () => { setForm(INIT_FORM); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setForm(INIT_FORM) }

  /* ── submit leave ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.staffId)       return toast.error('Please select a staff member')
    if (!form.fromDate)      return toast.error('From date is required')
    if (!form.toDate)        return toast.error('To date is required')
    if (totalDays <= 0)      return toast.error('To date must be on or after From date')
    if (!form.reason.trim()) return toast.error('Reason is required')

    setSubmitting(true)
    try {
      await postRequest({
        url: 'hr/leaves',
        cred: {
          staff:     form.staffId,
          leaveType: form.leaveType,
          fromDate:  form.fromDate,
          toDate:    form.toDate,
          totalDays,
          reason:    form.reason,
        },
      })
      toast.success('Leave applied successfully')
      closeModal()
      setRefresh((p) => !p)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to apply leave')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── delete leave ── */
  const handleDelete = async () => {
    if (!delItem) return
    setDeleting(true)
    try {
      await deleteRequest(`hr/leaves/${delItem._id}`)
      toast.success('Leave deleted')
      setDelItem(null)
      setRefresh((p) => !p)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen space-y-4">

      {/* ── APPLY LEAVE MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-[#0c3b73]">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CalendarOff className="w-4 h-4" /> Apply Leave
                </h3>
                <p className="text-white/70 text-xs mt-0.5">Submit a new leave application</p>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Row 1 — Staff + Leave Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Staff Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.staffId}
                    onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">— Select Staff —</option>
                    {staff.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.employeeName} ({s.employeeCode || '—'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.leaveType}
                    onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {/* Leave type badge preview */}
                  {form.leaveType && (
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium ${LEAVE_TYPE_COLOR[form.leaveType] || ''}`}>
                      {form.leaveType}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2 — From + To + Total Days */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.fromDate}
                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.toDate}
                    min={form.fromDate}
                    onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Days</label>
                  <div className={`w-full border rounded-lg px-3 py-2.5 text-sm font-semibold text-center ${totalDays > 0 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                    {totalDays > 0 ? `${totalDays} day${totalDays > 1 ? 's' : ''}` : '—'}
                  </div>
                </div>
              </div>

              {/* Row 3 — Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-gray-400" />
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  placeholder="Enter reason for leave..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="bg-[#0c3b73] hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition shadow-sm">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {delItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b bg-red-50">
              <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0" />
              <h3 className="font-semibold text-gray-800">Delete Leave Application?</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-1">
                Delete leave for <b>{delItem.staff?.employeeName}</b>?
              </p>
              <p className="text-xs text-gray-400">
                {delItem.leaveType} · {delItem.fromDate?.slice(0, 10)} → {delItem.toDate?.slice(0, 10)} ({delItem.totalDays} days)
              </p>
              <p className="text-xs text-red-400 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setDelItem(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="px-4 py-3 bg-white rounded border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <CalendarOff className="text-[#e24028] w-5 h-5" />
              Leave Entry
            </h1>
            <p className="text-xs text-gray-500">Apply and manage staff leave applications</p>
          </div>
          <button
            onClick={openModal}
            className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Apply Leave
          </button>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white border rounded p-3">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={draftStaff}
            onChange={(e) => setDraftStaff(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Staff</option>
            {staff.map((s) => <option key={s._id} value={s._id}>{s.employeeName}</option>)}
          </select>

          <select
            value={draftStatus}
            onChange={(e) => setDraftStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <input
            type="month"
            value={draftMonth}
            onChange={(e) => setDraftMonth(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          <button
            onClick={handleApply}
            className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
          >
            <Filter size={14} /> Apply
          </button>

          {hasActiveFilters && (
            <button onClick={handleClear} className="text-sm text-red-500 hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE ── */}
      <AppTable
        columns={[
          { key: 'sr',        label: 'Sr',         align: 'center', width: 50  },
          { key: 'employee',  label: 'Employee',    align: 'left',   width: 170 },
          { key: 'leaveType', label: 'Leave Type',  align: 'center', width: 120 },
          { key: 'from',      label: 'From',        align: 'center', width: 100 },
          { key: 'to',        label: 'To',          align: 'center', width: 100 },
          { key: 'days',      label: 'Days',        align: 'center', width: 60  },
          { key: 'status',    label: 'Status',      align: 'center', width: 110 },
          { key: 'reason',    label: 'Reason',      align: 'left',   width: 160 },
          { key: 'remarks',   label: 'Remarks',     align: 'left',   width: 160 },
          { key: 'action',    label: 'Action',      align: 'center', width: 70, sticky: 'right' },
        ]}
        data={leaves}
        loading={listLoading}
        emptyText="No leave records found"
        page={page}
        limit={limit}
        total={total}
        onPageChange={(p) => setPage(p)}
        rowKey={(item) => item._id}
      >
        {(lv, idx) => (
          <>
            <Td align="center">{(page - 1) * limit + idx + 1}</Td>
            <Td>
              <p className="font-semibold text-gray-800">{lv.staff?.employeeName || '—'}</p>
              <p className="text-xs text-gray-400 font-mono">{lv.staff?.employeeCode}</p>
            </Td>
            <Td align="center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${LEAVE_TYPE_COLOR[lv.leaveType] || 'bg-gray-100 text-gray-600'}`}>
                {lv.leaveType}
              </span>
            </Td>
            <Td align="center">{lv.fromDate?.slice(0, 10) || '—'}</Td>
            <Td align="center">{lv.toDate?.slice(0, 10)   || '—'}</Td>
            <Td align="center">
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold text-xs">{lv.totalDays ?? '—'}d</span>
            </Td>
            <Td align="center"><StatusBadge status={lv.status} /></Td>
            <Td>
              <span className="text-xs text-gray-600 line-clamp-2" title={lv.reason}>{lv.reason || '—'}</span>
            </Td>
            <Td>
              {lv.remarks ? (
                <span
                  className={`text-xs px-2 py-1 rounded-lg block truncate max-w-[140px] ${lv.status === 'Approved' ? 'bg-green-50 text-green-700' : lv.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}
                  title={lv.remarks}>
                  {lv.remarks}
                </span>
              ) : (
                <span className="text-gray-300 text-xs">—</span>
              )}
            </Td>
            <Td align="center" sticky="right">
              {lv.status === 'Pending' && (
                <button
                  onClick={() => setDelItem(lv)}
                  className="text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </Td>
          </>
        )}
      </AppTable>
    </div>
  )
}

export default LeaveEntry
