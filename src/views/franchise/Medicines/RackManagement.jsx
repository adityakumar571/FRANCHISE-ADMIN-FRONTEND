/* eslint-disable prettier/prettier */
/**
 * Screen 18 — Rack Management
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Plus, Edit2, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { RACKS } from './medicineMockData'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function RackManagement() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newRack, setNewRack] = useState({ shelf: '', capacity: '', section: '' })

  const filtered = RACKS.filter(r =>
    search === '' || r.name.toLowerCase().includes(search.toLowerCase()) || r.warehouse.toLowerCase().includes(search.toLowerCase())
  )

  /* Group by warehouse */
  const warehouses = [...new Set(RACKS.map(r => r.warehouse))]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Layers} title="Rack Management" subtitle="Organise medicines in racks and shelves" color="#16a34a">
        <button onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={14} /> Add New Rack
        </button>
      </PageHeader>

      {/* Add Rack Form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px' }}>Add New Rack / Shelf</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 12 }}>
            {[['Shelf Name', 'shelf', 'e.g. A-05'], ['Capacity', 'capacity', '200'], ['Section', 'section', 'e.g. Pain Relief Section']].map(([l,k,ph]) => (
              <div key={k}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 5 }}>{l}</label>
                <input value={newRack[k]} onChange={e => setNewRack(p => ({...p,[k]:e.target.value}))} placeholder={ph}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: '9px 18px', border: 'none', borderRadius: 8, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Rack</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rack or warehouse..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Warehouse Groups */}
      {warehouses.map(wh => (
        <div key={wh} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#f8faff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>🏪 {wh}</p>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{filtered.filter(r => r.warehouse === wh).length} racks</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th c="Shelf / Rack" /><Th c="Shelf Code" /><Th c="Shelf Name" />
                <Th c="Capacity" align="center" /><Th c="Current Items" align="center" />
                <Th c="Status" /><Th c="Actions" />
              </tr></thead>
              <tbody>
                {filtered.filter(r => r.warehouse === wh).map((r, i) => {
                  const pct = Math.round((r.currentItems / r.capacity) * 100)
                  const full = pct >= 100
                  return (
                    <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <Td style={{ fontWeight: 700, color: '#0c3b73' }}>{r.shelf}</Td>
                      <Td style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.name}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>Pain Relief Section</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 600 }}>{r.capacity}</Td>
                      <Td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                          <span style={{ fontWeight: 700, color: full ? '#dc2626' : '#111827' }}>{r.currentItems}</span>
                          <div style={{ width: 60, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(pct,100)}%`, height: '100%', background: full ? '#dc2626' : pct > 80 ? '#d97706' : '#16a34a', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 10, color: '#9ca3af' }}>{pct}%</span>
                        </div>
                      </Td>
                      <Td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#dcfce7', color: '#16a34a' }}>{r.status}</span>
                      </Td>
                      <Td>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          <Edit2 size={11} /> Edit
                        </button>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
