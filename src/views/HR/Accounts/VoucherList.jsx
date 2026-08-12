import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Plus, XCircle, TrendingUp, TrendingDown, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { getRequest, patchRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import AppTable, { Td } from '../../../components/AppTable'

const fmt      = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const today    = () => new Date().toISOString().slice(0, 10)
const monthAgo = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10) }

const VoucherList = () => {
  const navigate = useNavigate()
  const [data, setData]                 = useState([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [limit, setLimit]               = useState(10)
  const [loading, setLoading]           = useState(false)
  const [startDate, setStartDate]       = useState(monthAgo())
  const [endDate, setEndDate]           = useState(today())
  const [filterType, setFilterType]     = useState('')
  const [filterStatus, setFilterStatus] = useState('Active')
  const [refresh, setRefresh]           = useState(false)
  const [expanded, setExpanded]         = useState({})
  const [cancelling, setCancelling]     = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams({ page, limit })
    if (filterType)   q.set('voucherType', filterType)
    if (filterStatus) q.set('status', filterStatus)
    if (startDate)    q.set('startDate', startDate)
    if (endDate)      q.set('endDate', endDate)
    getRequest(`hr/vouchers?${q.toString()}`)
      .then((r) => { setData(r?.data?.data?.vouchers || []); setTotal(r?.data?.data?.total || 0) })
      .catch(() => toast.error('Failed to load vouchers'))
      .finally(() => setLoading(false))
  }, [page, filterType, filterStatus, startDate, endDate, refresh])

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(cancelTarget._id)
    try {
      await patchRequest({ url: `hr/vouchers/${cancelTarget._id}/cancel`, cred: {} })
      toast.success('Voucher cancelled')
      setCancelTarget(null)
      setRefresh((p) => !p)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed')
    } finally {
      setCancelling(null)
    }
  }

  const toggleExpand = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))

  const totalIncome  = data.filter((v) => v.voucherType === 'Income'  && v.status === 'Active').reduce((s, v) => s + v.totalAmount, 0)
  const totalExpense = data.filter((v) => v.voucherType === 'Expense' && v.status === 'Active').reduce((s, v) => s + v.totalAmount, 0)
  const net = totalIncome - totalExpense

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 space-y-5">

      {/* ── CANCEL CONFIRM MODAL ── */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#b4530915' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: '#b45309' }} />
              </div>
              <h3 className="font-bold text-slate-800">Cancel Voucher?</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-1">
                Cancel <span className="font-mono font-bold text-[#042954]">{cancelTarget.voucherNumber}</span>?
              </p>
              <p className="text-xs text-slate-400">₹{fmt(cancelTarget.totalAmount)} · {cancelTarget.voucherDate?.slice(0, 10)}</p>
              <p className="text-xs font-bold mt-3 text-[#b45309]">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <button onClick={() => setCancelTarget(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium transition">
                Keep
              </button>
              <button onClick={handleCancel} disabled={!!cancelling}
                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-60 transition active:scale-95"
                style={{ background: '#b45309' }}>
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <List className="w-5 h-5 text-[#042954]" /> Voucher List
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">All income and expense vouchers</p>
        </div>
        <button onClick={() => navigate('/hr/accounts/voucher/new')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold
                     text-white transition shadow-sm active:scale-95 hover:opacity-90"
          style={{ background: '#042954' }}>
          <Plus size={14} /> New Voucher
        </button>
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">From</label>
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#042954]/20 bg-slate-50 font-medium text-slate-700" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">To</label>
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#042954]/20 bg-slate-50 font-medium text-slate-700" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Type</label>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#042954]/20 bg-slate-50 font-medium text-slate-700">
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Status</label>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#042954]/20 bg-slate-50 font-medium text-slate-700">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="ml-auto self-end text-xs text-slate-400 pb-1 font-medium">
          Total: <span className="font-black text-slate-700 text-sm">{total}</span>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Income (page)', value: totalIncome, icon: TrendingUp,   color: '#2d6a4f' },
            { label: 'Expense (page)', value: totalExpense, icon: TrendingDown, color: '#7a2d2d' },
            { label: 'Net (page)',    value: Math.abs(net), icon: null,         color: net >= 0 ? '#042954' : '#b45309', prefix: net < 0 ? '-₹' : '₹' },
          ].map(({ label, value, icon: Icon, color, prefix = '₹' }) => (
            <div key={label}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
                style={{ background: color }}>
                {Icon ? <Icon className="w-5 h-5 text-white" /> : <span className="text-white font-black text-sm">N</span>}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-[18px] font-black text-slate-700">{prefix}{fmt(value)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TABLE ── */}
      <AppTable
        columns={[
          { key: 'sr',      label: 'Sr',          align: 'center', width: 50  },
          { key: 'vno',     label: 'Voucher No.',  align: 'left',   width: 140 },
          { key: 'date',    label: 'Date',         align: 'center', width: 105 },
          { key: 'type',    label: 'Type',         align: 'center', width: 110 },
          { key: 'mode',    label: 'Mode',         align: 'center', width: 115 },
          { key: 'amount',  label: 'Amount',       align: 'right',  width: 115 },
          { key: 'status',  label: 'Status',       align: 'center', width: 95  },
          { key: 'actions', label: 'Actions',      align: 'center', width: 90, sticky: 'right' },
        ]}
        data={data}
        loading={loading}
        emptyText="No vouchers found"
        page={page}
        limit={limit}
        total={total}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => { setLimit(size); setPage(1) }}
        rowKey={(v) => v._id}
      >
        {(v, idx) => (
          <>
            <Td align="center">{(page - 1) * limit + idx + 1}</Td>
            <Td>
              <div className="font-mono text-xs font-black text-[#042954]">{v.voucherNumber}</div>
              {v.remarks && <div className="text-xs text-slate-400 truncate max-w-[115px]">{v.remarks}</div>}
            </Td>
            <Td align="center" className="text-slate-600 font-medium">{v.voucherDate?.slice(0, 10)}</Td>
            <Td align="center">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={v.voucherType === 'Income'
                  ? { background: '#2d6a4f18', color: '#2d6a4f' }
                  : { background: '#7a2d2d18', color: '#7a2d2d' }}>
                {v.voucherType === 'Income' ? '↑' : '↓'} {v.voucherType}
              </span>
            </Td>
            <Td align="center">
              <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                style={{ background: '#04295415', color: '#042954' }}>
                {v.paymentMode}
              </span>
            </Td>
            <Td align="right">
              <span className="font-black text-sm"
                style={{ color: v.voucherType === 'Income' ? '#2d6a4f' : '#7a2d2d' }}>
                ₹{fmt(v.totalAmount)}
              </span>
            </Td>
            <Td align="center">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={v.status === 'Active'
                  ? { background: '#2d6a4f18', color: '#2d6a4f' }
                  : { background: '#94a3b820', color: '#64748b' }}>
                {v.status}
              </span>
            </Td>
            <Td align="center" sticky="right">
              <div className="flex justify-center gap-1">
                <button onClick={() => toggleExpand(v._id)} title="View lines"
                  className="p-1.5 rounded-lg transition hover:bg-slate-100"
                  style={{ color: '#042954' }}>
                  {expanded[v._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {v.status === 'Active' && (
                  <button onClick={() => setCancelTarget(v)} title="Cancel voucher"
                    className="p-1.5 rounded-lg transition hover:bg-slate-100"
                    style={{ color: '#b45309' }}>
                    <XCircle size={14} />
                  </button>
                )}
              </div>
            </Td>
          </>
        )}
      </AppTable>

      {/* ── EXPANDED TRANSACTION ROWS ── */}
      {data.filter((v) => expanded[v._id]).map((v) => (
        <div key={`exp-${v._id}`} className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm -mt-3">
          <p className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
            <span className="font-mono font-black text-[#042954] bg-slate-100 px-2 py-0.5 rounded-lg">{v.voucherNumber}</span>
            — Transaction Lines
          </p>
          <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr style={{ background: '#042954' }}>
                <th className="px-4 py-2.5 text-left font-bold text-white">Account Head</th>
                <th className="px-4 py-2.5 text-right font-bold text-white">Amount (₹)</th>
                <th className="px-4 py-2.5 text-left font-bold text-white">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {v.transactions?.map((t, ti) => (
                <tr key={ti} className="border-t border-slate-100 bg-white hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5 font-bold text-slate-700">{t.accountHead?.accountName || '—'}</td>
                  <td className="px-4 py-2.5 text-right font-black text-[#042954]">₹{fmt(t.amount)}</td>
                  <td className="px-4 py-2.5 text-slate-400">{t.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

    </div>
  )
}

export default VoucherList
