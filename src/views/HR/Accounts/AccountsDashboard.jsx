import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Scale, FileText,
  PlusCircle, BookOpen, BarChart2, Wallet, ChevronRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import DashboardStatCard from '../../dashboard/Stats/DashboardStatCard'
import QuickActionCard from '../../dashboard/Stats/QuickActionCard'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

/* ─── Main ───────────────────────────────────────────────── */
const AccountsDashboard = () => {
  const navigate  = useNavigate()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getRequest('hr/accounts/dashboard')
      .then((r) => setStats(r?.data?.data))
      .catch(() => toast.error('Failed to load accounts dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const inc      = stats?.currentMonthIncome  || 0
  const exp      = stats?.currentMonthExpense || 0
  const net      = stats?.netBalance          || 0
  const max      = Math.max(inc, exp, 1)
  const isProfit = net >= 0

  const barData = [
    { name: "Today's Income",  value: stats?.todayIncome  || 0, color: '#2d6a4f' },
    { name: "Today's Expense", value: stats?.todayExpense || 0, color: '#7a2d2d' },
    { name: 'Month Income',    value: inc,                       color: '#042954' },
    { name: 'Month Expense',   value: exp,                       color: '#b45309' },
  ]

  const navItems = [
    { label: 'Voucher List',     icon: FileText,     path: '/hr/accounts/vouchers',         color: '#042954' },
    { label: 'Day Book',         icon: BookOpen,     path: '/hr/accounts/day-book',         color: '#1d4ed8' },
    { label: 'Income Register',  icon: TrendingUp,   path: '/hr/accounts/income-register',  color: '#2d6a4f' },
    { label: 'Expense Register', icon: TrendingDown, path: '/hr/accounts/expense-register', color: '#7a2d2d' },
    { label: 'Account Ledger',   icon: Scale,        path: '/hr/accounts/ledger',           color: '#5b21b6' },
    { label: 'Monthly Summary',  icon: BarChart2,    path: '/hr/accounts/monthly',          color: '#0369a1' },
    { label: 'Annual Report',    icon: TrendingUp,   path: '/hr/accounts/annual',           color: '#065f46' },
    { label: 'Payment Mode',     icon: Wallet,       path: '/hr/accounts/payment-mode',     color: '#92400e' },
    { label: 'Account Heads',    icon: BookOpen,     path: '/hr/accounts/heads',            color: '#1e3a5f' },
  ]

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 space-y-5">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#042954]" /> Accounts Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Income, Expense and Net Balance overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/hr/accounts/voucher/new?type=Income')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold
                       bg-[#2d6a4f] hover:bg-[#245a42] text-white transition shadow-sm active:scale-95">
            <PlusCircle size={14} /> New Income
          </button>
          <button onClick={() => navigate('/hr/accounts/voucher/new?type=Expense')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold
                       bg-[#7a2d2d] hover:bg-[#6b2424] text-white transition shadow-sm active:scale-95">
            <PlusCircle size={14} /> New Expense
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-[180px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardStatCard
            title="Today's Income"
            value={`₹${fmt(stats?.todayIncome)}`}
            icon={TrendingUp}
            color="#2d6a4f"
            badge={`${stats?.todayVoucherCount || 0} vouchers today`}
            sub="Total income collected today"
            progress={stats?.todayIncome && stats?.currentMonthIncome ? Math.min(100, Math.round((stats.todayIncome / stats.currentMonthIncome) * 100)) : 0}
          />
          <DashboardStatCard
            title="Today's Expense"
            value={`₹${fmt(stats?.todayExpense)}`}
            icon={TrendingDown}
            color="#7a2d2d"
            badge="Paid out today"
            sub="Total expenses recorded today"
            progress={stats?.todayExpense && stats?.currentMonthExpense ? Math.min(100, Math.round((stats.todayExpense / stats.currentMonthExpense) * 100)) : 0}
          />
          <DashboardStatCard
            title="Month Income"
            value={`₹${fmt(inc)}`}
            icon={TrendingUp}
            color="#042954"
            badge="Current month total"
            sub="All income this month"
            progress={max > 0 ? Math.round((inc / max) * 100) : 0}
          />
          <DashboardStatCard
            title="Month Expense"
            value={`₹${fmt(exp)}`}
            icon={TrendingDown}
            color="#b45309"
            badge="Current month total"
            sub="All expenses this month"
            progress={max > 0 ? Math.round((exp / max) * 100) : 0}
          />
        </div>
      )}

      {/* ── CHARTS ROW ── */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Net Balance card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Net Balance — This Month
              </p>
              <h3 className={`text-3xl font-black ${isProfit ? 'text-[#2d6a4f]' : 'text-[#7a2d2d]'}`}>
                {isProfit ? '+' : '-'}₹{fmt(Math.abs(net))}
              </h3>
              <p className={`text-xs mt-1.5 font-bold ${isProfit ? 'text-[#2d6a4f]' : 'text-[#7a2d2d]'}`}>
                {isProfit ? '▲ Surplus this month' : '▼ Deficit this month'}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {/* Income bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-semibold">Income</span>
                  <span className="font-black text-[#2d6a4f]">₹{fmt(inc)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((inc / max) * 100)}%`, background: '#2d6a4f' }} />
                </div>
              </div>
              {/* Expense bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-semibold">Expense</span>
                  <span className="font-black text-[#7a2d2d]">₹{fmt(exp)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((exp / max) * 100)}%`, background: '#7a2d2d' }} />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Vouchers this month</span>
                <span className="text-sm font-black text-slate-700">{stats.monthVoucherCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-slate-700">Income vs Expense Comparison</h3>
              <button onClick={() => navigate('/hr/accounts/monthly')}
                className="text-xs text-[#042954] hover:underline flex items-center gap-0.5 font-bold">
                Monthly Summary <ChevronRight size={12} />
              </button>
            </div>
            {barData.every(d => d.value === 0) ? (
              <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                No transactions recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={barData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`}
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    domain={[0, 'auto']}
                  />
                  <RTooltip
                    formatter={(v, n) => [`₹${fmt(v)}`, n]}
                    contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,.08)', background: '#0f172a', color: '#f1f5f9' }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ── QUICK NAVIGATION ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-[14px] font-bold text-slate-700 mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {navItems.map(({ label, icon, path, color }) => (
            <QuickActionCard key={label} label={label} icon={icon} path={path} navigate={navigate} color={color} />
          ))}
        </div>
      </div>

    </div>
  )
}

export default AccountsDashboard
