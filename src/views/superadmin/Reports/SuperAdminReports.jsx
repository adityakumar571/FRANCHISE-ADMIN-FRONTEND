/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import {
  BarChart2, Download, Building2, CreditCard, Truck, Pill,
  Package, FileText, TrendingUp, Users, AlertCircle, CheckCircle,
  MapPin, Calendar, Search, Clock, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

/* ─── palette ─── */
const C = {
  primary: '#0c3b73', accent: '#fabf22', success: '#16a34a',
  danger: '#dc2626', border: '#e5e7eb', bg: '#f8f9fb',
}

const inputStyle = {
  border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px',
  fontSize: 13, color: '#374151', outline: 'none', background: '#fff',
  fontFamily: 'Inter, -apple-system, sans-serif', boxSizing: 'border-box',
}

/* ─── helpers ─── */
const fmt  = (n)  => (n || 0).toLocaleString('en-IN')
const fmtC = (n)  => `₹${fmt(n)}`
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const timeAgo = (d) => {
  if (!d) return '—'
  const diff = Math.floor((Date.now() - new Date(d)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/* ─── shared primitives ─── */
const StatCard = ({ icon: Icon, label, value, sub, color, bg, loading }) => (
  <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '16px 20px', flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 44, height: 44, borderRadius: 11, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
        {loading ? <span style={{ display: 'inline-block', width: 48, height: 20, background: '#f3f4f6', borderRadius: 6 }} /> : value}
      </p>
      <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0', fontWeight: 500 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{loading ? '…' : sub}</p>}
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
    true:      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    false:     { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  }
  const key = String(status)
  const s   = map[key] || map.Inactive
  const label = key === 'true' ? 'Active' : key === 'false' ? 'Inactive' : status
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {label}
    </span>
  )
}

const TableWrap = ({ headers, children, loading, colSpan, emptyMsg = 'No data' }) => (
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
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {headers.map((_, j) => (
                  <td key={j} style={{ padding: '13px 14px', borderBottom: `1px solid #f3f4f6` }}>
                    <div style={{ height: 12, borderRadius: 6, background: '#f3f4f6', width: j === 1 ? '70%' : '50%' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : children}
        </tbody>
      </table>
    </div>
  </div>
)

const Tr = ({ children, onClick }) => {
  const [hover, setHover] = useState(false)
  return (
    <tr onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick}
      style={{ borderBottom: '1px solid #f3f4f6', background: hover ? '#f8f9fb' : '#fff', transition: 'background .1s', cursor: onClick ? 'pointer' : 'default' }}>
      {children}
    </tr>
  )
}
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 14px', ...style }}>{children}</td>
)

/* ─── pagination bar ─── */
const PaginationBar = ({ page, totalPages, total, perPage, setPage }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
    <span style={{ fontSize: 12, color: '#6b7280' }}>
      {total === 0 ? 'No records' : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}`}
    </span>
    <div style={{ display: 'flex', gap: 4 }}>
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
        style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
        <ChevronLeft size={14} />
      </button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const n = totalPages <= 7 ? i + 1 : i === 0 ? 1 : i === 6 ? totalPages : page - 3 + i
        return (
          <button key={n} onClick={() => setPage(n)}
            style={{ width: 30, height: 30, borderRadius: 7,
              border: `1px solid ${n === page ? C.primary : C.border}`,
              background: n === page ? C.primary : '#fff',
              color: n === page ? '#fff' : '#374151',
              fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
        )
      })}
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
        style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
)

const TABS = [
  { key: 'franchise',    label: 'Franchise',    icon: Building2 },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
  { key: 'supplier',     label: 'Supplier',     icon: Truck },
  { key: 'medicine',     label: 'Medicine',     icon: Pill },
  { key: 'inventory',    label: 'Inventory',    icon: Package },
  { key: 'audit',        label: 'Audit',        icon: FileText },
]

const PLAN_COLORS = {
  Enterprise:   { color: C.primary,   bg: '#eff6ff' },
  Professional: { color: '#7c3aed',   bg: '#faf5ff' },
  Basic:        { color: '#6b7280',   bg: '#f9fafb' },
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function SuperAdminReports() {
  const [activeTab, setActiveTab] = useState('franchise')

  /* ── shared loading ── */
  const [dashLoading, setDashLoading] = useState(false)
  const [dashboard,   setDashboard]   = useState(null)

  /* ── franchise tab ── */
  const [franchises,      setFranchises]      = useState([])
  const [franchiseTotal,  setFranchiseTotal]  = useState(0)
  const [franchisePage,   setFranchisePage]   = useState(1)
  const [franchisePages,  setFranchisePages]  = useState(1)
  const [franchiseLoading,setFranchiseLoading]= useState(false)
  const [fFilters, setFFilters] = useState({ search: '', state: 'All', status: 'All' })

  /* ── subscription tab ── */
  const [planDist,     setPlanDist]     = useState([])
  const [subscriptions,setSubscriptions]= useState([])
  const [subTotal,     setSubTotal]     = useState(0)
  const [subPage,      setSubPage]      = useState(1)
  const [subPages,     setSubPages]     = useState(1)
  const [subLoading,   setSubLoading]   = useState(false)

  /* ── supplier tab ── */
  const [suppliers,     setSuppliers]     = useState([])
  const [supplierTotal, setSupplierTotal] = useState(0)
  const [supplierPage,  setSupplierPage]  = useState(1)
  const [supplierPages, setSupplierPages] = useState(1)
  const [supplierLoading,setSupplierLoading] = useState(false)
  const [supplierSearch, setSupplierSearch]  = useState('')

  const PER = 10

  /* ── load dashboard stats once ── */
  useEffect(() => {
    setDashLoading(true)
    getRequest('saas/dashboard')
      .then(res => setDashboard(res?.data?.data || null))
      .catch(() => toast.error('Dashboard load failed'))
      .finally(() => setDashLoading(false))
  }, [])

  /* ── franchise fetch ── */
  const fetchFranchises = useCallback(() => {
    setFranchiseLoading(true)
    const p = new URLSearchParams({ page: franchisePage, limit: PER })
    if (fFilters.search)          p.set('search', fFilters.search)
    if (fFilters.status !== 'All') p.set('isActive', fFilters.status === 'Active' ? 'true' : 'false')
    getRequest(`schools?${p}`)
      .then(res => {
        const d = res?.data?.data
        const list = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []
        setFranchises(list)
        setFranchiseTotal(d?.total || list.length)
        setFranchisePages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load franchises'))
      .finally(() => setFranchiseLoading(false))
  }, [franchisePage, fFilters])

  useEffect(() => { if (activeTab === 'franchise') fetchFranchises() }, [activeTab, fetchFranchises])

  /* ── subscription fetch ── */
  const fetchSubscriptions = useCallback(() => {
    setSubLoading(true)
    getRequest(`subscription?page=${subPage}&limit=${PER}`)
      .then(res => {
        const d = res?.data?.data
        const list = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []
        setSubscriptions(list)
        setSubTotal(d?.total || list.length)
        setSubPages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load subscriptions'))
      .finally(() => setSubLoading(false))
  }, [subPage])

  useEffect(() => { if (activeTab === 'subscription') fetchSubscriptions() }, [activeTab, fetchSubscriptions])

  /* ── supplier fetch ── */
  const fetchSuppliers = useCallback(() => {
    setSupplierLoading(true)
    const p = new URLSearchParams({ page: supplierPage, limit: PER })
    if (supplierSearch) p.set('search', supplierSearch)
    getRequest(`distributor/all?${p}`)
      .then(res => {
        const d = res?.data?.data
        const list = Array.isArray(d?.data) ? d.data : Array.isArray(d?.distributors) ? d.distributors : Array.isArray(d) ? d : []
        setSuppliers(list)
        setSupplierTotal(d?.total || list.length)
        setSupplierPages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load suppliers'))
      .finally(() => setSupplierLoading(false))
  }, [supplierPage, supplierSearch])

  useEffect(() => { if (activeTab === 'supplier') fetchSuppliers() }, [activeTab, fetchSuppliers])

  /* ── plan distribution from dashboard ── */
  useEffect(() => {
    if (dashboard?.planDistribution) setPlanDist(dashboard.planDistribution)
  }, [dashboard])

  /* ── stat helpers ── */
  const d = dashboard
  const totalRevenue = d?.subscriptions?.totalRevenue || 0

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
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Reports &amp; Analytics</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Comprehensive insights across your franchise network</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              if (activeTab === 'franchise')    fetchFranchises()
              if (activeTab === 'subscription') fetchSubscriptions()
              if (activeTab === 'supplier')     fetchSuppliers()
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#374151',
              border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.success, color: '#fff',
            border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Download size={15} /> Export Report
          </button>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, background: '#fff', border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 4, marginBottom: 18, width: 'fit-content' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 7, border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: activeTab === key ? C.primary : 'transparent',
              color:      activeTab === key ? '#fff' : '#6b7280' }}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════
          FRANCHISE TAB
      ════════════════════════════════ */}
      {activeTab === 'franchise' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <StatCard icon={Building2}   label="Total Registered" value={fmt(d?.franchises?.total   || 0)} sub={`+${fmt(d?.franchises?.thisMonth || 0)} this month`} color={C.primary}  bg="#eff6ff" loading={dashLoading} />
            <StatCard icon={CheckCircle} label="Active"           value={fmt(d?.franchises?.active  || 0)} sub={d?.franchises?.total ? `${Math.round((d.franchises.active / d.franchises.total) * 100)}% active` : ''} color={C.success} bg="#f0fdf4" loading={dashLoading} />
            <StatCard icon={TrendingUp}  label="New This Month"   value={fmt(d?.franchises?.thisMonth || 0)} color="#d97706" bg="#fffbeb" loading={dashLoading} />
            <StatCard icon={AlertCircle} label="Inactive"         value={fmt(d?.franchises?.inactive || 0)} color={C.danger} bg="#fef2f2" loading={dashLoading} />
          </div>

          {/* Filters */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px',
            display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
              <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={fFilters.search}
                onChange={e => { setFFilters(f => ({ ...f, search: e.target.value })); setFranchisePage(1) }}
                placeholder="Search franchise name…"
                style={{ ...inputStyle, paddingLeft: 32, width: '100%' }} />
            </div>
            <select value={fFilters.status}
              onChange={e => { setFFilters(f => ({ ...f, status: e.target.value })); setFranchisePage(1) }}
              style={{ ...inputStyle, minWidth: 130, cursor: 'pointer' }}>
              {['All', 'Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <TableWrap
            headers={['#', 'Franchise Name', 'Subdomain', 'City / State', 'Contact', 'Status', 'Registered', 'Last Updated']}
            loading={franchiseLoading}>
            {franchises.length === 0 && !franchiseLoading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No franchises found</td></tr>
            ) : franchises.map((r, i) => (
              <Tr key={r._id}>
                <Td><span style={{ fontSize: 11, color: '#9ca3af' }}>{(franchisePage - 1) * PER + i + 1}</span></Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.primary}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={13} color={C.primary} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.schoolName}</span>
                  </div>
                </Td>
                <Td><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{r.subdomain}</span></Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={11} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#374151' }}>{[r.city, r.state].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                </Td>
                <Td><span style={{ fontSize: 12, color: '#6b7280' }}>{r.schoolEmail || r.schoolContact || '—'}</span></Td>
                <Td><StatusBadge status={r.isActive ? 'Active' : 'Inactive'} /></Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={11} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#374151' }}>{fmtDate(r.createdAt)}</span>
                  </div>
                </Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={11} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{timeAgo(r.updatedAt)}</span>
                  </div>
                </Td>
              </Tr>
            ))}
          </TableWrap>
          {!franchiseLoading && franchisePages > 1 && (
            <PaginationBar page={franchisePage} totalPages={franchisePages} total={franchiseTotal} perPage={PER} setPage={setFranchisePage} />
          )}
        </>
      )}

      {/* ════════════════════════════════
          SUBSCRIPTION TAB
      ════════════════════════════════ */}
      {activeTab === 'subscription' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <StatCard icon={TrendingUp}  label="Total Revenue"    value={fmtC(totalRevenue)} sub="All plans combined" color={C.success}  bg="#f0fdf4" loading={dashLoading} />
            <StatCard icon={CheckCircle} label="Active Subs"      value={fmt(d?.subscriptions?.active || 0)} sub="Currently active" color={C.primary}  bg="#eff6ff" loading={dashLoading} />
            <StatCard icon={AlertCircle} label="Expiring Soon"    value={fmt(d?.alerts?.expiringSoonCount || 0)} sub="Within 30 days" color="#d97706" bg="#fffbeb" loading={dashLoading} />
            <StatCard icon={Users}       label="Trial Plans"      value={fmt(d?.subscriptions?.trial || 0)} sub="Free trial active" color="#7c3aed" bg="#faf5ff" loading={dashLoading} />
          </div>

          {/* Plan distribution summary */}
          {planDist.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {planDist.map((p, i) => {
                const colors = [C.primary, '#7c3aed', '#d97706', C.success, '#0891b2', C.danger]
                const color  = colors[i % colors.length]
                return (
                  <div key={p._id} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: '12px 18px', flex: '1 1 140px', borderLeft: `4px solid ${color}` }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color, margin: 0 }}>{p.count}</p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0', fontWeight: 500 }}>{p._id || 'Unknown Plan'}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Subscription records table */}
          <TableWrap
            headers={['Franchise', 'Plan Name', 'Billing', 'Start Date', 'End Date', 'Paid Status', 'Status']}
            loading={subLoading}>
            {subscriptions.length === 0 && !subLoading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No subscriptions found</td></tr>
            ) : subscriptions.map((s, i) => {
              const pc = PLAN_COLORS[s.currentPlan?.name] || PLAN_COLORS.Basic
              return (
                <Tr key={s._id}>
                  <Td>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {s.tenantId?.schoolName || s.tenantId || '—'}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: pc.bg, color: pc.color }}>
                      {s.currentPlan?.name || '—'}
                    </span>
                  </Td>
                  <Td><span style={{ fontSize: 12, color: '#6b7280' }}>{s.currentPlan?.billingCycle || '—'}</span></Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: '#374151' }}>{fmtDate(s.currentPlan?.startDate)}</span>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: '#374151' }}>{fmtDate(s.currentPlan?.endDate)}</span>
                    </div>
                  </Td>
                  <Td><StatusBadge status={s.paidStatus === 'PAID' ? 'Active' : s.paidStatus === 'OVERDUE' ? 'Suspended' : 'Pending'} /></Td>
                  <Td><StatusBadge status={s.status === 'ACTIVE' ? 'Active' : s.status === 'EXPIRED' ? 'Inactive' : 'Pending'} /></Td>
                </Tr>
              )
            })}
          </TableWrap>
          {!subLoading && subPages > 1 && (
            <PaginationBar page={subPage} totalPages={subPages} total={subTotal} perPage={PER} setPage={setSubPage} />
          )}
        </>
      )}

      {/* ════════════════════════════════
          SUPPLIER TAB
      ════════════════════════════════ */}
      {activeTab === 'supplier' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <StatCard icon={Truck}       label="Total Suppliers"    value={fmt(d?.distributors?.total       || 0)} sub="Registered"   color={C.primary}  bg="#eff6ff" loading={dashLoading} />
            <StatCard icon={CheckCircle} label="Active"             value={fmt(d?.distributors?.active      || 0)} sub={d?.distributors?.total ? `${Math.round((d.distributors.active / d.distributors.total) * 100)}% active` : ''} color={C.success} bg="#f0fdf4" loading={dashLoading} />
            <StatCard icon={Truck}       label="Distributors"       value={fmt(d?.distributors?.distributors|| 0)} color="#7c3aed"    bg="#faf5ff" loading={dashLoading} />
            <StatCard icon={TrendingUp}  label="Wholesalers"        value={fmt(d?.distributors?.wholesalers || 0)} color="#d97706"    bg="#fffbeb" loading={dashLoading} />
          </div>

          {/* Search */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px',
            display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={supplierSearch}
                onChange={e => { setSupplierSearch(e.target.value); setSupplierPage(1) }}
                placeholder="Search supplier name…"
                style={{ ...inputStyle, paddingLeft: 32, width: '100%' }} />
            </div>
          </div>

          <TableWrap
            headers={['Supplier Name', 'Type', 'Contact Person', 'Phone', 'City / State', 'GST No.', 'Status', 'Joined']}
            loading={supplierLoading}>
            {suppliers.length === 0 && !supplierLoading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No suppliers found</td></tr>
            ) : suppliers.map((s) => (
              <Tr key={s._id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.primary}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Truck size={13} color={C.primary} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.name}</span>
                  </div>
                </Td>
                <Td>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 8,
                    background: s.type === 'Distributor' ? '#eff6ff' : '#faf5ff',
                    color: s.type === 'Distributor' ? C.primary : '#7c3aed' }}>
                    {s.type || 'Distributor'}
                  </span>
                </Td>
                <Td><span style={{ fontSize: 12, color: '#374151' }}>{s.contactPerson || '—'}</span></Td>
                <Td><span style={{ fontSize: 12, color: '#6b7280' }}>{s.mobile || '—'}</span></Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={11} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#374151' }}>{[s.city, s.state].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                </Td>
                <Td><span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280' }}>{s.gstNo || '—'}</span></Td>
                <Td><StatusBadge status={s.isActive ? 'Active' : 'Inactive'} /></Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={11} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(s.createdAt)}</span>
                  </div>
                </Td>
              </Tr>
            ))}
          </TableWrap>
          {!supplierLoading && supplierPages > 1 && (
            <PaginationBar page={supplierPage} totalPages={supplierPages} total={supplierTotal} perPage={PER} setPage={setSupplierPage} />
          )}
        </>
      )}

      {/* ════════════════════════════════
          COMING SOON TABS
      ════════════════════════════════ */}
      {['medicine', 'inventory', 'audit'].includes(activeTab) && (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14,
          padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: `${C.primary}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeTab === 'medicine'  && <Pill size={28} color={C.primary} />}
            {activeTab === 'inventory' && <Package size={28} color={C.primary} />}
            {activeTab === 'audit'     && <FileText size={28} color={C.primary} />}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0, textTransform: 'capitalize' }}>
            {activeTab} Reports
          </h3>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, textAlign: 'center', maxWidth: 360 }}>
            This report module is under development and will be available in the next release.
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
