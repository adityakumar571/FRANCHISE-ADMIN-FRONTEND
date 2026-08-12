import React, { useState, useEffect } from 'react'
import { CreditCard, TrendingUp, TrendingDown, Download, RefreshCw, Filter, Wallet } from 'lucide-react'
import { Empty, Pagination } from 'antd'
import { PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import { getRequest } from '../../../Helpers'
import Loader from '../../../components/Loading/Loader'
import DashboardStatCard from '../../dashboard/Stats/DashboardStatCard'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const today      = () => new Date().toISOString().slice(0, 10)
const monthStart = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01` }

const MODE_COLORS = { 'Cash': '#2d6a4f', 'Bank Transfer': '#042954', 'UPI': '#5b21b6', 'Cheque': '#b45309', 'Other': '#64748b' }

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
          <span>{p.dataKey === 'count' ? p.value : `₹${fmt(p.value)}`}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Custom Pie Label ── */
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5
  const x  = cx + r * Math.cos(-midAngle * RADIAN)
  const y  = cy + r * Math.sin(-midAngle * RADIAN)
  return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>{`${(percent*100).toFixed(0)}%`}</text>
}

const PaymentModeReport = () => {
  const [startDate, setStartDate]     = useState(monthStart())
  const [endDate, setEndDate]         = useState(today())
  const [voucherType, setVoucherType] = useState('')
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(false)
  const [voucherPage, setVoucherPage] = useState(1)
  const PG = 10

  const fetchData = () => {
    setLoading(true); setVoucherPage(1)
    const q = new URLSearchParams({ startDate, endDate })
    if (voucherType) q.set('voucherType', voucherType)
    getRequest(`hr/accounts/payment-mode?${q.toString()}`)
      .then((r) => setData(r?.data?.data))
      .catch(() => toast.error('Failed to load payment mode report'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const exportExcel = () => {
    if (!data) { toast.error('No data to export'); return }
    const rows = (data.modeReport || []).map((m) => ({ 'Payment Mode': m.mode, 'Total Vouchers': m.count, 'Income (₹)': m.totalIncome, 'Expense (₹)': m.totalExpense, 'Total Amount (₹)': m.total }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Payment Mode')
    saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/octet-stream' }), `payment-mode-${startDate}-to-${endDate}.xlsx`)
    toast.success('Exported')
  }

  const modeReport  = data?.modeReport || []
  const grandTotal  = modeReport.reduce((s, m) => s + m.total, 0)
  const pieData     = modeReport.map((m) => ({ name: m.mode, value: m.total }))
  const isProfit    = (data?.totalIncome ?? 0) >= (data?.totalExpense ?? 0)

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 space-y-5">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#042954]" /> Payment Mode Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Cash, Bank Transfer, UPI, Cheque — income &amp; expense breakdown</p>
        </div>
        <button onClick={exportExcel} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition active:scale-95 hover:opacity-90" style={{ background: '#042954' }}>
          <Download size={13} /> Export Excel
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Filters</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 font-medium text-slate-700 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">To Date</label>
            <input type="date" value={endDate} max={today()} onChange={(e) => setEndDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 font-medium text-slate-700 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Voucher Type</label>
            <select value={voucherType} onChange={(e) => setVoucherType(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 font-medium text-slate-700 focus:outline-none">
              <option value="">All (Income + Expense)</option>
              <option value="Income">Income Only</option>
              <option value="Expense">Expense Only</option>
            </select>
          </div>
          <button onClick={fetchData} disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition shadow-sm active:scale-95 disabled:opacity-60" style={{ background: '#042954' }}>
            {loading ? <><RefreshCw size={13} className="animate-spin" /> Loading...</> : <><Filter size={14} /> Apply</>}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm"><Loader /></div>
      ) : !data ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-sm shadow-sm font-medium">Select a date range and click Apply</div>
      ) : (
        <>
          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardStatCard title="Total Income" value={`₹${fmt(data.totalIncome)}`} icon={TrendingUp} color="#2d6a4f"
              badge="All income in range" sub={`${modeReport.length} payment modes used`}
              progress={data.totalIncome && (data.totalIncome + data.totalExpense) ? Math.round((data.totalIncome/(data.totalIncome+data.totalExpense))*100) : 0} />
            <DashboardStatCard title="Total Expense" value={`₹${fmt(data.totalExpense)}`} icon={TrendingDown} color="#7a2d2d"
              badge="All expenses in range" sub="Across all payment modes"
              progress={data.totalExpense && (data.totalIncome + data.totalExpense) ? Math.round((data.totalExpense/(data.totalIncome+data.totalExpense))*100) : 0} />
            <DashboardStatCard title="Total Transactions" value={data.totalTransactions} icon={Wallet} color="#042954"
              badge={`${modeReport.length} active modes`} sub="Vouchers in selected range"
              progress={Math.min(100, data.totalTransactions)} />
          </div>

          {/* ── CHARTS ── */}
          {modeReport.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Pie — by total amount */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-[14px] font-bold text-slate-700 mb-4">Amount by Payment Mode</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={95} dataKey="value" labelLine={false} label={<PieLabel />}>
                      {pieData.map((e) => <Cell key={e.name} fill={MODE_COLORS[e.name] || '#64748b'} />)}
                    </Pie>
                    <RTooltip formatter={(v, n) => [`₹${fmt(v)}`, n]} contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {modeReport.map((m) => (
                    <div key={m.mode} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: MODE_COLORS[m.mode] || '#64748b' }} />
                      <span className="text-xs font-semibold text-slate-600">{m.mode}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar — income vs expense per mode */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-slate-700">Income vs Expense per Mode</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#2d6a4f' }} /><span className="text-xs font-semibold text-slate-500">Income</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#7a2d2d' }} /><span className="text-xs font-semibold text-slate-500">Expense</span></div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={modeReport} margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="mode" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52} />
                    <RTooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="totalIncome"  name="Income"  fill="#2d6a4f" radius={[6,6,0,0]} maxBarSize={28} />
                    <Bar dataKey="totalExpense" name="Expense" fill="#7a2d2d" radius={[6,6,0,0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── MODE SUMMARY TABLE ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: '#042954' }}>
              <h3 className="text-sm font-black text-white">Payment Mode Summary</h3>
              <span className="text-xs text-blue-200 font-medium">{data.totalTransactions} total vouchers</span>
            </div>
            {modeReport.length === 0 ? (
              <div className="py-10 text-center"><Empty description="No transactions in this date range" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Payment Mode','Vouchers','Income (₹)','Expense (₹)','Total (₹)','Share'].map((h,i) => (
                        <th key={h} className={`px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide ${i===0?'text-left':i===5?'text-left':i===1?'text-center':'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...modeReport].sort((a,b)=>b.total-a.total).map((m, i) => {
                      const share = grandTotal > 0 ? Math.round((m.total / grandTotal) * 100) : 0
                      return (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: (MODE_COLORS[m.mode]||'#64748b') + '18' }}>
                                <span className="w-3 h-3 rounded-sm" style={{ background: MODE_COLORS[m.mode]||'#64748b', display:'block' }} />
                              </div>
                              <span className="font-bold text-slate-700">{m.mode}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-1 rounded-full text-xs font-black" style={{ background: '#04295415', color: '#042954' }}>{m.count}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-black" style={{ color: '#2d6a4f' }}>{m.totalIncome > 0 ? `₹${fmt(m.totalIncome)}` : '—'}</td>
                          <td className="px-4 py-3 text-right font-black" style={{ color: '#7a2d2d' }}>{m.totalExpense > 0 ? `₹${fmt(m.totalExpense)}` : '—'}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-800">₹{fmt(m.total)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className="h-1.5 rounded-full" style={{ width: `${share}%`, background: MODE_COLORS[m.mode]||'#64748b' }} />
                              </div>
                              <span className="text-xs font-black text-slate-500 w-7 text-right">{share}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200" style={{ background: '#04295410' }}>
                      <td className="px-4 py-3 font-black text-slate-700">Total</td>
                      <td className="px-4 py-3 text-center font-black text-slate-700">{data.totalTransactions}</td>
                      <td className="px-4 py-3 text-right font-black" style={{ color: '#2d6a4f' }}>₹{fmt(data.totalIncome)}</td>
                      <td className="px-4 py-3 text-right font-black" style={{ color: '#7a2d2d' }}>₹{fmt(data.totalExpense)}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-800">₹{fmt(data.totalIncome+data.totalExpense)}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-400">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* ── RECENT VOUCHERS ── */}
          {data.recentVouchers?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: '#042954' }}>
                <h3 className="text-sm font-black text-white">Recent Vouchers</h3>
                <span className="text-xs text-blue-200 font-medium">{data.recentVouchers.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Voucher No.','Date','Type','Mode','Amount (₹)','Remarks'].map((h,i) => (
                        <th key={h} className={`px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide ${i===4?'text-right':i>=1&&i<=3?'text-center':'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentVouchers.slice((voucherPage-1)*PG, voucherPage*PG).map((v, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-black" style={{ color: '#042954' }}>{v.voucherNumber}</td>
                        <td className="px-4 py-3 text-center text-slate-600 font-medium text-xs">{v.voucherDate?.slice(0,10) || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={v.voucherType==='Income' ? {background:'#2d6a4f18',color:'#2d6a4f'} : {background:'#7a2d2d18',color:'#7a2d2d'}}>
                            {v.voucherType==='Income'?'↑':'↓'} {v.voucherType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: MODE_COLORS[v.paymentMode]||'#64748b' }}>{v.paymentMode}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-black" style={{ color: v.voucherType==='Income'?'#2d6a4f':'#7a2d2d' }}>₹{fmt(v.totalAmount)}</td>
                        <td className="px-4 py-3 text-xs text-slate-400 font-medium truncate max-w-[160px]">{v.remarks||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.recentVouchers.length > PG && (
                <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/50">
                  <p className="text-xs text-slate-400 font-medium">
                    Showing <span className="font-black text-slate-600">{(voucherPage-1)*PG+1}</span>–<span className="font-black text-slate-600">{Math.min(voucherPage*PG, data.recentVouchers.length)}</span> of <span className="font-black text-slate-600">{data.recentVouchers.length}</span>
                  </p>
                  <Pagination current={voucherPage} pageSize={PG} total={data.recentVouchers.length} onChange={(p) => setVoucherPage(p)} showSizeChanger={false} size="small" />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PaymentModeReport
