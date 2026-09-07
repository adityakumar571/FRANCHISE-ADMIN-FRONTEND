/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, AlertTriangle, TrendingUp, TrendingDown, BarChart2,
  RefreshCw, ChevronRight, ClipboardList, Layers,
  FlaskConical, Activity, ShieldCheck, Trash2, Zap, BookOpen,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', ...style }}>{children}</div>
)
const CH = ({ title, action, onAction }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{title}</span>
    {action && <button onClick={onAction} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>{action} <ChevronRight size={11} /></button>}
  </div>
)

const Skel = ({ h = 14, w = '100%' }) => <div style={{ height: h, width: w, background: '#f3f4f6', borderRadius: 4 }} />

const QUICK = [
  { label: 'Current\nStock',     to: '/franchise/inventory/stock',        icon: Package,      color: '#0c3b73' },
  { label: 'Near\nExpiry',       to: '/franchise/inventory/near-expiry',  icon: AlertTriangle,color: '#d97706' },
  { label: 'Stock\nAdjustment',  to: '/franchise/inventory/adjustments',  icon: Activity,     color: '#7c3aed' },
  { label: 'Physical\nVerif.',   to: '/franchise/inventory/verification', icon: ShieldCheck,  color: '#16a34a' },
  { label: 'Inventory\nLedger',  to: '/franchise/inventory/ledger',       icon: BookOpen,     color: '#0891b2' },
  { label: 'Inventory\nAudit',   to: '/franchise/inventory/audit',        icon: ClipboardList,color: '#dc2626' },
]

const MODULES = [
  { label: 'Current Stock',            to: '/franchise/inventory/stock',        icon: Package,      color: '#0c3b73' },
  { label: 'Stock Adjustment',         to: '/franchise/inventory/adjustments',  icon: Activity,     color: '#7c3aed' },
  { label: 'Physical Stock Verif.',    to: '/franchise/inventory/verification', icon: ShieldCheck,  color: '#16a34a' },
  { label: 'Near Expiry',              to: '/franchise/inventory/near-expiry',  icon: AlertTriangle,color: '#d97706' },
  { label: 'Expired Stock',            to: '/franchise/inventory/expired',      icon: Trash2,       color: '#dc2626' },
  { label: 'Damage Stock',             to: '/franchise/inventory/damage',       icon: AlertTriangle,color: '#ea580c' },
  { label: 'Dead Stock',               to: '/franchise/inventory/dead',         icon: TrendingDown, color: '#6b7280' },
  { label: 'Fast Moving',              to: '/franchise/inventory/fast-moving',  icon: Zap,          color: '#16a34a' },
  { label: 'Slow Moving',              to: '/franchise/inventory/slow-moving',  icon: TrendingDown, color: '#9ca3af' },
  { label: 'Stock Ledger',             to: '/franchise/inventory/ledger',       icon: BookOpen,     color: '#0891b2' },
  { label: 'Rack & Warehouse',         to: '/franchise/inventory/rack',         icon: Layers,       color: '#d97706' },
  { label: 'Inventory Audit',          to: '/franchise/inventory/audit',        icon: ClipboardList,color: '#dc2626' },
]

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function InventoryDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading]     = useState(true)
  const [refreshKey, setRefresh]  = useState(0)
  const [data, setData]           = useState(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest('/franchise/inventory/dashboard')
      setData(res.data?.data)
    } catch {
      toast.error('Failed to load inventory dashboard')
    } finally {
      setLoading(false)
    }
  }, [refreshKey])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const kpi        = data?.kpi          || {}
  const donut      = data?.donut        || {}
  const nearExpiry = data?.nearExpiry   || []
  const lowStockList = data?.lowStockList || []
  const topItems   = data?.topItems     || []
  const catData    = data?.categoryData || []

  const now = new Date()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: '#111827', margin: 0 }}>Inventory Dashboard</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
            Real-time stock overview · {now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <button onClick={() => setRefresh(k => k + 1)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, padding: '7px 13px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <Skel h={10} w="60%" /><div style={{ height: 6 }} /><Skel h={24} w="40%" />
          </div>
        )) : [
          { label: 'Total Stock Value', value: fmt(kpi.totalValue),  color: '#0c3b73', sub: { text: '↑ vs last month', up: true } },
          { label: 'Total Items',       value: kpi.totalItems || 0,  color: '#374151', sub: { text: 'Active medicines', up: true } },
          { label: 'Low Stock Items',   value: kpi.lowStock || 0,    color: '#d97706', sub: { text: 'Need reorder', up: false } },
          { label: 'Out of Stock',      value: kpi.outOfStock || 0,  color: '#dc2626', sub: { text: 'Urgent action needed', up: false } },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>{k.label}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
            <p style={{ fontSize: 10, color: k.sub.up ? '#16a34a' : '#dc2626', margin: '2px 0 0', fontWeight: 500 }}>{k.sub.text}</p>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 220px', gap: 14 }}>

        {/* Donut */}
        <Card>
          <CH title="Stock Overview" />
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 120, height: 120 }}>
                  {loading ? <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f3f4f6" strokeWidth="3.5" strokeDasharray="100 0" /> :
                    [
                      { pct: donut.inStock?.pct    || 70, color: '#0c3b73', offset: 0 },
                      { pct: donut.lowStock?.pct   || 14, color: '#d97706', offset: donut.inStock?.pct || 70 },
                      { pct: donut.outOfStock?.pct || 4,  color: '#dc2626', offset: (donut.inStock?.pct || 70) + (donut.lowStock?.pct || 14) },
                      { pct: donut.nearExpiry?.pct || 3,  color: '#ea580c', offset: (donut.inStock?.pct || 70) + (donut.lowStock?.pct || 14) + (donut.outOfStock?.pct || 4) },
                    ].map((s, i) => (
                      <circle key={i} cx="18" cy="18" r="15.9155" fill="transparent" stroke={s.color} strokeWidth="3.5"
                        strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeDashoffset={`-${s.offset}`} />
                    ))
                  }
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{loading ? '...' : kpi.totalItems}</span>
                  <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 600 }}>Total Items</span>
                </div>
              </div>
            </div>
            {loading ? Array(5).fill(0).map((_, i) => <div key={i} style={{ marginBottom: 6 }}><Skel h={12} /></div>) :
              [
                { label: 'In Stock',    value: `${donut.inStock?.count || 0} (${donut.inStock?.pct || 0}%)`,       color: '#0c3b73' },
                { label: 'Low Stock',   value: `${donut.lowStock?.count || 0} (${donut.lowStock?.pct || 0}%)`,     color: '#d97706' },
                { label: 'Out of Stock',value: `${donut.outOfStock?.count || 0} (${donut.outOfStock?.pct || 0}%)`, color: '#dc2626' },
                { label: 'Near Expiry', value: `${donut.nearExpiry?.count || 0} (${donut.nearExpiry?.pct || 0}%)`, color: '#ea580c' },
                { label: 'Expired',     value: `${kpi.expiredBatches || 0}`,                                         color: '#6b7280' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 11, color: '#374151' }}>{r.label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: r.color }}>{r.value}</span>
                </div>
              ))
            }
          </div>
        </Card>

        {/* Top Categories */}
        <Card>
          <CH title="Top Stock Categories (By Value)" action="View All" onAction={() => navigate('/franchise/inventory/stock')} />
          <div style={{ padding: '16px' }}>
            {loading
              ? Array(5).fill(0).map((_, i) => <div key={i} style={{ marginBottom: 16 }}><Skel h={12} w="60%" /><div style={{ height: 4 }} /><Skel h={6} /></div>)
              : catData.map((c, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0c3b73', minWidth: 14 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{c.value}</span>
                      <span style={{ fontSize: 11, color: '#6b7280', minWidth: 36, textAlign: 'right' }}>{c.pct}%</span>
                    </div>
                  </div>
                  <div style={{ background: '#f3f4f6', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))
            }
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total Items', value: kpi.totalItems || 0 },
                { label: 'Out of Stock',value: kpi.outOfStock || 0 },
                { label: 'Total Value', value: fmt(kpi.totalValue) },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px', background: '#f9fafb', borderRadius: 8, textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0c3b73', margin: 0 }}>{loading ? '...' : s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CH title="Quick Actions" />
          <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {QUICK.map(q => (
              <button key={q.label} onClick={() => navigate(q.to)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', borderRadius: 10, border: '1px solid #f3f4f6', background: '#fff', cursor: 'pointer', whiteSpace: 'pre-line', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = q.color; e.currentTarget.style.background = q.color + '0c' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.background = '#fff' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: q.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <q.icon size={15} color={q.color} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.3 }}>{q.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Near Expiry */}
        <Card>
          <CH title="Near Expiry (≤30 Days)" action="View All" onAction={() => navigate('/franchise/inventory/near-expiry')} />
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0, padding: '5px 14px', borderBottom: '1px solid #f3f4f6' }}>
              {['Medicine', 'Expiry', 'Days', 'Qty'].map(h => (
                <span key={h} style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {loading
              ? Array(3).fill(0).map((_, i) => <div key={i} style={{ padding: '9px 14px', borderBottom: '1px solid #f9fafb' }}><Skel h={12} /></div>)
              : (nearExpiry.length > 0 ? nearExpiry : []).map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0, padding: '9px 14px', borderBottom: i < nearExpiry.length - 1 ? '1px solid #f9fafb' : 'none', alignItems: 'center' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{r.name}</p>
                  <span style={{ fontSize: 11, color: '#6b7280', marginRight: 14 }}>{r.expiry}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.days <= 30 ? '#dc2626' : '#d97706', marginRight: 14 }}>{r.days}d</span>
                  <span style={{ fontSize: 11, color: '#374151' }}>{r.qty}</span>
                </div>
              ))
            }
            <div style={{ padding: '6px 14px' }}>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 7, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={13} color="#ea580c" />
                <span style={{ fontSize: 11, color: '#9a3412', fontWeight: 500 }}>
                  {loading ? '...' : `${nearExpiry.filter(r => r.urgent).length} items expiring within 30 days`}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Low Stock */}
        <Card>
          <CH title="Low Stock Alert" action="View All" onAction={() => navigate('/franchise/inventory/stock')} />
          <div style={{ padding: '8px 0' }}>
            {loading
              ? Array(3).fill(0).map((_, i) => <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid #f9fafb' }}><Skel h={12} /></div>)
              : lowStockList.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < lowStockList.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={14} color="#dc2626" />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{r.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#dc2626' }}>{r.stock}</span>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>strips left</p>
                  </div>
                </div>
              ))
            }
            <div style={{ padding: '8px 14px' }}>
              <button onClick={() => navigate('/franchise/purchase/orders')}
                style={{ width: '100%', padding: '8px', border: 'none', borderRadius: 7, background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Order Now →
              </button>
            </div>
          </div>
        </Card>

        {/* Top Stock Items */}
        <Card>
          <CH title="Top Stock Items (By Value)" action="View All" onAction={() => navigate('/franchise/inventory/stock')} />
          <div style={{ padding: '8px 0' }}>
            {loading
              ? Array(5).fill(0).map((_, i) => <div key={i} style={{ padding: '9px 14px', borderBottom: '1px solid #f9fafb' }}><Skel h={12} /></div>)
              : topItems.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: i < topItems.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0c3b7318', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#0c3b73', flexShrink: 0 }}>{r.rank}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{r.name}</p>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Rack: {r.loc}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>{r.value}</span>
                </div>
              ))
            }
          </div>
        </Card>
      </div>

      {/* All Modules */}
      <Card>
        <CH title="All Inventory Modules" />
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
          {MODULES.map(m => (
            <button key={m.label} onClick={() => navigate(m.to)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 10, border: `1px solid ${m.color}22`, background: m.color + '08', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = m.color + '18'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = m.color + '08'; e.currentTarget.style.transform = 'none' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: m.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <m.icon size={17} color={m.color} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>{m.label}</p>
            </button>
          ))}
        </div>
      </Card>

    </div>
  )
}
