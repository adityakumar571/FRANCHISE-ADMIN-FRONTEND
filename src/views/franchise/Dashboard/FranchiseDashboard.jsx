/* eslint-disable prettier/prettier */
/**
 * FranchiseDashboard
 *
 * Phase 1 — Uses mock data for KPIs and activity.
 * APIs will be wired in Phase 2.
 */
import { useFranchise } from '../../../Context/FranchiseContext'
import {
  TrendingUp, ShoppingCart, Users, Package,
  IndianRupee, AlertTriangle, CheckCircle2,
  ArrowUpRight, Store, Activity, Clock,
} from 'lucide-react'

/* ── KPI Card ── */
const KpiCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div style={{
    background: '#fff', borderRadius: 12, padding: '18px 20px',
    border: '1px solid #e5e7eb', display: 'flex', alignItems: 'flex-start', gap: 14,
    flex: '1 1 200px', minWidth: 180,
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: trend === 'up' ? '#16a34a' : '#9ca3af', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
        {trend === 'up' && <ArrowUpRight size={11} />} {sub}
      </p>}
    </div>
  </div>
)

/* ── Quick Action Button ── */
const QuickAction = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '16px 12px', borderRadius: 10,
      border: '1px solid #e5e7eb', background: '#fff',
      cursor: 'pointer', flex: '1 1 100px',
      transition: 'all 0.15s',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = color + '08' }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}
  >
    <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={color} />
    </div>
    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', textAlign: 'center' }}>{label}</span>
  </button>
)

/* ── Section Header ── */
const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h3>
    {sub && <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{sub}</p>}
  </div>
)

/* ── Mock recent activity ── */
const MOCK_ACTIVITY = [
  { time: '10:30 AM', label: 'New sale created', amount: '₹1,250', type: 'sale' },
  { time: '10:15 AM', label: 'Stock updated — Paracetamol 650mg', amount: '+100 units', type: 'stock' },
  { time: '09:45 AM', label: 'Customer added — Rahul Sharma', amount: '', type: 'customer' },
  { time: '09:30 AM', label: 'Purchase entry — Medico Agency', amount: '₹8,500', type: 'purchase' },
  { time: '09:00 AM', label: 'Staff logged in — Amit Kumar', amount: '', type: 'staff' },
]

/* ── Mock alerts ── */
const MOCK_ALERTS = [
  { label: 'Low stock — Amoxicillin 500mg', level: 'warning' },
  { label: '3 medicines expiring in 30 days', level: 'danger' },
  { label: 'Pending payment due — ₹2,500', level: 'warning' },
]

const FranchiseDashboard = () => {
  const { franchiseUser, franchiseInfo } = useFranchise()

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const kpis = [
    { icon: IndianRupee,  label: "Today's Sales",     value: '₹48,650', sub: '↑ 18.6% vs yesterday', color: '#0c3b73', trend: 'up' },
    { icon: ShoppingCart, label: 'Total Orders',       value: '24',       sub: '8 pending',             color: '#7c3aed', trend: 'up' },
    { icon: Package,      label: 'Total Products',     value: '4,856',    sub: '32 low stock',          color: '#d97706', trend: null },
    { icon: Users,        label: 'Total Customers',    value: '1,256',    sub: '+12 this month',        color: '#16a34a', trend: 'up' },
    { icon: TrendingUp,   label: 'Gross Profit (Today)', value: '₹8,750', sub: '17.96% margin',        color: '#0891b2', trend: 'up' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Welcome Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0c3b73 0%, #1a6fd4 100%)',
        borderRadius: 14, padding: '22px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            Welcome back, {franchiseUser?.name || franchiseUser?.userId || 'Admin'} 👋
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            {franchiseInfo?.franchiseName} · {dateStr}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#fabf22', margin: 0 }}>{timeStr}</p>
          {franchiseInfo?.franchiseCode && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '2px 0 0', fontFamily: 'monospace' }}>
              {franchiseInfo.franchiseCode}
            </p>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div>
        <SectionHeader title="Today's Overview" sub="Live data — refreshes automatically" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
        </div>
      </div>

      {/* ── Alerts + Quick Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* Alerts */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e5e7eb' }}>
          <SectionHeader title="Smart Alerts" sub="Items requiring attention" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_ALERTS.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                background: a.level === 'danger' ? '#fff1f2' : '#fffbeb',
                border: `1px solid ${a.level === 'danger' ? '#fecdd3' : '#fde68a'}`,
              }}>
                <AlertTriangle size={14} color={a.level === 'danger' ? '#e11d48' : '#d97706'} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e5e7eb' }}>
          <SectionHeader title="Quick Actions" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <QuickAction icon={ShoppingCart} label="New Sale"      color="#0c3b73" />
            <QuickAction icon={Package}      label="Add Product"   color="#7c3aed" />
            <QuickAction icon={Users}        label="Add Customer"  color="#16a34a" />
            <QuickAction icon={Store}        label="Purchase Entry" color="#d97706" />
            <QuickAction icon={Activity}     label="View Reports"  color="#0891b2" />
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e5e7eb' }}>
        <SectionHeader title="Recent Activity" sub="Today's latest actions" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {MOCK_ACTIVITY.map((act, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < MOCK_ACTIVITY.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {act.type === 'sale'     && <IndianRupee  size={14} color="#0c3b73" />}
                {act.type === 'stock'   && <Package       size={14} color="#7c3aed" />}
                {act.type === 'customer' && <Users         size={14} color="#16a34a" />}
                {act.type === 'purchase' && <ShoppingCart  size={14} color="#d97706" />}
                {act.type === 'staff'   && <CheckCircle2  size={14} color="#0891b2" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: '#111827', margin: 0, fontWeight: 500 }}>{act.label}</p>
                {act.amount && <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{act.amount}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9ca3af', flexShrink: 0 }}>
                <Clock size={11} />
                <span style={{ fontSize: 11 }}>{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Placeholder modules notice ── */}
      <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: '#166534', margin: 0 }}>
          <strong>Phase 1 complete.</strong> Franchise foundation is set up. Module APIs (Products, Orders, Inventory, Billing etc.) will be connected in Phase 2.
        </p>
      </div>

    </div>
  )
}

export default FranchiseDashboard
