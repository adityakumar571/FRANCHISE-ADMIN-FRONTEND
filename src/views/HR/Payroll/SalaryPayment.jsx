import React, { useEffect, useState } from 'react'
import { CreditCard, Plus, CheckCheck } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
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

const SalaryPayment = () => {
  const [month, setMonth]       = useState(curMon())
  const [payrolls, setPayrolls] = useState([])
  const [payments, setPayments] = useState([])
  const [loadingPayrolls, setLoadingPayrolls] = useState(false)
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [refresh, setRefresh]   = useState(false)
  const [page, setPage]         = useState(1)
  const [limit]                 = useState(20)
  const [total, setTotal]       = useState(0)

  // single pay modal
  const [modal, setModal]           = useState(null)
  const [form, setForm]             = useState({ paymentDate: new Date().toISOString().slice(0, 10), paymentMode: 'Cash', paidAmount: '', transactionReference: '', remarks: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors]         = useState({})

  // bulk pay modal
  const [showBulk, setShowBulk]   = useState(false)
  const [bulkMode, setBulkMode]   = useState('Cash')
  const [bulkDate, setBulkDate]   = useState(new Date().toISOString().slice(0, 10))
  const [bulkPaying, setBulkPaying] = useState(false)

  useEffect(() => {
    if (!month) return
    setLoadingPayrolls(true)
    getRequest(`hr/payroll?salaryMonth=${month}&limit=200`)
      .then((r) => setPayrolls(r?.data?.data?.payrolls || []))
      .catch(() => toast.error('Failed to load payrolls'))
      .finally(() => setLoadingPayrolls(false))
  }, [month, refresh])

  useEffect(() => {
    setLoadingPayments(true)
    getRequest(`hr/salary-payments?salaryMonth=${month}&page=${page}&limit=${limit}`)
      .then((r) => { setPayments(r?.data?.data?.payments || []); setTotal(r?.data?.data?.total || 0) })
      .catch(() => {})
      .finally(() => setLoadingPayments(false))
  }, [month, page, refresh])

  const openPayModal = (p) => {
    setModal(p)
    setForm({ paymentDate: new Date().toISOString().slice(0, 10), paymentMode: 'Cash', paidAmount: p.netSalary || '', transactionReference: '', remarks: '' })
    setErrors({})
  }

  const validate = () => {
    const e = {}
    if (!form.paymentDate) e.paymentDate = 'Required'
    if (!form.paymentMode) e.paymentMode = 'Required'
    if (!form.paidAmount || Number(form.paidAmount) <= 0) e.paidAmount = 'Must be > 0'
    if (modal && Number(form.paidAmount) > modal.netSalary)
      e.paidAmount = `Cannot exceed ₹${fmt(modal.netSalary)}`
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    postRequest({ url: 'hr/salary-payments', cred: { payrollId: modal._id, paymentDate: form.paymentDate, paymentMode: form.paymentMode, paidAmount: Number(form.paidAmount), transactionReference: form.transactionReference, remarks: form.remarks } })
      .then(() => { toast.success('Payment recorded'); setModal(null); setRefresh((p) => !p) })
      .catch((err) => toast.error(err?.response?.data?.message || 'Payment failed'))
      .finally(() => setSubmitting(false))
  }

  const handleBulkPay = async () => {
    const unpaid = payrolls.filter((p) => p.paymentStatus === 'Unpaid')
    if (!unpaid.length) return toast.error('No unpaid records')
    setBulkPaying(true)
    let ok = 0, fail = 0
    for (const p of unpaid) {
      try {
        await postRequest({ url: 'hr/salary-payments', cred: { payrollId: p._id, paymentDate: bulkDate, paymentMode: bulkMode, paidAmount: p.netSalary, remarks: 'Bulk payment' } })
        ok++
      } catch { fail++ }
    }
    setBulkPaying(false); setShowBulk(false)
    toast.success(`Paid: ${ok}${fail ? `, Failed: ${fail}` : ''}`)
    setRefresh((p) => !p)
  }

  const unpaidList = payrolls.filter((p) => p.paymentStatus !== 'Paid')
  const pendingAmt = unpaidList.reduce((s, p) => s + (p.netSalary || 0), 0)
  const paidCount  = payrolls.filter((p) => p.paymentStatus === 'Paid').length

  return (
    <div className="min-h-screen space-y-4">

      {/* BULK PAY MODAL */}
      {showBulk && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6">
            <h3 className="font-semibold mb-1 flex items-center gap-2 text-sm">
              <CheckCheck className="w-4 h-4 text-green-600" /> Bulk Pay All Unpaid
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Pay <b>{payrolls.filter((p) => p.paymentStatus === 'Unpaid').length}</b> staff —
              total <b>₹{fmt(payrolls.filter((p) => p.paymentStatus === 'Unpaid').reduce((s, p) => s + (p.netSalary || 0), 0))}</b>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Payment Date</label>
                <input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Payment Mode</label>
                <select value={bulkMode} onChange={(e) => setBulkMode(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                  {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowBulk(false)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleBulkPay} disabled={bulkPaying} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50">
                {bulkPaying ? 'Paying...' : 'Pay All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE PAY MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#e24028]" />Record Salary Payment</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="mx-5 mt-4 bg-blue-50 rounded p-3 text-sm flex justify-between">
              <div>
                <p className="font-medium text-gray-800">{modal.staff?.employeeName}</p>
                <p className="text-xs text-gray-500">{modal.staff?.designation?.name} · {modal.staff?.department?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Net Salary</p>
                <p className="font-bold text-[#0c3b73] text-base">₹{fmt(modal.netSalary)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[modal.paymentStatus]}`}>{modal.paymentStatus}</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Payment Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.paymentDate} onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.paymentDate ? 'border-red-400' : 'border-gray-300'}`} />
                  {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Payment Mode <span className="text-red-500">*</span></label>
                  <select value={form.paymentMode} onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                    {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Amount Paid (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="1" max={modal.netSalary} value={form.paidAmount}
                  onChange={(e) => setForm((f) => ({ ...f, paidAmount: e.target.value }))}
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.paidAmount ? 'border-red-400' : 'border-gray-300'}`} />
                {errors.paidAmount && <p className="text-red-500 text-xs mt-1">{errors.paidAmount}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Transaction Reference</label>
                <input type="text" value={form.transactionReference}
                  onChange={(e) => setForm((f) => ({ ...f, transactionReference: e.target.value }))}
                  placeholder="UTR / Cheque No."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Remarks</label>
                <textarea rows={2} value={form.remarks}
                  onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50">
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2"><CreditCard className="text-[#e24028] w-5 h-5" />Salary Payment</h1>
          <p className="text-xs text-gray-500">Record salary payments for staff</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          {payrolls.filter((p) => p.paymentStatus === 'Unpaid').length > 0 && (
            <button onClick={() => setShowBulk(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
              <CheckCheck size={14} /> Pay All Unpaid
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{unpaidList.length}</p>
          <p className="text-xs text-yellow-600 mt-1">Pending Payments</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-red-600">₹{fmt(pendingAmt)}</p>
          <p className="text-xs text-red-500 mt-1">Pending Amount</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{paidCount}</p>
          <p className="text-xs text-green-600 mt-1">Paid</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{payrolls.length}</p>
          <p className="text-xs text-blue-500 mt-1">Total Payroll</p>
        </div>
      </div>

      {/* PENDING TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Pending / Partial Payments</h2>
          <span className="text-xs text-gray-400">{unpaidList.length} records</span>
        </div>
        <AppTable
          columns={[
            { key: 'sr',     label: 'Sr',        align: 'center', width: 50  },
            { key: 'emp',    label: 'Employee',   align: 'left',   width: 200 },
            { key: 'dept',   label: 'Department', align: 'left',   width: 140 },
            { key: 'salary', label: 'Net Salary', align: 'right',  width: 110 },
            { key: 'status', label: 'Status',     align: 'center', width: 120 },
            { key: 'action', label: 'Pay',        align: 'center', width: 80, sticky: 'right' },
          ]}
          data={unpaidList}
          loading={loadingPayrolls}
          emptyText="All salaries paid for this month 🎉"
          rowKey={(p) => p._id}
        >
          {(p, idx) => (
            <>
              <Td align="center">{idx + 1}</Td>
              <Td>
                <p className="font-semibold text-gray-800">{p.staff?.employeeName || '—'}</p>
                <p className="text-xs text-gray-400 font-mono">{p.staff?.employeeCode}</p>
              </Td>
              <Td>{p.staff?.department?.name || '—'}</Td>
              <Td align="right"><span className="font-bold text-[#0c3b73]">₹{fmt(p.netSalary)}</span></Td>
              <Td align="center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[p.paymentStatus]}`}>{p.paymentStatus}</span>
              </Td>
              <Td align="center" sticky="right">
                <button onClick={() => openPayModal(p)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 mx-auto">
                  <Plus size={11} /> Pay
                </button>
              </Td>
            </>
          )}
        </AppTable>
      </div>

      {/* PAYMENT HISTORY */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Payment History</h2>
          <span className="text-xs text-gray-400">{total} records</span>
        </div>
        <AppTable
          columns={[
            { key: 'sr',     label: 'Sr',          align: 'center', width: 50  },
            { key: 'emp',    label: 'Employee',     align: 'left',   width: 200 },
            { key: 'dept',   label: 'Department',   align: 'left',   width: 140 },
            { key: 'date',   label: 'Payment Date', align: 'center', width: 120 },
            { key: 'mode',   label: 'Mode',         align: 'center', width: 110 },
            { key: 'amount', label: 'Amount Paid',  align: 'right',  width: 120 },
            { key: 'ref',    label: 'Reference',    align: 'left',   width: 150 },
          ]}
          data={payments}
          loading={loadingPayments}
          emptyText="No payments recorded for this month"
          page={page}
          limit={limit}
          total={total}
          onPageChange={(p) => setPage(p)}
          rowKey={(p) => p._id}
        >
          {(pay, idx) => (
            <>
              <Td align="center">{(page - 1) * limit + idx + 1}</Td>
              <Td>
                <p className="font-semibold text-gray-800">{pay.staff?.employeeName || '—'}</p>
                <p className="text-xs text-gray-400 font-mono">{pay.staff?.employeeCode}</p>
              </Td>
              <Td>{pay.staff?.department?.name || '—'}</Td>
              <Td align="center">{pay.paymentDate?.slice(0, 10)}</Td>
              <Td align="center">
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{pay.paymentMode}</span>
              </Td>
              <Td align="right"><span className="font-bold text-green-600">₹{fmt(pay.paidAmount)}</span></Td>
              <Td className="text-gray-500 text-xs">{pay.transactionReference || '—'}</Td>
            </>
          )}
        </AppTable>
      </div>

    </div>
  )
}

export default SalaryPayment
