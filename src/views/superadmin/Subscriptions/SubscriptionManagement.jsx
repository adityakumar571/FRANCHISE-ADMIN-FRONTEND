/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  CreditCard, Plus, Search, Edit2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X, Check, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Bell, TrendingUp, Layers, Ban,
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

const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const PLANS = [
  {
    id: 'PLN-001', name: 'Basic', price: 999, cycle: 'Monthly', limit: 5,
    features: ['Up to 5 franchises', 'Basic inventory', 'Standard support', 'Monthly reports', 'Email notifications'],
    status: 'Active', color: '#6b7280', bg: '#f9fafb',
  },
  {
    id: 'PLN-002', name: 'Professional', price: 2499, cycle: 'Monthly', limit: 25,
    features: ['Up to 25 franchises', 'Advanced inventory', 'Priority support', 'Weekly reports', 'SMS + Email alerts', 'Supplier management', 'API access'],
    status: 'Active', color: '#7c3aed', bg: '#faf5ff', recommended: true,
  },
  {
    id: 'PLN-003', name: 'Enterprise', price: 4999, cycle: 'Monthly', limit: null,
    features: ['Unlimited franchises', 'Full inventory suite', 'Dedicated support', 'Real-time analytics', 'All integrations', 'Custom workflows', 'SLA guarantee', 'White-label option'],
    status: 'Active', color: C.primary, bg: '#eff6ff',
  },
]

const FRANCHISE_SUBS = [
  { id: 'FS-001', franchise: 'MedPlus Pharmacy - Andheri',      plan: 'Enterprise',   status: 'Expiring',   start: '01 Jan 2025', end: '03 Jul 2025', daysLeft: 5 },
  { id: 'FS-002', franchise: 'HealthCare Plus - Koramangala',   plan: 'Professional', status: 'Active',     start: '15 Feb 2025', end: '15 Aug 2025', daysLeft: 48 },
  { id: 'FS-003', franchise: 'Wellness Pharma - Banjara Hills', plan: 'Professional', status: 'Expiring',   start: '01 Mar 2025', end: '10 Jul 2025', daysLeft: 12 },
  { id: 'FS-004', franchise: 'Apollo Medicals - Sector 18',     plan: 'Basic',        status: 'Suspended',  start: '01 Dec 2024', end: '01 Jun 2025', daysLeft: 0 },
  { id: 'FS-005', franchise: 'Shree Ram Medicals - Kothrud',    plan: 'Enterprise',   status: 'Active',     start: '10 Apr 2025', end: '10 Oct 2025', daysLeft: 102 },
  { id: 'FS-006', franchise: 'Lifeline Pharmacy - Vastrapur',   plan: 'Professional', status: 'Expired',    start: '01 Jan 2025', end: '01 Jun 2025', daysLeft: -10 },
  { id: 'FS-007', franchise: 'Jana Aushadhi - Anna Nagar',      plan: 'Basic',        status: 'Active',     start: '20 May 2025', end: '20 Nov 2025', daysLeft: 143 },
  { id: 'FS-008', franchise: 'Raj Medicos - Salt Lake',         plan: 'Professional', status: 'Expiring',   start: '01 Feb 2025', end: '07 Jul 2025', daysLeft: 9 },
  { id: 'FS-009', franchise: 'City Pharmacy - Vijay Nagar',     plan: 'Basic',        status: 'Cancelled',  start: '15 Dec 2024', end: '15 May 2025', daysLeft: -20 },
  { id: 'FS-010', franchise: 'Prime Medicals - Attapur',        plan: 'Professional', status: 'Active',     start: '01 Jun 2025', end: '01 Dec 2025', daysLeft: 184 },
]

const ALERTS = [
  { id: 1, franchise: 'MedPlus Pharmacy - Andheri',      plan: 'Enterprise',   expiry: '03 Jul 2025', daysLeft: 5,  type: 'critical' },
  { id: 2, franchise: 'Raj Medicos - Salt Lake',          plan: 'Professional', expiry: '07 Jul 2025', daysLeft: 9,  type: 'critical' },
  { id: 3, franchise: 'Wellness Pharma - Banjara Hills', plan: 'Professional', expiry: '10 Jul 2025', daysLeft: 12, type: 'warning'  },
  { id: 4, franchise: 'Sai Baba Medicals - Miyapur',     plan: 'Basic',        expiry: '18 Jul 2025', daysLeft: 20, type: 'warning'  },
  { id: 5, franchise: 'Ganesh Drug House - Wakad',       plan: 'Professional', expiry: '25 Jul 2025', daysLeft: 27, type: 'reminder' },
  { id: 6, franchise: 'Apollo Medicals - Sector 18',     plan: 'Basic',        expiry: '01 Jun 2025', daysLeft: -10, type: 'expired' },
  { id: 7, franchise: 'Lifeline Pharmacy - Vastrapur',   plan: 'Professional', expiry: '01 Jun 2025', daysLeft: -10, type: 'expired' },
  { id: 8, franchise: 'Jana Aushadhi - Anna Nagar',      plan: 'Basic',        expiry: '20 Nov 2025', daysLeft: 143, type: 'renewal' },
]

const PLAN_FEATURES_ALL = [
  'Inventory Management', 'Supplier Management', 'Franchise Reports',
  'API Access', 'Email Notifications', 'SMS Alerts', 'Analytics Dashboard', 'Custom Workflows',
]

/* ─────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────── */
const SubStatusBadge = ({ status }) => {
  const map = {
    Active:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Expiring:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    Expired:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    Suspended: { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
    Cancelled: { bg: '#f9fafb', color: '#9ca3af', border: '#f3f4f6' },
  }
  const s = map[status] || map.Suspended
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}

const DaysLeftBadge = ({ days }) => {
  const color = days < 0 ? '#dc2626' : days < 7 ? '#dc2626' : days < 30 ? '#d97706' : '#16a34a'
  const bg    = days < 0 ? '#fef2f2' : days < 7 ? '#fef2f2' : days < 30 ? '#fffbeb' : '#f0fdf4'
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8, background: bg, color }}>
      {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
    </span>
  )
}

/* ─────────────────────────────────────────────
   PLAN CARD
───────────────────────────────────────────── */
const PlanCard = ({ plan, onEdit, onToggle }) => (
  <div style={{ background: '#fff', border: `2px solid ${plan.recommended ? plan.color : C.border}`,
    borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
    {plan.recommended && (
      <div style={{ position: 'absolute', top: 12, right: 12, background: C.accent, color: '#000',
        fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Popular
      </div>
    )}
    <div style={{ padding: '20px 20px 14px', background: plan.bg, borderBottom: `1px solid ${plan.color}20` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: plan.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CreditCard size={18} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>{plan.name}</h3>
          <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{plan.id}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: plan.color }}>₹{plan.price.toLocaleString()}</span>
        <span style={{ fontSize: 12, color: '#6b7280' }}>/{plan.cycle === 'Monthly' ? 'mo' : 'yr'}</span>
      </div>
      <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>
        {plan.limit ? `Up to ${plan.limit} franchises` : 'Unlimited franchises'}
      </p>
    </div>
    <div style={{ padding: '14px 20px' }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <CheckCircle size={13} color={plan.color} />
            <span style={{ fontSize: 12, color: '#374151' }}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
    <div style={{ display: 'flex', gap: 8, padding: '0 20px 18px' }}>
      <button onClick={() => onEdit(plan)}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '8px 0', borderRadius: 8, border: `1px solid ${C.border}`,
          background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
        <Edit2 size={12} /> Edit
      </button>
      <button onClick={() => onToggle(plan.id)}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '8px 0', borderRadius: 8, border: 'none',
          background: plan.status === 'Active' ? '#fef2f2' : '#f0fdf4',
          fontSize: 12, fontWeight: 600,
          color: plan.status === 'Active' ? C.danger : C.success, cursor: 'pointer' }}>
        {plan.status === 'Active' ? <><Ban size={12} /> Deactivate</> : <><CheckCircle size={12} /> Activate</>}
      </button>
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function SubscriptionManagement() {
  const [activeTab, setActiveTab]       = useState('Plans')
  const [plans, setPlans]               = useState(PLANS)
  const [subs, setSubs]                 = useState(FRANCHISE_SUBS)
  const [subSearch, setSubSearch]       = useState('')
  const [subStatus, setSubStatus]       = useState('All')
  const [page, setPage]                 = useState(1)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editPlan, setEditPlan]         = useState(null)

  const [planForm, setPlanForm] = useState({
    name: '', description: '', price: '', cycle: 'Monthly',
    limit: '', features: [], statusOn: true,
  })

  const PER_PAGE = 6
  const TABS = ['Plans', 'Franchise Subscriptions', 'Alerts']

  /* ── filter subs ── */
  const filteredSubs = subs.filter(s => {
    const q = subSearch.toLowerCase()
    return (!q || s.franchise.toLowerCase().includes(q)) &&
      (subStatus === 'All' || s.status === subStatus)
  })
  const totalPages = Math.ceil(filteredSubs.length / PER_PAGE)
  const pageSubs   = filteredSubs.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openCreatePlan = () => {
    setEditPlan(null)
    setPlanForm({ name: '', description: '', price: '', cycle: 'Monthly', limit: '', features: [], statusOn: true })
    setShowPlanModal(true)
  }

  const openEditPlan = (plan) => {
    setEditPlan(plan)
    setPlanForm({ name: plan.name, description: '', price: String(plan.price), cycle: plan.cycle, limit: plan.limit ? String(plan.limit) : '', features: [], statusOn: plan.status === 'Active' })
    setShowPlanModal(true)
  }

  const togglePlanStatus = (id) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p))
  }

  const handlePlanSave = () => {
    if (!planForm.name || !planForm.price) return
    if (editPlan) {
      setPlans(prev => prev.map(p => p.id === editPlan.id
        ? { ...p, name: planForm.name, price: Number(planForm.price), cycle: planForm.cycle, limit: planForm.limit ? Number(planForm.limit) : null, status: planForm.statusOn ? 'Active' : 'Inactive' }
        : p))
    } else {
      const newPlan = {
        id: `PLN-${String(plans.length + 1).padStart(3, '0')}`,
        name: planForm.name, price: Number(planForm.price), cycle: planForm.cycle,
        limit: planForm.limit ? Number(planForm.limit) : null,
        features: planForm.features.length ? planForm.features : ['Basic features'],
        status: planForm.statusOn ? 'Active' : 'Inactive',
        color: '#6b7280', bg: '#f9fafb',
      }
      setPlans(prev => [...prev, newPlan])
    }
    setShowPlanModal(false)
  }

  const toggleFeature = (f) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f],
    }))
  }

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13, background: C.bg, minHeight: '100vh', padding: 4 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: C.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={20} color={C.accent} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Subscription Management</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage SaaS plans and franchise subscriptions</p>
          </div>
        </div>
        <button onClick={openCreatePlan}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: '#fff',
            border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> Create Plan
        </button>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display: 'flex', gap: 2, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, marginBottom: 18, width: 'fit-content' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '7px 18px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeTab === tab ? C.primary : 'transparent',
              color: activeTab === tab ? '#fff' : '#6b7280' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          TAB: PLANS
      ══════════════════════════════ */}
      {activeTab === 'Plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} onEdit={openEditPlan} onToggle={togglePlanStatus} />
          ))}
        </div>
      )}

      {/* ══════════════════════════════
          TAB: FRANCHISE SUBSCRIPTIONS
      ══════════════════════════════ */}
      {activeTab === 'Franchise Subscriptions' && (
        <>
          {/* Filter */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px',
            display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
              <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={subSearch} onChange={e => { setSubSearch(e.target.value); setPage(1) }}
                placeholder="Search franchise…"
                style={{ ...inputStyle, paddingLeft: 32, width: '100%' }} />
            </div>
            <select value={subStatus} onChange={e => { setSubStatus(e.target.value); setPage(1) }}
              style={{ ...inputStyle, width: 'auto', minWidth: 150, cursor: 'pointer' }}>
              {['All', 'Active', 'Expiring', 'Expired', 'Suspended', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Franchise Name', 'Current Plan', 'Status', 'Start Date', 'End Date', 'Days Remaining', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: 10, color: '#6b7280', fontWeight: 700,
                        textTransform: 'uppercase', textAlign: 'left', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageSubs.map(s => (
                    <tr key={s.id}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                      style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{s.franchise}</p>
                        <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>{s.id}</p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
                          background: s.plan === 'Enterprise' ? '#eff6ff' : s.plan === 'Professional' ? '#faf5ff' : '#f9fafb',
                          color: s.plan === 'Enterprise' ? C.primary : s.plan === 'Professional' ? '#7c3aed' : '#6b7280',
                          border: `1px solid ${s.plan === 'Enterprise' ? '#bfdbfe' : s.plan === 'Professional' ? '#e9d5ff' : C.border}` }}>
                          {s.plan}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}><SubStatusBadge status={s.status} /></td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#374151' }}>{s.start}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#374151' }}>{s.end}</td>
                      <td style={{ padding: '11px 14px' }}><DaysLeftBadge days={s.daysLeft} /></td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button style={{ padding: '4px 9px', borderRadius: 6, border: `1px solid #bbf7d0`,
                            background: '#f0fdf4', color: C.success, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            Renew
                          </button>
                          <button style={{ padding: '4px 9px', borderRadius: 6, border: `1px solid #bfdbfe`,
                            background: '#eff6ff', color: C.primary, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            Upgrade
                          </button>
                          <button style={{ padding: '4px 9px', borderRadius: 6, border: `1px solid #fecaca`,
                            background: '#fef2f2', color: C.danger, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                Showing {Math.min((page - 1) * PER_PAGE + 1, filteredSubs.length)}–{Math.min(page * PER_PAGE, filteredSubs.length)} of {filteredSubs.length}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${n === page ? C.primary : C.border}`,
                      background: n === page ? C.primary : '#fff', color: n === page ? '#fff' : '#374151',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════
          TAB: ALERTS
      ══════════════════════════════ */}
      {activeTab === 'Alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ALERTS.map(alert => {
            const isExpired  = alert.daysLeft < 0
            const isCritical = !isExpired && alert.daysLeft < 7
            const isWarning  = !isExpired && alert.daysLeft >= 7 && alert.daysLeft < 30
            const dotColor   = isExpired ? '#9ca3af' : isCritical ? C.danger : isWarning ? '#d97706' : C.success
            const bgRow      = isExpired ? '#fafafa' : isCritical ? '#fff8f8' : isWarning ? '#fffdf0' : '#f0fdf4'
            return (
              <div key={alert.id} style={{ background: '#fff', border: `1px solid ${isExpired ? C.border : isCritical ? '#fecaca' : isWarning ? '#fde68a' : '#bbf7d0'}`,
                borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: dotColor + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isExpired ? <XCircle size={18} color="#9ca3af" /> : isCritical ? <AlertTriangle size={18} color={C.danger} /> : <Bell size={18} color={dotColor} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{alert.franchise}</p>
                    <p style={{ fontSize: 11, color: '#6b7280', margin: '3px 0 0' }}>
                      Plan: <strong>{alert.plan}</strong> · Expiry: {alert.expiry}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <DaysLeftBadge days={alert.daysLeft} />
                  <button style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${dotColor}40`,
                    background: dotColor + '12', color: dotColor, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {isExpired ? 'Renew' : 'Send Reminder'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══════════════════════════════
          CREATE / EDIT PLAN MODAL
      ═══════════════════════════════ */}
      {showPlanModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>
                {editPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button onClick={() => setShowPlanModal(false)}
                style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`,
                  background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} color="#6b7280" />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Plan Name *</label>
                  <input value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Professional Plus" style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Brief plan description…"
                    style={{ ...inputStyle, width: '100%', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Price (₹) *</label>
                  <input type="number" value={planForm.price} onChange={e => setPlanForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="1999" style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div>
                  <label style={labelStyle}>Billing Cycle</label>
                  <select value={planForm.cycle} onChange={e => setPlanForm(f => ({ ...f, cycle: e.target.value }))}
                    style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}>
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Franchise Limit (blank = unlimited)</label>
                  <input type="number" value={planForm.limit} onChange={e => setPlanForm(f => ({ ...f, limit: e.target.value }))}
                    placeholder="e.g. 25 (or blank)" style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Status: Active</label>
                  <button onClick={() => setPlanForm(f => ({ ...f, statusOn: !f.statusOn }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {planForm.statusOn
                      ? <ToggleRight size={28} color={C.success} />
                      : <ToggleLeft size={28} color="#9ca3af" />}
                  </button>
                </div>
              </div>

              {/* Feature Mapping */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Feature Mapping</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {PLAN_FEATURES_ALL.map(f => {
                    const sel = planForm.features.includes(f)
                    return (
                      <label key={f} onClick={() => toggleFeature(f)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px',
                          borderRadius: 8, border: `1px solid ${sel ? C.primary : C.border}`,
                          background: sel ? `${C.primary}08` : '#fafafa', cursor: 'pointer' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? C.primary : '#d1d5db'}`,
                          background: sel ? C.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: 12, color: sel ? C.primary : '#374151', fontWeight: 500 }}>{f}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowPlanModal(false)}
                  style={{ padding: '9px 20px', borderRadius: 8, border: `1px solid ${C.border}`,
                    background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handlePlanSave}
                  style={{ padding: '9px 22px', borderRadius: 8, border: 'none',
                    background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {editPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
