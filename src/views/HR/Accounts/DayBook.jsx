import React, { useState, useEffect, useCallback } from 'react'
import { BookOpen, TrendingUp, TrendingDown, Scale, Printer, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Empty } from 'antd'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Loader from '../../../components/Loading/Loader'
import DashboardStatCard from '../../dashboard/Stats/DashboardStatCard'

const fmt   = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const today = () => new Date().toISOString().slice(0, 10)

const dateLabel = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

const DayBook = () => {
  const [date, setDate]       = useState(today())
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback((d) => {
    if (!d) return
    setLoading(true)
    getRequest(`hr/accounts/day-book?date=${d}`)
      .then((r) => setData(r?.data?.data || null))
      .catch(() => { toast.error('Failed to load day book'); setData(null) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(date) }, [])

  const handleDateChange = (d) => { setDate(d); fetchData(d) }
  const navigateDay = (dir) => {
    const d = new Date(date)
    d.setDate(d.getDate() + dir)
    const next = d.toISOString().slice(0, 10)
    if (next > today()) return
    setDate(next); fetchData(next)
  }

  const isToday         = date === today()
  const incomeVouchers  = data?.vouchers?.filter((v) => v.voucherType === 'Income')  || []
  const expenseVouchers = data?.vouchers?.filter((v) => v.voucherType === 'Expense') || []
  const isProfit        = (data?.netBalance ?? 0) >= 0

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 space-y-5">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#042954]" /> Day Book
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">All transactions for the selected date</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchData(date)} disabled={loading}
            className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 font-bold shadow-sm transition active:scale-95">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {data && (
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 font-bold shadow-sm transition active:scale-95">
              <Printer size={13} /> Print
            </button>
          )}
        </div>
      </div>

      {/* ── DATE SELECTOR ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4 print:hidden">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
          <button onClick={() => navigateDay(-1)}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition active:scale-95 shadow-sm">
            <ChevronLeft size={15} className="text-slate-500" />
          </button>
          <input type="date" value={date} max={today()} onChange={(e) => handleDateChange(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#042954]/20 bg-slate-50 text-slate-700" />
          <button onClick={() => navigateDay(1)} disabled={isToday}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition active:scale-95 shadow-sm disabled:opacity-30">
            <ChevronRight size={15} className="text-slate-500" />
          </button>
          <span className="text-sm text-slate-500 font-bold">{dateLabel(date)}</span>
          {isToday && (
            <span className="text-xs font-black px-2.5 py-1 rounded-full text-white" style={{ background: '#042954' }}>Today</span>
          )}
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <h2 className="text-xl font-black">Day Book</h2>
        <p className="text-sm text-slate-600">{dateLabel(date)}</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
          <Loader />
          <p className="text-sm text-slate-400 mt-3 font-medium">Loading {dateLabel(date)}...</p>
        </div>
      ) : !data ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
          <Empty description="No data found" />
        </div>
      ) : (
        <>
          {/* ── KPI CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardStatCard
              title="Total Income"
              value={`₹${fmt(data.totalIncome)}`}
              icon={TrendingUp}
              color="#2d6a4f"
              badge="All income for this date"
              sub={`${incomeVouchers.length} income voucher${incomeVouchers.length !== 1 ? 's' : ''}`}
              progress={data.totalIncome && data.totalIncome + data.totalExpense
                ? Math.round((data.totalIncome / (data.totalIncome + data.totalExpense)) * 100)
                : 0}
            />
            <DashboardStatCard
              title="Total Expense"
              value={`₹${fmt(data.totalExpense)}`}
              icon={TrendingDown}
              color="#7a2d2d"
              badge="All expenses for this date"
              sub={`${expenseVouchers.length} expense voucher${expenseVouchers.length !== 1 ? 's' : ''}`}
              progress={data.totalExpense && data.totalIncome + data.totalExpense
                ? Math.round((data.totalExpense / (data.totalIncome + data.totalExpense)) * 100)
                : 0}
            />
            <DashboardStatCard
              title="Net Balance"
              value={`${data.netBalance >= 0 ? '+' : ''}₹${fmt(data.netBalance)}`}
              icon={Scale}
              color={isProfit ? '#042954' : '#b45309'}
              badge={isProfit ? '▲ Surplus' : '▼ Deficit'}
              sub={`${data.vouchers.length} total voucher${data.vouchers.length !== 1 ? 's' : ''}`}
              progress={isProfit
                ? data.totalIncome > 0 ? Math.round((data.netBalance / data.totalIncome) * 100) : 0
                : 100}
            />
          </div>

          {data.vouchers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
              <Empty description={`No transactions on ${dateLabel(date)}`} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* ── INCOME TABLE ── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between" style={{ background: '#2d6a4f' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <TrendingUp size={14} className="text-white" />
                    </div>
                    <h3 className="text-sm font-black text-white">Income ({incomeVouchers.length})</h3>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
                    ₹{fmt(data.totalIncome)}
                  </span>
                </div>
                {incomeVouchers.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm font-medium">No income vouchers</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Voucher</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Account Head</th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeVouchers.map((v) =>
                        v.transactions.map((t, ti) => (
                          <tr key={`${v._id}-${ti}`} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-mono text-xs font-black" style={{ color: '#042954' }}>{v.voucherNumber}</div>
                              <div className="text-xs text-slate-400 font-medium">{v.paymentMode}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-bold">{t.accountHead?.accountName || '—'}</td>
                            <td className="px-4 py-3 text-right font-black" style={{ color: '#2d6a4f' }}>₹{fmt(t.amount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-100" style={{ background: '#2d6a4f10' }}>
                        <td colSpan={2} className="px-4 py-2.5 font-black text-slate-700">Total Income</td>
                        <td className="px-4 py-2.5 text-right font-black" style={{ color: '#2d6a4f' }}>₹{fmt(data.totalIncome)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>

              {/* ── EXPENSE TABLE ── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between" style={{ background: '#7a2d2d' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <TrendingDown size={14} className="text-white" />
                    </div>
                    <h3 className="text-sm font-black text-white">Expense ({expenseVouchers.length})</h3>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
                    ₹{fmt(data.totalExpense)}
                  </span>
                </div>
                {expenseVouchers.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm font-medium">No expense vouchers</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Voucher</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Account Head</th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseVouchers.map((v) =>
                        v.transactions.map((t, ti) => (
                          <tr key={`${v._id}-${ti}`} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-mono text-xs font-black" style={{ color: '#042954' }}>{v.voucherNumber}</div>
                              <div className="text-xs text-slate-400 font-medium">{v.paymentMode}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-bold">{t.accountHead?.accountName || '—'}</td>
                            <td className="px-4 py-3 text-right font-black" style={{ color: '#7a2d2d' }}>₹{fmt(t.amount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-100" style={{ background: '#7a2d2d10' }}>
                        <td colSpan={2} className="px-4 py-2.5 font-black text-slate-700">Total Expense</td>
                        <td className="px-4 py-2.5 text-right font-black" style={{ color: '#7a2d2d' }}>₹{fmt(data.totalExpense)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@media print { .print\\:hidden { display: none !important; } .hidden.print\\:block { display: block !important; } }`}</style>
    </div>
  )
}

export default DayBook
