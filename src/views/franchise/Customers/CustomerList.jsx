/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Plus, Eye, Edit2, Search, Trash2, X, Save,
  ChevronLeft, ChevronRight, IndianRupee, UserCheck,
  Wallet, Star, Crown, Bell, Award,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, putRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

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

const TIER_COLORS = { Regular: '#6b7280', Silver: '#94a3b8', Gold: '#d97706', Platinum: '#7c3aed', Diamond: '#0891b2' }
const TierBadge = ({ tier }) => {
  const c = TIER_COLORS[tier] || '#6b7280'
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: c + '18', color: c, border: `1px solid ${c}44` }}>{tier}</span>
}

const Confirm = ({ onYes, onNo }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ background: '#fff', borderRadius: 14, padding: 30, maxWidth: 340, width: '90%', textAlign: 'center' }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Delete Customer?</p>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>This action cannot be undone.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onNo}  style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
        <button onClick={onYes} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#dc2626', color: '#fff', fontWeight: 600 }}>Delete</button>
      </div>
    </div>
  </div>
)

function EditCustomerModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:    customer?.name    || '',
    phone:   customer?.phone   || '',
    email:   customer?.email   || '',
    tier:    customer?.tier    || 'Regular',
    address: customer?.address || '',
    dob:     customer?.dob     ? customer.dob.slice(0,10) : '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.4px' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      await putRequest({ url: `/franchise/customers/${customer._id}`, cred: form })
      toast.success('Customer updated successfully')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:500, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid #f3f4f6' }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#111827' }}>Edit Customer</h3>
          <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X size={15} color="#6b7280" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>Full Name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Full name" style={inp} /></div>
              <div><label style={lbl}>Phone</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="10-digit mobile" style={inp} /></div>
              <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@example.com" style={inp} /></div>
              <div>
                <label style={lbl}>Tier</label>
                <select value={form.tier} onChange={e=>set('tier',e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                  {['Regular','Silver','Gold','Platinum','Diamond'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Date of Birth</label><input type="date" value={form.dob} onChange={e=>set('dob',e.target.value)} style={inp} /></div>
            </div>
            <div><label style={lbl}>Address</label><textarea value={form.address} onChange={e=>set('address',e.target.value)} rows={2} placeholder="Customer address" style={{ ...inp, resize:'vertical' }} /></div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', padding:'14px 22px', borderTop:'1px solid #f3f4f6' }}>
            <button type="button" onClick={onClose} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', color:'#374151' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:saving?'#94a3b8':'#0c3b73', fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', color:'#fff', display:'flex', alignItems:'center', gap:6 }}>
              <Save size={13} /> {saving ? 'Saving…' : 'Update Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CustomerList() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [kpi, setKpi]           = useState({ total: 0, active: 0, inactive: 0, totalDue: 0 })
  const [search, setSearch]     = useState('')
  const [statusF, setStatusF]   = useState('All')
  const [tierF, setTierF]       = useState('All')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(true)
  const [confirmId, setConfirmId] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)
  const debounceRef = useRef()
  const PER_PAGE = 8

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const tierParam = tierF !== 'All' ? tierF : ''
      const res = await getRequest(
        `/franchise/customers?search=${encodeURIComponent(search)}&status=${statusF === 'All' ? '' : statusF}&tier=${encodeURIComponent(tierParam)}&page=${page}&limit=${PER_PAGE}`
      )
      const d = res.data?.data
      setCustomers(d?.customers || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      if (d?.kpi) setKpi(d.kpi)
    } catch { toast.error('Failed to load customers') }
    finally { setLoading(false) }
  }, [search, statusF, tierF, page])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleSearchChange = (val) => {
    setSearch(val); setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchCustomers, 400)
  }

  const handleDelete = async (id) => {
    try {
      await deleteRequest(`/franchise/customers/${id}`)
      toast.success('Customer deleted')
      setCustomers(p => p.filter(c => c._id !== id))
      setConfirmId(null)
    } catch { toast.error('Failed to delete') }
  }

  const go = (id, sub = '') => navigate(`/franchise/customers/${id}${sub}`)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {confirmId && <Confirm onYes={() => handleDelete(confirmId)} onNo={() => setConfirmId(null)} />}
      {editCustomer && <EditCustomerModal customer={editCustomer} onClose={() => setEditCustomer(null)} onSaved={fetchCustomers} />}

      <PageHeader icon={Users} title="Customer List" subtitle="Manage all your customers" color="#0c3b73">
        <button onClick={() => navigate('/franchise/customers/add')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> + Add Customer
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Customers',  value: loading ? '...' : kpi.total,    icon: Users,      color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Active Customers', value: loading ? '...' : kpi.active,   icon: UserCheck,  color: '#16a34a', bg: '#dcfce7' },
          { label: 'Inactive',         value: loading ? '...' : kpi.inactive, icon: Users,      color: '#dc2626', bg: '#fee2e2' },
          { label: 'Total Due', value: loading ? '...' : `₹${Number(kpi.totalDue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: '#d97706', bg: '#fef3c7' },
        ].map(k => (
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

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by name, phone, ID..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All', 'Active', 'Inactive'].map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={tierF} onChange={e => { setTierF(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All', 'Regular', 'Silver', 'Gold', 'Platinum', 'Diamond'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['ID', 'Name', 'Phone', 'Total Purchase', 'Due Amount', 'Tier', 'Status', 'Actions'].map(h => <Th key={h} c={h} />)}
            </tr></thead>
            <tbody>
              {loading
                ? Array(PER_PAGE).fill(0).map((_, i) => (
                  <tr key={i}>{Array(8).fill(0).map((_, j) => (
                    <td key={j} style={{ padding: '11px 14px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>
                  ))}</tr>
                ))
                : customers.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No customers found</td></tr>
                  : customers.map(c => (
                    <tr key={c._id}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{c.id}</span></Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {c.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{c.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{c.email || '—'}</p>
                          </div>
                        </div>
                      </Td>
                      <Td style={{ color: '#6b7280' }}>{c.phone}</Td>
                      <Td style={{ fontWeight: 600, color: '#0c3b73' }}>{c.totalPurchase}</Td>
                      <Td style={{ fontWeight: 600, color: c.due !== '₹0' ? '#dc2626' : '#16a34a' }}>{c.due}</Td>
                      <Td><TierBadge tier={c.tier} /></Td>
                      <Td><StatusBadge s={c.status} /></Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <button onClick={() => go(c._id)}
                            style={{ padding: '4px 8px', border: 'none', borderRadius: 5, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Eye size={10} /> View
                          </button>
                          <button onClick={() => setEditCustomer(c)}
                            style={{ padding: '4px 8px', border: 'none', borderRadius: 5, background: '#fffbeb', color: '#d97706', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Edit2 size={10} /> Edit
                          </button>
                          <button onClick={() => go(c._id, '/wallet')}
                            style={{ padding: '4px 7px', border: 'none', borderRadius: 5, background: '#f0fdf4', color: '#16a34a', fontSize: 10, cursor: 'pointer' }} title="Wallet">
                            <Wallet size={11} />
                          </button>
                          <button onClick={() => go(c._id, '/loyalty')}
                            style={{ padding: '4px 7px', border: 'none', borderRadius: 5, background: '#fef3c7', color: '#d97706', fontSize: 10, cursor: 'pointer' }} title="Loyalty">
                            <Star size={11} />
                          </button>
                          <button onClick={() => go(c._id, '/membership')}
                            style={{ padding: '4px 7px', border: 'none', borderRadius: 5, background: '#f5f3ff', color: '#7c3aed', fontSize: 10, cursor: 'pointer' }} title="Membership">
                            <Crown size={11} />
                          </button>
                          <button onClick={() => go(c._id, '/reminders')}
                            style={{ padding: '4px 7px', border: 'none', borderRadius: 5, background: '#eff6ff', color: '#3b82f6', fontSize: 10, cursor: 'pointer' }} title="Reminders">
                            <Bell size={11} />
                          </button>
                          <button onClick={() => go(c._id, '/carecoin')}
                            style={{ padding: '4px 7px', border: 'none', borderRadius: 5, background: '#fff7ed', color: '#f97316', fontSize: 10, cursor: 'pointer' }} title="CareCoin">
                            <Award size={11} />
                          </button>
                          <button onClick={() => setConfirmId(c._id)}
                            style={{ padding: '4px 7px', border: 'none', borderRadius: 5, background: '#fee2e2', color: '#dc2626', fontSize: 10, cursor: 'pointer' }} title="Delete">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {customers.length} of {total} customers</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page <= 1 ? 'default' : 'pointer', background: 'none', color: page <= 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ background: n === page ? '#0c3b73' : 'none', border: `1px solid ${n === page ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: n === page ? '#fff' : '#374151', fontSize: 12, fontWeight: n === page ? 700 : 400 }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page >= totalPages ? 'default' : 'pointer', background: 'none', color: page >= totalPages ? '#d1d5db' : '#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
