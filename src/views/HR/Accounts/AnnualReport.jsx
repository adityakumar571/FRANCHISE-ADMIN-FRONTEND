import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Scale, Download, RefreshCw, Printer, BarChart2 } from 'lucide-react'
import { Empty } from 'antd'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart,
} from 'recharts'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import { getRequest } from '../../../Helpers'
import Loader from '../../../components/Loading/Loader'
import DashboardStatCard from '../../dashboard/Stats/DashboardStatCard'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

/* ── Custom Tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0f172a', color: '#f1f5f9', fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,.25)', lineHeight: 1.7, border: '1px solid rgba(255,255,255,0.08)' }}>
      <p style={{ color: '#94a3b8', fontSize: 10, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#94a3b8', fontSize: 10 }}>{p.name}:</span>
          <span style={{ color: '#fff' }}>₹{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const AnnualReport = () => {
  const curYear    = new Date().getFullYear()
  const [year, setYear]       = useState(curYear)
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const yearOptions = Array.from({ length: 5 }, (_, i) => curYear - i)

  const fetchData = () => {
    setLoading(true)
    getRequest(`hr/accounts/annual?year=${year}`)
      .then((r) => setData(r?.data?.data))
      .catch(() => toast.error('Failed to load annual report'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [year])

  const incomeHeads  = data?.breakdown?.filter((b) => b.accountType === 'Income').sort((a,b) => b.total - a.total)  || []
  const expenseHeads = data?.breakdown?.filter((b) => b.accountType === 'Expense').sort((a,b) => b.total - a.total) || []
  const isProfit     = (data?.netBalance ?? 0) >= 0
  const maxMonthly   = Math.max(...(data?.monthlyData?.map(m => Math.max(m.income, m.expense)) || [1]))

  const exportExcel = () => {
    if (!data) { toast.error('No data to export'); return }
    const monthly = (data.monthlyData || []).map((m) => ({ Month: m.monthName, 'Income (₹)': m.income, 'Expense (₹)': m.expense, 'Net Balance (₹)': m.netBalance }))
    const heads   = (data.breakdown  || []).map((h) => ({ 'Account Head': h.accountName, Type: h.accountType, 'Total (₹)': h.total }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthly), 'Monthly Summary')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(heads),   'Account Heads')
    saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/octet-stream' }), `annual-report-${year}.xlsx`)
    toast.success('Exported successfully')
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 space-y-5">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#042954]" /> Annual Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Year-wise income vs expense with monthly breakdown</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white font-bold text-slate-700 focus:outline-none shadow-sm">
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={fetchData} className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 font-bold shadow-sm transition active:scale-95">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 font-bold shadow-sm transition active:scale-95">
            <Printer size={13} /> Print
          </button>
          <button onClick={exportExcel} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition active:scale-95 hover:opacity-90" style={{ background: '#042954' }}>
            <Download size={13} /> Export Excel
          </button>
        </div>
      </div>

      <div className="hidden print:block text-center mb-4">
        <h2 className="text-xl font-black">Annual Income &amp; Expense Report — {year}</h2>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm"><Loader /></div>
      ) : !data ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-sm shadow-sm font-medium">Select a year to load the report</div>
      ) : (
        <>
          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardStatCard title={`Total Income (${year})`} value={`₹${fmt(data.totalIncome)}`}
              icon={TrendingUp} color="#2d6a4f"
              badge={`${incomeHeads.length} account heads`}
              sub="All income vouchers this year"
              progress={data.totalIncome && (data.totalIncome + data.totalExpense) ? Math.round((data.totalIncome / (data.totalIncome + data.totalExpense)) * 100) : 0} />
            <DashboardStatCard title={`Total Expense (${year})`} value={`₹${fmt(data.totalExpense)}`}
              icon={TrendingDown} color="#7a2d2d"
              badge={`${expenseHeads.length} account heads`}
              sub="All expense vouchers this year"
              progress={data.totalExpense && (data.totalIncome + data.totalExpense) ? Math.round((data.totalExpense / (data.totalIncome + data.totalExpense)) * 100) : 0} />
            <DashboardStatCard title={`Net Balance (${year})`}
              value={`${isProfit ? '+' : ''}₹${fmt(data.netBalance)}`}
              icon={Scale} color={isProfit ? '#042954' : '#b45309'}
              badge={isProfit ? '▲ Surplus this year' : '▼ Deficit this year'}
              sub={`${data.voucherCount} total vouchers`}
              progress={data.totalIncome > 0 ? Math.min(100, Math.round((Math.abs(data.netBalance) / data.totalIncome) * 100)) : 0} />
          </div>

          {/* ── BAR CHART — Month wise ── */}
          {data.monthlyData?.some((m) => m.income > 0 || m.expense > 0) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-slate-700">Month-wise Income vs Expense — {year}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#2d6a4f' }} /><span className="text-xs font-semibold text-slate-500">Income</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#7a2d2d' }} /><span className="text-xs font-semibold text-slate-500">Expense</span></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`}
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={58}
                    domain={[0, 'auto']}
                  />
                  <RTooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="income"  name="Income"  fill="#2d6a4f" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expense" name="Expense" fill="#7a2d2d" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── NET BALANCE TREND ── */}
          {data.monthlyData?.some((m) => m.netBalance !== 0) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-[14px] font-bold text-slate-700 mb-4">Net Balance Trend — {year}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#042954" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#042954" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`}
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={58}
                    domain={['auto', 'auto']}
                  />
                  <RTooltip content={<ChartTooltip />} cursor={{ stroke: '#e2e8f0' }} />
                  <Area
                    type="monotone"
                    dataKey="netBalance"
                    name="Net Balance"
                    stroke="#042954"
                    strokeWidth={3}
                    fill="url(#netGrad)"
                    dot={{ r: 5, fill: '#fff', stroke: '#042954', strokeWidth: 2.5 }}
                    activeDot={{ r: 7, fill: '#042954', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── MONTHLY TABLE ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: '#042954' }}>
              <h3 className="text-sm font-black text-white">Monthly Breakdown — {year}</h3>
              <span className="text-xs text-blue-200 font-medium">{data.voucherCount} total vouchers</span>
            </div>
            {data.monthlyData?.length === 0 ? (
              <div className="py-10 text-center"><Empty description="No data for this year" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Month', 'Income (₹)', 'Expense (₹)', 'Net Balance (₹)', 'Visual'].map((h, i) => (
                        <th key={h} className={`px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide ${i === 0 ? 'text-left' : i === 4 ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthlyData.map((m, i) => {
                      const hasData = m.income > 0 || m.expense > 0
                      const incW  = maxMonthly > 0 ? Math.round((m.income  / maxMonthly) * 100) : 0
                      const expW  = maxMonthly > 0 ? Math.round((m.expense / maxMonthly) * 100) : 0
                      return (
                        <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${!hasData ? 'opacity-35' : ''}`}>
                          <td className="px-4 py-3 font-bold text-slate-700">{m.monthName}</td>
                          <td className="px-4 py-3 text-right font-black" style={{ color: '#2d6a4f' }}>{m.income > 0 ? `₹${fmt(m.income)}` : '—'}</td>
                          <td className="px-4 py-3 text-right font-black" style={{ color: '#7a2d2d' }}>{m.expense > 0 ? `₹${fmt(m.expense)}` : '—'}</td>
                          <td className="px-4 py-3 text-right font-black" style={{ color: !hasData ? '#94a3b8' : m.netBalance >= 0 ? '#042954' : '#b45309' }}>
                            {!hasData ? '—' : `${m.netBalance >= 0 ? '+' : ''}₹${fmt(m.netBalance)}`}
                          </td>
                          <td className="px-4 py-3 w-40">
                            {hasData && (
                              <div className="space-y-1">
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className="h-1.5 rounded-full" style={{ width: `${incW}%`, background: '#2d6a4f' }} /></div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className="h-1.5 rounded-full" style={{ width: `${expW}%`, background: '#7a2d2d' }} /></div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200" style={{ background: '#04295410' }}>
                      <td className="px-4 py-3 font-black text-slate-700">Total</td>
                      <td className="px-4 py-3 text-right font-black" style={{ color: '#2d6a4f' }}>₹{fmt(data.totalIncome)}</td>
                      <td className="px-4 py-3 text-right font-black" style={{ color: '#7a2d2d' }}>₹{fmt(data.totalExpense)}</td>
                      <td className="px-4 py-3 text-right font-black" style={{ color: isProfit ? '#042954' : '#b45309' }}>{isProfit ? '+' : ''}₹{fmt(data.netBalance)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* ── ACCOUNT HEAD BREAKDOWN ── */}
          {data.breakdown?.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Income Heads */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="px-5 py-3.5" style={{ background: '#2d6a4f' }}>
                  <h3 className="text-sm font-black text-white">Income — Account Head Wise</h3>
                </div>
                {incomeHeads.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm font-medium">No income this year</div>
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
                      {incomeHeads.map((h, i) => {
                        const pct = data.totalIncome > 0 ? Math.round((h.total / data.totalIncome) * 100) : 0
                        return (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-slate-700">{h.accountName}</td>
                            <td className="px-4 py-2.5 text-right font-black" style={{ color: '#2d6a4f' }}>₹{fmt(h.total)}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: '#2d6a4f' }} /></div>
                                <span className="text-xs font-bold text-slate-500 w-7 text-right">{pct}%</span>
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

              {/* Expense Heads */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="px-5 py-3.5" style={{ background: '#7a2d2d' }}>
                  <h3 className="text-sm font-black text-white">Expense — Account Head Wise</h3>
                </div>
                {expenseHeads.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm font-medium">No expenses this year</div>
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
                      {expenseHeads.map((h, i) => {
                        const pct = data.totalExpense > 0 ? Math.round((h.total / data.totalExpense) * 100) : 0
                        return (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-slate-700">{h.accountName}</td>
                            <td className="px-4 py-2.5 text-right font-black" style={{ color: '#7a2d2d' }}>₹{fmt(h.total)}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: '#7a2d2d' }} /></div>
                                <span className="text-xs font-bold text-slate-500 w-7 text-right">{pct}%</span>
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
    </div>
  )
}

export default AnnualReport
