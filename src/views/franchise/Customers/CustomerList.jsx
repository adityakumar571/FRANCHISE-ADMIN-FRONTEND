/* eslint-disable prettier/prettier */
/**
 * Screen 63 — Customer List
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Plus, Eye, Edit2, Search, Phone, Trash2,
  ChevronLeft, ChevronRight, Filter, Download,
  Wallet, Star, Crown, Bell, Award, IndianRupee, UserCheck,
} from 'lucide-react'
import { CUSTOMERS, TIER_COLORS } from './mockData'
import PageHeader from '../components/PageHeader'

const Th = ({ c }) => (
  <th style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>
)

const StatusBadge = ({ s }) =>
  s === 'Active'
    ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Active</span>
    : <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3' }}>Inactive</span>

const TierBadge = ({ tier }) => {
  const c = TIER_COLORS[tier] || '#6b7280'
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: c + '18', color: c, border: `1px solid ${c}44` }}>{tier}</span>
}

const Btn = ({ icon: Icon, label, color, bg, onClick, title }) => (
  <button title={title || label} onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 8px', border: 'none', borderRadius: 6, background: bg, color, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
    <Icon size={11} />{label}
  </button>
)

const Confirm = ({ onYes, onNo }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ background: '#fff', borderRadius: 14, padding: '30px', maxWidth: 340, width: '90%', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Trash2 size={24} color="#dc2626" />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Delete Customer?</p>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>This customer record will be permanently deleted.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onNo}  style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff' }}>Cancel</button>
        <button onClick={onYes} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#dc2626', color: '#fff' }}>Delete</button>
      </div>
    </div>
  </div>
)

export default function CustomerList() {
  const navigate = useNavigate()
  const [data, setData]           = useState(CUSTOMERS)
  const [search, setSearch]       = useState('')
  const [statusF, setStatusF]     = useState('All')
  const [tierF, setTierF]         = useState('All')
  const [page, setPage]           = useState(1)
  const [confirmId, setConfirmId] = useState(null)
  const PER_PAGE = 8

  const filtered = data.filter(c =>
    (statusF === 'All' || c.status === statusF) &&
    (tierF   === 'All' || c.memberTier === tierF) &&
    (search  === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const go = (id, sub = '') => navigate(`/franchise/customers/${id}${sub}`)

  const KPI = [
    { label: 'Total Customers',  value: data.length,                                        icon: Users,       color: '#0c3b73', bg: '#e0e7ff' },
    { label: 'Active Customers', value: data.filter(c => c.status === 'Active').length,     icon: UserCheck,   color: '#16a34a', bg: '#dcfce7' },
    { label: 'Inactive',         value: data.filter(c => c.status === 'Inactive').length,   icon: Users,       color: '#dc2626', bg: '#fee2e2' },
    { label: 'Total Due',        value: `₹${data.reduce((a,c) => a + c.totalDue, 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: '#d97706', bg: '#fef3c7' },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {confirmId && (
        <Confirm
          onYes={() => { setData(p => p.filter(c => c.id !== confirmId)); setConfirmId(null) }}
          onNo={() => setConfirmId(null)}
        />
      )}

      <PageHeader icon={Users} title="Customer List" subtitle="Manage all your customers" color="#0c3b73">
        <button onClick={() => navigate('/franchise/customers/add')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> + Add Customer
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
        {KPI.map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '2px 0 0' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, phone, email or ID..."
            style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All', 'Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={tierF} onChange={e => { setTierF(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All', 'Regular', 'Silver', 'Gold', 'Platinum', 'Diamond'].map(t => <option key={t}>{t}</option>)}
        </select>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer', color: '#374151' }}>
          <Filter size={13} /> Filters
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer', color: '#374151' }}>
          <Download size={13} /> Export
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Customer ID','Customer Name','Phone','Email','Total Purchase','Due Amount','Tier','Status','Actions'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No customers found</td></tr>
              ) : paged.map(c => (
                <tr key={c.id}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '3px 8px', borderRadius: 5 }}>{c.id}</span>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13, flexShrink: 0 }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '1px 0 0' }}>Since {c.memberSince}</p>
                      </div>
                    </div>
                  </Td>
                  <Td><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={11} color="#9ca3af" />{c.phone}</span></Td>
                  <Td style={{ color: '#6b7280' }}>{c.email || '—'}</Td>
                  <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{c.totalPurchase.toLocaleString('en-IN')}</Td>
                  <Td style={{ fontWeight: 700, color: c.totalDue > 0 ? '#dc2626' : '#16a34a' }}>₹{c.totalDue.toLocaleString('en-IN')}</Td>
                  <Td><TierBadge tier={c.memberTier} /></Td>
                  <Td><StatusBadge s={c.status} /></Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <Btn icon={Eye}    label="View"  color="#0c3b73" bg="#e0e7ff" onClick={() => go(c.id)} />
                      <Btn icon={Edit2}  label="Edit"  color="#d97706" bg="#fef3c7" onClick={() => go(c.id, '/edit')} />
                      <Btn icon={Wallet} label=""      color="#7c3aed" bg="#f5f3ff" title="Wallet"     onClick={() => go(c.id, '/wallet')} />
                      <Btn icon={Star}   label=""      color="#d97706" bg="#fefce8" title="Loyalty"    onClick={() => go(c.id, '/loyalty')} />
                      <Btn icon={Crown}  label=""      color="#d97706" bg="#fef3c7" title="Membership" onClick={() => go(c.id, '/membership')} />
                      <Btn icon={Bell}   label=""      color="#16a34a" bg="#f0fdf4" title="Reminders"  onClick={() => go(c.id, '/reminders')} />
                      <Btn icon={Award}  label=""      color="#f59e0b" bg="#fffbeb" title="CareCoin"   onClick={() => go(c.id, '/carecoin')} />
                      <Btn icon={Trash2} label=""      color="#dc2626" bg="#fff1f2" title="Delete"     onClick={() => setConfirmId(c.id)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Showing {Math.min((page-1)*PER_PAGE+1, filtered.length)}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} customers
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===1 ? 'default':'pointer', background: 'none', color: page===1 ? '#d1d5db':'#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: page===p?'#0c3b73':'none', border: `1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: page===p?'#fff':'#374151', fontSize: 12, fontWeight: page===p?700:400 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===totalPages?'default':'pointer', background: 'none', color: page===totalPages?'#d1d5db':'#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
