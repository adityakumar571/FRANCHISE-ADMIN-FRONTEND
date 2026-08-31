/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  BarChart2, Download, Building2, CreditCard, Truck, Pill,
  Package, FileText, TrendingUp, Users, AlertCircle, CheckCircle,
  MapPin, Calendar, Search, Clock,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   PALETTE & PRIMITIVES
───────────────────────────────────────────── */
const C = {
  primary: '#0c3b73', accent: '#fabf22', success: '#16a34a',
  danger: '#dc2626', border: '#e5e7eb', bg: '#f8f9fb',
}

const inputStyle = {
  border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px',
  fontSize: 13, color: '#374151', outline: 'none', background: '#fff',
  fontFamily: 'Inter, -apple-system, sans-serif', boxSizing: 'border-box',
}

const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '16px 20px', flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 44, height: 44, borderRadius: 11, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0', fontWeight: 500 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  </div>
)

const StatusBadge = ({ status }) => {
  const map = {
    Active:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Inactive:  { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
    Suspended: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    Pending:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    Approved:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  }
  const s = map[status] || map.Inactive
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const FRANCHISE_ROWS = [
  { id: 'FRN-001', name: 'MedPlus Pharmacy - Andheri',       state: 'Maharashtra', city: 'Mumbai',     plan: 'Enterprise',   status: 'Active',    regDate: '12 Jan 2025', lastActivity: '2 hrs ago' },
  { id: 'FRN-002', name: 'HealthCare Plus - Koramangala',    state: 'Karnataka',   city: 'Bengaluru',  plan: 'Professional', status: 'Active',    regDate: '20 Jan 2025', lastActivity: '5 hrs ago' },
  { id: 'FRN-003', name: 'Wellness Pharma - Banjara Hills',  state: 'Telangana',   city: 'Hyderabad',  plan: 'Professional', status: 'Active',    regDate: '01 Feb 2025', lastActivity: '1 day ago' },
  { id: 'FRN-004', name: 'Apollo Medicals - Sector 18',      state: 'Uttar Pradesh', city: 'Noida',    plan: 'Basic',        status: 'Suspended', regDate: '15 Feb 2025', lastActivity: '3 days ago' },
  { id: 'FRN-005', name: 'Shree Ram Medicals - Kothrud',     state: 'Maharashtra', city: 'Pune',       plan: 'Enterprise',   status: 'Active',    regDate: '10 Mar 2025', lastActivity: '30 min ago' },
  { id: 'FRN-006', name: 'Lifeline Pharmacy - Vastrapur',    state: 'Gujarat',     city: 'Ahmedabad',  plan: 'Professional', status: 'Inactive',  regDate: '22 Mar 2025', lastActivity: '12 days ago' },
  { id: 'FRN-007', name: 'Jana Aushadhi - Anna Nagar',       state: 'Tamil Nadu',  city: 'Chennai',    plan: 'Basic',        status: 'Active',    regDate: '05 Apr 2025', lastActivity: '4 hrs ago' },
  { id: 'FRN-008', name: 'Raj Medicos - Salt Lake',          state: 'West Bengal', city: 'Kolkata',    plan: 'Professional', status: 'Active',    regDate: '18 Apr 2025', lastActivity: '1 hr ago' },
]

const SUBSCRIPTION_ROWS = [
  { plan: 'Enterprise',   franchises: 38, revenue: '₹1,89,962', avgDuration: '8.4 months' },
  { plan: 'Professional', franchises: 58, revenue: '₹1,44,942', avgDuration: '7.1 months' },
  { plan: 'Basic',        franchises: 22, revenue: '₹21,978',   avgDuration: '5.2 months' },
]

const SUPPLIER_ROWS = [
  { name: 'Gupta Pharma Distributors', type: 'Distributor',  status: 'Active',   franchises: 32, orders: 128, lastActivity: '2 hrs ago' },
  { name: 'MedLife Wholesale',          type: 'Wholesaler',   status: 'Active',   franchises: 24, orders: 89,  lastActivity: '5 hrs ago' },
  { name: 'Shree Balaji Pharma',        type: 'Distributor',  status: 'Active',   franchises: 18, orders: 67,  lastActivity: '1 day ago' },
  { name: 'HealthCore Distributors',    type: 'Distributor',  status: 'Inactive', franchises: 10, orders: 34,  lastActivity: '5 days ago' },
  { name: 'R.K. Pharma Agency',         type: 'Wholesaler',   status: 'Suspended',franchises: 5,  orders: 12,  lastActivity: '10 days ago' },
  { name: 'Sunrise Medicals Supply',    type: 'Distributor',  status: 'Active',   franchises: 14, orders: 55,  lastActivity: '3 hrs ago' },
]

const TABS = [
  { key: 'franchise',    label: 'Franchise',    icon: Building2 },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
  { key: 'supplier',     label: 'Supplier',     icon: Truck },
  { key: 'medicine',     label: 'Medicine',     icon: Pill },
  { key: 'inventory',    label: 'Inventory',    icon: Package },
  { key: 'audit',        label: 'Audit',        icon: FileText },
]

/* ─────────────────────────────────────────────
   TABLE WRAPPER
───────────────────────────────────────────── */
const TableWrap = ({ headers, children }) => (
  <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: 10, color: '#6b7280', fontWeight: 700,
                textTransform: 'uppercase', textAlign: 'left', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  </div>
)

const Tr = ({ children }) => {
  const [hover, setHover] = useState(false)
  return (
    <tr onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ borderBottom: '1px solid #f3f4f6', background: hover ? '#f8f9fb' : '#fff', transition: 'background .1s' }}>
      {children}
    </tr>
  )
}

const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 14px', ...style }}>{children}</td>
)

/* ─────────────────────────────────────────────
   FILTER BAR
───────────────────────────────────────────── */
const FranchiseFilterBar = ({ filters, setFilters }) => (
  <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px',
    display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
    <select value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}
      style={{ ...inputStyle, minWidth: 140, cursor: 'pointer' }}>
      {['All States', 'Maharashtra', 'Karnataka', 'Telangana', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Uttar Pradesh'].map(s => <option key={s}>{s}</option>)}
    </select>
    <select value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
      style={{ ...inputStyle, minWidth: 130, cursor: 'pointer' }}>
      {['All Cities', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Noida'].map(c => <option key={c}>{c}</option>)}
    </select>
    <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
      style={{ ...inputStyle, minWidth: 130, cursor: 'pointer' }}>
      {['All Status', 'Active', 'Inactive', 'Suspended', 'Pending'].map(s => <option key={s}>{s}</option>)}
    </select>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Calendar size={13} color="#9ca3af" />
      <input type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
        style={{ ...inputStyle, minWidth: 140 }} />
      <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
      <input type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
        style={{ ...inputStyle, minWidth: 140 }} />
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function SuperAdminReports() {
  const [activeTab, setActiveTab] = useState('franchise')
  const [filters, setFilters]     = useState({ state: 'All States', city: 'All Cities', status: 'All Status', from: '', to: '' })

  /* ── filter franchise rows ── */
  const filteredFranchises = FRANCHISE_ROWS.filter(r => {
    const matchSt  = filters.state  === 'All States'  || r.state  === filters.state
    const matchCi  = filters.city   === 'All Cities'  || r.city   === filters.city
    const matchSta = filters.status === 'All Status'  || r.status === filters.status
    return matchSt && matchCi && matchSta
  })

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13, background: C.bg, minHeight: '100vh', padding: 4 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: C.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={20} color={C.accent} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Reports & Analytics</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Comprehensive insights across your pharmacy franchise network</p>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.success, color: '#fff',
          border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, background: '#fff', border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 4, marginBottom: 18, width: 'fit-content' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 7, border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: activeTab === key ? C.primary : 'transparent',
              color: activeTab === key ? '#fff' : '#6b7280' }}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          FRANCHISE TAB
      ══════════════════════════════ */}
      {activeTab === 'franchise' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <StatCard icon={Building2}   label="Total Registered" value="142" sub="+8 this month"  color={C.primary}  bg="#eff6ff" />
            <StatCard icon={CheckCircle} label="Active"           value="128" sub="90.1% active"   color={C.success}  bg="#f0fdf4" />
            <StatCard icon={TrendingUp}  label="New This Month"   value="8"   sub="↑ 3 vs last"   color="#d97706"    bg="#fffbeb" />
            <StatCard icon={AlertCircle} label="Churned"          value="2"   sub="This month"    color={C.danger}   bg="#fef2f2" />
          </div>

          <FranchiseFilterBar filters={filters} setFilters={setFilters} />

          <TableWrap headers={['Franchise ID', 'Name', 'State', 'City', 'Plan', 'Status', 'Registered Date', 'Last Activity']}>
            {filteredFranchises.map(r => (
              <Tr key={r.id}>
                <Td><span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{r.id}</span></Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.primary}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={13} color={C.primary} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.name}</span>
                  </div>
                </Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={11} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#374151' }}>{r.state}</span>
                  </div>
                </Td>
                <Td><span style={{ fontSize: 12, color: '#374151' }}>{r.city}</span></Td>
                <Td>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                    background: r.plan === 'Enterprise' ? '#eff6ff' : r.plan === 'Professional' ? '#faf5ff' : '#f9fafb',
                    color: r.plan === 'Enterprise' ? C.primary : r.plan === 'Professional' ? '#7c3aed' : '#6b7280' }}>
                    {r.plan}
                  </span>
                </Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={11} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#374151' }}>{r.regDate}</span>
                  </div>
                </Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={11} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{r.lastActivity}</span>
                  </div>
                </Td>
              </Tr>
            ))}
            {filteredFranchises.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>No records match your filters.</td></tr>
            )}
          </TableWrap>
        </>
      )}

      {/* ══════════════════════════════
          SUBSCRIPTION TAB
      ══════════════════════════════ */}
      {activeTab === 'subscription' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <StatCard icon={TrendingUp}  label="Total Revenue"    value="₹4.8L" sub="This year"     color={C.success}  bg="#f0fdf4" />
            <StatCard icon={CheckCircle} label="Active Plans"     value="118"   sub="Across all"   color={C.primary}  bg="#eff6ff" />
            <StatCard icon={AlertCircle} label="Expiring Soon"    value="8"     sub="Within 30d"   color="#d97706"    bg="#fffbeb" />
            <StatCard icon={Users}       label="Expired"          value="14"    sub="Needs renewal" color={C.danger}   bg="#fef2f2" />
          </div>

          <TableWrap headers={['Plan Name', 'Franchises Count', 'Revenue Generated', 'Avg Duration']}>
            {SUBSCRIPTION_ROWS.map(r => (
              <Tr key={r.plan}>
                <Td>
                  <span style={{ fontSize: 13, fontWeight: 700, color: r.plan === 'Enterprise' ? C.primary : r.plan === 'Professional' ? '#7c3aed' : '#6b7280' }}>
                    {r.plan}
                  </span>
                </Td>
                <Td><span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{r.franchises}</span></Td>
                <Td><span style={{ fontSize: 13, fontWeight: 700, color: C.success }}>{r.revenue}</span></Td>
                <Td><span style={{ fontSize: 12, color: '#6b7280' }}>{r.avgDuration}</span></Td>
              </Tr>
            ))}
          </TableWrap>
        </>
      )}

      {/* ══════════════════════════════
          SUPPLIER TAB
      ══════════════════════════════ */}
      {activeTab === 'supplier' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <StatCard icon={Truck}       label="Total Suppliers"     value="24"  sub="Registered"   color={C.primary}  bg="#eff6ff" />
            <StatCard icon={CheckCircle} label="Active"              value="19"  sub="79.2% active" color={C.success}  bg="#f0fdf4" />
            <StatCard icon={AlertCircle} label="Inactive/Suspended"  value="5"   sub="Needs review" color={C.danger}   bg="#fef2f2" />
            <StatCard icon={TrendingUp}  label="Total Orders"        value="385" sub="This month"   color="#d97706"    bg="#fffbeb" />
          </div>

          <TableWrap headers={['Supplier Name', 'Type', 'Status', 'Assigned Franchises', 'Orders Placed', 'Last Activity']}>
            {SUPPLIER_ROWS.map(r => (
              <Tr key={r.name}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.primary}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Truck size={13} color={C.primary} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.name}</span>
                  </div>
                </Td>
                <Td>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 8,
                    background: r.type === 'Distributor' ? '#eff6ff' : '#faf5ff',
                    color: r.type === 'Distributor' ? C.primary : '#7c3aed' }}>
                    {r.type}
                  </span>
                </Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td><span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{r.franchises}</span></Td>
                <Td><span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{r.orders}</span></Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={11} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{r.lastActivity}</span>
                  </div>
                </Td>
              </Tr>
            ))}
          </TableWrap>
        </>
      )}

      {/* ══════════════════════════════
          COMING SOON TABS
      ══════════════════════════════ */}
      {['medicine', 'inventory', 'audit'].includes(activeTab) && (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14,
          padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: `${C.primary}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeTab === 'medicine'   && <Pill size={28} color={C.primary} />}
            {activeTab === 'inventory'  && <Package size={28} color={C.primary} />}
            {activeTab === 'audit'      && <FileText size={28} color={C.primary} />}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0, textTransform: 'capitalize' }}>
            {activeTab} Reports
          </h3>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, textAlign: 'center', maxWidth: 360 }}>
            This report module is currently under development and will be available in the next release.
          </p>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20,
            background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
            Coming Soon
          </span>
        </div>
      )}

    </div>
  )
}
