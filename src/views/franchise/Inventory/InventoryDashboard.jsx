/* eslint-disable prettier/prettier */
import { useNavigate } from 'react-router-dom'
import {
  Package, AlertTriangle, TrendingUp, TrendingDown, BarChart2,
  RefreshCw, Calendar, ChevronRight, ClipboardList, Layers,
  FlaskConical, Activity, ShieldCheck, Trash2, Zap, BookOpen,
} from 'lucide-react'

/* ─── shared ─── */
const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', ...style }}>{children}</div>
)
const CH = ({ title, action, onAction }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{title}</span>
    {action && <button onClick={onAction} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>{action} <ChevronRight size={11} /></button>}
  </div>
)
const Stat = ({ label, value, color = '#0c3b73', sub }) => (
  <div>
    <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
    <p style={{ fontSize: 18, fontWeight: 800, color, margin: 0 }}>{value}</p>
    {sub && <p style={{ fontSize: 10, color: sub.up ? '#16a34a' : '#dc2626', margin: '2px 0 0', fontWeight: 500 }}>{sub.text}</p>}
  </div>
)

/* ─── mock ─── */
const CATEGORY_DATA = [
  { name: 'Tablets',    value: '₹6,25,230', pct: 71.4, color: '#0c3b73' },
  { name: 'Capsules',   value: '₹2,12,540', pct: 14.8, color: '#7c3aed' },
  { name: 'Syrups',     value: '₹1,53,410', pct: 7.6,  color: '#d97706' },
  { name: 'Injections', value: '₹1,75,230', pct: 4.8,  color: '#16a34a' },
  { name: 'Others',     value: '₹2,09,010', pct: 1.4,  color: '#9ca3af' },
]

const TOP_ITEMS = [
  { name: 'Crocin 650 Tablet',    value: '₹18,750.00', loc: 'A-01' },
  { name: 'Paracetamol 650mg',    value: '₹14,500.00', loc: 'A-02' },
  { name: 'Dolo 650 Tablet',      value: '₹12,100.00', loc: 'B-01' },
  { name: 'Pantop DSR Capsule',   value: '₹10,200.00', loc: 'B-03' },
  { name: 'Amoxicillin 500mg',    value: '₹9,600.00',  loc: 'C-01' },
]

const NEAR_EXPIRY = [
  { name: 'Augmentin 625',  exp: '15/06/2025', days: 25, qty: 120 },
  { name: 'Azithral 500',   exp: '20/06/2025', days: 30, qty: 200 },
  { name: 'Calpol 650',     exp: '25/06/2025', days: 35, qty: 60  },
]

const LOW_STOCK = [
  { name: 'Amoxicillin 500mg Capsule',  stock: 12 },
  { name: 'Pantoprazole 40mg Tablet',   stock: 8  },
  { name: 'Cetirizine 10mg Tablet',     stock: 10 },
]

const QUICK = [
  { label: 'Current\nStock',     to: '/franchise/inventory/stock',        icon: Package,      color: '#0c3b73' },
  { label: 'Near\nExpiry',       to: '/franchise/inventory/near-expiry',  icon: AlertTriangle,color: '#d97706' },
  { label: 'Stock\nAdjustment',  to: '/franchise/inventory/adjustments',  icon: Activity,     color: '#7c3aed' },
  { label: 'Physical\nVerif.',   to: '/franchise/inventory/verification', icon: ShieldCheck,  color: '#16a34a' },
  { label: 'Inventory\nLedger',  to: '/franchise/inventory/ledger',       icon: BookOpen,     color: '#0891b2' },
  { label: 'Inventory\nAudit',   to: '/franchise/inventory/audit',        icon: ClipboardList,color: '#dc2626' },
]

const MODULES = [
  { label: 'Current Stock',            to: '/franchise/inventory/stock',        icon: Package,      color: '#0c3b73', desc: '8,945 items' },
  { label: 'Stock Adjustment',         to: '/franchise/inventory/adjustments',  icon: Activity,     color: '#7c3aed', desc: '24 this month' },
  { label: 'Physical Stock Verif.',    to: '/franchise/inventory/verification', icon: ShieldCheck,  color: '#16a34a', desc: '18 total' },
  { label: 'Near Expiry',              to: '/franchise/inventory/near-expiry',  icon: AlertTriangle,color: '#d97706', desc: '256 items' },
  { label: 'Expired Stock',            to: '/franchise/inventory/expired',      icon: Trash2,       color: '#dc2626', desc: '156 items' },
  { label: 'Damage Stock',             to: '/franchise/inventory/damage',       icon: AlertTriangle,color: '#ea580c', desc: '78 items' },
  { label: 'Dead Stock',               to: '/franchise/inventory/dead',         icon: TrendingDown, color: '#6b7280', desc: '112 items' },
  { label: 'Fast Moving',              to: '/franchise/inventory/fast-moving',  icon: Zap,          color: '#16a34a', desc: '120 items' },
  { label: 'Slow Moving',              to: '/franchise/inventory/slow-moving',  icon: TrendingDown, color: '#9ca3af', desc: '134 items' },
  { label: 'Stock Ledger',             to: '/franchise/inventory/ledger',       icon: BookOpen,     color: '#0891b2', desc: 'Crocin 650' },
  { label: 'Rack & Warehouse',         to: '/franchise/inventory/rack',         icon: Layers,       color: '#d97706', desc: '4 racks' },
  { label: 'Inventory Audit',          to: '/franchise/inventory/audit',        icon: ClipboardList,color: '#dc2626', desc: '16 audits' },
]

export default function InventoryDashboard() {
  const navigate = useNavigate()
  const now = new Date()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: '#111827', margin: 0 }}>Inventory Dashboard</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
            Real-time stock overview and management &nbsp;·&nbsp; {now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <button onClick={() => window.location.reload()}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, padding: '7px 13px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Top KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Stock Value', value: '₹18,75,420', color: '#0c3b73', sub: { text: '↑ 4.52% vs last month', up: true } },
          { label: 'Total Items',       value: '8,945',       color: '#374151', sub: { text: '↑ 124 This Month', up: true } },
          { label: 'Low Stock Items',   value: '128',         color: '#d97706', sub: { text: '↑ 12 vs last week', up: false } },
          { label: 'Out of Stock',      value: '23',          color: '#dc2626', sub: { text: '↑ 5 vs last week', up: false } },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <Stat {...k} />
          </div>
        ))}
      </div>

      {/* Row 2: Donut chart area + Top Categories + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 220px', gap: 14 }}>

        {/* Donut chart (CSS) */}
        <Card>
          <CH title="Stock Overview" />
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 120, height: 120 }}>
                  {[
                    { pct: 71.4, color: '#0c3b73', offset: 0 },
                    { pct: 14.8, color: '#7c3aed', offset: 71.4 },
                    { pct: 7.6,  color: '#d97706', offset: 86.2 },
                    { pct: 4.8,  color: '#16a34a', offset: 93.8 },
                    { pct: 1.4,  color: '#9ca3af', offset: 98.6 },
                  ].map((s, i) => (
                    <circle key={i} cx="18" cy="18" r="15.9155"
                      fill="transparent" stroke={s.color} strokeWidth="3.5"
                      strokeDasharray={`${s.pct} ${100 - s.pct}`}
                      strokeDashoffset={`-${s.offset}`} />
                  ))}
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>8,945</span>
                  <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 600 }}>Total Items</span>
                </div>
              </div>
            </div>
            {[
              { label: 'In Stock',    value: '6,243 (69.8%)', color: '#0c3b73' },
              { label: 'Low Stock',   value: '1,245 (13.9%)', color: '#d97706' },
              { label: 'Out of Stock',value: '344 (3.8%)',    color: '#dc2626' },
              { label: 'Near Expiry', value: '256 (2.9%)',    color: '#ea580c' },
              { label: 'Expired',     value: '857 (9.6%)',    color: '#6b7280' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: '#374151' }}>{r.label}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Stock Categories */}
        <Card>
          <CH title="Top Stock Categories (By Value)" action="View All" onAction={() => navigate('/franchise/inventory/stock')} />
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CATEGORY_DATA.map((c, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0c3b73', minWidth: 14 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{c.value}</span>
                      <span style={{ fontSize: 11, color: '#6b7280', minWidth: 36, textAlign: 'right' }}>{c.pct}%</span>
                    </div>
                  </div>
                  <div style={{ background: '#f3f4f6', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 4, transition: 'width 0.4s' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Avg Stock Value', value: '₹14.95' },
                { label: 'Total Qty',       value: '1,25,430' },
                { label: 'Total Value',     value: '₹18,75,420' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px', background: '#f9fafb', borderRadius: 8, textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0c3b73', margin: 0 }}>{s.value}</p>
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

      {/* Row 3: Near Expiry + Low Stock + Top Items */}
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
            {NEAR_EXPIRY.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0, padding: '9px 14px', borderBottom: i < NEAR_EXPIRY.length - 1 ? '1px solid #f9fafb' : 'none', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{r.name}</p>
                </div>
                <span style={{ fontSize: 11, color: '#6b7280', marginRight: 14 }}>{r.exp}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: r.days <= 30 ? '#dc2626' : '#d97706', marginRight: 14 }}>{r.days}d</span>
                <span style={{ fontSize: 11, color: '#374151' }}>{r.qty}</span>
              </div>
            ))}
            <div style={{ padding: '6px 14px' }}>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 7, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={13} color="#ea580c" />
                <span style={{ fontSize: 11, color: '#9a3412', fontWeight: 500 }}>56 items expiring within 30 days — Critical</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Low Stock */}
        <Card>
          <CH title="Low Stock Alert" action="View All" onAction={() => navigate('/franchise/inventory/stock')} />
          <div style={{ padding: '8px 0' }}>
            {LOW_STOCK.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < LOW_STOCK.length - 1 ? '1px solid #f9fafb' : 'none' }}>
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
            ))}
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
            {TOP_ITEMS.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: i < TOP_ITEMS.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0c3b7318', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#0c3b73', flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{r.name}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Rack: {r.loc}</p>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 4: All Modules Grid */}
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
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>{m.label}</p>
                <p style={{ fontSize: 11, color: m.color, margin: '2px 0 0', fontWeight: 500 }}>{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

    </div>
  )
}
