/* eslint-disable prettier/prettier */
/**
 * Screen 21 — Generic Mapping
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GitMerge, ArrowLeft, Plus, Trash2, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MEDICINES, GENERIC_BRANDS } from './medicineMockData'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function GenericMapping() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const med       = MEDICINES.find(m => m._id === id) || MEDICINES[0]
  const [search, setSearch] = useState('')
  const [company, setCompany] = useState('All Companies')

  const filtered = GENERIC_BRANDS.filter(b =>
    search === '' || b.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={GitMerge} title="Generic Mapping" subtitle="Map brand medicines to their generic salt" color="#16a34a">
        <button onClick={() => navigate(`/franchise/medicines/${med._id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={14} /> Add Mapping
        </button>
      </PageHeader>

      {/* Generic / Salt Info */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Generic / Salt</p>
            <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: '#111827' }}>{med.salt}</p>
          </div>
          <div style={{ padding: '12px 20px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' }}>Category</p>
            <p style={{ margin: '3px 0 0', fontSize: 15, fontWeight: 700, color: '#16a34a' }}>{med.category}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brand medicines..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={company} onChange={e => setCompany(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#f9fafb', cursor: 'pointer', outline: 'none' }}>
          {['All Companies', 'GSK', 'Cipla', 'Sun Pharma', 'Abbott'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Mapped Brands Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Mapped Brand Medicines ({filtered.length})</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Brand Name" /><Th c="Formulation" /><Th c="Strength" /><Th c="MRP (₹)" align="right" /><Th c="Action" />
            </tr></thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <Td style={{ fontWeight: 600 }}>{b.brand}</Td>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{b.formulation}</Td>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{b.strength}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹ {b.mrp.toFixed(2)}</Td>
                  <Td>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', border: 'none', borderRadius: 6, background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      <Trash2 size={10} /> Remove
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
