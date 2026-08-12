import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart2, TrendingUp, TrendingDown, Scale,
  Printer, RefreshCw, Download, ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Cell,
  AreaChart, Area,
} from 'recharts'
import { Empty, Select } from 'antd'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Loader from '../../../components/Loading/Loader'
import DashboardStatCard from '../../dashboard/Stats/DashboardStatCard'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

const curMon = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const monthLabel = (ym) => {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

const monthOptions = Array.from({ length: 24 }, (_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  return { value: val, label: d.toLocaleString('en-IN', { month: 'short', year: 'numeric' }) }
})

/* ── Custom dark tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0f172a', color: '#f1f5f9', fontSize: 12, fontWeight: 600,
      padding: '8px 14px', borderRadius: 10, lineHeight: 1.7,
      boxShadow: '0 6px 20px rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: 10, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill, display: 'inline-block' }} />
          <span style={{ color: '#94a3b8', fontSize: 10 }}>{p.name}:</span>
          <span style={{ color: '#fff' }}>₹{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const MonthlySummary = () => {
  const [month, setMonth]     = useState(curMon())
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback((m) => {
    if (!m) return
    setLoading(true)
    getRequest(`hr/accounts/monthly?month=${m}`)
      .then((r) => setData(r?.data?.data || null))
      .catch(() => { toast.error('Failed to load summary'); setData(null) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(month) }, [])

  const handleMonthChange = (val) => { setMonth(val); fetchData(val) }

  const navigateMonth = (dir) => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 + dir, 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    setMonth(next); fetchData(next)
  }

  const incomeBreakdown  = data?.breakdown?.filter((b) => b.accountType === 'Income').sort((a, b) => b.total - a.total)  || []
  const expenseBreakdown = data?.breakdown?.filter((b) => b.accountType === 'Expense').sort((a, b) => b.total - a.total) || []
  const isProfit         = (data?.netBalance ?? 0) >= 0
  const isCurrentMonth   = month === curMon()
  const max              = Math.max(data?.totalIncome || 0, data?.totalExpense || 0, 1)

  /* Chart data — side-by-side bars */
  const chartData = data ? [
    { name: 'Income',  value: data.totalIncome  || 0, fill: '#2d6a4f' },
    { name: 'Expense', value: data.totalExpense || 0, fill: '#7a2d2d' },
    { name: 'Net',     value: Math.abs(data.netBalance || 0), fill: isProfit ? '#042954' : '#b45309' },
  ] : []

  const exportExcel = () => {
    if (!data) return
    const rows = [
      ...incomeBreakdown.map((h)  => ({ Type: 'Income',  'Account Head': h.accountName, 'Amount (₹)': h.total })),
      ...expenseBreakdown.map((h) => ({ Type: 'Expense', 'Account Head': h.accountName, 'Amount (₹)': h.total })),
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Monthly Summary')
    saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/octet-stream' }), `monthly-summary-${month}.xlsx`)
    toast.success('Exported')
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 space-y-5">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#042954]" /> Monthly Summary
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Account-head wise breakdown for the selected month</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => fetchData(month)} disabled={loading}
            className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 font-bold shadow-sm transition active:scale-95">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {data && (
            <>
              <button onClick={exportExcel}
                className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 font-bold shadow-sm transition active:scale-95">
                <Download size={13} /> Export
              </button>
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 font-bold shadow-sm transition active:scale-95">
                <Printer size={13} /> Print
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── MONTH SELECTOR ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4 print:hidden">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Month</label>
          <button onClick={() => navigateMonth(-1)}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition active:scale-95 shadow-sm">
            <ChevronLeft size={15} className="text-slate-500" />
          </button>
          <Select
            value={month}
            onChange={handleMonthChange}
            options={monthOptions}
            size="middle"
            style={{ minWidth: 160 }}
            className="font-bold"
          />
          <button onClick={() => navigateMonth(1)} disabled={isCurrentMonth}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition active:scale-95 shadow-sm disabled:opacity-30">
            <ChevronRight size={15} className="text-slate-500" />
          </button>
          <span className="text-sm text-slate-600 font-bold">{monthLabel(month)}</span>
          {isCurrentMonth && (
            <span className="text-xs font-black px-2.5 py-1 rounded-full text-white" style={{ background: '#042954' }}>Current</span>
          )}
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <h2 className="text-xl font-black">Monthly Income &amp; Expense Summary</h2>
        <p className="text-sm text-slate-600">{monthLabel(month)} &nbsp;|&nbsp; {data?.voucherCount || 0} vouchers</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
          <Loader />
          <p className="text-sm text-slate-400 mt-3 font-medium">Loading {monthLabel(month)}...</p>
        </div>
      ) : !data ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
          <Empty description="No data for this month" />
        </div>
      ) : (
        <>
          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardStatCard
              title="Total Income"
              value={`₹${fmt(data.totalIncome)}`}
              icon={TrendingUp}
              color="#2d6a4f"
              badge={`${incomeBreakdown.length} account heads`}
              sub={`${data.voucherCount} vouchers this month`}
              progress={max > 0 ? Math.round((data.totalIncome / max) * 100) : 0}
            />
            <DashboardStatCard
              title="Total Expense"
              value={`₹${fmt(data.totalExpense)}`}
              icon={TrendingDown}
              color="#7a2d2d"
              badge={`${expenseBreakdown.length} account heads`}
              sub="All expenses this month"
              progress={max > 0 ? Math.round((data.totalExpense / max) * 100) : 0}
            />
            <DashboardStatCard
              title="Net Balance"
              value={`${isProfit ? '+' : ''}₹${fmt(data.netBalance)}`}
              icon={Scale}
              color={isProfit ? '#042954' : '#b45309'}
              badge={isProfit ? '▲ Surplus this month' : '▼ Deficit this month'}
              sub={`Income ${isProfit ? 'exceeds' : 'less than'} expense`}
              progress={data.totalIncome > 0 ? Math.min(100, Math.round((Math.abs(data.netBalance) / data.totalIncome) * 100)) : 0}
            />
          </div>

          {/* ── CHARTS ROW ── */}
          {(data.totalIncome > 0 || data.totalExpense > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Net balance mini card + progress bars */}
              <div className={`bg-white border-2 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                ${isProfit ? 'border-[#042954]/20' : 'border-[#b45309]/20'}`}>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${isProfit ? 'text-[#042954]' : 'text-[#b45309]'}`}>
                    {monthLabel(month)}
                  </p>
                  <h3 className={`text-3xl font-black ${isProfit ? 'text-[#042954]' : 'text-[#b45309]'}`}>
                    {isProfit ? '+' : '-'}₹{fmt(Math.abs(data.netBalance))}
                  </h3>
                  <p className={`text-xs mt-1.5 font-bold ${isProfit ? 'text-[#2d6a4f]' : 'text-[#7a2d2d]'}`}>
                    {isProfit ? '▲ Surplus' : '▼ Deficit'}
                  </p>
                </div>
                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-semibold">Income</span>
                      <span className="font-black text-[#2d6a4f]">₹{fmt(data.totalIncome)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.round((data.totalIncome / max) * 100)}%`, background: '#2d6a4f' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-semibold">Expense</span>
                      <span className="font-black text-[#7a2d2d]">₹{fmt(data.totalExpense)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.round((data.totalExpense / max) * 100)}%`, background: '#7a2d2d' }} />
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Total Vouchers</span>
                    <span className="text-sm font-black text-slate-700">{data.voucherCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Bar chart */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-slate-700">Income vs Expense vs Net</h3>
                  <div className="flex items-center gap-4">
                    {[['#2d6a4f','Income'],['#7a2d2d','Expense'],[isProfit?'#042954':'#b45309','Net']].map(([c,l]) => (
                      <div key={l} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ background: c }} />
                        <span className="text-xs font-semibold text-slate-500">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barCategoryGap="32%">
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#475569', fontWeight: 700 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`}
                      tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                      domain={[0, 'auto']}
                    />
                    <RTooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── BREAKDOWN TABLES ── */}
          {data.breakdown.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
              <Empty description="No transactions this month" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* ── INCOME ── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: '#2d6a4f' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <TrendingUp size={14} className="text-white" />
                    </div>
                    <h3 className="text-sm font-black text-white">Income Breakdown</h3>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
                    ₹{fmt(data.totalIncome)}
                  </span>
                </div>
                {incomeBreakdown.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm font-medium">No income this month</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Account Head</th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wide">Amount</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeBreakdown.map((item, i) => {
                        const pct = data.totalIncome > 0 ? Math.round((item.total / data.totalIncome) * 100) : 0
                        return (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#2d6a4f' }} />
                                <span className="font-bold text-slate-700">{item.accountName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-black" style={{ color: '#2d6a4f' }}>₹{fmt(item.total)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: '#2d6a4f' }} />
                                </div>
                                <span className="text-xs font-black text-slate-500 w-7 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 font-black" style={{ background: '#2d6a4f10' }}>
                        <td className="px-4 py-2.5" style={{ color: '#2d6a4f' }}>Total</td>
                        <td className="px-4 py-2.5 text-right" style={{ color: '#2d6a4f' }}>₹{fmt(data.totalIncome)}</td>
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-400">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>

              {/* ── EXPENSE ── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: '#7a2d2d' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <TrendingDown size={14} className="text-white" />
                    </div>
                    <h3 className="text-sm font-black text-white">Expense Breakdown</h3>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
                    ₹{fmt(data.totalExpense)}
                  </span>
                </div>
                {expenseBreakdown.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm font-medium">No expenses this month</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Account Head</th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wide">Amount</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseBreakdown.map((item, i) => {
                        const pct = data.totalExpense > 0 ? Math.round((item.total / data.totalExpense) * 100) : 0
                        return (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#7a2d2d' }} />
                                <span className="font-bold text-slate-700">{item.accountName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-black" style={{ color: '#7a2d2d' }}>₹{fmt(item.total)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: '#7a2d2d' }} />
                                </div>
                                <span className="text-xs font-black text-slate-500 w-7 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 font-black" style={{ background: '#7a2d2d10' }}>
                        <td className="px-4 py-2.5" style={{ color: '#7a2d2d' }}>Total</td>
                        <td className="px-4 py-2.5 text-right" style={{ color: '#7a2d2d' }}>₹{fmt(data.totalExpense)}</td>
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-400">100%</td>
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

export default MonthlySummary
