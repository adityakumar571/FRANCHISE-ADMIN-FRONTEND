/* eslint-disable prettier/prettier */
/**
 * RackWarehouse — Create/view rack structure + rack-wise stock
 * SOW §11.2: Rack-Wise Operations
 */
import { useState } from 'react'
import { Layers, Plus, Package, Search, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'

const MOCK_RACKS = [
  { code: 'A01', area: 'Main Store', shelf: 'Shelf 1', description: 'Analgesics & Antipyretics', items: 12, capacity: 20 },
  { code: 'A02', area: 'Main Store', shelf: 'Shelf 2', description: 'Antibiotics', items: 8, capacity: 15 },
  { code: 'B01', area: 'Main Store', shelf: 'Shelf 3', description: 'Cardiac & BP', items: 6, capacity: 12 },
  { code: 'B02', area: 'Main Store', shelf: 'Shelf 3', description: 'Antidiabetics', items: 10, capacity: 15 },
  { code: 'C01', area: 'Back Store', shelf: 'Shelf 1', description: 'Cold & Cough', items: 15, capacity: 20 },
  { code: 'D01', area: 'Back Store', shelf: 'Shelf 2', description: 'Vitamins & Supplements', items: 20, capacity: 25 },
  { code: 'REF', area: 'Refrigerator', shelf: 'Fridge', description: 'Cold storage — Insulin, Vaccines', items: 4, capacity: 8 },
]

const MOCK_STOCK_BY_RACK = {
  'A01': [
    { medicine: 'Paracetamol 650mg', batch: 'B2401', expiry: '2027-06', qty: 450 },
    { medicine: 'Ibuprofen 400mg', batch: 'B2395', expiry: '2027-03', qty: 200 },
  ],
  'A02': [
    { medicine: 'Amoxicillin 500mg', batch: 'B2395', expiry: '2026-10', qty: 25 },
    { medicine: 'Azithromycin 500mg', batch: 'B2310', expiry: '2026-08', qty: 0 },
  ],
}

const RackWarehouse = () => {
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newRack, setNewRack] = useState({ code: '', area: '', shelf: '', description: '', capacity: '' })

  const filtered = MOCK_RACKS.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.code.toLowerCase().includes(q) || r.area.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader icon={Layers} title="Rack & Warehouse" subtitle="Manage physical storage locations and rack-wise stock" color="#2563eb">
        <button onClick={() => setAddOpen(true)} style={primaryBtn}><Plus size={14} /> Add Rack</button>
      </PageHeader>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input type="text" placeholder="Search rack code, area…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 8, paddingLeft: 32, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
      </div>

      {/* Rack Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 24 }}>
        {filtered.map((rack) => {
          const pct = Math.round((rack.items / rack.capacity) * 100)
          const barColor = pct > 85 ? '#e11d48' : pct > 60 ? '#d97706' : '#16a34a'
          return (
            <div key={rack.code} onClick={() => setSelected(selected?.code === rack.code ? null : rack)}
              style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: `2px solid ${selected?.code === rack.code ? '#2563eb' : '#e5e7eb'}`, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 700 }}>{rack.code}</span>
                  <p style={{ margin: '8px 0 2px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{rack.description}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{rack.area} · {rack.shelf}</p>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Layers size={18} color="#2563eb" />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{rack.items} / {rack.capacity} SKUs</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: barColor }}>{pct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 10, background: '#f3f4f6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 10, transition: 'width 0.4s' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stock detail for selected rack */}
      {selected && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
              Rack {selected.code} — {selected.description}
            </h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={16} /></button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#f9fafb' }}>
              {['Medicine', 'Batch', 'Expiry', 'Qty'].map((h) => <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(MOCK_STOCK_BY_RACK[selected.code] || []).length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>No stock in this rack</td></tr>
              ) : (
                (MOCK_STOCK_BY_RACK[selected.code] || []).map((s, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '9px 14px', fontWeight: 600 }}>{s.medicine}</td>
                    <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: 12 }}>{s.batch}</td>
                    <td style={{ padding: '9px 14px' }}>{s.expiry}</td>
                    <td style={{ padding: '9px 14px', fontWeight: 700, color: s.qty <= 0 ? '#e11d48' : '#111827' }}>{s.qty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Rack Modal */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Add New Rack</h3>
              <button onClick={() => setAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={18} /></button>
            </div>
            {[
              { label: 'Rack Code *', key: 'code', placeholder: 'e.g. A01' },
              { label: 'Area', key: 'area', placeholder: 'e.g. Main Store' },
              { label: 'Shelf', key: 'shelf', placeholder: 'e.g. Shelf 1' },
              { label: 'Description', key: 'description', placeholder: 'Medicine type stored' },
              { label: 'Capacity (SKUs)', key: 'capacity', placeholder: '20' },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{f.label}</label>
                <input value={newRack[f.key]} onChange={(e) => setNewRack((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  style={{ width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 7, padding: '0 11px', fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setAddOpen(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { toast.success('Rack added'); setAddOpen(false) }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Add Rack</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const primaryBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }

export default RackWarehouse
