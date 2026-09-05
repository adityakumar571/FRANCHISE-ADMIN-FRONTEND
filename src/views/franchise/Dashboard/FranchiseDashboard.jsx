/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useFranchise } from '../../../Context/FranchiseContext'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package, IndianRupee,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Store, Activity, Clock,
  BarChart2, UserCheck, ClipboardList, Wallet, Bell, RefreshCw,
  Calendar, Star, Phone, ChevronRight, Eye, Search, Loader2,
} from 'lucide-react'
import { getRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

/* ─── Reusable components ─── */
const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', ...style }}>{children}</div>
)
const CardHeader = ({ title, action, onAction, badge }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{title}</span>
      {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#e11d4818', color: '#e11d48', border: '1px solid #fecdd3' }}>{badge}</span>}
    </div>
    {action && <button onClick={onAction} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>{action}</button>}
  </div>
)

/* ─── KPI Card ─── */
const KpiCard = ({ icon: Icon, label, value, change, up, color, loading }) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px', flex: '1 1 150px', minWidth: 140 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={15} color={color} />
      </div>
    </div>
    {loading
      ? <div style={{ height: 28, background: '#f3f4f6', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
      : <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{value}</p>
    }
    {!loading && change != null && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {up ? <ArrowUpRight size={11} color="#16a34a" /> : <ArrowDownRight size={11} color="#dc2626" />}
        <span style={{ fontSize: 11, color: up ? '#16a34a' : '#dc2626', fontWeight: 500 }}>{Math.abs(change)}%</span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>vs Yesterday</span>
      </div>
    )}
    {!loading && change == null && label === 'Low Stock Items' && (
      <button style={{ fontSize: 11, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>View Details</button>
    )}
  </div>
)

const modeColor = { Cash: '#16a34a', UPI: '#7c3aed', Card: '#2563eb', Credit: '#d97706' }

const fmt = (n) => {
  if (n == null) return '₹0'
  return '₹' + Number(n).toLocaleString('en-IN')
}

/* ════════════════════════════════════════════ */
export default function FranchiseDashboard() {
  const navigate = useNavigate()
  const { franchiseUser, franchiseInfo } = useFranchise()

  /* ─── State ─── */
  const [loading, setLoading]           = useState(true)
  const [refreshKey, setRefreshKey]     = useState(0)

  const [summary, setSummary]           = useState(null)
  const [liveRates, setLiveRates]       = useState({ medicine: {}, rates: [], updatedAt: null })
  const [priceTrend, setPriceTrend]     = useState(null)
  const [rateAlerts, setRateAlerts]     = useState([])
  const [topMoving, setTopMoving]       = useState([])
  const [expiryAlerts, setExpiryAlerts] = useState([])
  const [recentSales, setRecentSales]   = useState([])
  const [recentPurchases, setRecentPurchases] = useState([])
  const [lowStock, setLowStock]         = useState([])
  const [searchMed, setSearchMed]       = useState('')

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  /* ─── Fetch all dashboard data ─── */
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, ratesRes, trendRes, alertsRes, topRes, expiryRes, salesRes, purchaseRes, stockRes] =
        await Promise.allSettled([
          getRequest('/franchise/dashboard/summary'),
          getRequest('/franchise/dashboard/live-rates?medicine=Clavm+625+Tablet'),
          getRequest('/franchise/dashboard/price-trend?medicine=Clavm+625+Tablet&days=7'),
          getRequest('/franchise/dashboard/rate-alerts'),
          getRequest('/franchise/dashboard/top-moving?period=month&limit=5'),
          getRequest('/franchise/dashboard/expiry-alerts?days=60'),
          getRequest('/franchise/sales/recent?limit=5'),
          getRequest('/franchise/purchase/recent?limit=5'),
          getRequest('/franchise/inventory/low-stock?limit=5'),
        ])

      if (sumRes.status === 'fulfilled')      setSummary(sumRes.value.data?.data)
      if (ratesRes.status === 'fulfilled')    setLiveRates(ratesRes.value.data?.data || { medicine: {}, rates: [] })
      if (trendRes.status === 'fulfilled')    setPriceTrend(trendRes.value.data?.data)
      if (alertsRes.status === 'fulfilled')   setRateAlerts(alertsRes.value.data?.data || [])
      if (topRes.status === 'fulfilled')      setTopMoving(topRes.value.data?.data || [])
      if (expiryRes.status === 'fulfilled')   setExpiryAlerts(expiryRes.value.data?.data || [])
      if (salesRes.status === 'fulfilled')    setRecentSales(salesRes.value.data?.data || [])
      if (purchaseRes.status === 'fulfilled') setRecentPurchases(purchaseRes.value.data?.data || [])
      if (stockRes.status === 'fulfilled')    setLowStock(stockRes.value.data?.data || [])
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [refreshKey])

  useEffect(() => { fetchAll() }, [fetchAll])

  /* ─── KPI config from API data ─── */
  const KPIS = [
    { icon: IndianRupee,   label: "Today's Sales",    value: fmt(summary?.todaySales?.amount),    change: summary?.todaySales?.change,    up: summary?.todaySales?.up,    color: '#0c3b73' },
    { icon: ShoppingCart,  label: "Today's Purchase",  value: fmt(summary?.todayPurchase?.amount), change: summary?.todayPurchase?.change,  up: false,                       color: '#7c3aed' },
    { icon: TrendingUp,    label: 'Gross Profit',      value: fmt(summary?.grossProfit?.amount),   change: null,                            up: summary?.grossProfit?.up,    color: '#16a34a' },
    { icon: Store,         label: 'Total Orders',      value: summary?.totalOrders?.count ?? '—',  change: null,                            up: null,                        color: '#d97706' },
    { icon: Package,       label: 'Stock Value',       value: fmt(summary?.stockValue?.amount),    change: null,                            up: null,                        color: '#0891b2' },
    { icon: AlertTriangle, label: 'Low Stock Items',   value: summary?.lowStockItems?.count ?? '—',change: null,                            up: null,                        color: '#dc2626' },
  ]

  /* ─── Price trend bars ─── */
  const PRICE_TREND = priceTrend?.trend?.map(t => t.price) || [67, 66, 65, 66, 65, 65, 63]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13 }}>

      {/* ─── Page heading ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
            Welcome back! Here is what is happening with your store. &nbsp;&bull;&nbsp; {dateStr}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long' })}
          </span>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
          >
            {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />} Refresh
          </button>
        </div>
      </div>

      {/* ─── KPI Strip ─── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {KPIS.map((k) => <KpiCard key={k.label} {...k} loading={loading} />)}
      </div>

      {/* ─── ROW 1: Live Wholesale + Price Trend ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>

        {/* Live Wholesale Rate Comparison */}
        <Card>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Live Wholesale Rate Comparison</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fff1f2', border: '1px solid #fecdd3', padding: '2px 7px', borderRadius: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                LIVE
              </span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>
                Updated: {liveRates.updatedAt ? new Date(liveRates.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
              </span>
            </div>
            <button onClick={() => navigate('/franchise/live-rates')} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All Medicines <ChevronRight size={12} />
            </button>
          </div>

          {/* Medicine info bar */}
          {liveRates.medicine && (
            <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: 14 }}>{liveRates.medicine.name || 'Clavm 625 Tablet'}</p>
                <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>
                  {liveRates.medicine.salt || '—'} · {liveRates.medicine.packSize || '—'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[
                  { label: 'MRP',                  value: fmt(liveRates.medicine.mrp),              color: '#374151' },
                  { label: 'Last Purchase Rate',   value: fmt(liveRates.medicine.lastPurchaseRate), sub: '', color: '#374151' },
                  { label: 'Today Best Rate',      value: fmt(liveRates.medicine.bestRateToday),    sub: liveRates.medicine.lastPurchaseRate && liveRates.medicine.bestRateToday ? `↓ ₹${(liveRates.medicine.lastPurchaseRate - liveRates.medicine.bestRateToday).toFixed(2)}` : '', color: '#16a34a' },
                  { label: 'Available Wholesalers',value: liveRates.medicine.availableWholesalers || 0, color: '#0c3b73' },
                ].map((m) => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{m.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: m.color, margin: '2px 0 0' }}>{m.value}</p>
                    {m.sub && <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>{m.sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['#', 'Wholesaler Name', 'Basic Rate (₹)', 'Scheme', 'GST (₹)', 'Other Charges (₹)', 'Effective Rate (₹)', 'Stock', 'Delivery', 'Action'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(10).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '9px 10px' }}>
                          <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : liveRates.rates.map((w) => (
                    <tr key={w.rank} style={{ background: w.best ? '#f0fdf4' : '#fff', borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#6b7280' }}>{w.rank}</td>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontWeight: 600, color: '#111827', fontSize: 12 }}>{w.name}</span>
                          {w.verified && <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 5px', borderRadius: 10 }}>Verified</span>}
                          <span style={{ fontSize: 10, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Star size={9} fill="#f59e0b" /> {w.rating}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.basic?.toFixed(2)}</td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.scheme}</td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.gst?.toFixed(2)}</td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.other?.toFixed(2)}</td>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: w.best ? '#16a34a' : '#111827' }}>₹{w.effective?.toFixed(2)}</span>
                          {w.best && <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>Best Price</span>}
                        </div>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.stock}</td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.delivery}</td>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => navigate('/franchise/live-rates/purchase-cart')} style={{ fontSize: 11, fontWeight: 600, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer' }}>Buy Now</button>
                          <button style={{ background: '#f3f4f6', border: 'none', borderRadius: 5, padding: '4px 6px', cursor: 'pointer', color: '#374151' }}><Phone size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          {liveRates.rates.length > 0 && (
            <div style={{ padding: '8px 16px', background: '#f0fdf4', borderTop: '1px solid #dcfce7' }}>
              <p style={{ fontSize: 11, color: '#166534', margin: 0, fontWeight: 500 }}>
                You can save ₹{((liveRates.rates[1]?.basic || 0) - (liveRates.rates[0]?.basic || 0)).toFixed(2)} per strip by buying from {liveRates.rates[0]?.name}
              </p>
            </div>
          )}
          <div style={{ padding: '10px 16px', display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/franchise/live-rates/scheme-comparison')} style={{ flex: 1, padding: '8px 0', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>Compare Scheme</button>
            <button onClick={() => navigate('/franchise/live-rates/purchase-cart')} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#fff', background: '#0c3b73', cursor: 'pointer' }}>Add to Purchase Cart</button>
          </div>
        </Card>

        {/* Price Trend */}
        <Card>
          <CardHeader title="Price Trend" />
          <div style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{priceTrend?.medicine || 'Clavm 625 Tablet'}</p>
            {/* Chart area */}
            <div style={{ position: 'relative', height: 120, marginBottom: 8 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%', pointerEvents: 'none' }}>
                {[70, 67, 65, 62, 60].map(v => (
                  <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 9, color: '#9ca3af', width: 18, textAlign: 'right' }}>₹{v}</span>
                    <div style={{ flex: 1, borderTop: '1px dashed #f3f4f6' }} />
                  </div>
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: 12, left: 24, right: 0, display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
                {PRICE_TREND.map((v, i) => {
                  const max = Math.max(...PRICE_TREND) || 70
                  const min = Math.min(...PRICE_TREND) || 60
                  const h = ((v - min) / (max - min || 1)) * 80 + 8
                  const label = priceTrend?.trend?.[i]?.date || `${i + 1}`
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{ width: '100%', background: i === PRICE_TREND.length - 1 ? '#16a34a' : '#0c3b73', borderRadius: '3px 3px 0 0', height: h, opacity: i === PRICE_TREND.length - 1 ? 1 : 0.35 }} />
                      <span style={{ fontSize: 8, color: '#9ca3af' }}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {[
                { label: "Yesterday's Avg Rate", value: priceTrend ? fmt(priceTrend.avgYesterday) : '—', color: '#374151' },
                { label: '7 Days Avg Rate',       value: priceTrend ? fmt(priceTrend.avg7Days) : '—',    color: '#374151' },
                { label: '30 Days Avg Rate',      value: priceTrend ? fmt(priceTrend.avg30Days) : '—',   color: '#374151' },
                { label: "Today's Best Rate",     value: priceTrend ? fmt(priceTrend.bestToday) : '—',   color: '#16a34a' },
              ].map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button onClick={() => navigate('/franchise/live-rates/price-history')} style={{ flex: 1, padding: '7px 0', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>Rate History</button>
              <button style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#fff', background: '#0c3b73', cursor: 'pointer' }}>Set Price Alert</button>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── ROW 2: Live Alerts + Top Moving + Expiry + Quick Actions ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>

        {/* Live Rate Alerts */}
        <Card>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={13} color="#0c3b73" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Live Rate Alerts</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ padding: '8px 14px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 4 }} />
                  <div style={{ height: 10, width: '60%', background: '#f3f4f6', borderRadius: 4 }} />
                </div>
              ))
              : rateAlerts.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: i < rateAlerts.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
                    <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0' }}>{a.note}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>{a.rate}</span>
                    <button onClick={() => navigate('/franchise/live-rates')} style={{ fontSize: 10, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>View</button>
                  </div>
                </div>
              ))
            }
          </div>
        </Card>

        {/* Top Moving Items */}
        <Card>
          <CardHeader title="Top Moving Items" badge="This Month" action="View All" onAction={() => navigate('/franchise/reports/sales')} />
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 0 }}>
              <div style={{ padding: '6px 10px', fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6' }} />
              <div style={{ padding: '6px 10px', fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6' }}>Medicine Name</div>
              <div style={{ padding: '6px 10px', fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>Sales</div>
            </div>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ padding: '9px 10px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} />
                </div>
              ))
              : topMoving.map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', borderBottom: i < topMoving.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ padding: '9px 10px', fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>{t.rank}</div>
                  <div style={{ padding: '9px 6px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '1px 0 0' }}>Qty: {t.qty}</p>
                  </div>
                  <div style={{ padding: '9px 10px', fontSize: 12, fontWeight: 700, color: '#0c3b73', textAlign: 'right' }}>{t.sales}</div>
                </div>
              ))
            }
          </div>
        </Card>

        {/* Expiry Alert */}
        <Card>
          <CardHeader title="Expiry Alert" action="View All" onAction={() => navigate('/franchise/inventory/near-expiry')} />
          <div style={{ padding: '8px 0' }}>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ padding: '8px 14px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 4 }} />
                  <div style={{ height: 10, width: '50%', background: '#f3f4f6', borderRadius: 4 }} />
                </div>
              ))
              : expiryAlerts.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: i < expiryAlerts.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.urgent ? '#dc2626' : '#d97706', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{e.name}</p>
                      <p style={{ fontSize: 10, color: e.urgent ? '#dc2626' : '#6b7280', margin: '1px 0 0' }}>Expires in {e.expiry}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>{e.qty}</span>
                </div>
              ))
            }
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'New Sale',       to: '/franchise/pos/billing',          color: '#0c3b73', icon: ShoppingCart },
              { label: 'Purchase Entry', to: '/franchise/purchase/orders',      color: '#7c3aed', icon: Store },
              { label: 'Add Medicine',   to: '/franchise/medicines/add',        color: '#16a34a', icon: Package },
              { label: 'Stock Transfer', to: '/franchise/inventory/stock',      color: '#d97706', icon: Activity },
              { label: 'Live Rates',     to: '/franchise/live-rates',           color: '#dc2626', icon: TrendingUp },
              { label: 'View Reports',   to: '/franchise/reports/sales',        color: '#6366f1', icon: BarChart2 },
              { label: 'Customers',      to: '/franchise/customers',            color: '#ec4899', icon: Users },
              { label: 'Suppliers',      to: '/franchise/suppliers',            color: '#0891b2', icon: ClipboardList },
              { label: 'Online Orders',  to: '/franchise/b2b-orders',           color: '#f97316', icon: Star },
              { label: 'Prescriptions',  to: '/franchise/medicines',            color: '#16a34a', icon: UserCheck },
              { label: 'Price Alerts',   to: '/franchise/live-rates',           color: '#dc2626', icon: Bell },
              { label: 'More',           to: '/franchise/settings',             color: '#6b7280', icon: ChevronRight },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.to)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 4px', borderRadius: 8, border: '1px solid #f3f4f6', background: '#fff', cursor: 'pointer', transition: 'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.color + '08' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.background = '#fff' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <a.icon size={14} color={a.color} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.2 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── ROW 3: Recent Sales + Recent Purchases + Low Stock ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Recent Sales */}
        <Card>
          <CardHeader title="Recent Sales" action="View All" onAction={() => navigate('/franchise/reports/sales')} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Invoice', 'Customer', 'Amount', 'Mode', 'Time'].map(h => (
                    <th key={h} style={{ padding: '7px 10px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '8px 10px' }}>
                          <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : recentSales.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: '#0c3b73', fontWeight: 600, fontFamily: 'monospace' }}>
                        {s.inv?.split('-').slice(-1)[0]}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#374151', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.customer}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#111827' }}>{s.amount}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: (modeColor[s.mode] || '#6b7280') + '18', color: modeColor[s.mode] || '#6b7280' }}>{s.mode}</span>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: '#9ca3af' }}>{s.time}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader title="Recent Purchases" action="View All" onAction={() => navigate('/franchise/purchase/dashboard')} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Bill No', 'Supplier', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '7px 10px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(4).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '8px 10px' }}>
                          <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : recentPurchases.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: '#0c3b73', fontWeight: 600, fontFamily: 'monospace' }}>
                        {p.billNo?.split('-').slice(-1)[0]}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#374151', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.supplier}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#111827' }}>{p.amount}</td>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: '#9ca3af' }}>{p.date}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: p.status === 'Paid' ? '#f0fdf4' : '#fffbeb', color: p.status === 'Paid' ? '#16a34a' : '#d97706', border: `1px solid ${p.status === 'Paid' ? '#bbf7d0' : '#fde68a'}` }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={13} color="#dc2626" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Stock Alerts</span>
            </div>
            <button onClick={() => navigate('/franchise/inventory/stock')} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ padding: '6px 0' }}>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ padding: '8px 14px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 4 }} />
                  <div style={{ height: 10, width: '60%', background: '#f3f4f6', borderRadius: 4 }} />
                </div>
              ))
              : lowStock.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 14px', borderBottom: i < lowStock.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{s.name}</p>
                    <p style={{ fontSize: 10, color: s.color, margin: '1px 0 0', fontWeight: 500 }}>{s.left}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#dc2626', background: '#fff1f2', border: '1px solid #fecdd3', padding: '2px 6px', borderRadius: 20, flexShrink: 0 }}>Low Stock</span>
                </div>
              ))
            }
          </div>
        </Card>
      </div>

      {/* ─── Bottom bar ─── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        {[
          { label: 'Pharmacy Name', value: franchiseInfo?.franchiseName || 'Franchise Portal' },
          { label: 'Pharmacy ID',   value: franchiseInfo?.franchiseCode || 'FRN-001' },
          { label: 'Plan',          value: 'Premium', color: '#d97706' },
          { label: 'Valid Till',    value: '31 Dec 2025' },
        ].map((b) => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{b.label}:</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: b.color || '#111827' }}>{b.value}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: '#9ca3af' }}>Made with care for Indian Pharmacies</span>
      </div>

    </div>
  )
}
