/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Store, Plus, Eye, Edit, Search, MapPin, Phone, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { getRequest } from '../../../Helpers'

const Badge = ({ status }) => {
  const colors = {
    Active:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Inactive: { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  }
  const c = colors[status] || colors.Inactive
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {status}
    </span>
  )
}

const Th = ({ children }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', textAlign: 'left' }}>
    {children}
  </th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>
    {children}
  </td>
)

export default function Branches() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [data, setData]     = useState([])
  const [summary, setSummary] = useState({ total: 0, active: 0, staff: 0, monthlySales: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)

  useEffect(() => { fetchBranches() }, [page, status])

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`franchise/branches?page=${page}&limit=10${status !== 'All' ? `&status=${status}` : ''}`)
      setData(res?.data || [])
      setTotal(res?.total || 0)
      if (res?.summary) setSummary(res.summary)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = data.filter(b =>
    search === '' ||
    (b.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (b.city||'').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(total / 10))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Branches / Outlets</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage all franchise branches</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Branch
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Branches',      value: summary.total || total || data.length, icon: Store,       color: '#0c3b73' },
          { label: 'Active Branches',     value: summary.active || data.filter(b=>b.status==='Active').length, icon: TrendingUp, color: '#16a34a' },
          { label: 'Total Staff',         value: summary.staff || 0,                    icon: Users,       color: '#7c3aed' },
          { label: 'Total Sales (Month)', value: summary.monthlySales ? `₹${Number(summary.monthlySales).toLocaleString('en-IN')}` : '—', icon: TrendingUp, color: '#d97706' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: c.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <c.icon size={18} color={c.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{c.label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search branch by name or city..."
            style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>Branch Code</Th><Th>Branch Name</Th><Th>Location</Th><Th>Manager</Th>
                <Th>Phone</Th><Th>Sales (Month)</Th><Th>Orders</Th><Th>Status</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No branches found</td></tr>
              ) : filtered.map(b => (
                <tr key={b._id} style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{b.branchCode || b._id?.slice(-6)}</span></Td>
                  <Td style={{ fontWeight: 600, color: '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Store size={13} color="#0c3b73" />
                      </div>
                      {b.name}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                      <MapPin size={12} />{b.city}{b.state ? `, ${b.state}` : ''}
                    </div>
                  </Td>
                  <Td>{b.manager || b.managerName || '—'}</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                      <Phone size={12} />{b.phone || '—'}
                    </div>
                  </Td>
                  <Td style={{ fontWeight: 600 }}>{b.monthlySales ? `₹${Number(b.monthlySales).toLocaleString('en-IN')}` : '—'}</Td>
                  <Td>{b.orders || b.monthlyOrders || 0}</Td>
                  <Td><Badge status={b.status} /></Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button title="View" style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73' }}><Eye size={13} /></button>
                      <button title="Edit" style={{ background: '#fffbeb', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}><Edit size={13} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {total || data.length} branches</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#374151' }}><ChevronLeft size={14} /></button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ background: page===p?'#0c3b73':'none', border:`1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius:6, padding:'4px 10px', cursor:'pointer', color:page===p?'#fff':'#374151', fontSize:12 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#374151' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
