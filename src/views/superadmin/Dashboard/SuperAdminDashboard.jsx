/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  LayoutDashboard, Building2, Users, CreditCard, AlertTriangle, CheckCircle,
  Clock, TrendingUp, RefreshCw, Calendar, MapPin, Bell, Activity,
  ChevronRight, Eye, Plus, Settings, Shield, Store,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   REUSABLE PRIMITIVES
───────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', ...style }}>
    {children}
  </div>
)

const CardHeader = ({ title, action, onAction, icon: Icon, iconColor = '#0c3b73' }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {Icon && (
        <div style={{ width: 28, height: 28, borderRadius: 7, background: iconColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={iconColor} />
        </div>
      )}
      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{title}</span>
    </div>
    {action && (
      <button onClick={onAction} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        {action} <ChevronRight size={12} />
      </button>
    )}
  </div>
)

const StatusBadge = ({ status }) => {
  const map = {
    Active:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Inactive:  { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
    Suspended: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    Pending:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  }
  const s = map[status] || map.Inactive
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}

/* ─────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────── */
const KpiCard = ({ icon: Icon, label, value, info, color, trend }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 18px', flex: '1 1 160px', minWidth: 148 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </div>
    </div>
    <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 5px' }}>{value}</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {trend && <TrendingUp size={11} color="#16a34a" />}
      <span style={{ fontSize: 11, color: trend ? '#16a34a' : '#9ca3af', fontWeight: 500 }}>{info}</span>
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const FRANCHISES = [
  { id: 'FRN-001', name: 'MedPlus Pharmacy - Andheri',    city: 'Mumbai',    state: 'Maharashtra', plan: 'Enterprise', status: 'Active',    lastActivity: '2 hrs ago' },
  { id: 'FRN-002', name: 'HealthCare Plus - Koramangala', city: 'Bengaluru', state: 'Karnataka',   plan: 'Professional', status: 'Active',  lastActivity: '5 hrs ago' },
  { id: 'FRN-003', name: 'Wellness Pharma - Banjara Hills',city: 'Hyderabad', state: 'Telangana',  plan: 'Professional', status: 'Active',  lastActivity: '1 day ago' },
  { id: 'FRN-004', name: 'Apollo Medicals - Sector 18',   city: 'Noida',     state: 'Uttar Pradesh', plan: 'Basic',    status: 'Suspended', lastActivity: '3 days ago' },
  { id: 'FRN-005', name: 'Shree Ram Medicals - Kothrud',  city: 'Pune',      state: 'Maharashtra', plan: 'Enterprise', status: 'Active',    lastActivity: '30 min ago' },
  { id: 'FRN-006', name: 'Lifeline Pharmacy - Vastrapur', city: 'Ahmedabad', state: 'Gujarat',     plan: 'Professional', status: 'Inactive', lastActivity: '12 days ago' },
  { id: 'FRN-007', name: 'Jana Aushadhi - Anna Nagar',    city: 'Chennai',   state: 'Tamil Nadu',  plan: 'Basic',      status: 'Active',    lastActivity: '4 hrs ago' },
  { id: 'FRN-008', name: 'Raj Medicos - Salt Lake',       city: 'Kolkata',   state: 'West Bengal', plan: 'Professional', status: 'Active',  lastActivity: '1 hr ago' },
]

const RECENT_REGISTRATIONS = [
  { name: 'Pooja Pharma - BTM Layout',     city: 'Bengaluru',  date: '28 Jun 2025', status: 'Active' },
  { name: 'Sai Baba Medicals - Miyapur',   city: 'Hyderabad',  date: '25 Jun 2025', status: 'Pending' },
  { name: 'Ganesh Drug House - Wakad',     city: 'Pune',       date: '22 Jun 2025', status: 'Active' },
  { name: 'City Pharmacy - Vijay Nagar',   city: 'Indore',     date: '20 Jun 2025', status: 'Active' },
  { name: 'Prime Medicals - Attapur',      city: 'Hyderabad',  date: '18 Jun 2025', status: 'Pending' },
]

const SUBSCRIPTION_ALERTS = [
  { name: 'MedPlus Pharmacy - Andheri',     expiry: '03 Jul 2025', days: 5 },
  { name: 'Raj Medicos - Salt Lake',         expiry: '04 Jul 2025', days: 6 },
  { name: 'Lifeline Pharmacy - Vastrapur',   expiry: '15 Jul 2025', days: 17 },
  { name: 'City Pharmacy - Vijay Nagar',     expiry: '20 Jul 2025', days: 22 },
  { name: 'Jana Aushadhi - Anna Nagar',      expiry: '28 Jul 2025', days: 30 },
]

const SUPPLIER_ACTIVITY = [
  { name: 'Gupta Pharma Distributors',    action: 'Catalogue Updated',   time: '2 hrs ago',  color: '#0c3b73' },
  { name: 'MedLife Wholesale',            action: 'Newly Onboarded',      time: '5 hrs ago',  color: '#16a34a' },
  { name: 'Shree Balaji Pharma',          action: 'Price List Updated',   time: '1 day ago',  color: '#d97706' },
  { name: 'HealthCore Distributors',      action: 'Scheme Added: 10+2',   time: '2 days ago', color: '#7c3aed' },
  { name: 'R.K. Pharma Agency',           action: 'Account Suspended',    time: '3 days ago', color: '#dc2626' },
]

const PENDING_ACTIONS = [
  { title: 'New Franchise Approval',       sub: 'Sai Baba Medicals, Hyderabad',  type: 'approval' },
  { title: 'Plan Renewal Request',         sub: 'MedPlus Pharmacy – Basic → Pro', type: 'renewal' },
  { title: 'Supplier Verification',        sub: 'MedLife Wholesale – Docs pending', type: 'verification' },
  { title: 'Franchise Profile Update',     sub: 'Apollo Medicals, Noida',         type: 'update' },
  { title: 'Subscription Cancellation',    sub: 'Lifeline Pharmacy, Ahmedabad',   type: 'cancellation' },
]

const STATE_DISTRIBUTION = [
  { state: 'Maharashtra',    cities: 4, franchises: 28, active: 25 },
  { state: 'Karnataka',      cities: 3, franchises: 22, active: 20 },
  { state: 'Telangana',      cities: 2, franchises: 18, active: 16 },
  { state: 'Tamil Nadu',     cities: 3, franchises: 16, active: 15 },
  { state: 'Gujarat',        cities: 2, franchises: 14, active: 11 },
  { state: 'Uttar Pradesh',  cities: 4, franchises: 13, active: 10 },
  { state: 'West Bengal',    cities: 2, franchises: 12, active: 12 },
  { state: 'Rajasthan',      cities: 2, franchises: 9,  active: 8 },
  { state: 'Madhya Pradesh', cities: 2, franchises: 7,  active: 6 },
  { state: 'Punjab',         cities: 1, franchises: 5,  active: 5 },
]

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function SuperAdminDashboard() {
  const [refreshed, setRefreshed] = useState(false)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const handleRefresh = () => {
    setRefreshed(true)
    setTimeout(() => setRefreshed(false), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13, minHeight: '100vh', background: '#f8f9fb', padding: 4 }}>

      {/* ══════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutDashboard size={20} color="#fabf22" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Network Dashboard</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
              Monitor your entire pharmacy franchise network at a glance
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px' }}>
            <Calendar size={13} color="#6b7280" />
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{dateStr}</span>
          </div>
          <button
            onClick={handleRefresh}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0c3b73', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
          >
            <RefreshCw size={12} style={{ animation: refreshed ? 'spin 0.8s linear' : 'none' }} />
            {refreshed ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          KPI STRIP — 8 cards
      ══════════════════════════════════════ */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <KpiCard icon={Building2}    label="Total Franchises"      value="142"   color="#0c3b73" info="+4 this month"    trend />
        <KpiCard icon={CheckCircle}  label="Active Franchises"     value="128"   color="#16a34a" info="90.1% of total"   trend />
        <KpiCard icon={AlertTriangle}label="Inactive / Suspended"  value="14"    color="#dc2626" info="↓ 2 vs last month" />
        <KpiCard icon={Shield}       label="Total Admins"          value="12"    color="#7c3aed" info="Franchise admins" />
        <KpiCard icon={Users}        label="Total Users"           value="1,842" color="#0891b2" info="+38 this month"   trend />
        <KpiCard icon={CreditCard}   label="Active Subscriptions"  value="118"   color="#16a34a" info="₹4.8L MRR"        trend />
        <KpiCard icon={Clock}        label="Expiring Soon"         value="8"     color="#d97706" info="Within 30 days" />
        <KpiCard icon={Bell}         label="Pending Actions"       value="5"     color="#dc2626" info="Require attention" />
      </div>

      {/* ══════════════════════════════════════
          ROW 1 — Franchise Overview + Recent Registrations
      ══════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, alignItems: 'start' }}>

        {/* Franchise Overview Table */}
        <Card>
          <CardHeader title="Franchise Overview" action="View All" icon={Store} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Franchise Name', 'City', 'State', 'Plan', 'Status', 'Last Activity', 'Action'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FRANCHISES.map((f, i) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0c3b7318', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Building2 size={14} color="#0c3b73" />
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{f.name}</p>
                          <p style={{ fontSize: 10, color: '#9ca3af', margin: '1px 0 0' }}>{f.id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>{f.city}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>{f.state}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: f.plan === 'Enterprise' ? '#0c3b7312' : f.plan === 'Professional' ? '#7c3aed12' : '#f3f4f6', color: f.plan === 'Enterprise' ? '#0c3b73' : f.plan === 'Professional' ? '#7c3aed' : '#6b7280' }}>
                        {f.plan}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}><StatusBadge status={f.status} /></td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#9ca3af' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Activity size={11} color="#9ca3af" />
                        {f.lastActivity}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#0c3b73', background: '#0c3b7310', border: '1px solid #0c3b7325', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                        <Eye size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader title="Recent Registrations" icon={Plus} iconColor="#16a34a" />
          <div style={{ padding: '8px 0' }}>
            {RECENT_REGISTRATIONS.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < RECENT_REGISTRATIONS.length - 1 ? '1px solid #f3f4f6' : 'none', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0c3b7312', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Building2 size={14} color="#0c3b73" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.3 }}>{r.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <MapPin size={10} color="#9ca3af" />
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{r.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Calendar size={10} color="#9ca3af" />
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{r.date}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
            <button style={{ width: '100%', padding: '8px 0', background: '#0c3b7308', border: '1px dashed #0c3b7330', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#0c3b73', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Plus size={13} /> Register New Franchise
            </button>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════
          ROW 2 — Subscription Alerts + Supplier Activity + Pending Actions
      ══════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Subscription Alerts */}
        <Card>
          <CardHeader title="Subscription Alerts" icon={CreditCard} iconColor="#d97706" />
          <div style={{ padding: '8px 0' }}>
            {SUBSCRIPTION_ALERTS.map((s, i) => {
              const isRed    = s.days < 7
              const isOrange = s.days >= 7 && s.days < 30
              const dotColor = isRed ? '#dc2626' : isOrange ? '#d97706' : '#16a34a'
              const bgRow    = isRed ? '#fff8f8' : 'transparent'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < SUBSCRIPTION_ALERTS.length - 1 ? '1px solid #f3f4f6' : 'none', background: bgRow, gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>Expires: {s.expiry}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: dotColor, background: dotColor + '14', padding: '3px 8px', borderRadius: 6, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {s.days}d left
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ fontSize: 11, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All Expiries <ChevronRight size={11} />
            </button>
          </div>
        </Card>

        {/* Supplier Activity */}
        <Card>
          <CardHeader title="Supplier Activity" icon={Activity} iconColor="#7c3aed" />
          <div style={{ padding: '8px 0' }}>
            {SUPPLIER_ACTIVITY.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < SUPPLIER_ACTIVITY.length - 1 ? '1px solid #f3f4f6' : 'none', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Store size={14} color={s.color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                    <span style={{ fontSize: 10, fontWeight: 600, color: s.color, background: s.color + '12', padding: '2px 6px', borderRadius: 5, marginTop: 3, display: 'inline-block' }}>{s.action}</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>{s.time}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ fontSize: 11, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All Suppliers <ChevronRight size={11} />
            </button>
          </div>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader title="Pending Actions" icon={Bell} iconColor="#dc2626" />
          <div style={{ padding: '8px 0' }}>
            {PENDING_ACTIONS.map((p, i) => {
              const typeMap = {
                approval:     { color: '#16a34a', label: 'Approve' },
                renewal:      { color: '#0c3b73', label: 'Review'  },
                verification: { color: '#7c3aed', label: 'Verify'  },
                update:       { color: '#d97706', label: 'View'    },
                cancellation: { color: '#dc2626', label: 'Action'  },
              }
              const t = typeMap[p.type]
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < PENDING_ACTIONS.length - 1 ? '1px solid #f3f4f6' : 'none', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{p.title}</p>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.sub}</p>
                    </div>
                  </div>
                  <button style={{ fontSize: 11, fontWeight: 600, color: t.color, background: t.color + '12', border: `1px solid ${t.color}25`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', flexShrink: 0 }}>
                    {t.label}
                  </button>
                </div>
              )
            })}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ fontSize: 11, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All Pending <ChevronRight size={11} />
            </button>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════
          ROW 3 — State / City Distribution
      ══════════════════════════════════════ */}
      <Card>
        <CardHeader title="State / City Distribution" icon={MapPin} iconColor="#0c3b73" action="Full Report" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'State', 'Cities', 'Total Franchises', 'Active', 'Inactive / Suspended', 'Coverage'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STATE_DISTRIBUTION.map((s, i) => {
                const pct = Math.round((s.active / s.franchises) * 100)
                return (
                  <tr key={s.state} style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <MapPin size={12} color="#0c3b73" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.state}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{s.cities}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151', fontWeight: 700 }}>{s.franchises}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{s.active}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.franchises - s.active > 0 ? '#dc2626' : '#9ca3af' }}>
                        {s.franchises - s.active}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, maxWidth: 80 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#16a34a' : pct >= 70 ? '#d97706' : '#dc2626', borderRadius: 3, transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', minWidth: 32 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f0f4ff', borderTop: '2px solid #e5e7eb' }}>
                <td colSpan={2} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>Total</td>
                <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>{STATE_DISTRIBUTION.reduce((a, b) => a + b.cities, 0)}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>{STATE_DISTRIBUTION.reduce((a, b) => a + b.franchises, 0)}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{STATE_DISTRIBUTION.reduce((a, b) => a + b.active, 0)}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{STATE_DISTRIBUTION.reduce((a, b) => a + (b.franchises - b.active), 0)}</td>
                <td style={{ padding: '10px 16px' }}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

    </div>
  )
}
