/* eslint-disable prettier/prettier */
/**
 * Screen 64 — Customer Details
 * Real API integration
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Phone, Mail, MapPin, Edit2, User,
  Package, Wallet, Star, Crown, Bell, Award,
  ChevronRight, Eye,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'

const TIER_COLORS = { Regular: '#6b7280', Silver: '#94a3b8', Gold: '#d97706', Platinum: '#7c3aed', Diamond: '#0891b2' }

// Static categories for donut chart — derived from purchase history
const CATEGORIES = [
  { name: 'Antibiotics',  pct: 32, color: '#0c3b73' },
  { name: 'Analgesic',    pct: 24, color: '#7c3aed' },
  { name: 'Vitamins',     pct: 18, color: '#d97706' },
  { name: 'Antidiabetic', pct: 14, color: '#16a34a' },
  { name: 'Others',       pct: 12, color: '#9ca3af' },
]

const Th = ({ c }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const StatusBadge = ({ s }) =>
  s === 'Active'
    ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Active</span>
    : <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3' }}>Inactive</span>

const OrderStatusBadge = ({ s }) => {
  const cfg = s === 'Paid' || s === 'Completed'
    ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }
    : { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{s}</span>
}

const SkeletonBlock = ({ h = 16, w = '100%' }) => (
  <div style={{ height: h, width: w, background: '#f3f4f6', borderRadius: 4 }} />
)

const TABS = ['Overview', 'Purchase History', 'Prescriptions', 'Wallet & Loyalty', 'Notes']

export default function CustomerDetails() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const [tab, setTab]       = useState('Overview')
  const [cust, setCust]     = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true)
      try {
        // Load customer detail and purchases in parallel
        const [custRes, purchRes] = await Promise.allSettled([
          getRequest(`/franchise/customers/${id}`),
          getRequest(`/franchise/customers/${id}/purchases?page=1&limit=10`),
        ])
        if (custRes.status === 'fulfilled') {
          setCust(custRes.value.data?.data || null)
        } else {
          toast.error('Failed to load customer')
        }
        if (purchRes.status === 'fulfilled') {
          setOrders(purchRes.value.data?.data?.purchases || [])
        }
      } finally {
        setLoading(false)
      }
    }
    if (id) loadCustomer()
  }, [id])

  if (loading) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18, padding: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '22px 24px', display: 'flex', gap: 20 }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#f3f4f6' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SkeletonBlock h={20} w="40%" />
            <SkeletonBlock h={12} w="25%" />
            <SkeletonBlock h={14} w="60%" />
          </div>
        </div>
      </div>
    )
  }

  if (!cust) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', padding: 40, textAlign: 'center', color: '#9ca3af' }}>
        <User size={40} color="#e5e7eb" style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
        <p>Customer not found.</p>
        <button onClick={() => navigate('/franchise/customers')}
          style={{ marginTop: 12, padding: '8px 18px', background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
          Back to Customers
        </button>
      </div>
    )
  }

  const tc = TIER_COLORS[cust.tier] || '#6b7280'
  const go = sub => navigate(`/franchise/customers/${cust._id}${sub}`)

  // Derive numeric values safely
  const totalPurchase  = cust.totalPurchase || 0
  const totalDue       = cust.dueAmount || 0
  const totalPaid      = totalPurchase - totalDue
  const totalOrders    = orders.length
  const avgOrderValue  = totalOrders > 0 ? totalPurchase / totalOrders : 0
  const walletBalance  = cust.walletBalance || 0
  const loyaltyPoints  = cust.loyaltyPoints || 0
  const carecoins      = cust.careCoins || 0

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <PageHeader icon={User} title="Customer Details" subtitle="View complete customer information" color="#0c3b73">
        <button onClick={() => navigate('/franchise/customers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#374151' }}>
          <ArrowLeft size={14} /> Back to List
        </button>
        <button onClick={() => go('/edit')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#0c3b73', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>
          <Edit2 size={13} /> Edit Profile
        </button>
      </PageHeader>

      {/* ── Profile Header Card ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '22px 24px' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Avatar */}
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {cust.name?.[0]?.toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>{cust.name}</h2>
              <StatusBadge s={cust.isActive !== false ? 'Active' : 'Inactive'} />
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: tc + '18', color: tc, border: `1px solid ${tc}44` }}>
                {cust.tier || 'Regular'} Member
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>
              {cust.customerId} &nbsp;·&nbsp; Member since {new Date(cust.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {cust.phone && <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} color="#9ca3af" />{cust.phone}</span>}
              {cust.email && <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} color="#9ca3af" />{cust.email}</span>}
              {cust.dob   && <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}><User size={13} color="#9ca3af" />{new Date(cust.dob).toLocaleDateString('en-IN')}</span>}
              {cust.gender && <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}><Package size={13} color="#9ca3af" />{cust.gender}</span>}
            </div>
            {cust.address && (
              <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                <MapPin size={12} style={{ marginTop: 2, flexShrink: 0 }} />{cust.address}
              </p>
            )}
          </div>

          {/* KPI tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flexShrink: 0 }}>
            {[
              { l: 'Total Purchase',  v: `₹${totalPurchase.toLocaleString('en-IN')}`, c: '#0c3b73' },
              { l: 'Total Paid',      v: `₹${totalPaid.toLocaleString('en-IN')}`,     c: '#16a34a' },
              { l: 'Total Due',       v: `₹${totalDue.toLocaleString('en-IN')}`,      c: totalDue > 0 ? '#dc2626' : '#16a34a' },
              { l: 'Total Orders',    v: String(totalOrders),                          c: '#7c3aed' },
              { l: 'Avg Order Value', v: `₹${avgOrderValue.toFixed(2)}`,              c: '#374151' },
              { l: 'Wallet Balance',  v: `₹${walletBalance.toLocaleString('en-IN')}`, c: '#d97706' },
            ].map(s => (
              <div key={s.l} style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textAlign: 'center', minWidth: 100 }}>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: s.c, margin: 0 }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Nav Buttons ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { label: 'Purchase History',  icon: Package, sub: '/history',    color: '#0c3b73' },
          { label: 'Medicine Reminder', icon: Bell,    sub: '/reminders',  color: '#16a34a' },
          { label: 'Membership',        icon: Crown,   sub: '/membership', color: '#d97706' },
          { label: 'Loyalty Program',   icon: Star,    sub: '/loyalty',    color: '#f59e0b' },
          { label: 'CareCoin',          icon: Award,   sub: '/carecoin',   color: '#f97316' },
          { label: 'Wallet',            icon: Wallet,  sub: '/wallet',     color: '#7c3aed' },
        ].map(a => (
          <button key={a.label} onClick={() => go(a.sub)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: `1px solid ${a.color}33`, background: a.color + '0d', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: a.color }}>
            <a.icon size={14} /> {a.label}
          </button>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '12px 20px', border: 'none', borderBottom: tab === t ? '2px solid #0c3b73' : '2px solid transparent', background: 'none', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? '#0c3b73' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: '22px 24px' }}>

          {/* Overview */}
          {tab === 'Overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 260px', gap: 20 }}>
              <div style={{ gridColumn: '1 / 3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Orders</h3>
                  <button onClick={() => go('/history')} style={{ fontSize: 12, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                    View All Orders <ChevronRight size={12} />
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Invoice No.','Date','Items','Amount (₹)','Status'].map(h => <Th key={h} c={h} />)}</tr></thead>
                  <tbody>
                    {orders.length === 0
                      ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No orders found</td></tr>
                      : orders.slice(0, 5).map((o, i) => (
                        <tr key={i} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                          <Td><span style={{ fontSize: 12, fontFamily: 'monospace', color: '#0c3b73', fontWeight: 600 }}>{o.invoiceNo}</span></Td>
                          <Td style={{ fontSize: 12, color: '#6b7280' }}>{o.date}</Td>
                          <Td>{o.items}</Td>
                          <Td style={{ fontWeight: 700 }}>₹{Number(o.total || 0).toLocaleString('en-IN')}</Td>
                          <Td><OrderStatusBadge s={o.status} /></Td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                <button onClick={() => go('/history')} style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>View All Orders →</button>
              </div>

              {/* Top Categories Donut */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Top Categories</h3>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <div style={{ position: 'relative', width: 110, height: 110 }}>
                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 110, height: 110 }}>
                      {CATEGORIES.reduce((acc, c) => {
                        const offset = acc.off
                        acc.els.push(
                          <circle key={c.name} cx="18" cy="18" r="15.9155" fill="transparent"
                            stroke={c.color} strokeWidth="3.5"
                            strokeDasharray={`${c.pct} ${100 - c.pct}`}
                            strokeDashoffset={`-${offset}`} />
                        )
                        acc.off += c.pct
                        return acc
                      }, { els: [], off: 0 }).els}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{totalOrders}</span>
                      <span style={{ fontSize: 9, color: '#6b7280' }}>Orders</span>
                    </div>
                  </div>
                </div>
                {CATEGORIES.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#374151' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                      {c.name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase History */}
          {tab === 'Purchase History' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { l: 'Total Orders',    v: String(totalOrders),                          c: '#0c3b73' },
                  { l: 'Total Purchase',  v: `₹${totalPurchase.toLocaleString('en-IN')}`, c: '#7c3aed' },
                  { l: 'Total Paid',      v: `₹${totalPaid.toLocaleString('en-IN')}`,     c: '#16a34a' },
                  { l: 'Avg Order Value', v: `₹${avgOrderValue.toFixed(2)}`,              c: '#d97706' },
                ].map(s => (
                  <div key={s.l} style={{ padding: '14px', background: '#f9fafb', borderRadius: 8, textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: s.c, margin: 0 }}>{s.v}</p>
                  </div>
                ))}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Invoice No.','Date','Items','Amount (₹)','Payment Mode','Status','Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
                <tbody>
                  {orders.length === 0
                    ? <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No purchase history found</td></tr>
                    : orders.map((o, i) => (
                      <tr key={i} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                        <Td><span style={{ fontSize: 12, fontFamily: 'monospace', color: '#0c3b73', fontWeight: 600 }}>{o.invoiceNo}</span></Td>
                        <Td style={{ fontSize: 12, color: '#6b7280' }}>{o.date}</Td>
                        <Td>{o.items}</Td>
                        <Td style={{ fontWeight: 700 }}>₹{Number(o.total || 0).toLocaleString('en-IN')}</Td>
                        <Td style={{ color: '#6b7280', fontSize: 12 }}>{o.mode}</Td>
                        <Td><OrderStatusBadge s={o.status} /></Td>
                        <Td>
                          <button style={{ background: '#e0e7ff', border: 'none', borderRadius: 5, padding: '4px 9px', cursor: 'pointer', color: '#0c3b73', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Eye size={11} />View
                          </button>
                        </Td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* Prescriptions */}
          {tab === 'Prescriptions' && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af' }}>
              <Package size={44} color="#e5e7eb" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, margin: 0 }}>No prescriptions found for this customer.</p>
            </div>
          )}

          {/* Wallet & Loyalty */}
          {tab === 'Wallet & Loyalty' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[
                { label: 'Wallet Balance', value: `₹${walletBalance.toLocaleString('en-IN')}`, color: '#7c3aed', sub: '/wallet' },
                { label: 'Loyalty Points', value: loyaltyPoints.toLocaleString('en-IN'),         color: '#d97706', sub: '/loyalty' },
                { label: 'CareCoins',      value: carecoins.toLocaleString('en-IN'),             color: '#f59e0b', sub: '/carecoin' },
              ].map(s => (
                <div key={s.label} style={{ padding: '22px', background: '#f9fafb', borderRadius: 12, textAlign: 'center', border: `1px solid ${s.color}22` }}>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: '0 0 16px' }}>{s.value}</p>
                  <button onClick={() => go(s.sub)} style={{ background: s.color, color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Manage →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {tab === 'Notes' && (
            <div>
              <textarea placeholder="Add notes about this customer..." rows={6}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              <button style={{ marginTop: 10, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Note</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

      {/* ── Profile Header Card ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '22px 24px' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Avatar */}
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {cust.name[0]}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>{cust.name}</h2>
              <StatusBadge s={cust.status} />
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: tc + '18', color: tc, border: `1px solid ${tc}44` }}>
                {cust.memberTier} Member
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>{cust.id} &nbsp;·&nbsp; Member since {cust.memberSince}</p>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} color="#9ca3af" />{cust.phone}</span>
              {cust.email && <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} color="#9ca3af" />{cust.email}</span>}
              {cust.dob  && <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}><User size={13} color="#9ca3af" />{cust.dob}</span>}
              {cust.bloodGroup && <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}><Package size={13} color="#9ca3af" />{cust.bloodGroup}</span>}
            </div>
            {cust.address && (
              <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                <MapPin size={12} style={{ marginTop: 2, flexShrink: 0 }} />{cust.address}
              </p>
            )}
          </div>

          {/* KPI tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flexShrink: 0 }}>
            {[
              { l: 'Total Purchase',  v: `₹${cust.totalPurchase.toLocaleString('en-IN')}`, c: '#0c3b73' },
              { l: 'Total Paid',      v: `₹${cust.totalPaid.toLocaleString('en-IN')}`,     c: '#16a34a' },
              { l: 'Total Due',       v: `₹${cust.totalDue.toLocaleString('en-IN')}`,      c: cust.totalDue > 0 ? '#dc2626' : '#16a34a' },
              { l: 'Total Orders',    v: cust.totalOrders,                                  c: '#7c3aed' },
              { l: 'Avg Order Value', v: `₹${cust.avgOrderValue.toFixed(2)}`,               c: '#374151' },
              { l: 'Total Savings',   v: `₹${cust.totalSavings.toLocaleString('en-IN')}`,  c: '#d97706' },
            ].map(s => (
              <div key={s.l} style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textAlign: 'center', minWidth: 100 }}>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: s.c, margin: 0 }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Nav Buttons ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { label: 'Purchase History',  icon: Package, sub: '/history',    color: '#0c3b73' },
          { label: 'Medicine Reminder', icon: Bell,    sub: '/reminders',  color: '#16a34a' },
          { label: 'Membership',        icon: Crown,   sub: '/membership', color: '#d97706' },
          { label: 'Loyalty Program',   icon: Star,    sub: '/loyalty',    color: '#f59e0b' },
          { label: 'CareCoin',          icon: Award,   sub: '/carecoin',   color: '#f97316' },
          { label: 'Wallet',            icon: Wallet,  sub: '/wallet',     color: '#7c3aed' },
        ].map(a => (
          <button key={a.label} onClick={() => go(a.sub)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: `1px solid ${a.color}33`, background: a.color + '0d', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: a.color }}>
            <a.icon size={14} /> {a.label}
          </button>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '12px 20px', border: 'none', borderBottom: tab === t ? '2px solid #0c3b73' : '2px solid transparent', background: 'none', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? '#0c3b73' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: '22px 24px' }}>

          {/* Overview */}
          {tab === 'Overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 260px', gap: 20 }}>
              <div style={{ gridColumn: '1 / 3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Orders</h3>
                  <button onClick={() => go('/history')} style={{ fontSize: 12, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                    View All Orders <ChevronRight size={12} />
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Invoice No.','Date','Items','Amount (₹)','Paid (₹)','Due','Status'].map(h => <Th key={h} c={h} />)}</tr></thead>
                  <tbody>
                    {ORDERS.slice(0, 5).map((o, i) => (
                      <tr key={i} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                        <Td><span style={{ fontSize: 12, fontFamily: 'monospace', color: '#0c3b73', fontWeight: 600 }}>{o.id}</span></Td>
                        <Td style={{ fontSize: 12, color: '#6b7280' }}>{o.date}</Td>
                        <Td>{o.items}</Td>
                        <Td style={{ fontWeight: 700 }}>₹{o.amount.toLocaleString('en-IN')}</Td>
                        <Td style={{ fontWeight: 700, color: '#16a34a' }}>₹{o.paid.toLocaleString('en-IN')}</Td>
                        <Td style={{ fontWeight: 700, color: o.due > 0 ? '#dc2626' : '#16a34a' }}>₹{o.due.toFixed(2)}</Td>
                        <Td><OrderStatusBadge s={o.status} /></Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => go('/history')} style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>View All Orders →</button>
              </div>

              {/* Top Categories Donut */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Top Categories</h3>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <div style={{ position: 'relative', width: 110, height: 110 }}>
                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 110, height: 110 }}>
                      {CATEGORIES.reduce((acc, c) => {
                        const offset = acc.off
                        acc.els.push(
                          <circle key={c.name} cx="18" cy="18" r="15.9155" fill="transparent"
                            stroke={c.color} strokeWidth="3.5"
                            strokeDasharray={`${c.pct} ${100 - c.pct}`}
                            strokeDashoffset={`-${offset}`} />
                        )
                        acc.off += c.pct
                        return acc
                      }, { els: [], off: 0 }).els}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{cust.totalOrders}</span>
                      <span style={{ fontSize: 9, color: '#6b7280' }}>Orders</span>
                    </div>
                  </div>
                </div>
                {CATEGORIES.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#374151' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                      {c.name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase History */}
          {tab === 'Purchase History' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { l: 'Total Orders',    v: cust.totalOrders,                                               c: '#0c3b73' },
                  { l: 'Total Purchase',  v: `₹${cust.totalPurchase.toLocaleString('en-IN')}`,               c: '#7c3aed' },
                  { l: 'Total Paid',      v: `₹${cust.totalPaid.toLocaleString('en-IN')}`,                   c: '#16a34a' },
                  { l: 'Avg Order Value', v: `₹${cust.avgOrderValue.toFixed(2)}`,                            c: '#d97706' },
                ].map(s => (
                  <div key={s.l} style={{ padding: '14px', background: '#f9fafb', borderRadius: 8, textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: s.c, margin: 0 }}>{s.v}</p>
                  </div>
                ))}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Invoice No.','Date','Items','Amount (₹)','Discount (₹)','Paid (₹)','Due (₹)','Status','Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
                <tbody>
                  {ORDERS.map((o, i) => (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                      <Td><span style={{ fontSize: 12, fontFamily: 'monospace', color: '#0c3b73', fontWeight: 600 }}>{o.id}</span></Td>
                      <Td style={{ fontSize: 12, color: '#6b7280' }}>{o.date}</Td>
                      <Td>{o.items}</Td>
                      <Td style={{ fontWeight: 700 }}>₹{o.amount.toLocaleString('en-IN')}</Td>
                      <Td style={{ color: '#d97706' }}>₹{o.discount.toFixed(2)}</Td>
                      <Td style={{ fontWeight: 700, color: '#16a34a' }}>₹{o.paid.toLocaleString('en-IN')}</Td>
                      <Td style={{ fontWeight: 700, color: o.due > 0 ? '#dc2626' : '#16a34a' }}>₹{o.due.toFixed(2)}</Td>
                      <Td><OrderStatusBadge s={o.status} /></Td>
                      <Td><button style={{ background: '#e0e7ff', border: 'none', borderRadius: 5, padding: '4px 9px', cursor: 'pointer', color: '#0c3b73', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={11} />View</button></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Prescriptions */}
          {tab === 'Prescriptions' && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af' }}>
              <Package size={44} color="#e5e7eb" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, margin: 0 }}>No prescriptions found for this customer.</p>
            </div>
          )}

          {/* Wallet & Loyalty */}
          {tab === 'Wallet & Loyalty' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[
                { label: 'Wallet Balance', value: `₹${cust.walletBalance.toLocaleString('en-IN')}`, color: '#7c3aed', sub: '/wallet' },
                { label: 'Loyalty Points', value: cust.loyaltyPoints.toLocaleString('en-IN'),         color: '#d97706', sub: '/loyalty' },
                { label: 'CareCoins',      value: cust.carecoins.toLocaleString('en-IN'),             color: '#f59e0b', sub: '/carecoin' },
              ].map(s => (
                <div key={s.label} style={{ padding: '22px', background: '#f9fafb', borderRadius: 12, textAlign: 'center', border: `1px solid ${s.color}22` }}>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: '0 0 16px' }}>{s.value}</p>
                  <button onClick={() => go(s.sub)} style={{ background: s.color, color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Manage →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {tab === 'Notes' && (
            <div>
              <textarea placeholder="Add notes about this customer..." rows={6}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              <button style={{ marginTop: 10, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Note</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
