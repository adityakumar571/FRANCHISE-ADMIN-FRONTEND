/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard, Plus, Search, Edit2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X, Check, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Bell, Layers, Ban, Save,
} from 'lucide-react'
import { getRequest, postRequest, putRequest, patchRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

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

const PLAN_FEATURES_ALL = [
  'Inventory Management', 'Supplier Management', 'Franchise Reports',
  'API Access', 'Email Notifications', 'SMS Alerts', 'Analytics Dashboard', 'Custom Workflows',
]

/* ─── Status Badges ── */
const SubStatusBadge = ({ status }) => {
  const map = {
    Active:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    ACTIVE:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Expiring:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    Expired:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    EXPIRED:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    Suspended: { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
    Cancelled: { bg: '#f9fafb', color: '#9ca3af', border: '#f3f4f6' },
    TRIAL:     { bg: '#fef9c3', color: '#b45309', border: '#fde68a' },
    PENDING:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  }
  const s = map[status] || map.Suspended
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{status}</span>
  )
}

const DaysLeftBadge = ({ days }) => {
  if (days === undefined || days === null) return <span style={{ color: '#9ca3af', fontSize: 11 }}>—</span>
  const color = days < 0 ? '#dc2626' : days < 7 ? '#dc2626' : days < 30 ? '#d97706' : '#16a34a'
  const bg    = days < 0 ? '#fef2f2' : days < 7 ? '#fef2f2' : days < 30 ? '#fffbeb' : '#f0fdf4'
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8, background: bg, color }}>
      {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
    </span>
  )
}

/* ─── Plan Card ── */
const PlanCard = ({ plan, onEdit, onToggle }) => (
  <div style={{ background: '#fff', border: `2px solid ${plan.recommended ? C.primary : C.border}`,
    borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
    {plan.recommended && (
      <div style={{ position: 'absolute', top: 12, right: 12, background: C.accent, color: '#000',
        fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>Popular</div>
    )}
    <div style={{ padding: '20px 20px 14px', background: '#f8f9fb', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: C.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CreditCard size={18} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>{plan.name}</h3>
          <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{plan.billingCycle}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: C.primary }}>₹{Number(plan.price).toLocaleString()}</span>
        <span style={{ fontSize: 12, color: '#6b7280' }}>/{plan.billingCycle === 'Monthly' ? 'mo' : 'yr'}</span>
      </div>
      <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>
        {plan.studentLimit ? `Up to ${plan.studentLimit} franchises` : 'Unlimited franchises'}
      </p>
    </div>
    <div style={{ padding: '14px 20px' }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {(plan.features || []).slice(0, 6).map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <CheckCircle size={13} color={C.primary} />
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
      <button onClick={() => onToggle(plan._id)}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '8px 0', borderRadius: 8, border: 'none',
          background: plan.isActive ? '#fef2f2' : '#f0fdf4',
          fontSize: 12, fontWeight: 600,
          color: plan.isActive ? C.danger : C.success, cursor: 'pointer' }}>
        {plan.isActive ? <><Ban size={12} /> Deactivate</> : <><CheckCircle size={12} /> Activate</>}
      </button>
    </div>
  </div>
)

const EMPTY_PLAN_FORM = { name: '', description: '', price: '', cycle: 'Monthly', limit: '', features: [], statusOn: true }

export default function SubscriptionManagement() {
  const [activeTab, setActiveTab]         = useState('Plans')
  const [plans, setPlans]                 = useState([])
  const [plansLoading, setPlansLoading]   = useState(false)
  const [subs, setSubs]                   = useState([])
  const [subsTotal, setSubsTotal]         = useState(0)
  const [subsLoading, setSubsLoading]     = useState(false)
  const [subSearch, setSubSearch]         = useState('')
  const [draftSearch, setDraftSearch]     = useState('')
  const [subStatus, setSubStatus]         = useState('All')
  const [page, setPage]                   = useState(1)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editPlan, setEditPlan]           = useState(null)
  const [planForm, setPlanForm]           = useState(EMPTY_PLAN_FORM)
  const [planSubmitting, setPlanSubmitting] = useState(false)

  const PER_PAGE = 8
  const TABS = ['Plans', 'Franchise Subscriptions', 'Alerts']

  /* ── Fetch Plans ── */
  const fetchPlans = useCallback(async () => {
    setPlansLoading(true)
    try {
      const res = await getRequest('subscriptionPlan?isPagination=false')
      setPlans(res?.data?.data?.plans || [])
    } catch (err) {
      console.error('[SubscriptionMgmt] plans error:', err)
      toast.error('Failed to load plans')
    } finally {
      setPlansLoading(false)
    }
  }, [])

  /* ── Fetch Franchise Subscriptions ── */
  const fetchSubs = useCallback(async () => {
    setSubsLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE })
      if (subSearch) params.append('search', subSearch)

      const res  = await getRequest(`subscription?${params.toString()}`)
      const data = res?.data?.data
      setSubs(data?.subscriptions || data?.data || [])
      setSubsTotal(data?.total || 0)
    } catch (err) {
      console.error('[SubscriptionMgmt] subs error:', err)
      setSubs([])
    } finally {
      setSubsLoading(false)
    }
  }, [page, subSearch])

  useEffect(() => {
    if (activeTab === 'Plans') fetchPlans()
    if (activeTab === 'Franchise Subscriptions') fetchSubs()
    if (activeTab === 'Alerts') fetchSubs()
  }, [activeTab, fetchPlans, fetchSubs])

  /* ── Toggle Plan Status ── */
  const handleTogglePlan = async (id) => {
    try {
      await patchRequest({ url: `subscriptionPlan/${id}/toggle`, cred: {} })
      toast.success('Plan status updated')
      fetchPlans()
    } catch { toast.error('Failed to update plan') }
  }

  /* ── Open create/edit modal ── */
  const openCreatePlan = () => {
    setEditPlan(null)
    setPlanForm(EMPTY_PLAN_FORM)
    setShowPlanModal(true)
  }
  const openEditPlan = (plan) => {
    setEditPlan(plan)
    setPlanForm({
      name:        plan.name        || '',
      description: plan.description || '',
      price:       String(plan.price ?? ''),
      cycle:       plan.billingCycle || 'Monthly',
      limit:       plan.studentLimit ? String(plan.studentLimit) : '',
      features:    plan.features    || [],
      statusOn:    plan.isActive !== false,
    })
    setShowPlanModal(true)
  }

  /* ── Save Plan ── */
  const handlePlanSave = async () => {
    if (!planForm.name.trim() || !planForm.price) {
      toast.error('Plan name and price are required')
      return
    }
    setPlanSubmitting(true)
    try {
      const body = {
        name:         planForm.name.trim(),
        description:  planForm.description,
        price:        Number(planForm.price),
        billingCycle: planForm.cycle,
        studentLimit: planForm.limit ? Number(planForm.limit) : 999999,
        features:     planForm.features,
        isActive:     planForm.statusOn,
      }
      if (editPlan) {
        await putRequest({ url: `subscriptionPlan/${editPlan._id}`, cred: body })
        toast.success('Plan updated successfully')
      } else {
        await postRequest({ url: 'subscriptionPlan', cred: body })
        toast.success('Plan created successfully')
      }
      setShowPlanModal(false)
      fetchPlans()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed')
    } finally {
      setPlanSubmitting(false)
    }
  }

  const toggleFeature = (f) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f],
    }))
  }

  /* ── Filter subs client-side ── */
  const filteredSubs = subs.filter(s => {
    if (subStatus === 'All') return true
    return (s.status || '').toUpperCase() === subStatus.toUpperCase()
  })
  const totalPages = Math.ceil(subsTotal / PER_PAGE)

  /* ── Expiring soon alerts from subs ── */
  const now = new Date()
  const alerts = subs.filter(s => {
    const end = s.currentPlan?.endDate ? new Date(s.currentPlan.endDate) : null
    if (!end) return false
    const days = Math.ceil((end - now) / 86400000)
    return days <= 30
  }).map(s => {
    const end  = new Date(s.currentPlan.endDate)
    const days = Math.ceil((end - now) / 86400000)
    return { ...s, daysLeft: days, expiryStr: end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  }).sort((a, b) => a.daysLeft - b.daysLeft)

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { if (activeTab === 'Plans') fetchPlans(); else fetchSubs() }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff',
              border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 14px',
              fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          {activeTab === 'Plans' && (
            <button onClick={openCreatePlan}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: '#fff',
                border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={15} /> Create Plan
            </button>
          )}
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display: 'flex', gap: 2, background: '#fff', border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 4, marginBottom: 18, width: 'fit-content' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1) }}
            style={{ padding: '7px 18px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeTab === tab ? C.primary : 'transparent',
              color: activeTab === tab ? '#fff' : '#6b7280' }}>
            {tab}
            {tab === 'Alerts' && alerts.length > 0 && (
              <span style={{ marginLeft: 6, background: C.danger, color: '#fff',
                fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 10 }}>
                {alerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════
          TAB: PLANS
      ══════════════════════════ */}
      {activeTab === 'Plans' && (
        plansLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, height: 300 }}>
                <div style={{ height: '40%', background: '#f3f4f6', borderRadius: '14px 14px 0 0' }} />
                <div style={{ padding: 20 }}>
                  {[80, 60, 60].map((w, j) => <div key={j} style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 10, width: `${w}%` }} />)}
                </div>
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <Layers size={40} style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No plans yet</p>
            <p style={{ fontSize: 13, margin: '6px 0 16px' }}>Create your first subscription plan</p>
            <button onClick={openCreatePlan}
              style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={14} style={{ marginRight: 6 }} />Create Plan
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {plans.map(plan => (
              <PlanCard key={plan._id} plan={plan} onEdit={openEditPlan} onToggle={handleTogglePlan} />
            ))}
          </div>
        )
      )}

      {/* ══════════════════════════
          TAB: FRANCHISE SUBSCRIPTIONS
      ══════════════════════════ */}
      {activeTab === 'Franchise Subscriptions' && (
        <>
          {/* Filter */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
              <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={draftSearch}
                onChange={e => setDraftSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSubSearch(draftSearch); setPage(1) } }}
                onBlur={() => { if (draftSearch !== subSearch) { setSubSearch(draftSearch); setPage(1) } }}
                placeholder="Search franchise… (Enter)"
                style={{ ...inputStyle, paddingLeft: 32, width: '100%' }} />
            </div>
            <select value={subStatus} onChange={e => { setSubStatus(e.target.value); setPage(1) }}
              style={{ ...inputStyle, width: 'auto', minWidth: 150, cursor: 'pointer' }}>
              {['All', 'ACTIVE', 'TRIAL', 'PENDING', 'EXPIRED'].map(s => <option key={s}>{s}</option>)}
            </select>
            {(subSearch || subStatus !== 'All') && (
              <button onClick={() => { setDraftSearch(''); setSubSearch(''); setSubStatus('All'); setPage(1) }}
                style={{ fontSize: 12, color: C.danger, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear</button>
            )}
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Franchise', 'Plan', 'Status', 'Start Date', 'End Date', 'Days Remaining'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: 10, color: '#6b7280', fontWeight: 700,
                        textTransform: 'uppercase', textAlign: 'left', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={7} style={{ padding: '12px 14px' }}>
                        <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} />
                      </td></tr>
                    ))
                  ) : filteredSubs.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                      No subscriptions found
                    </td></tr>
                  ) : filteredSubs.map((s, i) => {
                    const endDate   = s.currentPlan?.endDate ? new Date(s.currentPlan.endDate) : null
                    const startDate = s.currentPlan?.startDate ? new Date(s.currentPlan.startDate) : null
                    const daysLeft  = endDate ? Math.ceil((endDate - now) / 86400000) : null

                    return (
                      <tr key={s._id}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                        style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '11px 14px', fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
                          {(page - 1) * PER_PAGE + i + 1}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>
                            {s.tenantId?.schoolName || s.franchiseName || '—'}
                          </p>
                          <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>
                            {s.tenantId?.subdomain || ''}
                          </p>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
                            background: '#eff6ff', color: C.primary, border: '1px solid #bfdbfe' }}>
                            {s.currentPlan?.name || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px' }}><SubStatusBadge status={s.status || '—'} /></td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#374151' }}>
                          {startDate ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#374151' }}>
                          {endDate ? endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '11px 14px' }}><DaysLeftBadge days={daysLeft} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {subsTotal > 0 ? `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, subsTotal)} of ${subsTotal}` : '0 results'}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, page - 2)
                  const n = start + i
                  if (n > totalPages) return null
                  return (
                    <button key={n} onClick={() => setPage(n)}
                      style={{ width: 30, height: 30, borderRadius: 7,
                        border: `1px solid ${n === page ? C.primary : C.border}`,
                        background: n === page ? C.primary : '#fff',
                        color: n === page ? '#fff' : '#374151',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
                  style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                    opacity: (page === totalPages || totalPages === 0) ? 0.4 : 1 }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════
          TAB: ALERTS
      ══════════════════════════ */}
      {activeTab === 'Alerts' && (
        subsLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
            <RefreshCw size={20} style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }} />
            Loading alerts…
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <CheckCircle size={40} color="#16a34a" style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No alerts right now</p>
            <p style={{ fontSize: 13, margin: '6px 0 0' }}>All subscriptions are healthy for the next 30 days</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((alert, i) => {
              const isExpired  = alert.daysLeft < 0
              const isCritical = !isExpired && alert.daysLeft < 7
              const isWarning  = !isExpired && alert.daysLeft >= 7 && alert.daysLeft < 30
              const dotColor   = isExpired ? '#9ca3af' : isCritical ? C.danger : isWarning ? '#d97706' : C.success
              return (
                <div key={alert._id || i} style={{ background: '#fff',
                  border: `1px solid ${isExpired ? C.border : isCritical ? '#fecaca' : isWarning ? '#fde68a' : '#bbf7d0'}`,
                  borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: dotColor + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isExpired ? <XCircle size={18} color="#9ca3af" /> : isCritical ? <AlertTriangle size={18} color={C.danger} /> : <Bell size={18} color={dotColor} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>
                        {alert.tenantId?.schoolName || alert.franchiseName || '—'}
                      </p>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: '3px 0 0' }}>
                        Plan: <strong>{alert.currentPlan?.name || '—'}</strong> · Expiry: {alert.expiryStr}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <DaysLeftBadge days={alert.daysLeft} />
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 8,
                      border: `1px solid ${dotColor}40`, background: dotColor + '12', color: dotColor }}>
                      {isExpired ? 'Expired' : isCritical ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ══════════════════════════
          CREATE / EDIT PLAN MODAL
      ══════════════════════════ */}
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
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Active</label>
                  <button onClick={() => setPlanForm(f => ({ ...f, statusOn: !f.statusOn }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {planForm.statusOn
                      ? <ToggleRight size={28} color={C.success} />
                      : <ToggleLeft  size={28} color="#9ca3af" />}
                  </button>
                </div>
              </div>

              {/* Features */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Features</label>
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
                <button onClick={handlePlanSave} disabled={planSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 8,
                    border: 'none', background: planSubmitting ? '#6fa3d0' : C.primary,
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: planSubmitting ? 'not-allowed' : 'pointer' }}>
                  <Save size={14} />
                  {planSubmitting ? 'Saving…' : editPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
