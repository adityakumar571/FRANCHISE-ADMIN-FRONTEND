/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { TrendingUp, Search, Edit2, Save, X, Plus, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

const MOCK = [
  { id: 'SKU-001', name: 'Paracetamol 650mg Tablet',      company: 'GSK',       pack: '10x15', mrp: 28.00,  ptr: 20.20, pts: 18.50, stock: 4200, minOrder: 10 },
  { id: 'SKU-002', name: 'Azithromycin 500mg Tablet',     company: 'Alkem',     pack: '3 Strip',mrp: 98.50, ptr: 72.00, pts: 68.00, stock: 42,   minOrder: 5  },
  { id: 'SKU-003', name: 'Amoxicillin 500mg Capsule',     company: 'Cipla',     pack: '10x10', mrp: 65.00,  ptr: 47.50, pts: 44.00, stock: 320,  minOrder: 20 },
  { id: 'SKU-004', name: 'Pantoprazole 40mg + Domperidone',company: 'Aristo',   pack: '10x10', mrp: 125.00, ptr: 91.00, pts: 86.50, stock: 980,  minOrder: 5  },
  { id: 'SKU-005', name: 'Metformin 500mg Tablet',        company: 'USV',       pack: '10x15', mrp: 42.00,  ptr: 30.00, pts: 28.50, stock: 2100, minOrder: 10 },
  { id: 'SKU-006', name: 'Atorvastatin 10mg Tablet',      company: 'Sun Pharma',pack: '10x15', mrp: 88.00,  ptr: 64.00, pts: 61.00, stock: 1560, minOrder: 5  },
  { id: 'SKU-007', name: 'Cetirizine 10mg Tablet',        company: 'GSK',       pack: '10x10', mrp: 22.00,  ptr: 16.00, pts: 15.00, stock: 3200, minOrder: 20 },
  { id: 'SKU-008', name: 'Omeprazole 20mg Capsule',       company: 'Dr Reddy',  pack: '10x10', mrp: 38.00,  ptr: 27.50, pts: 26.00, stock: 0,    minOrder: 10 },
  { id: 'SKU-009', name: 'Ceftriaxone 1g Injection',      company: 'Aristo',    pack: '1 Vial', mrp: 85.00, ptr: 62.00, pts: 58.00, stock: 18,   minOrder: 1  },
  { id: 'SKU-010', name: 'Dolo 650 Tablet',               company: 'Micro Labs', pack: '15 Tab',mrp: 30.00, ptr: 21.80, pts: 20.50, stock: 6800, minOrder: 10 },
]

const PER = 8
const Th = ({ c, a = 'left' }) => <th style={{ padding: '9px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: a, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function DistStockPricing() {
  const [items, setItems] = useState(MOCK)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const filtered = items.filter(m => search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER))
  const paged = filtered.slice((page - 1) * PER, page * PER)

  const startEdit = (item) => {
    setEditId(item.id)
    setEditForm({ ptr: item.ptr, pts: item.pts, stock: item.stock, minOrder: item.minOrder })
  }
  const saveEdit = (id) => {
    setItems(p => p.map(m => m.id === id ? { ...m, ...editForm, ptr: +editForm.ptr, pts: +editForm.pts, stock: +editForm.stock, minOrder: +editForm.minOrder } : m))
    setEditId(null)
  }

  const lowStock  = items.filter(m => m.stock > 0 && m.stock < 100).length
  const outOfStock = items.filter(m => m.stock === 0).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={20} color="#fabf22" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Live Stock & Pricing</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Update real-time PTR, PTS and available stock</p>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total SKUs',    value: items.length,                                     color: '#0c3b73' },
          { label: 'In Stock',      value: items.filter(m => m.stock > 100).length,          color: '#16a34a' },
          { label: 'Low Stock',     value: lowStock,                                         color: '#d97706' },
          { label: 'Out of Stock',  value: outOfStock,                                       color: '#dc2626' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${k.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {lowStock + outOfStock > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} color="#d97706" />
          <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
            {outOfStock} item(s) out of stock · {lowStock} item(s) running low — update stock now.
          </span>
        </div>
      )}

      {/* Filter + search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search medicine name or SKU..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="SKU" /><Th c="Medicine Name" /><Th c="Company" />
              <Th c="MRP (₹)" a="right" /><Th c="PTR (₹)" a="right" /><Th c="PTS (₹)" a="right" />
              <Th c="Stock" a="center" /><Th c="Min Order" a="center" /><Th c="Action" />
            </tr></thead>
            <tbody>
              {paged.map(m => (
                <tr key={m.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{m.id}</span></Td>
                  <Td style={{ fontWeight: 600, maxWidth: 220 }}>{m.name}</Td>
                  <Td style={{ fontSize: 12, color: '#6b7280' }}>{m.company}</Td>
                  <Td style={{ textAlign: 'right' }}>₹{m.mrp.toFixed(2)}</Td>

                  {/* Editable PTR */}
                  <Td style={{ textAlign: 'right' }}>
                    {editId === m.id
                      ? <input type="number" value={editForm.ptr} onChange={e => setEditForm(p => ({ ...p, ptr: e.target.value }))}
                          style={{ width: 70, padding: '4px 6px', border: '1px solid #0c3b73', borderRadius: 6, fontSize: 12, textAlign: 'right', outline: 'none' }} />
                      : <span style={{ fontWeight: 700, color: '#0c3b73' }}>₹{m.ptr.toFixed(2)}</span>
                    }
                  </Td>

                  {/* Editable PTS */}
                  <Td style={{ textAlign: 'right' }}>
                    {editId === m.id
                      ? <input type="number" value={editForm.pts} onChange={e => setEditForm(p => ({ ...p, pts: e.target.value }))}
                          style={{ width: 70, padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, textAlign: 'right', outline: 'none' }} />
                      : <span style={{ color: '#6b7280' }}>₹{m.pts.toFixed(2)}</span>
                    }
                  </Td>

                  {/* Editable Stock */}
                  <Td style={{ textAlign: 'center' }}>
                    {editId === m.id
                      ? <input type="number" value={editForm.stock} onChange={e => setEditForm(p => ({ ...p, stock: e.target.value }))}
                          style={{ width: 70, padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, textAlign: 'center', outline: 'none' }} />
                      : <span style={{ fontWeight: 700, color: m.stock === 0 ? '#dc2626' : m.stock < 100 ? '#d97706' : '#16a34a' }}>{m.stock}</span>
                    }
                  </Td>

                  {/* Editable Min Order */}
                  <Td style={{ textAlign: 'center' }}>
                    {editId === m.id
                      ? <input type="number" value={editForm.minOrder} onChange={e => setEditForm(p => ({ ...p, minOrder: e.target.value }))}
                          style={{ width: 60, padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, textAlign: 'center', outline: 'none' }} />
                      : m.minOrder
                    }
                  </Td>

                  <Td>
                    {editId === m.id
                      ? (
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => saveEdit(m.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <Save size={11} /> Save
                          </button>
                          <button onClick={() => setEditId(null)}
                            style={{ padding: '5px 7px', border: 'none', borderRadius: 6, background: '#fee2e2', cursor: 'pointer' }}>
                            <X size={11} color="#dc2626" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(m)}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          <Edit2 size={11} /> Edit
                        </button>
                      )
                    }
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {paged.length} of {filtered.length} SKUs</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: page === p ? '#0c3b73' : 'none', border: `1px solid ${page === p ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: page === p ? '#fff' : '#374151', fontSize: 12 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none', color: page === totalPages ? '#d1d5db' : '#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
