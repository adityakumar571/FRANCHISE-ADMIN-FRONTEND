import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Play, Edit2, Trash2, AlertTriangle, Eye, Filter, CreditCard } from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import AppTable, { Td } from '../../../components/AppTable'

const fmt    = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const curMon = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other']

const STATUS_COLOR = {
  Unpaid:           'bg-yellow-100 text-yellow-700',
  Paid:             'bg-green-100 text-green-700',
  'Partially Paid': 'bg-blue-100 text-blue-700',
  'On Hold':        'bg-red-100 text-red-600',
}

const DEFAULT_FILTERS = { month: curMon(), department: '', paymentStatus: '' }

const MonthlyPayroll = () => {
  const navigate = useNavigate()
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [limit]                 = useState(50)
  const [departments, setDepts] = useState([])
  const [loading, setLoading]   = useState(false)
  const [generating, setGenerating] = useState(false)
  const [refresh, setRefresh]   = useState(false)
  const [showGen, setShowGen]   = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [saving, setSaving]       = useState(false)
  const [delItem, setDelItem]     = useState(null)

  // Quick Pay modal (inline from Monthly Payroll)
  const [payModal, setPayModal]   = useState(null)
  const [payForm, setPayForm]     = useState({ paymentDate: new Date().toISOString().slice(0, 10), paymentMode: 'Cash', paidAmount: '', transactionReference: '', remarks: '' })
  const [paying, setPaying]       = useState(false)

  // Draft
  const [draftMonth, setDraftMonth]   = useState(curMon())
  const [draftDept, setDraftDept]     = useState('')
  const [draftStatus, setDraftStatus] = useState('')

  // Applied
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    getRequest('hr/departments?limit=200').then((r) => setDepts(r?.data?.data?.departments || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!appliedFilters.month) return
    setLoading(true)
    const q = new URLSearchParams({ salaryMonth: appliedFilters.month, page, limit })
    if (appliedFilters.department)    q.set('department', appliedFilters.department)
    if (appliedFilters.paymentStatus) q.set('paymentStatus', appliedFilters.paymentStatus)
    getRequest(`hr/payroll?${q.toString()}`)
      .then((r) => { setData(r?.data?.data?.payrolls || []); setTotal(r?.data?.data?.total || 0) })
      .catch(() => toast.error('Failed to fetch payroll'))
      .finally(() => setLoading(false))
  }, [page, appliedFilters, refresh])

  const handleApply = () => {
    setAppliedFilters({ month: draftMonth, department: draftDept, paymentStatus: draftStatus })
    setPage(1)
  }

  const handleClear = () => {
    const def = { month: curMon(), department: '', paymentStatus: '' }
    setDraftMonth(def.month); setDraftDept(''); setDraftStatus('')
    setAppliedFilters(def)
    setPage(1)
  }

  const handleGenerate = () => {
    setGenerating(true)
    postRequest({ url: 'hr/payroll/generate', cred: { salaryMonth: appliedFilters.month } })
      .then((r) => {
        const d = r?.data?.data
        toast.success(`Generated: ${d?.created}, Skipped: ${d?.skipped}`)
        setShowGen(false); setRefresh((p) => !p)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to generate'))
      .finally(() => setGenerating(false))
  }

  const saveEdit = () => {
    setSaving(true)
    putRequest({ url: `hr/payroll/${editModal._id}`, cred: editForm })
      .then(() => { toast.success('Payroll updated'); setEditModal(null); setRefresh((p) => !p) })
      .catch((err) => toast.error(err?.response?.data?.message || 'Update failed'))
      .finally(() => setSaving(false))
  }

  const confirmDelete = () => {
    deleteRequest(`hr/payroll/${delItem._id}`)
      .then(() => { toast.success('Deleted'); setDelItem(null); setRefresh((p) => !p) })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
  }

  const handleQuickPay = (e) => {
    e.preventDefault()
    if (!payForm.paidAmount || Number(payForm.paidAmount) <= 0) return toast.error('Enter valid amount')
    if (Number(payForm.paidAmount) > payModal.netSalary) return toast.error(`Cannot exceed ₹${fmt(payModal.netSalary)}`)
    setPaying(true)
    postRequest({
      url: 'hr/salary-payments',
      cred: { payrollId: payModal._id, paymentDate: payForm.paymentDate, paymentMode: payForm.paymentMode, paidAmount: Number(payForm.paidAmount), transactionReference: payForm.transactionReference, remarks: payForm.remarks },
    })
      .then(() => { toast.success('Payment recorded'); setPayModal(null); setRefresh((p) => !p) })
      .catch((err) => toast.error(err?.response?.data?.message || 'Payment failed'))
      .finally(() => setPaying(false))
  }

  const totals = data.reduce((acc, p) => {
    acc.gross     += p.monthlySalary  || 0
    acc.deduction += p.totalDeduction || 0
    acc.net       += p.netSalary      || 0
    return acc
  }, { gross: 0, deduction: 0, net: 0 })

  return (
    <div className="min-h-screen space-y-4">
      {/* GENERATE CONFIRM */}
      {showGen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><Play className="w-4 h-4 text-purple-600" />Generate Payroll</h3>
            <p className="text-sm text-gray-600 mb-4">Generate payroll for all active staff for <b>{appliedFilters.month}</b>?<br /><span className="text-xs text-gray-400">Already generated staff will be skipped.</span></p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowGen(false)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleGenerate} disabled={generating} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm disabled:opacity-50">{generating ? 'Generating...' : 'Generate'}</button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PAY MODAL */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-600" />Quick Pay — {payModal.staff?.employeeName}</h3>
              <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="mx-5 mt-4 bg-green-50 border border-green-100 rounded p-3 flex justify-between text-sm">
              <span className="text-gray-600">Net Salary</span>
              <span className="font-bold text-green-700">₹{fmt(payModal.netSalary)}</span>
            </div>
            <form onSubmit={handleQuickPay} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date</label>
                  <input type="date" value={payForm.paymentDate} onChange={(e) => setPayForm((f) => ({ ...f, paymentDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Mode</label>
                  <select value={payForm.paymentMode} onChange={(e) => setPayForm((f) => ({ ...f, paymentMode: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                    {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Amount (₹)</label>
                <input type="number" min="1" max={payModal.netSalary} value={payForm.paidAmount}
                  onChange={(e) => setPayForm((f) => ({ ...f, paidAmount: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Reference / UTR</label>
                <input type="text" value={payForm.transactionReference}
                  onChange={(e) => setPayForm((f) => ({ ...f, transactionReference: e.target.value }))}
                  placeholder="UTR / Cheque No."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setPayModal(null)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={paying} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50">
                  {paying ? 'Paying...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Edit2 className="w-4 h-4 text-[#e24028]" />Adjust Payroll — {editModal.staff?.employeeName}</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-3">
              {[['extraEarning','Extra Earning (₹)'],['absentDeduction','Absent Deduction (₹)'],['leaveDeduction','Leave Deduction (₹)'],['advanceDeduction','Advance Deduction (₹)'],['otherDeduction','Other Deduction (₹)']].map(([k, label]) => (
                <div key={k} className="flex items-center gap-3">
                  <label className="text-xs text-gray-600 w-44 flex-shrink-0">{label}</label>
                  <input type="number" min="0" value={editForm[k] ?? 0} onChange={(e) => setEditForm((f) => ({ ...f, [k]: Number(e.target.value) || 0 }))}
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
              ))}
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600 w-44 flex-shrink-0">Payment Status</label>
                <select value={editForm.paymentStatus || ''} onChange={(e) => setEditForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                  {['Unpaid', 'Paid', 'Partially Paid', 'On Hold'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded p-3 flex justify-between">
                <span className="text-xs text-blue-600">Net Salary Preview</span>
                <span className="font-bold text-[#0c3b73]">₹{fmt(Math.max(0, (editModal.monthlySalary||0)+(Number(editForm.extraEarning)||0)-(Number(editForm.absentDeduction)||0)-(Number(editForm.leaveDeduction)||0)-(Number(editForm.advanceDeduction)||0)-(Number(editForm.otherDeduction)||0)))}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditModal(null)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="px-5 py-2 bg-[#0c3b73] hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE */}
      {delItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3"><AlertTriangle className="text-red-500 w-5 h-5" /><h3 className="font-semibold">Confirm Delete</h3></div>
            <p className="text-sm text-gray-600 mb-5">Delete payroll for <b>{delItem.staff?.employeeName}</b>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDelItem(null)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={confirmDelete} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2"><FileText className="text-[#e24028] w-5 h-5" />Monthly Payroll</h1>
          <p className="text-xs text-gray-500">Generate and manage monthly staff salary</p>
        </div>
        <button onClick={() => setShowGen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
          <Play size={14} /> Generate Payroll
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Month</label>
          <input type="month" value={draftMonth} onChange={(e) => setDraftMonth(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
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
          <label className="text-xs text-gray-500 font-medium">Status</label>
          <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Status</option>
            {['Unpaid', 'Paid', 'Partially Paid', 'On Hold'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-transparent font-medium">.</label>
          <button onClick={handleApply} className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
            <Filter size={14} /> Apply
          </button>
        </div>
        <div className="flex flex-col gap-1 self-end">
          <button onClick={handleClear} className="text-sm text-red-500 hover:underline pb-2">Clear</button>
        </div>
        <div className="ml-auto flex gap-4 text-sm self-end pb-0.5">
          <span className="text-gray-500">Gross: <b>₹{fmt(totals.gross)}</b></span>
          <span className="text-red-500">Deduction: <b>₹{fmt(totals.deduction)}</b></span>
          <span className="text-[#0c3b73] font-semibold">Net: <b>₹{fmt(totals.net)}</b></span>
        </div>
      </div>

      {/* TABLE */}
      <AppTable
        columns={[
          { key: 'sr',       label: 'Sr',         align: 'center', width: 50  },
          { key: 'employee', label: 'Employee',    align: 'left',   width: 180 },
          { key: 'dept',     label: 'Dept',        align: 'left',   width: 120 },
          { key: 'pa',       label: 'P/A/PL/UL',   align: 'center', width: 120 },
          { key: 'salary',   label: 'Salary',      align: 'right',  width: 100 },
          { key: 'extra',    label: '+ Extra',     align: 'right',  width: 90  },
          { key: 'deduct',   label: '- Deduct',    align: 'right',  width: 90  },
          { key: 'net',      label: 'Net',         align: 'right',  width: 100 },
          { key: 'status',   label: 'Status',      align: 'center', width: 120 },
          { key: 'actions',  label: 'Actions',     align: 'center', width: 130, sticky: 'right' },
        ]}
        data={data}
        loading={loading}
        emptyText={`No payroll records for ${appliedFilters.month}`}
        page={page}
        limit={limit}
        total={total}
        onPageChange={(p) => setPage(p)}
        rowKey={(item) => item._id}
      >
        {(p, idx) => (
          <>
            <Td align="center">{(page - 1) * limit + idx + 1}</Td>
            <Td>
              <div className="font-medium text-gray-800">{p.staff?.employeeName || '—'}</div>
              <div className="text-xs text-gray-400">{p.staff?.employeeCode}</div>
            </Td>
            <Td>{p.staff?.department?.name || '—'}</Td>
            <Td align="center">
              <span className="text-green-600 font-bold">{p.presentDays}P</span>/<span className="text-red-500 font-bold">{p.absentDays}A</span>/<span className="text-blue-600">{p.paidLeave}PL</span>/<span className="text-orange-500">{p.unpaidLeave}UL</span>
            </Td>
            <Td align="right">₹{fmt(p.monthlySalary)}</Td>
            <Td align="right"><span className="text-green-600">+₹{fmt(p.extraEarning)}</span></Td>
            <Td align="right"><span className="text-red-500">-₹{fmt(p.totalDeduction)}</span></Td>
            <Td align="right"><span className="font-bold text-[#0c3b73]">₹{fmt(p.netSalary)}</span></Td>
            <Td align="center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[p.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>{p.paymentStatus}</span>
            </Td>
            <Td align="center" sticky="right">
              <div className="flex justify-center gap-1">
                <button onClick={() => navigate(`/hr/salary-slip/${p._id}`)} title="View Slip"
                  className="text-green-600 hover:bg-green-600 hover:text-white p-2 rounded transition"><Eye size={13} /></button>
                {p.paymentStatus !== 'Paid' && (
                  <button
                    onClick={() => { setPayModal(p); setPayForm({ paymentDate: new Date().toISOString().slice(0, 10), paymentMode: 'Cash', paidAmount: p.netSalary, transactionReference: '', remarks: '' }) }}
                    title="Pay Now"
                    className="text-white bg-green-500 hover:bg-green-600 p-2 rounded transition text-xs flex items-center gap-0.5">
                    <CreditCard size={13} />
                  </button>
                )}
                {p.paymentStatus !== 'Paid' && (
                  <button onClick={() => { setEditModal(p); setEditForm({ extraEarning: p.extraEarning, absentDeduction: p.absentDeduction, leaveDeduction: p.leaveDeduction, advanceDeduction: p.advanceDeduction, otherDeduction: p.otherDeduction, paymentStatus: p.paymentStatus }) }}
                    title="Adjust" className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded transition"><Edit2 size={13} /></button>
                )}
                {p.paymentStatus !== 'Paid' && (
                  <button onClick={() => setDelItem(p)} title="Delete"
                    className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded transition"><Trash2 size={13} /></button>
                )}
              </div>
            </Td>
          </>
        )}
      </AppTable>
    </div>
  )
}

export default MonthlyPayroll
