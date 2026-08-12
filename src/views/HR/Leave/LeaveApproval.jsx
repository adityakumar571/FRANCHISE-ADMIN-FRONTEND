import React, { useEffect, useState, useCallback } from 'react'
import { CheckSquare, X, Filter, User, Calendar, Clock, MessageSquare } from 'lucide-react'
import { getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import AppTable, { Td } from '../../../components/AppTable'

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const DEFAULT_FILTERS = { status: 'Pending', department: '', month: getCurrentMonth() }

const STATUS_MAP = {
  Pending:  { cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200', dot: 'bg-yellow-500' },
  Approved: { cls: 'bg-green-100 text-green-700 border border-green-200',   dot: 'bg-green-500'  },
  Rejected: { cls: 'bg-red-100 text-red-700 border border-red-200',         dot: 'bg-red-500'    },
}

const LEAVE_TYPE_COLOR = {
  'Casual Leave':  'bg-blue-50 text-blue-700 border border-blue-100',
  'Sick Leave':    'bg-orange-50 text-orange-700 border border-orange-100',
  'Paid Leave':    'bg-green-50 text-green-700 border border-green-100',
  'Unpaid Leave':  'bg-red-50 text-red-700 border border-red-100',
}

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="text-gray-400 w-28 flex-shrink-0">{label}</span>
    <span className="text-gray-800 font-medium">{value || '—'}</span>
  </div>
)

const LeaveApproval = () => {
  const [leaves, setLeaves]           = useState([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [limit]                       = useState(20)
  const [loading, setLoading]         = useState(false)
  const [departments, setDepartments] = useState([])
  const [refresh, setRefresh]         = useState(false)
  const [modal, setModal]             = useState(null)   // { leave, action }
  const [detailModal, setDetailModal] = useState(null)   // view detail
  const [remarks, setRemarks]         = useState('')
  const [processing, setProcessing]   = useState(false)

  const [draftStatus, setDraftStatus] = useState('Pending')
  const [draftDept, setDraftDept]     = useState('')
  const [draftMonth, setDraftMonth]   = useState(getCurrentMonth())
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  const hasActiveFilters =
    appliedFilters.status !== 'Pending' || appliedFilters.department || appliedFilters.month !== getCurrentMonth()

  useEffect(() => {
    getRequest('hr/departments?limit=200')
      .then((r) => setDepartments(r?.data?.data?.departments || []))
      .catch(() => {})
  }, [])

  const fetchLeaves = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams({ page, limit })
    if (appliedFilters.status)     p.set('status', appliedFilters.status)
    if (appliedFilters.department) p.set('department', appliedFilters.department)
    if (appliedFilters.month)      p.set('month', appliedFilters.month)
    getRequest(`hr/leaves?${p.toString()}`)
      .then((r) => { setLeaves(r?.data?.data?.leaves || []); setTotal(r?.data?.data?.total || 0) })
      .catch(() => toast.error('Failed to fetch leaves'))
      .finally(() => setLoading(false))
  }, [page, limit, appliedFilters, refresh])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  const handleApply = () => {
    setAppliedFilters({ status: draftStatus, department: draftDept, month: draftMonth })
    setPage(1)
  }
  const handleClear = () => {
    setDraftStatus('Pending'); setDraftDept(''); setDraftMonth(getCurrentMonth())
    setAppliedFilters(DEFAULT_FILTERS); setPage(1)
  }

  const openApproveModal = (leave, action) => { setModal({ leave, action }); setRemarks('') }

  const handleConfirm = async () => {
    if (!modal) return
    setProcessing(true)
    try {
      await putRequest({ url: `hr/leaves/${modal.leave._id}/status`, cred: { status: modal.action, remarks } })
      toast.success(`Leave ${modal.action} successfully`)
      setModal(null); setRefresh((p) => !p)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed')
    } finally {
      setProcessing(false)
    }
  }

  const pending  = leaves.filter((l) => l.status === 'Pending').length
  const approved = leaves.filter((l) => l.status === 'Approved').length
  const rejected = leaves.filter((l) => l.status === 'Rejected').length

  return (
    <div className="min-h-screen space-y-4">

      {/* ══ APPROVE / REJECT MODAL ══ */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">

            {/* Colored header */}
            <div className={`px-5 py-3.5 flex items-center justify-between border-b ${modal.action === 'Approved' ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${modal.action === 'Approved' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {modal.action === 'Approved' ? '✓ Approve Leave' : '✕ Reject Leave'}
                </span>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Employee info card */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2.5 border border-gray-100">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-[#0c3b73] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {modal.leave.staff?.employeeName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{modal.leave.staff?.employeeName || '—'}</p>
                    <p className="text-xs text-gray-400">{modal.leave.staff?.employeeCode} · {modal.leave.staff?.department?.name}</p>
                  </div>
                </div>
                <InfoRow label="Leave Type"
                  value={
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${LEAVE_TYPE_COLOR[modal.leave.leaveType] || 'bg-gray-100 text-gray-600'}`}>
                      {modal.leave.leaveType}
                    </span>
                  }
                />
                <InfoRow label="Duration"
                  value={
                    <span>
                      {modal.leave.fromDate?.slice(0, 10)} → {modal.leave.toDate?.slice(0, 10)}
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${modal.action === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {modal.leave.totalDays} day{modal.leave.totalDays > 1 ? 's' : ''}
                      </span>
                    </span>
                  }
                />
                <InfoRow label="Reason" value={modal.leave.reason} />
              </div>

              {/* Remarks input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-gray-400" />
                  Remarks
                  <span className="text-xs text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder={modal.action === 'Approved' ? 'e.g. Approved. Enjoy your leave.' : 'e.g. Insufficient leave balance. Please reapply.'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition">
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className={`px-6 py-2.5 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition shadow-sm ${modal.action === 'Approved' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'}`}
                >
                  {processing
                    ? 'Processing...'
                    : modal.action === 'Approved' ? 'Confirm Approve' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ DETAIL VIEW MODAL ══ */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Calendar size={16} className="text-[#0c3b73]" /> Leave Details
              </h3>
              <button onClick={() => setDetailModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-11 h-11 rounded-full bg-[#0c3b73] text-white flex items-center justify-center text-sm font-bold">
                  {detailModal.staff?.employeeName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{detailModal.staff?.employeeName || '—'}</p>
                  <p className="text-xs text-gray-400">{detailModal.staff?.employeeCode} · {detailModal.staff?.department?.name}</p>
                  <p className="text-xs text-gray-400">{detailModal.staff?.designation?.name}</p>
                </div>
              </div>
              <InfoRow label="Leave Type" value={<span className={`px-2 py-0.5 rounded text-xs font-medium ${LEAVE_TYPE_COLOR[detailModal.leaveType] || ''}`}>{detailModal.leaveType}</span>} />
              <InfoRow label="From Date"  value={detailModal.fromDate?.slice(0, 10)} />
              <InfoRow label="To Date"    value={detailModal.toDate?.slice(0, 10)} />
              <InfoRow label="Total Days" value={`${detailModal.totalDays} day${detailModal.totalDays > 1 ? 's' : ''}`} />
              <InfoRow label="Status"     value={<StatusBadge status={detailModal.status} />} />
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-500 font-medium mb-1 flex items-center gap-1"><MessageSquare size={12} /> Reason</p>
                <p className="text-sm text-gray-700">{detailModal.reason || '—'}</p>
              </div>
              {detailModal.remarks && (
                <div className={`rounded-lg p-3 border ${detailModal.status === 'Approved' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <p className={`text-xs font-medium mb-1 flex items-center gap-1 ${detailModal.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                    <MessageSquare size={12} /> Manager Remarks
                  </p>
                  <p className="text-sm text-gray-700">{detailModal.remarks}</p>
                </div>
              )}
              {detailModal.approvedBy?.name && (
                <InfoRow label="Actioned By" value={`${detailModal.approvedBy.name} · ${detailModal.approvedAt ? new Date(detailModal.approvedAt).toLocaleDateString('en-IN') : ''}`} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border">
        <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <CheckSquare className="text-[#e24028] w-5 h-5" /> Leave Approval
        </h1>
        <p className="text-xs text-gray-500">Review and approve/reject staff leave applications</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{pending}</p>
          <p className="text-xs text-yellow-600 mt-1 font-medium">Pending</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{approved}</p>
          <p className="text-xs text-green-600 mt-1 font-medium">Approved</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{rejected}</p>
          <p className="text-xs text-red-500 mt-1 font-medium">Rejected</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-3 flex flex-wrap gap-3 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Status</label>
          <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Department</label>
          <select value={draftDept} onChange={(e) => setDraftDept(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Month</label>
          <input type="month" value={draftMonth} onChange={(e) => setDraftMonth(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex gap-2 self-end">
          <button onClick={handleApply} className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
            <Filter size={14} /> Apply
          </button>
          {hasActiveFilters && (
            <button onClick={handleClear} className="px-4 py-2 border border-gray-300 rounded text-sm text-red-500 hover:bg-red-50">
              Clear
            </button>
          )}
        </div>
        <span className="ml-auto text-sm text-gray-500">Total: <b>{total}</b></span>
      </div>

      {/* TABLE */}
      <AppTable
        columns={[
          { key: 'sr',        label: 'Sr',         align: 'center', width: 50  },
          { key: 'employee',  label: 'Employee',    align: 'left',   width: 190 },
          { key: 'deptDesig', label: 'Dept',        align: 'left',   width: 130 },
          { key: 'leaveType', label: 'Leave Type',  align: 'center', width: 120 },
          { key: 'dates',     label: 'Duration',    align: 'center', width: 200 },
          { key: 'reason',    label: 'Reason',      align: 'left',   width: 160 },
          { key: 'remarks',   label: 'Remarks',     align: 'left',   width: 160 },
          { key: 'status',    label: 'Status',      align: 'center', width: 110 },
          { key: 'actions',   label: 'Actions',     align: 'center', width: 170, sticky: 'right' },
        ]}
        data={leaves}
        loading={loading}
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

            {/* Employee */}
            <Td>
              <button onClick={() => setDetailModal(lv)} className="text-left hover:text-[#0c3b73] transition">
                <p className="font-semibold text-gray-800">{lv.staff?.employeeName || '—'}</p>
                <p className="text-xs text-gray-400 font-mono">{lv.staff?.employeeCode}</p>
              </button>
            </Td>

            {/* Dept */}
            <Td>
              <p className="text-sm text-gray-700">{lv.staff?.department?.name || '—'}</p>
              <p className="text-xs text-gray-400">{lv.staff?.designation?.name || ''}</p>
            </Td>

            {/* Leave type */}
            <Td align="center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${LEAVE_TYPE_COLOR[lv.leaveType] || 'bg-gray-100 text-gray-600'}`}>
                {lv.leaveType}
              </span>
            </Td>

            {/* Duration */}
            <Td align="center">
              <div className="flex items-center justify-center gap-1.5 text-xs">
                <span className="text-gray-600">{lv.fromDate?.slice(0, 10)}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600">{lv.toDate?.slice(0, 10)}</span>
                <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">{lv.totalDays}d</span>
              </div>
            </Td>

            {/* Reason */}
            <Td>
              <span className="text-sm text-gray-600 line-clamp-2" title={lv.reason}>{lv.reason || '—'}</span>
            </Td>

            {/* Remarks (manager) */}
            <Td>
              {lv.remarks ? (
                <span className={`text-xs px-2 py-1 rounded-lg block max-w-[140px] truncate ${lv.status === 'Approved' ? 'bg-green-50 text-green-700' : lv.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}
                  title={lv.remarks}>
                  {lv.remarks}
                </span>
              ) : (
                <span className="text-gray-300 text-xs">—</span>
              )}
            </Td>

            {/* Status */}
            <Td align="center"><StatusBadge status={lv.status} /></Td>

            {/* Actions */}
            <Td align="center" sticky="right">
              {lv.status === 'Pending' ? (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => openApproveModal(lv, 'Approved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1">
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => openApproveModal(lv, 'Rejected')}
                    className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 hover:border-rose-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1">
                    ✕ Reject
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-gray-500">{lv.approvedBy?.name ? `By: ${lv.approvedBy.name}` : '—'}</p>
                  {lv.approvedAt && <p className="text-xs text-gray-400">{new Date(lv.approvedAt).toLocaleDateString('en-IN')}</p>}
                  <button onClick={() => setDetailModal(lv)} className="text-xs text-[#0c3b73] hover:underline mt-0.5">
                    View Details
                  </button>
                </div>
              )}
            </Td>
          </>
        )}
      </AppTable>
    </div>
  )
}

export default LeaveApproval
