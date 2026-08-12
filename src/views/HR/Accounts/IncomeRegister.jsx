import React, { useState } from 'react'
import { TrendingUp, Filter, Printer } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination } from 'antd'
import Loader from '../../../components/Loading/Loader'

const fmt    = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const curMon = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }

const COLOR = '#2d6a4f'

const IncomeRegister = () => {
  const [data, setData]           = useState([])
  const [summary, setSummary]     = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [limit, setLimit]         = useState(10)
  const [loading, setLoading]     = useState(false)
  const [applied, setApplied]     = useState(true)

  const [draftMonth, setDraftMonth]     = useState(curMon())
  const [draftStartDate, setDraftStart] = useState('')
  const [draftEndDate, setDraftEnd]     = useState('')
  const [draftMode, setDraftMode]       = useState('')
  const [draftHead, setDraftHead]       = useState('')
  const [accountHeads, setAccountHeads] = useState([])
  const [appliedFilters, setAppliedFilters] = useState({
    month: curMon(), startDate: '', endDate: '', mode: '', head: '',
  })

  /* Build shared date/filter params (no pagination) */
  const buildFilterParams = (filters) => {
    const q = new URLSearchParams({ voucherType: 'Income', status: 'Active' })
    if (filters.month && !filters.startDate) {
      const [yr, mo] = filters.month.split('-')
      q.set('startDate', `${yr}-${mo}-01`)
      q.set('endDate', new Date(yr, mo, 0).toISOString().slice(0, 10))
    }
    if (filters.startDate) q.set('startDate', filters.startDate)
    if (filters.endDate)   q.set('endDate',   filters.endDate)
    if (filters.mode)      q.set('paymentMode', filters.mode)
    if (filters.head)      q.set('accountHead', filters.head)
    return q
  }

  React.useEffect(() => {
    getRequest('hr/account-heads?accountType=Income&limit=200')
      .then((r) => setAccountHeads(r?.data?.data?.heads || []))
      .catch(() => {})
  }, [])

  /* ── Summary fetch — runs only when filters change (not on page change) ── */
  React.useEffect(() => {
    if (!applied) return
    setSummaryLoading(true)
    const q = buildFilterParams(appliedFilters)
    q.set('limit', '9999')  // all records for accurate totals
    q.set('page', '1')
    getRequest(`hr/vouchers?${q.toString()}`)
      .then((r) => {
        const all = r?.data?.data?.vouchers || []
        const totalAmt = all.reduce((s, v) => s + (v.totalAmount || 0), 0)
        const byMode = {}; const byHead = {}
        all.forEach((v) => {
          byMode[v.paymentMode] = (byMode[v.paymentMode] || 0) + v.totalAmount
          v.transactions?.forEach((t) => {
            const name = t.accountHead?.accountName || 'Other'
            byHead[name] = (byHead[name] || 0) + t.amount
          })
        })
        setSummary({ totalAmt, byMode, byHead, count: all.length })
      })
      .catch(() => {})
      .finally(() => setSummaryLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, applied])

  /* ── Paginated table fetch — runs on page/limit/filter change ── */
  React.useEffect(() => {
    if (!applied) return
    setLoading(true)
    const q = buildFilterParams(appliedFilters)
    q.set('page', page)
    q.set('limit', limit)
    getRequest(`hr/vouchers?${q.toString()}`)
      .then((r) => {
        setData(r?.data?.data?.vouchers || [])
        setTotal(r?.data?.data?.total || 0)
      })
      .catch(() => toast.error('Failed to load income register'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, appliedFilters, applied])

  const handleApply = () => {
    setAppliedFilters({ month: draftMonth, startDate: draftStartDate, endDate: draftEndDate, mode: draftMode, head: draftHead })
    setPage(1); setApplied(true)
  }
  const handleClear = () => {
    const reset = { month: curMon(), startDate: '', endDate: '', mode: '', head: '' }
    setDraftMonth(curMon()); setDraftStart(''); setDraftEnd(''); setDraftMode(''); setDraftHead('')
    setAppliedFilters(reset)
    setPage(1)
    setApplied(true)
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 space-y-5">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: COLOR }} /> Income Register
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">All income vouchers — month-wise or date-range</p>
        </div>
        {applied && data.length > 0 && (
          <button onClick={() => window.print()}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition">
            <Printer size={14} /> Print
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Filters</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Month</label>
            <input type="month" value={draftMonth} onChange={(e) => { setDraftMonth(e.target.value); setDraftStart(''); setDraftEnd('') }}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-slate-50 font-medium text-slate-700" />
          </div>
          <div className="text-xs text-slate-400 self-center pb-2 font-medium">— or custom range —</div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">From Date</label>
            <input type="date" value={draftStartDate} onChange={(e) => { setDraftStart(e.target.value); setDraftMonth('') }}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-slate-50 font-medium text-slate-700" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">To Date</label>
            <input type="date" value={draftEndDate} onChange={(e) => { setDraftEnd(e.target.value); setDraftMonth('') }}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-slate-50 font-medium text-slate-700" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Payment Mode</label>
            <select value={draftMode} onChange={(e) => setDraftMode(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-slate-50 font-medium text-slate-700">
              <option value="">All Modes</option>
              {['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Account Head</label>
            <select value={draftHead} onChange={(e) => setDraftHead(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-slate-50 font-medium text-slate-700">
              <option value="">All Heads</option>
              {accountHeads.map((h) => <option key={h._id} value={h._id}>{h.accountName}</option>)}
            </select>
          </div>
          <button onClick={handleApply}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition shadow-sm active:scale-95"
            style={{ background: COLOR }}>
            <Filter size={14} /> Apply
          </button>
          {applied && (
            <button onClick={handleClear} className="text-sm font-bold self-center" style={{ color: '#7a2d2d' }}>Clear</button>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {applied && summary && !summaryLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: COLOR }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Income</p>
              <p className="text-2xl font-black text-slate-800">₹{fmt(summary.totalAmt)}</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: COLOR }}>{summary.count} vouchers</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">By Payment Mode</p>
            <div className="space-y-1.5">
              {Object.entries(summary.byMode).map(([mode, amt]) => (
                <div key={mode} className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">{mode}</span>
                  <span className="font-black" style={{ color: COLOR }}>₹{fmt(amt)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">By Account Head</p>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {Object.entries(summary.byHead).map(([head, amt]) => (
                <div key={head} className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium truncate max-w-[140px]" title={head}>{head}</span>
                  <span className="font-black" style={{ color: COLOR }}>₹{fmt(amt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      {!applied ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-sm shadow-sm font-medium">
          Select filters and click <b className="text-slate-600">Apply</b> to view the income register
        </div>
      ) : loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <Loader /><p className="text-sm text-slate-400 mt-2 font-medium">Loading records...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-10 text-center shadow-sm">
          <Empty description="No income records found" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Sr', 'Voucher No.', 'Date', 'Account Heads', 'Mode', 'Reference', 'Amount', 'Remarks'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide ${i === 0 ? 'text-center' : i >= 4 && i <= 5 ? 'text-center' : i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((v, idx) => (
                <tr key={v._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-center text-slate-400 font-medium">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-black" style={{ color: '#042954' }}>{v.voucherNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{v.voucherDate?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {v.transactions?.map((t, ti) => (
                        <div key={ti} className="text-xs text-slate-600 font-medium">
                          {t.accountHead?.accountName || '—'}
                          <span className="text-slate-400 ml-1">(₹{fmt(t.amount)})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: '#04295415', color: '#042954' }}>{v.paymentMode}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-medium">{v.referenceNumber || '—'}</td>
                  <td className="px-4 py-3 text-right font-black" style={{ color: COLOR }}>₹{fmt(v.totalAmount)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-[140px] truncate font-medium" title={v.remarks}>{v.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200" style={{ background: `${COLOR}10` }}>
                <td colSpan={6} className="px-4 py-3 text-right text-sm font-bold text-slate-600">
                  Total ({total} vouchers — all pages):
                </td>
                <td className="px-4 py-3 text-right font-black text-base" style={{ color: COLOR }}>
                  {summaryLoading ? '...' : `₹${fmt(summary?.totalAmt || 0)}`}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
          {total > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/50">
              <p className="text-xs text-slate-400 font-medium">
                Showing <span className="font-black text-slate-600">{(page - 1) * limit + 1}</span>–
                <span className="font-black text-slate-600">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-black text-slate-600">{total}</span> records
              </p>
              <Pagination current={page} pageSize={limit} total={total} onChange={(p) => setPage(p)}
                showSizeChanger pageSizeOptions={['10', '20', '50', '100']}
                onShowSizeChange={(_, size) => { setLimit(size); setPage(1) }} size="small" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IncomeRegister
