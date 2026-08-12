import React, { useState } from 'react'
import { BookOpen, TrendingUp, TrendingDown, SlidersHorizontal, Printer, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Select, Pagination } from 'antd'
import Loader from '../../../components/Loading/Loader'

const fmt    = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const curMon = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }

const AccountLedger = () => {
  const [accountHeads, setAccountHeads] = useState([])
  const [selectedHead, setSelectedHead] = useState(null)
  const [selectedHeadLabel, setSelectedHeadLabel] = useState('')

  const [draftMonth, setDraftMonth]     = useState(curMon())
  const [draftStartDate, setDraftStart] = useState('')
  const [draftEndDate, setDraftEnd]     = useState('')

  const [appliedFilters, setAppliedFilters] = useState({})
  const [applied, setApplied]           = useState(false)

  const [data, setData]       = useState([])
  const [summary, setSummary] = useState(null)
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [limit, setLimit]     = useState(10)
  const [loading, setLoading] = useState(false)
  const [headsLoading, setHeadsLoading] = useState(false)

  React.useEffect(() => {
    setHeadsLoading(true)
    getRequest('hr/account-heads?limit=500')
      .then((r) => setAccountHeads(r?.data?.data?.heads || []))
      .catch(() => {})
      .finally(() => setHeadsLoading(false))
  }, [])

  React.useEffect(() => {
    if (!applied || !appliedFilters.headId) return
    setLoading(true)
    const q = new URLSearchParams({ page, limit, accountHead: appliedFilters.headId, status: 'Active' })
    if (appliedFilters.month && !appliedFilters.startDate) {
      const [yr, mo] = appliedFilters.month.split('-')
      const start = `${yr}-${mo}-01`
      const end   = new Date(yr, mo, 0).toISOString().slice(0, 10)
      q.set('startDate', start); q.set('endDate', end)
    }
    if (appliedFilters.startDate) q.set('startDate', appliedFilters.startDate)
    if (appliedFilters.endDate)   q.set('endDate',   appliedFilters.endDate)

    getRequest(`hr/vouchers?${q.toString()}`)
      .then((r) => {
        const vouchers = r?.data?.data?.vouchers || []
        setTotal(r?.data?.data?.total || 0)
        const rows = []
        let runningBalance = 0
        vouchers.forEach((v) => {
          const matchedTrans = v.transactions?.filter(
            (t) => t.accountHead?._id === appliedFilters.headId || t.accountHead === appliedFilters.headId
          ) || []
          matchedTrans.forEach((t) => {
            const amt = t.amount || 0
            if (v.voucherType === 'Income') runningBalance += amt
            else runningBalance -= amt
            rows.push({
              voucherNumber: v.voucherNumber,
              voucherDate:   v.voucherDate,
              voucherType:   v.voucherType,
              paymentMode:   v.paymentMode,
              referenceNumber: v.referenceNumber,
              remarks:       t.remarks || v.remarks,
              amount:        amt,
              balance:       runningBalance,
            })
          })
        })
        const totalIncome  = rows.filter((r) => r.voucherType === 'Income').reduce((s, r) => s + r.amount, 0)
        const totalExpense = rows.filter((r) => r.voucherType === 'Expense').reduce((s, r) => s + r.amount, 0)
        setData(rows)
        setSummary({ totalIncome, totalExpense, netBalance: totalIncome - totalExpense, count: vouchers.length })
      })
      .catch(() => toast.error('Failed to load account ledger'))
      .finally(() => setLoading(false))
  }, [page, appliedFilters, applied])

  const handleApply = () => {
    if (!selectedHead) return toast.error('Please select an Account Head')
    setAppliedFilters({ headId: selectedHead, month: draftMonth, startDate: draftStartDate, endDate: draftEndDate })
    setPage(1)
    setApplied(true)
  }

  const handleClear = () => {
    setSelectedHead(null); setSelectedHeadLabel('')
    setDraftMonth(curMon()); setDraftStart(''); setDraftEnd('')
    setApplied(false); setData([]); setSummary(null)
  }

  const incomeHeads  = accountHeads.filter((h) => h.accountType === 'Income')
  const expenseHeads = accountHeads.filter((h) => h.accountType === 'Expense')
  const selectOptions = [
    {
      label: <span className="font-semibold text-green-700">Income Heads</span>,
      options: incomeHeads.map((h) => ({ value: h._id, label: h.accountName, type: 'Income' })),
    },
    {
      label: <span className="font-semibold text-red-600">Expense Heads</span>,
      options: expenseHeads.map((h) => ({ value: h._id, label: h.accountName, type: 'Expense' })),
    },
  ]

  const periodLabel = appliedFilters.startDate
    ? `${appliedFilters.startDate}  →  ${appliedFilters.endDate || '...'}`
    : appliedFilters.month || ''


  return (
    <div className="min-h-screen space-y-4 p-1">

      {/* ── HEADER ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0c3b73] flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Account Ledger</h1>
            <p className="text-xs text-gray-400">Transaction history for a specific account head</p>
          </div>
        </div>
        {applied && data.length > 0 && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm transition-colors print:hidden"
          >
            <Printer size={14} /> Print
          </button>
        )}
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={14} className="text-[#0c3b73]" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-[220px]">
            <label className="text-xs text-gray-500 font-medium">
              Account Head <span className="text-red-500">*</span>
            </label>
            <Select
              showSearch
              placeholder="Select Account Head"
              loading={headsLoading}
              value={selectedHead}
              onChange={(val, opt) => { setSelectedHead(val); setSelectedHeadLabel(opt?.label || '') }}
              options={selectOptions}
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              className="w-full"
              style={{ minWidth: 220 }}
              size="middle"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Month</label>
            <input
              type="month"
              value={draftMonth}
              onChange={(e) => { setDraftMonth(e.target.value); setDraftStart(''); setDraftEnd('') }}
              className="border border-gray-200 rounded-lg px-3 py-[7px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50"
            />
          </div>

          <div className="text-xs text-gray-400 self-center pb-1 font-medium">— or —</div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">From Date</label>
            <input
              type="date"
              value={draftStartDate}
              onChange={(e) => { setDraftStart(e.target.value); setDraftMonth('') }}
              className="border border-gray-200 rounded-lg px-3 py-[7px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">To Date</label>
            <input
              type="date"
              value={draftEndDate}
              onChange={(e) => { setDraftEnd(e.target.value); setDraftMonth('') }}
              className="border border-gray-200 rounded-lg px-3 py-[7px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50"
            />
          </div>

          <button
            onClick={handleApply}
            className="bg-[#0c3b73] hover:bg-blue-800 active:scale-95 text-white px-5 py-[9px] rounded-lg text-sm flex items-center gap-2 transition-all font-medium shadow-sm"
          >
            <SlidersHorizontal size={13} /> Apply
          </button>
          {applied && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              <RefreshCw size={13} /> Clear
            </button>
          )}
        </div>
      </div>


      {/* ── SUMMARY CARDS ── */}
      {applied && summary && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Income */}
          <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm p-5 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-t-xl" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-600">₹{fmt(summary.totalIncome)}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-green-500" />
              <span className="text-xs text-gray-400">Debit side</span>
            </div>
          </div>

          {/* Expense */}
          <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm p-5 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-rose-500 rounded-t-xl" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Expense</p>
                <p className="text-2xl font-bold text-red-500">₹{fmt(summary.totalExpense)}</p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <TrendingDown size={13} className="text-red-400" />
              <span className="text-xs text-gray-400">Credit side</span>
            </div>
          </div>

          {/* Net Balance */}
          <div className={`relative bg-white border rounded-xl shadow-sm p-5 overflow-hidden ${
            summary.netBalance >= 0 ? 'border-blue-200' : 'border-orange-200'
          }`}>
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
              summary.netBalance >= 0
                ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                : 'bg-gradient-to-r from-orange-400 to-amber-500'
            }`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                  {summary.netBalance >= 0 ? '+' : ''}₹{fmt(summary.netBalance)}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                summary.netBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50'
              }`}>
                <Wallet className={`w-5 h-5 ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-orange-500'}`} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className={`text-xs ${summary.netBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                {summary.count} voucher{summary.count !== 1 ? 's' : ''} · {periodLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT HEADER ── */}
      {applied && (
        <div className="hidden print:block text-center mb-4">
          <h2 className="text-xl font-bold">Account Ledger</h2>
          <p className="text-sm text-gray-600">
            Account Head: {selectedHeadLabel}
            {appliedFilters.month && !appliedFilters.startDate && ` | Month: ${appliedFilters.month}`}
            {appliedFilters.startDate && ` | ${appliedFilters.startDate} to ${appliedFilters.endDate}`}
          </p>
        </div>
      )}


      {/* ── TABLE / STATES ── */}
      {!applied ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm py-20 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 bg-[#EEF2F7] rounded-full flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-[#0c3b73]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">No Account Selected</p>
            <p className="text-xs text-gray-400 mt-1">Select an <b>Account Head</b> and period, then click <b>Apply</b></p>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 flex flex-col items-center gap-3">
          <Loader />
          <p className="text-sm text-gray-400">Loading ledger...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm py-16 flex flex-col items-center gap-2">
          <Empty description={<span className="text-sm text-gray-400">No transactions found for this period</span>} />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          {/* Table Header Bar */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#0c3b73] to-[#1a5aa0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <span className="font-semibold text-white text-sm">{selectedHeadLabel}</span>
              {periodLabel && (
                <span className="text-xs text-blue-200 bg-white/10 px-2 py-0.5 rounded-full ml-1">
                  {periodLabel}
                </span>
              )}
            </div>
            <span className="text-xs text-blue-200 bg-white/10 px-2.5 py-1 rounded-full">
              {data.length} transaction{data.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Voucher No.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-green-700 uppercase tracking-wider">Income (Dr)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-red-600 uppercase tracking-wider">Expense (Cr)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-400 font-medium">{(page - 1) * limit + idx + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                        {row.voucherDate?.slice(0, 10)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-[#0c3b73] bg-blue-50 px-2 py-0.5 rounded">
                        {row.voucherNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        row.voucherType === 'Income'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
                      }`}>
                        {row.voucherType === 'Income'
                          ? <ArrowUpRight size={11} />
                          : <ArrowDownRight size={11} />
                        }
                        {row.voucherType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {row.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.referenceNumber || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-right">
                      {row.voucherType === 'Income' ? (
                        <span className="text-emerald-600 font-bold text-sm">₹{fmt(row.amount)}</span>
                      ) : (
                        <span className="text-gray-200 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.voucherType === 'Expense' ? (
                        <span className="text-rose-500 font-bold text-sm">₹{fmt(row.amount)}</span>
                      ) : (
                        <span className="text-gray-200 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold text-sm ${row.balance >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                        {row.balance >= 0 ? '+' : '-'}₹{fmt(Math.abs(row.balance))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-[130px] truncate" title={row.remarks}>
                      {row.remarks || <span className="text-gray-200">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-t-2 border-gray-300">
                  <td colSpan={6} className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Totals
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700 text-sm">
                    ₹{fmt(summary?.totalIncome || 0)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600 text-sm">
                    ₹{fmt(summary?.totalExpense || 0)}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold text-sm ${
                    (summary?.netBalance || 0) >= 0 ? 'text-blue-700' : 'text-orange-500'
                  }`}>
                    {(summary?.netBalance || 0) >= 0 ? '+' : ''}₹{fmt(summary?.netBalance || 0)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {total > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-gray-400">
                Showing{' '}
                <span className="font-semibold text-gray-600">{(page - 1) * limit + 1}</span>–
                <span className="font-semibold text-gray-600">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-semibold text-gray-600">{total}</span> records
              </p>
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                onChange={(p) => setPage(p)}
                showSizeChanger
                pageSizeOptions={['10', '25', '50', '100']}
                onShowSizeChange={(_, size) => { setLimit(size); setPage(1) }}
                size="small"
              />
            </div>
          )}
        </div>
      )}

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .hidden.print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  )
}

export default AccountLedger
