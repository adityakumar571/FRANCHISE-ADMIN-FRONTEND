/* eslint-disable prettier/prettier */
/**
 * Screen 57 — Supplier List
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Search, Plus, Eye, Edit2, ChevronLeft, ChevronRight, Download, Users, UserCheck, UserX, IndianRupee } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SUPPLIERS } from './supplierMockData'

const Th = ({ c }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function SupplierList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const PER = 10

  const filtered = SUPPLIERS.filter(s =>
    search === '' ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER))
  const paged      = filtered.slice((page-1)*PER, page*PER)

  const totalSuppliers  = SUPPLIERS.length
  const activeSuppliers = SUPPLIERS.filter(s => s.status === 'Active').length
  const inactive        = SUPPLIERS.filter(s => s.status !== 'Active').length
  const totalPayable    = SUPPLIERS.reduce((s, x) => s + x.outstanding, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Truck} title="Supplier List" subtitle="Manage all your suppliers" color="#d97706">
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
        <button onClick={() => navigate('/franchise/suppliers/add')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#d97706', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={14} /> + Add Supplier
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Suppliers',   value: totalSuppliers,  icon: Users,       color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Active Suppliers',  value: activeSuppliers, icon: UserCheck,   color: '#16a34a', bg: '#dcfce7' },
          { label: 'Inactive Suppliers',value: inactive,        icon: UserX,       color: '#dc2626', bg: '#fee2e2' },
          { label: 'Total Payable',     value: `₹${(totalPayable/100000).toFixed(2)}L`, icon: IndianRupee, color: '#d97706', bg: '#fef3c7' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '2px 0 0' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, code, phone, email..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={12} /> Export
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Supplier Code','Supplier Name','Phone','Email','City','Outstanding','Status','Action'].map(h => <Th key={h} c={h} />)}
            </tr></thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No suppliers found</td></tr>
              ) : paged.map(s => (
                <tr key={s.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{s.id}</span></Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#d97706', fontSize: 13, flexShrink: 0 }}>
                        {s.name[0]}
                      </div>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{s.name}</span>
                    </div>
                  </Td>
                  <Td style={{ color: '#6b7280' }}>{s.phone}</Td>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.email}</Td>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.city}</Td>
                  <Td style={{ fontWeight: 700, color: s.outstanding > 0 ? '#dc2626' : '#16a34a' }}>
                    ₹{s.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: s.status==='Active'?'#dcfce7':'#fee2e2', color: s.status==='Active'?'#16a34a':'#dc2626' }}>
                      {s.status}
                    </span>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => navigate(`/franchise/suppliers/${s.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        <Eye size={11} /> View
                      </button>
                      <button onClick={() => navigate(`/franchise/suppliers/${s.id}/edit`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        <Edit2 size={11} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {Math.min((page-1)*PER+1,filtered.length)}–{Math.min(page*PER,filtered.length)} of {filtered.length} entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===1?'default':'pointer', background: 'none', color: page===1?'#d1d5db':'#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p => (
              <button key={p} onClick={()=>setPage(p)}
                style={{ background:page===p?'#0c3b73':'none', border:`1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius:6, padding:'5px 10px', cursor:'pointer', color:page===p?'#fff':'#374151', fontSize:12, fontWeight:page===p?700:400 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===totalPages?'default':'pointer', background: 'none', color: page===totalPages?'#d1d5db':'#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
