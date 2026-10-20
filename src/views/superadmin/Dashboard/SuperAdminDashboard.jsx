/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, Building2, Users, CreditCard, AlertTriangle, CheckCircle,
  Clock, TrendingUp, RefreshCw, Calendar, MapPin, Bell, Activity,
  ChevronRight, Eye, Plus, Shield, Store, XCircle,
} from 'lucide-react'
import { getRequest } from '../../../Helpers/index'
import { useNavigate } from 'react-router-dom'

/* ─── Reusable Primitives ── */
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
    ACTIVE:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    TRIAL:     { bg: '#fef9c3', color: '#b45309', border: '#fde68a' },
    PENDING:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  }
  const s = map[status] || map.Inactive
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}

const KpiCard = ({ icon: Icon, label, value, info, color, trend, loading }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 18px', flex: '1 1 160px', minWidth: 148 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </div>
    </div>
    {loading
      ? <div style={{ height: 28, background: '#f3f4f6', borderRadius: 6, marginBottom: 5 }} />
      : <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 5px' }}>{value}</p>
    }
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {trend && <TrendingUp size={11} color="#16a34a" />}
      <span style={{ fontSize: 11, color: trend ? '#16a34a' : '#9ca3af', fontWeight: 500 }}>{info}</span>
    </div>
  </div>
)

const Skeleton = ({ h = 14, w = '100%', radius = 6 }) => (
  <div style={{ height: h, width: w, background: '#f3f4f6', borderRadius: radius, animation: 'pulse 1.5s ease-in-out infinite' }} />
)

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [refreshed, setRefreshed] = useState(false)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await getRequest('saas/dashboard')
      setStats(res?.data?.data || null)
    } catch (err) {
      console.error('[Dashboard] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const handleRefresh = () => {
    setRefreshed(true)
    fetchStats().finally(() => setTimeout(() => setRefreshed(false), 1500))
  }

  const f  = stats?.franchises    || {}
  const s  = stats?.subscriptions || {}
  const a  = stats?.admins        || {}
  const d  = stats?.distributors  || {}
  const al = stats?.alerts        || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13, minHeight: '100vh', background: '#f8f9fb', padding: 4 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutDashboard size={20} color="#fabf22" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Network Dashboard</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Monitor your entire franchise network at a glance</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px' }}>
            <Calendar size={13} color="#6b7280" />
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{dateStr}</span>
          </div>
          <button onClick={handleRefresh}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0c3b73', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
            <RefreshCw size={12} style={{ transition: 'transform .3s', transform: refreshed ? 'rotate(360deg)' : 'none' }} />
            {refreshed ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <KpiCard loading={loading} icon={Building2}     label="Total Franchises"      value={f.total      ?? '—'} color="#0c3b73" info={loading ? '' : `+${f.thisMonth ?? 0} this month`}  trend={!loading && f.thisMonth > 0} />
        <KpiCard loading={loading} icon={CheckCircle}   label="Active Franchises"     value={f.active     ?? '—'} color="#16a34a" info={loading ? '' : `${f.total ? Math.round((f.active/f.total)*100) : 0}% of total`} trend={!loading} />
        <KpiCard loading={loading} icon={XCircle}       label="Inactive / Suspended"  value={f.inactive   ?? '—'} color="#dc2626" info="Needs attention" />
        <KpiCard loading={loading} icon={Shield}        label="Total Admins"          value={a.total      ?? '—'} color="#7c3aed" info={loading ? '' : `${a.active ?? 0} active`} />
        <KpiCard loading={loading} icon={CreditCard}    label="Active Subscriptions"  value={s.active     ?? '—'} color="#16a34a" info={loading ? '' : `${s.trial ?? 0} on trial`} trend={!loading} />
        <KpiCard loading={loading} icon={Clock}         label="Expiring Soon"         value={al.expiringSoonCount ?? '—'} color="#d97706" info="Within 7 days" />
        <KpiCard loading={loading} icon={Store}         label="Distributors"          value={d.total      ?? '—'} color="#0891b2" info={loading ? '' : `${d.active ?? 0} active`} />
        <KpiCard loading={loading} icon={Bell}          label="Total Revenue"         value={loading ? '—' : `₹${((s.totalRevenue || 0)/1000).toFixed(1)}K`} color="#16a34a" info="All time" trend={!loading} />
      </div>

      {/* ── ROW 1: Franchise Table + Recent ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, alignItems: 'start' }}>

        {/* Franchise Overview */}
        <Card>
          <CardHeader title="Recent Franchises" action="View All" onAction={() => navigate('/superadmin/franchise')} icon={Store} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Franchise Name', 'City', 'State', 'Plan', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} style={{ padding: '10px 14px' }}><Skeleton /></td></tr>
                  ))
                ) : (stats?.recentFranchises || []).length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '30px 0', textAlign: 'center', color: '#9ca3af' }}>No franchises yet</td></tr>
                ) : (stats?.recentFranchises || []).map((f) => (
                  <tr key={f._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0c3b7318', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Building2 size={14} color="#0c3b73" />
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{f.schoolName}</p>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>{f.city || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>{f.state || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                        background: '#f3f4f6', color: '#374151' }}>
                        {f.planName || 'Trial'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}><StatusBadge status={f.isActive ? 'Active' : 'Inactive'} /></td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => navigate('/superadmin/franchise')}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#0c3b73', background: '#0c3b7310', border: '1px solid #0c3b7325', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                        <Eye size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader title="Expiring Soon" icon={Clock} iconColor="#d97706" action="View All" onAction={() => navigate('/superadmin/subscriptions')} />
          <div style={{ padding: '8px 0' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '10px 16px' }}><Skeleton /></div>
              ))
            ) : (al.expiringSoon || []).length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
                <CheckCircle size={24} color="#16a34a" style={{ marginBottom: 8 }} />
                <p style={{ margin: 0 }}>No subscriptions expiring soon</p>
              </div>
            ) : (al.expiringSoon || []).map((item, i) => {
              const isRed = item.daysLeft < 3
              const dotColor = isRed ? '#dc2626' : '#d97706'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px', borderBottom: i < (al.expiringSoon.length - 1) ? '1px solid #f3f4f6' : 'none',
                  background: isRed ? '#fff8f8' : 'transparent', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.franchiseName || '—'}
                      </p>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>{item.planName}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: dotColor, background: dotColor + '14',
                    padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>
                    {item.daysLeft}d left
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
            <button onClick={() => navigate('/superadmin/franchise')}
              style={{ width: '100%', padding: '8px 0', background: '#0c3b7308', border: '1px dashed #0c3b7330',
                borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#0c3b73', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Plus size={13} /> Register New Franchise
            </button>
          </div>
        </Card>
      </div>

      {/* ── ROW 2: Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Admin Stats */}
        <Card>
          <CardHeader title="Admin Overview" icon={Shield} iconColor="#7c3aed" action="Manage" onAction={() => navigate('/superadmin/admins')} />
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total Admins',    value: a.total,    color: '#7c3aed' },
              { label: 'Active Admins',   value: a.active,   color: '#16a34a' },
              { label: 'Inactive Admins', value: a.inactive, color: '#9ca3af' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{row.label}</span>
                {loading
                  ? <Skeleton h={20} w={40} />
                  : <span style={{ fontSize: 16, fontWeight: 800, color: row.color }}>{row.value ?? 0}</span>
                }
              </div>
            ))}
          </div>
        </Card>

        {/* Distributor Stats */}
        <Card>
          <CardHeader title="Supplier Overview" icon={Store} iconColor="#0891b2" action="Manage" onAction={() => navigate('/superadmin/distributors')} />
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total Suppliers',  value: d.total,        color: '#0891b2' },
              { label: 'Distributors',     value: d.distributors, color: '#1d4ed8' },
              { label: 'Wholesalers',      value: d.wholesalers,  color: '#7c3aed' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{row.label}</span>
                {loading
                  ? <Skeleton h={20} w={40} />
                  : <span style={{ fontSize: 16, fontWeight: 800, color: row.color }}>{row.value ?? 0}</span>
                }
              </div>
            ))}
          </div>
        </Card>

        {/* Subscription Stats */}
        <Card>
          <CardHeader title="Subscription Overview" icon={CreditCard} iconColor="#16a34a" action="Manage" onAction={() => navigate('/superadmin/subscriptions')} />
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total Subscriptions', value: s.total,  color: '#0c3b73' },
              { label: 'Active',              value: s.active, color: '#16a34a' },
              { label: 'On Trial',            value: s.trial,  color: '#d97706' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{row.label}</span>
                {loading
                  ? <Skeleton h={20} w={40} />
                  : <span style={{ fontSize: 16, fontWeight: 800, color: row.color }}>{row.value ?? 0}</span>
                }
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── ROW 3: State Distribution ── */}
      <Card>
        <CardHeader title="State / City Distribution" icon={MapPin} iconColor="#0c3b73" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'State', 'Total Franchises', 'Active', 'Inactive', 'Coverage'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} style={{ padding: '10px 16px' }}><Skeleton /></td></tr>
                ))
              ) : (stats?.stateDistribution || []).length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '30px 0', textAlign: 'center', color: '#9ca3af' }}>No data</td></tr>
              ) : (stats?.stateDistribution || []).map((s, i) => {
                const pct = s.total > 0 ? Math.round((s.active / s.total) * 100) : 0
                return (
                  <tr key={s.state} style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <MapPin size={12} color="#0c3b73" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.state}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#374151' }}>{s.total}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{s.active}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.inactive > 0 ? '#dc2626' : '#9ca3af' }}>{s.inactive}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, maxWidth: 80 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#16a34a' : pct >= 70 ? '#d97706' : '#dc2626', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', minWidth: 32 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {!loading && (stats?.stateDistribution || []).length > 0 && (
              <tfoot>
                <tr style={{ background: '#f0f4ff', borderTop: '2px solid #e5e7eb' }}>
                  <td colSpan={2} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>Total</td>
                  <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>
                    {(stats.stateDistribution || []).reduce((a, b) => a + b.total, 0)}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                    {(stats.stateDistribution || []).reduce((a, b) => a + b.active, 0)}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#dc2626' }}>
                    {(stats.stateDistribution || []).reduce((a, b) => a + b.inactive, 0)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

    </div>
  )
}
