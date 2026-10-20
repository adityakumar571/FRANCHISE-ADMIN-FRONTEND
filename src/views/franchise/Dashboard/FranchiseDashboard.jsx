/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useFranchise } from '../../../Context/FranchiseContext'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, ShoppingCart, Users, Package, IndianRupee,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Store, Activity,
  BarChart2, UserCheck, ClipboardList, Wallet, Bell, RefreshCw,
  Calendar, Star, Phone, ChevronRight, Loader2,
} from 'lucide-react'
import { getRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

import AccountsDashboard from '../RoleDashboards/AccountsDashboard'
import StaffDashboard    from '../RoleDashboards/StaffDashboard'
import CustomerDashboard from '../RoleDashboards/CustomerDashboard'
import VendorDashboard   from '../RoleDashboards/VendorDashboard'

/* ─── Role Router ─── */
function RoleDashboardRouter() {
  const { franchiseUser } = useFranchise()
  const role = franchiseUser?.role
  if (role === 'Accounts')  return <AccountsDashboard />
  if (role === 'Staff')     return <StaffDashboard />
  if (role === 'Customer')  return <CustomerDashboard />
  if (role === 'Vendor')    return <VendorDashboard />
  return <AdminDashboard />
}
export default RoleDashboardRouter

/* ─────────────────── Skeleton Components ─────────────────── */
const SkeletonLine = ({ w = 'w-full', h = 'h-3' }) => (
  <div className={`${w} ${h} bg-gray-200 rounded animate-pulse`} />
)

const SkeletonKpiCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 shadow-sm">
    <div className="flex items-center justify-between">
      <SkeletonLine w="w-24" h="h-3" />
      <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
    </div>
    <SkeletonLine w="w-20" h="h-6" />
    <SkeletonLine w="w-32" h="h-2.5" />
  </div>
)

const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array(cols).fill(0).map((_, i) => (
      <td key={i} className="px-3 py-2.5">
        <SkeletonLine h="h-3" />
      </td>
    ))}
  </tr>
)

const SkeletonAlertRow = () => (
  <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center gap-3">
    <div className="flex-1 flex flex-col gap-1.5">
      <SkeletonLine w="w-3/4" h="h-3" />
      <SkeletonLine w="w-1/2" h="h-2.5" />
    </div>
    <SkeletonLine w="w-12" h="h-3" />
  </div>
)

/* ─────────────────── Reusable Card ─────────────────── */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ title, action, onAction, badge, icon: Icon }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={13} className="text-blue-900 flex-shrink-0" />}
      <span className="text-[13px] font-bold text-gray-900">{title}</span>
      {badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
          {badge}
        </span>
      )}
    </div>
    {action && (
      <button onClick={onAction} className="text-[12px] text-blue-900 font-semibold hover:underline">
        {action}
      </button>
    )}
  </div>
)

/* ─────────────────── KPI Card ─────────────────── */
const KpiCard = ({ icon: Icon, label, value, change, up, color, loading }) => {
  const bgMap = {
    '#0c3b73': 'bg-blue-50',  '#7c3aed': 'bg-purple-50',
    '#16a34a': 'bg-green-50', '#d97706': 'bg-amber-50',
    '#0891b2': 'bg-cyan-50',  '#dc2626': 'bg-red-50',
  }
  const bg = bgMap[color] || 'bg-gray-50'

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-2 shadow-sm min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      {loading
        ? <SkeletonLine w="w-24" h="h-6" />
        : <p className="text-[22px] font-extrabold text-gray-900 leading-none">{value}</p>
      }
      {!loading && change != null && (
        <div className="flex items-center gap-1">
          {up
            ? <ArrowUpRight size={11} className="text-green-600" />
            : <ArrowDownRight size={11} className="text-red-500" />
          }
          <span className={`text-[11px] font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
            {Math.abs(change)}%
          </span>
          <span className="text-[11px] text-gray-400">vs Yesterday</span>
        </div>
      )}
      {!loading && change == null && label === 'Low Stock Items' && (
        <button className="text-[11px] text-blue-900 font-semibold text-left">View Details</button>
      )}
    </div>
  )
}

const modeColor = {
  Cash:   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  UPI:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Card:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  Credit: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
}

const fmt = (n) => {
  if (n == null) return '₹0'
  return '₹' + Number(n).toLocaleString('en-IN')
}

/* ═══════════════════ AdminDashboard ═══════════════════ */
function AdminDashboard() {
  const navigate = useNavigate()
  const { franchiseUser, franchiseInfo } = useFranchise()

  const [loading, setLoading]                   = useState(true)
  const [refreshKey, setRefreshKey]             = useState(0)
  const [summary, setSummary]                   = useState(null)
  const [liveRates, setLiveRates]               = useState({ medicine: {}, rates: [], updatedAt: null })
  const [priceTrend, setPriceTrend]             = useState(null)
  const [rateAlerts, setRateAlerts]             = useState([])
  const [topMoving, setTopMoving]               = useState([])
  const [expiryAlerts, setExpiryAlerts]         = useState([])
  const [recentSales, setRecentSales]           = useState([])
  const [recentPurchases, setRecentPurchases]   = useState([])
  const [lowStock, setLowStock]                 = useState([])

  const now     = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, ratesRes, trendRes, alertsRes, topRes, expiryRes, salesRes, /* purchaseRes, */ stockRes] =
        await Promise.allSettled([
          getRequest('/franchise/dashboard/summary'),
          getRequest('/franchise-suppliers/medicines/compare/Clavm 625'),
          getRequest('/franchise/dashboard/price-trend?medicine=Clavm+625+Tablet&days=7'),
          getRequest('/franchise/dashboard/rate-alerts'),
          getRequest('/franchise/dashboard/top-moving?period=month&limit=5'),
          getRequest('/franchise/dashboard/expiry-alerts?days=60'),
          getRequest('/franchise/sales/recent?limit=5'),
          // getRequest('/franchise/purchase/recent?limit=5'), // COMMENTED: Recent Purchases
          getRequest('/franchise/inventory/low-stock?limit=5'),
        ])

      if (sumRes.status === 'fulfilled')      setSummary(sumRes.value.data?.data)
      
      // Transform main supplier API response to match dashboard format
      if (ratesRes.status === 'fulfilled') {
        const supplierData = ratesRes.value.data?.data
        if (supplierData && supplierData.suppliers && supplierData.suppliers.length > 0) {
          const transformedRates = {
            medicine: {
              name: 'Clavm 625',
              salt: 'Amoxicillin + Clavulanic Acid',
              packSize: '10 tablets',
              mrp: supplierData.suppliers[0]?.medicine?.mrp || 0,
              lastPurchaseRate: null, // Not available from supplier API
              bestRateToday: supplierData.comparison.lowestPrice || 0,
              availableWholesalers: supplierData.comparison.count || 0
            },
            rates: supplierData.suppliers.map((item, index) => ({
              rank: index + 1,
              name: item.supplierInfo.companyName,
              verified: item.supplierInfo.rating >= 4,
              rating: item.supplierInfo.rating || 0,
              basic: item.medicine.supplierPrice || 0,
              scheme: item.medicine.scheme || 'No Scheme',
              gst: item.medicine.gst || 0,
              other: 0, // Not in supplier API
              effective: item.medicine.effectiveRate || 0,
              stock: item.medicine.stock || 0,
              delivery: item.medicine.deliveryEstimate || 'Next Day',
              best: item.isBestPrice || false
            })),
            updatedAt: new Date().toISOString()
          }
          setLiveRates(transformedRates)
        } else {
          setLiveRates({ medicine: { availableWholesalers: 0 }, rates: [] })
        }
      }
      
      if (trendRes.status === 'fulfilled')    setPriceTrend(trendRes.value.data?.data)
      if (alertsRes.status === 'fulfilled')   setRateAlerts(alertsRes.value.data?.data || [])
      if (topRes.status === 'fulfilled')      setTopMoving(topRes.value.data?.data || [])
      if (expiryRes.status === 'fulfilled')   setExpiryAlerts(expiryRes.value.data?.data || [])
      if (salesRes.status === 'fulfilled')    setRecentSales(salesRes.value.data?.data || [])
      // if (purchaseRes.status === 'fulfilled') setRecentPurchases(purchaseRes.value.data?.data || []) // COMMENTED
      if (stockRes.status === 'fulfilled')    setLowStock(stockRes.value.data?.data || [])
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [refreshKey])

  useEffect(() => { fetchAll() }, [fetchAll])

  const KPIS = [
    { icon: IndianRupee,   label: "Today's Sales",    value: fmt(summary?.todaySales?.amount),    change: summary?.todaySales?.change,    up: summary?.todaySales?.up,    color: '#0c3b73' },
    { icon: ShoppingCart,  label: "Today's Purchase",  value: fmt(summary?.todayPurchase?.amount), change: summary?.todayPurchase?.change,  up: false,                       color: '#7c3aed' },
    { icon: TrendingUp,    label: 'Gross Profit',      value: fmt(summary?.grossProfit?.amount),   change: null,                            up: null,                        color: '#16a34a' },
    { icon: Store,         label: 'Total Orders',      value: summary?.totalOrders?.count ?? '0',  change: null,                            up: null,                        color: '#d97706' },
    { icon: Package,       label: 'Stock Value',       value: fmt(summary?.stockValue?.amount),    change: null,                            up: null,                        color: '#0891b2' },
    { icon: AlertTriangle, label: 'Low Stock Items',   value: summary?.lowStockItems?.count ?? '0',change: null,                            up: null,                        color: '#dc2626' },
  ]

  const PRICE_TREND = priceTrend?.trend?.map(t => t.price) || [67, 66, 65, 66, 65, 65, 63]

  return (
    <div className="flex flex-col gap-4 min-w-0">

      {/* ── Page Heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-gray-900 leading-tight">Dashboard</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Welcome back! Here is what is happening with your store.&nbsp;&bull;&nbsp;{dateStr}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-500">
            <Calendar size={12} />
            {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span> */}
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-gray-700 transition-colors"
          >
            {loading
              ? <Loader2 size={12} className="animate-spin" />
              : <RefreshCw size={12} />
            }
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonKpiCard key={i} />)
          : KPIS.map(k => <KpiCard key={k.label} {...k} loading={false} />)
        }
      </div>

      {/* ── ROW 1: Live Rates + Price Trend ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Live Wholesale Rate Comparison */}
        <Card className="flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold text-gray-900">Live Wholesale Rate Comparison</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                LIVE
              </span>
              <span className="text-[11px] text-gray-400">
                Updated: {liveRates.updatedAt ? new Date(liveRates.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
              </span>
            </div>
            <button onClick={() => navigate('/franchise/live-rates')} className="flex items-center gap-1 text-[12px] text-blue-900 font-semibold hover:underline flex-shrink-0">
              View All Medicines <ChevronRight size={12} />
            </button>
          </div>

          {/* Medicine info */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-gray-100 flex-shrink-0">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{liveRates.medicine?.name || 'Clavm 625 Tablet'}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{liveRates.medicine?.salt || '—'} · {liveRates.medicine?.packSize || '—'}</p>
            </div>
            <div className="flex gap-5">
              {[
                { label: 'MRP',         value: fmt(liveRates.medicine?.mrp),                   color: 'text-gray-800' },
                { label: 'Last Rate',   value: fmt(liveRates.medicine?.lastPurchaseRate),       color: 'text-gray-800' },
                { label: 'Best Rate',   value: fmt(liveRates.medicine?.bestRateToday),          color: 'text-green-600' },
                { label: 'Wholesalers', value: liveRates.medicine?.availableWholesalers || '—', color: 'text-blue-900' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-[9px] text-gray-400 uppercase">{m.label}</p>
                  <p className={`text-[13px] font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Table — 5 rows visible, scroll only when 6+ rows, horizontal scroll for narrow screens */}
          <div style={{
            maxHeight: liveRates.rates.length > 5 ? 210 : 'none',
            overflowY: liveRates.rates.length > 5 ? 'auto' : 'visible',
            overflowX: 'auto'
          }}>
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: 560 }}>
              <colgroup>
                <col style={{ width: 28 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 60 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 52 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 52 }} />
                <col style={{ width: 75 }} />
                <col style={{ width: 80 }} />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-left">#</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-left">Wholesaler</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-right">Basic</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-center">Scheme</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-right">GST</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-right">Effective</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-right">Stock</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-center">Delivery</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={9} />)
                  : liveRates.rates.map(w => (
                    <tr key={w.rank} className={`border-b border-gray-50 last:border-0 ${w.best ? 'bg-green-50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-2 py-2 text-[11px] text-gray-400 whitespace-nowrap">{w.rank}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <span title={w.name} className="text-[11px] font-semibold text-gray-900 truncate cursor-default">{w.name}</span>
                          {/* <span className="text-[9px] text-amber-500 flex items-center gap-0.5 flex-shrink-0">
                            <Star size={8} fill="#f59e0b" />{w.rating}
                          </span> */}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-[11px] text-gray-700 text-right whitespace-nowrap">{w.basic?.toFixed(2)}</td>
                      <td className="px-2 py-2 text-[11px] text-gray-700 text-center" title={w.scheme}>
                        <span className="block truncate">{w.scheme}</span>
                      </td>
                      <td className="px-2 py-2 text-[11px] text-gray-700 text-right whitespace-nowrap">{w.gst?.toFixed(2)}</td>
                      <td className="px-2 py-2 text-right whitespace-nowrap">
                        <p className={`text-[12px] font-bold ${w.best ? 'text-green-600' : 'text-gray-900'}`}>₹{w.effective?.toFixed(2)}</p>
                        {w.best && <p className="text-[9px] text-green-600 font-semibold">Best</p>}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-gray-700 text-right whitespace-nowrap">{w.stock}</td>
                      <td className="px-2 py-2 text-[11px] text-gray-700 text-center whitespace-nowrap" title={w.delivery}>{w.delivery}</td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => navigate('/franchise/live-rates/purchase-cart')} className="text-[10px] font-semibold bg-blue-900 text-white rounded-md px-2 py-1 hover:bg-blue-800 transition-colors whitespace-nowrap">Buy Now</button>
                          <button title="Call wholesaler" className="bg-gray-100 hover:bg-gray-200 rounded-md p-1.5 text-gray-600 transition-colors flex-shrink-0">
                            <Phone size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Save tip */}
          {liveRates.rates.length > 0 && (
            <div className="px-4 py-1.5 bg-green-50 border-t border-green-100 flex-shrink-0">
              <p className="text-[11px] text-green-700 font-medium">
                Save ₹{((liveRates.rates[1]?.basic || 0) - (liveRates.rates[0]?.basic || 0)).toFixed(2)} per strip —{' '}
                <span title={liveRates.rates[0]?.name} className="font-bold cursor-default">{liveRates.rates[0]?.name}</span>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <button onClick={() => navigate('/franchise/live-rates/scheme-comparison')} className="flex-1 py-2 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">Compare Scheme</button>
            <button onClick={() => navigate('/franchise/live-rates/purchase-cart')} className="flex-1 py-2 bg-blue-900 text-white rounded-lg text-[12px] font-semibold hover:bg-blue-800 transition-colors">Add to Purchase Cart</button>
          </div>
        </Card>

        {/* Price Trend */}
        <Card className="flex flex-col">
          <CardHeader title="Price Trend" />
          <div className="flex-1 flex flex-col p-4 min-h-0">
            <p className="text-[12px] font-semibold text-gray-700 mb-3 flex-shrink-0">{priceTrend?.medicine || 'Clavm 625 Tablet'}</p>

            {/* Bar Chart — flex-1 fills space between header and stats */}
            <div className="relative flex-1 min-h-[160px] mb-4">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[70, 67, 65, 62, 60].map(v => (
                  <div key={v} className="flex items-center gap-1">
                    <span className="text-[9px] text-gray-400 w-6 text-right flex-shrink-0">₹{v}</span>
                    <div className="flex-1 border-t border-dashed border-gray-100" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 left-8 bottom-5 flex items-end gap-1.5">
                {PRICE_TREND.map((v, i) => {
                  const max = Math.max(...PRICE_TREND) || 70
                  const min = Math.min(...PRICE_TREND) || 60
                  const hPct = ((v - min) / (max - min || 1)) * 75 + 10
                  const label = priceTrend?.trend?.[i]?.date || `${i + 1}`
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end" title={`₹${v}`}>
                      <div className={`w-full rounded-t-sm ${i === PRICE_TREND.length - 1 ? 'bg-green-500' : 'bg-blue-900/40'}`} style={{ height: `${hPct}%` }} />
                      <span className="text-[8px] text-gray-400 whitespace-nowrap">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col divide-y divide-gray-50 flex-shrink-0">
              {[
                { label: "Yesterday's Avg Rate", value: priceTrend ? fmt(priceTrend.avgYesterday) : '—', cls: 'text-gray-800' },
                { label: '7 Days Avg Rate',      value: priceTrend ? fmt(priceTrend.avg7Days) : '—',    cls: 'text-gray-800' },
                { label: '30 Days Avg Rate',     value: priceTrend ? fmt(priceTrend.avg30Days) : '—',   cls: 'text-gray-800' },
                { label: "Today's Best Rate",    value: priceTrend ? fmt(priceTrend.bestToday) : '—',   cls: 'text-green-600' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2.5">
                  <span className="text-[12px] text-gray-500">{r.label}</span>
                  <span className={`text-[13px] font-bold ${r.cls}`}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Buttons pinned at bottom */}
            <div className="flex gap-2 pt-3 mt-2 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => navigate('/franchise/live-rates/price-history')} className="flex-1 py-2 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">Rate History</button>
              <button className="flex-1 py-2 bg-blue-900 text-white rounded-lg text-[12px] font-semibold hover:bg-blue-800 transition-colors">Set Price Alert</button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── ROW 2: Alerts + Top Moving + Expiry + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4 items-stretch">

        {/* Live Rate Alerts */}
        <Card className="flex flex-col">
          <CardHeader title="Live Rate Alerts" icon={Bell} />
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 280 }}>
            <table className="w-full border-collapse table-auto">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-left whitespace-nowrap">Medicine</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-right whitespace-nowrap">Rate</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={3} />)
                  : rateAlerts.map((a, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-[12px] font-semibold text-gray-900 truncate max-w-[140px]">{a.name}</td>
                      <td className="px-3 py-2 text-[12px] font-bold text-blue-900 text-right whitespace-nowrap">{a.rate}</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => navigate('/franchise/live-rates')} className="text-[11px] font-semibold text-blue-900 hover:underline">View</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Moving Items */}
        <Card className="flex flex-col">
          <CardHeader title="Top Moving Items" badge="This Month" action="View All" onAction={() => navigate('/franchise/reports/sales')} />
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 280 }}>
            <table className="w-full border-collapse table-auto">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-left whitespace-nowrap">#</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-left whitespace-nowrap">Medicine</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-center whitespace-nowrap">Qty</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-right whitespace-nowrap">Sales</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={4} />)
                  : topMoving.map((t, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-[12px] font-bold text-gray-400 whitespace-nowrap">{t.rank}</td>
                      <td className="px-3 py-2 text-[12px] font-semibold text-gray-900">{t.name}</td>
                      <td className="px-3 py-2 text-[12px] text-gray-500 text-center whitespace-nowrap">{t.qty}</td>
                      <td className="px-3 py-2 text-[12px] font-bold text-blue-900 text-right whitespace-nowrap">{t.sales}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card>

        {/* Expiry Alert */}
        <Card className="flex flex-col">
          <CardHeader title="Expiry Alert" action="View All" onAction={() => navigate('/franchise/inventory/near-expiry')} />
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 280 }}>
            <table className="w-full border-collapse table-auto">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-left whitespace-nowrap">Medicine</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-left whitespace-nowrap">Expiry</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-right whitespace-nowrap">Qty</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={3} />)
                  : expiryAlerts.map((e, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.urgent ? 'bg-red-500' : 'bg-amber-400'}`} />
                          <span className="text-[12px] font-semibold text-gray-900">{e.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`text-[11px] font-medium ${e.urgent ? 'text-red-500' : 'text-gray-500'}`}>{e.expiry}</span>
                      </td>
                      <td className="px-3 py-2 text-[12px] font-semibold text-gray-700 text-right whitespace-nowrap">{e.qty}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions — 3×4 grid */}
        <Card className="flex flex-col">
          <CardHeader title="Quick Actions" />
          <div className="flex-1 p-2 grid grid-cols-3 gap-1.5 content-start">
            {[
              { label: 'New Sale',       to: '/franchise/pos/billing',        color: '#0c3b73', icon: ShoppingCart },
              { label: 'Purchase Entry', to: '/franchise/purchase/orders',    color: '#7c3aed', icon: Store },
              { label: 'Add Medicine',   to: '/franchise/medicines/add',      color: '#16a34a', icon: Package },
              { label: 'Stock Transfer', to: '/franchise/inventory/stock',    color: '#d97706', icon: Activity },
              { label: 'Live Rates',     to: '/franchise/live-rates',         color: '#dc2626', icon: TrendingUp },
              { label: 'View Reports',   to: '/franchise/reports/sales',      color: '#6366f1', icon: BarChart2 },
              { label: 'Customers',      to: '/franchise/customers',          color: '#ec4899', icon: Users },
              { label: 'Suppliers',      to: '/franchise/suppliers',          color: '#0891b2', icon: ClipboardList },
              { label: 'Online Orders',  to: '/franchise/b2b-orders',         color: '#f97316', icon: Star },
              { label: 'Prescriptions',  to: '/franchise/medicines',          color: '#16a34a', icon: UserCheck },
              { label: 'Price Alerts',   to: '/franchise/live-rates',         color: '#dc2626', icon: Bell },
              { label: 'More',           to: '/franchise/settings',           color: '#6b7280', icon: ChevronRight },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg border border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: a.color + '18' }}>
                  <a.icon size={13} style={{ color: a.color }} />
                </div>
                <span className="text-[9px] font-semibold text-gray-700 text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>

      </div>

      {/* ── ROW 3: Recent Sales + Recent Purchases + Stock Alerts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 items-stretch">

        {/* Recent Sales */}
        <Card className="flex flex-col">
          <CardHeader title="Recent Sales" action="View All" onAction={() => navigate('/franchise/reports/sales')} />
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 220 }}>
            <table className="w-full border-collapse table-auto">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-left whitespace-nowrap">Invoice</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-left whitespace-nowrap">Customer</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-right whitespace-nowrap">Amount</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-center whitespace-nowrap">Mode</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-right whitespace-nowrap">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={5} />)
                  : recentSales.map((s, i) => {
                    const mc = modeColor[s.mode] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
                    return (
                      <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-2 text-[11px] text-blue-900 font-semibold font-mono whitespace-nowrap">{s.inv?.split('-').slice(-1)[0]}</td>
                        <td className="px-2 py-2 text-[12px] text-gray-700 truncate max-w-[90px]">{s.customer}</td>
                        <td className="px-2 py-2 text-[12px] font-bold text-gray-900 text-right whitespace-nowrap">{s.amount}</td>
                        <td className="px-2 py-2 text-center">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap ${mc.bg} ${mc.text} ${mc.border}`}>{s.mode}</span>
                        </td>
                        <td className="px-2 py-2 text-[11px] text-gray-400 text-right whitespace-nowrap">{s.time}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Purchases */}
        <Card className="flex flex-col">
          <CardHeader title="Recent Purchases" action="View All" onAction={() => navigate('/franchise/purchase/dashboard')} />
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 220 }}>
            <table className="w-full border-collapse table-auto">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-left whitespace-nowrap">Bill No</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-left whitespace-nowrap">Supplier</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-right whitespace-nowrap">Amount</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-right whitespace-nowrap">Date</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={5} />)
                  : recentPurchases.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-2 text-[11px] text-blue-900 font-semibold font-mono whitespace-nowrap">{p.billNo?.split('-').slice(-1)[0]}</td>
                      <td className="px-2 py-2 text-[12px] text-gray-700 truncate max-w-[90px]">{p.supplier}</td>
                      <td className="px-2 py-2 text-[12px] font-bold text-gray-900 text-right whitespace-nowrap">{p.amount}</td>
                      <td className="px-2 py-2 text-[11px] text-gray-400 text-right whitespace-nowrap">{p.date}</td>
                      <td className="px-2 py-2 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap ${
                          p.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{p.status}</span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card> 
        

        {/* Stock Alerts */}
        <Card className="flex flex-col md:col-span-2 2xl:col-span-1">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
              <span className="text-[13px] font-bold text-gray-900">Stock Alerts</span>
            </div>
            <button onClick={() => navigate('/franchise/inventory/stock')} className="text-[12px] text-blue-900 font-semibold hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 220 }}>
            <table className="w-full border-collapse table-auto">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-left whitespace-nowrap">Medicine</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-left whitespace-nowrap">Stock Left</th>
                  <th className="px-2 py-2 text-[10px] text-gray-400 font-bold uppercase text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={3} />)
                  : lowStock.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                          <span className="text-[12px] font-semibold text-gray-900 truncate max-w-[120px]">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-[11px] font-medium whitespace-nowrap" style={{ color: s.color }}>{s.left}</td>
                      <td className="px-2 py-2 text-center">
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">Low Stock</span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* ── Footer Info Bar ── */}
      {/* <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {[
          { label: 'Pharmacy Name', value: franchiseInfo?.franchiseName || 'Franchise Portal', color: '' },
          { label: 'Pharmacy ID',   value: franchiseInfo?.franchiseCode || 'FRN-001',          color: '' },
          { label: 'Plan',          value: 'Premium',                                           color: 'text-amber-600' },
          { label: 'Valid Till',    value: '31 Dec 2025',                                       color: '' },
        ].map(b => (
          <div key={b.label} className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400">{b.label}:</span>
            <span className={`text-[12px] font-bold ${b.color || 'text-gray-900'}`}>{b.value}</span>
          </div>
        ))}
        <span className="text-[11px] text-gray-400">Made with care for Indian Pharmacies</span>
      </div> */}

    </div>
  )
}
