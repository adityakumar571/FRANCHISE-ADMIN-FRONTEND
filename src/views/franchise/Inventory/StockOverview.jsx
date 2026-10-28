/* eslint-disable prettier/prettier */
/**
 * StockOverview — Tailwind UI, all real API fields (currentStock not stock)
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, TrendingUp, TrendingDown, AlertTriangle, Calendar,
  DollarSign, ShoppingCart, Zap, AlertCircle, CheckCircle,
  XCircle, BarChart3, RefreshCw, ArrowRight,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, subvalue, color, bg, loading }) => (
  <div className={`${bg || 'bg-white'} border border-gray-200 rounded-xl p-5 relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md`}>
    <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10"
      style={{ background: color, transform: 'translate(30%, -30%)' }}/>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22` }}>
        <Icon size={20} style={{ color }}/>
      </div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-3xl font-extrabold text-gray-900 mb-1">
      {loading ? <span className="inline-block w-16 h-7 bg-gray-100 rounded animate-pulse"/> : value}
    </p>
    {subvalue && <p className="text-xs text-gray-400 font-medium">{subvalue}</p>}
  </div>
)

/* ── Distribution tile ── */
const DistTile = ({ icon: Icon, label, value, color, loading }) => (
  <div className="flex flex-col items-center text-center p-4 rounded-xl border"
    style={{ background: `${color}08`, borderColor: `${color}33` }}>
    <Icon size={24} style={{ color }} className="mb-2"/>
    <p className="text-2xl font-extrabold mb-0.5" style={{ color }}>
      {loading ? '…' : value}
    </p>
    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
  </div>
)

/* ── Quick link ── */
const QuickLink = ({ icon: Icon, label, count, color, onClick }) => (
  <div onClick={onClick}
    className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer transition hover:shadow-md group"
    style={{ '--hc': color }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15` }}>
      <Icon size={18} style={{ color }}/>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-700 truncate">{label}</p>
      {count !== undefined && (
        <p className="text-[11px] text-gray-400">{count} items</p>
      )}
    </div>
    <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition"/>
  </div>
)

/* ── Alert banner ── */
const AlertBanner = ({ type, message, severity }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${
    type === 'error'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-amber-50 border-amber-200 text-amber-700'
  }`}>
    <AlertCircle size={16} className="flex-shrink-0"/>
    <span className="flex-1">{message}</span>
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white ${
      type === 'error' ? 'bg-red-500' : 'bg-amber-500'
    }`}>
      {severity.toUpperCase()}
    </span>
  </div>
)

/* ════════════════════════════════════════════════════════ */
export default function StockOverview() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [kpis,    setKpis]    = useState({
    totalSKUs: 0, totalQuantity: 0, totalValue: 0,
    lowStock: 0, outOfStock: 0, nearExpiry: 0, expired: 0,
  })
  const [stockLevels, setStockLevels] = useState({ outOfStock:0, low:0, adequate:0, overstock:0 })
  const [alerts,      setAlerts]      = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all medicines (no layout param so KPI fields come back)
      const res = await getRequest('/franchise/medicines?limit=500')
      const medicines = res.data?.data?.medicines || []

      let totalQuantity = 0, totalValue = 0
      let lowStock = 0, outOfStock = 0, nearExpiry = 0, expired = 0
      const levels = { outOfStock:0, low:0, adequate:0, overstock:0 }

      const now              = new Date()
      const thirtyDays       = new Date(now.getTime() + 30*24*60*60*1000)

      medicines.forEach(med => {
        // ✅ Use currentStock (real field), not legacy 'stock'
        const stock       = med.currentStock ?? 0
        const mrp         = med.mrp          ?? 0
        const reorder     = med.reorderLevel ?? 10

        totalQuantity += stock
        totalValue    += stock * mrp

        if (stock === 0)              { outOfStock++; levels.outOfStock++ }
        else if (stock <= reorder)    { lowStock++;   levels.low++        }
        else if (stock <= reorder*3)  {               levels.adequate++   }
        else                          {               levels.overstock++  }

        // Check batches for expiry
        ;(med.batches || []).forEach(b => {
          if (!b.isActive && b.isActive !== undefined) return
          const exp = new Date(b.expiryDate)
          if (exp <= now)       expired++
          else if (exp <= thirtyDays) nearExpiry++
        })
      })

      setKpis({
        totalSKUs:     medicines.length,
        totalQuantity,
        totalValue:    totalValue.toFixed(2),
        lowStock,
        outOfStock,
        nearExpiry,
        expired,
      })
      setStockLevels(levels)

      // Build alerts
      const al = []
      if (outOfStock > 0) al.push({ type:'error',   message:`${outOfStock} medicines are out of stock`,           severity:'high'     })
      if (lowStock   > 0) al.push({ type:'warning',  message:`${lowStock} medicines are running low`,             severity:'medium'   })
      if (nearExpiry > 0) al.push({ type:'warning',  message:`${nearExpiry} batches expiring within 30 days`,     severity:'high'     })
      if (expired    > 0) al.push({ type:'error',    message:`${expired} batches have already expired`,           severity:'critical' })
      setAlerts(al)
    } catch {
      toast.error('Failed to load stock overview')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  /* ════════════ RENDER ════════════ */
  return (
    <div className="font-sans flex flex-col gap-5">

      {/* Gradient header */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-7 overflow-hidden shadow-xl shadow-blue-600/20">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full"/>
        <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-white/5 rounded-full"/>
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={26} className="text-white"/>
              <h1 className="text-2xl font-bold text-white">Stock Overview</h1>
            </div>
            <p className="text-blue-200 text-sm">Real-time inventory health · All values from live database</p>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-white text-sm font-semibold transition">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((a,i) => <AlertBanner key={i} {...a}/>)}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Package}       label="Total SKUs"     value={kpis.totalSKUs}                                subvalue="Unique medicines"     color="#3b82f6" bg="#eff6ff"  loading={loading}/>
        <StatCard icon={ShoppingCart}  label="Total Quantity" value={Number(kpis.totalQuantity).toLocaleString()}   subvalue="Units in stock"       color="#8b5cf6" bg="#f5f3ff"  loading={loading}/>
        <StatCard icon={DollarSign}    label="Stock Value"    value={`₹${Number(kpis.totalValue).toLocaleString('en-IN',{maximumFractionDigits:0})}`} subvalue="At MRP" color="#16a34a" bg="#f0fdf4" loading={loading}/>
        <StatCard icon={AlertTriangle} label="Low Stock"      value={kpis.lowStock}                                 subvalue="Need reorder"         color="#f59e0b" bg="#fffbeb"  loading={loading}/>
        <StatCard icon={XCircle}       label="Out of Stock"   value={kpis.outOfStock}                               subvalue="Urgent action needed" color="#dc2626" bg="#fef2f2"  loading={loading}/>
        <StatCard icon={Calendar}      label="Near Expiry"    value={kpis.nearExpiry}                               subvalue="Within 30 days"       color="#ea580c" bg="#fff7ed"  loading={loading}/>
        <StatCard icon={AlertCircle}   label="Expired"        value={kpis.expired}                                  subvalue="Batch level count"    color="#dc2626" bg="#fef2f2"  loading={loading}/>
        <StatCard icon={Zap}           label="Overstock"      value={loading ? '…' : stockLevels.overstock}         subvalue="Above 3× reorder"     color="#6b7280" bg="#f9fafb"  loading={loading}/>
      </div>

      {/* Stock Level Distribution */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <BarChart3 size={15} className="text-blue-600"/> Stock Level Distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DistTile icon={XCircle}       label="Out of Stock" value={stockLevels.outOfStock} color="#dc2626" loading={loading}/>
          <DistTile icon={AlertTriangle} label="Low Stock"    value={stockLevels.low}        color="#f59e0b" loading={loading}/>
          <DistTile icon={CheckCircle}   label="Adequate"     value={stockLevels.adequate}   color="#16a34a" loading={loading}/>
          <DistTile icon={Package}       label="Overstock"    value={stockLevels.overstock}  color="#6b7280" loading={loading}/>
        </div>

        {/* Visual bar */}
        {!loading && (() => {
          const total = stockLevels.outOfStock + stockLevels.low + stockLevels.adequate + stockLevels.overstock
          if (!total) return null
          return (
            <div className="mt-4 flex h-2.5 rounded-full overflow-hidden gap-0.5">
              {[
                { v: stockLevels.outOfStock, c: '#dc2626' },
                { v: stockLevels.low,        c: '#f59e0b' },
                { v: stockLevels.adequate,   c: '#16a34a' },
                { v: stockLevels.overstock,  c: '#6b7280' },
              ].filter(s => s.v > 0).map((s,i) => (
                <div key={i} style={{ width:`${(s.v/total*100).toFixed(1)}%`, background: s.c }}
                  className="rounded-full transition-all" title={`${s.v} medicines`}/>
              ))}
            </div>
          )
        })()}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickLink icon={AlertTriangle} label="View Low Stock"      count={kpis.lowStock}   color="#f59e0b" onClick={() => navigate('/franchise/live-rates/low-stock-alert')}/>
          <QuickLink icon={Calendar}      label="Near Expiry"         count={kpis.nearExpiry} color="#ea580c" onClick={() => navigate('/franchise/inventory/near-expiry')}/>
          <QuickLink icon={XCircle}       label="Expired Stock"       count={kpis.expired}    color="#dc2626" onClick={() => navigate('/franchise/inventory/expired')}/>
          <QuickLink icon={Zap}           label="Fast Moving"                                 color="#16a34a" onClick={() => navigate('/franchise/inventory/fast-moving')}/>
          <QuickLink icon={TrendingDown}  label="Slow Moving"                                 color="#9ca3af" onClick={() => navigate('/franchise/inventory/slow-moving')}/>
          <QuickLink icon={TrendingUp}    label="Quick Stock Entry"                           color="#3b82f6" onClick={() => navigate('/franchise/inventory/quick-entry')}/>
        </div>
      </div>

    </div>
  )
}
