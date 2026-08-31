/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import {
  Search, Plus, Edit2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, X, Package, Tag, Layers, FileText,
} from 'lucide-react'

const C = {
  primary: '#0c3b73',
  accent: '#fabf22',
  success: '#16a34a',
  danger: '#dc2626',
  border: '#e5e7eb',
  bg: '#f8f9fb',
  white: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
}

const font = { fontFamily: "'Inter', sans-serif" }

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockMedicines = [
  { id: 1, name: 'Paracetamol 650mg', generic: 'Paracetamol', brand: 'Calpol', strength: '650mg', form: 'Tablet', pack: '10s', hsn: '3004', gst: '12%', barcode: '8901030869807', status: true, category: 'Analgesic' },
  { id: 2, name: 'Amoxicillin 500mg', generic: 'Amoxicillin Trihydrate', brand: 'Mox', strength: '500mg', form: 'Capsule', pack: '10s', hsn: '3004', gst: '12%', barcode: '8901030869808', status: true, category: 'Antibiotic' },
  { id: 3, name: 'Pantoprazole 40mg', generic: 'Pantoprazole Sodium', brand: 'Pan-D', strength: '40mg', form: 'Tablet', pack: '15s', hsn: '3004', gst: '12%', barcode: '8901030869809', status: true, category: 'GI' },
  { id: 4, name: 'Azithromycin 500mg', generic: 'Azithromycin Dihydrate', brand: 'Zithromax', strength: '500mg', form: 'Tablet', pack: '5s', hsn: '3004', gst: '12%', barcode: '8901030869810', status: true, category: 'Antibiotic' },
  { id: 5, name: 'Metformin 500mg', generic: 'Metformin HCl', brand: 'Glycomet', strength: '500mg', form: 'Tablet', pack: '20s', hsn: '3004', gst: '5%', barcode: '8901030869811', status: true, category: 'Antidiabetic' },
  { id: 6, name: 'Atorvastatin 10mg', generic: 'Atorvastatin Calcium', brand: 'Lipitor', strength: '10mg', form: 'Tablet', pack: '15s', hsn: '3004', gst: '12%', barcode: '8901030869812', status: true, category: 'Cardiac' },
  { id: 7, name: 'Amlodipine 5mg', generic: 'Amlodipine Besylate', brand: 'Amlovas', strength: '5mg', form: 'Tablet', pack: '30s', hsn: '3004', gst: '12%', barcode: '8901030869813', status: true, category: 'Cardiac' },
  { id: 8, name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', brand: 'Zyrtec', strength: '10mg', form: 'Tablet', pack: '10s', hsn: '3004', gst: '12%', barcode: '8901030869814', status: false, category: 'Antiallergic' },
  { id: 9, name: 'Omeprazole 20mg', generic: 'Omeprazole', brand: 'Prilosec', strength: '20mg', form: 'Capsule', pack: '14s', hsn: '3004', gst: '12%', barcode: '8901030869815', status: true, category: 'GI' },
  { id: 10, name: 'Amikacin 500mg', generic: 'Amikacin Sulphate', brand: 'Amikin', strength: '500mg', form: 'Injection', pack: '2ml', hsn: '3004', gst: '5%', barcode: '8901030869816', status: true, category: 'Antibiotic' },
]

const mockBrands = [
  { id: 1, name: 'Sun Pharma', manufacturer: 'Sun Pharmaceutical Industries', status: true, count: 1240 },
  { id: 2, name: 'Cipla', manufacturer: 'Cipla Ltd.', status: true, count: 980 },
  { id: 3, name: 'Dr. Reddys', manufacturer: "Dr. Reddy's Laboratories", status: true, count: 870 },
  { id: 4, name: 'Zydus Cadila', manufacturer: 'Zydus Lifesciences Ltd.', status: true, count: 760 },
  { id: 5, name: 'Lupin', manufacturer: 'Lupin Limited', status: true, count: 690 },
  { id: 6, name: 'Abbott India', manufacturer: 'Abbott Healthcare Pvt. Ltd.', status: false, count: 430 },
  { id: 7, name: 'Alkem Labs', manufacturer: 'Alkem Laboratories Ltd.', status: true, count: 520 },
  { id: 8, name: 'Mankind Pharma', manufacturer: 'Mankind Pharma Ltd.', status: true, count: 610 },
]

const mockCategories = [
  { id: 1, name: 'Analgesic', type: 'Therapeutic', count: 320, status: true },
  { id: 2, name: 'Antibiotic', type: 'Therapeutic', count: 540, status: true },
  { id: 3, name: 'Antidiabetic', type: 'Therapeutic', count: 210, status: true },
  { id: 4, name: 'Cardiac', type: 'Therapeutic', count: 390, status: true },
  { id: 5, name: 'OTC Vitamins', type: 'OTC', count: 180, status: true },
  { id: 6, name: 'Controlled Substances', type: 'Controlled', count: 45, status: false },
]

const mockTax = [
  { id: 1, hsn: '3004', desc: 'Medicaments (excluding goods of heading 3002, 3005, or 3006)', gst: '12%', status: true },
  { id: 2, hsn: '3002', desc: 'Human blood; animal blood prepared for therapeutic uses; antisera', gst: '5%', status: true },
  { id: 3, hsn: '3005', desc: 'Wadding, gauze, bandages and similar articles', gst: '5%', status: true },
  { id: 4, hsn: '3006', desc: 'Pharmaceutical goods specified in Note 4 to this Chapter', gst: '12%', status: true },
  { id: 5, hsn: '2941', desc: 'Antibiotics', gst: '5%', status: true },
  { id: 6, hsn: '3001', desc: 'Glands and other organs for organo-therapeutic uses', gst: '0%', status: true },
]

const emptyForm = {
  name: '', generic: '', brand: '', strength: '', form: 'Tablet', pack: '', unit: '', hsn: '3004',
  gst: '12', barcode: '', category: '', controlled: false, status: true,
}

// ─── Shared Components ────────────────────────────────────────────────────────
const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color, background: bg, whiteSpace: 'nowrap' }}>{label}</span>
)

const StatCard = ({ label, value, color }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', minWidth: 130, flex: 1 }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: color || C.primary }}>{value}</div>
    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</div>
  </div>
)

const Th = ({ children, w }) => (
  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: C.muted, background: C.bg, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap', width: w }}>{children}</th>
)

const Td = ({ children }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: C.text, borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle' }}>{children}</td>
)

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>{label}</label>}
    <input {...props} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box', ...props.style }} />
  </div>
)

const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>{label}</label>}
    <select {...props} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none', background: C.white, boxSizing: 'border-box', ...props.style }}>
      {children}
    </select>
  </div>
)

const Toggle = ({ checked, onChange }) => (
  <div onClick={onChange} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
    {checked
      ? <ToggleRight size={24} color={C.success} />
      : <ToggleLeft size={24} color={C.muted} />}
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const GlobalMedicineMaster = () => {
  const [activeTab, setActiveTab] = useState('medicines')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [medicines, setMedicines] = useState(mockMedicines)
  const perPage = 10

  const tabs = [
    { key: 'medicines', label: 'Medicines', icon: <Package size={14} /> },
    { key: 'brands', label: 'Brands', icon: <Tag size={14} /> },
    { key: 'categories', label: 'Categories', icon: <Layers size={14} /> },
    { key: 'tax', label: 'Tax / GST', icon: <FileText size={14} /> },
  ]

  const filtered = medicines.filter(m => {
    const s = search.toLowerCase()
    const matchSearch = !s || m.name.toLowerCase().includes(s) || m.generic.toLowerCase().includes(s) || m.barcode.includes(s)
    const matchCat = !catFilter || m.category === catFilter
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? m.status : !m.status)
    return matchSearch && matchCat && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const handleToggle = (id) => setMedicines(prev => prev.map(m => m.id === id ? { ...m, status: !m.status } : m))

  const handleSave = () => {
    if (!form.name) return
    setMedicines(prev => [...prev, { ...form, id: prev.length + 1 }])
    setForm(emptyForm)
    setShowModal(false)
  }

  return (
    <div style={{ ...font, background: C.bg, minHeight: '100vh', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>Global Medicine Master</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>Central medicine catalogue for the network</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 6, marginBottom: 22, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: activeTab === t.key ? C.primary : 'transparent', color: activeTab === t.key ? C.white : C.muted, transition: 'all .15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Medicines Tab ── */}
      {activeTab === 'medicines' && (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatCard label="Total Medicines" value="12,450" />
            <StatCard label="Active" value="11,800" color={C.success} />
            <StatCard label="Inactive" value="650" color={C.danger} />
            <StatCard label="Generic Mapped" value="9,200" color="#7c3aed" />
          </div>

          {/* Filters */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search name / generic / barcode..." style={{ width: '100%', padding: '8px 10px 8px 32px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white }}>
              <option value="">All Categories</option>
              {[...new Set(mockMedicines.map(m => m.category))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
              <thead>
                <tr>
                  <Th>Medicine Name</Th><Th>Generic / Composition</Th><Th>Brand</Th><Th>Strength</Th><Th>Form</Th>
                  <Th>Pack</Th><Th>HSN</Th><Th>GST%</Th><Th>Barcode</Th><Th>Status</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(m => (
                  <tr key={m.id} style={{ transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = C.white}>
                    <Td><span style={{ fontWeight: 600, color: C.primary }}>{m.name}</span></Td>
                    <Td><span style={{ color: C.muted, fontSize: 12 }}>{m.generic}</span></Td>
                    <Td>{m.brand}</Td>
                    <Td><Badge label={m.strength} color={C.primary} bg="#e8f0fb" /></Td>
                    <Td><Badge label={m.form} color="#7c3aed" bg="#f3e8ff" /></Td>
                    <Td>{m.pack}</Td>
                    <Td>{m.hsn}</Td>
                    <Td>{m.gst}</Td>
                    <Td><span style={{ fontSize: 11, color: C.muted }}>{m.barcode}</span></Td>
                    <Td>
                      <Badge label={m.status ? 'Active' : 'Inactive'} color={m.status ? C.success : C.danger} bg={m.status ? '#dcfce7' : '#fee2e2'} />
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button style={{ background: '#e8f0fb', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.primary }}><Edit2 size={13} /></button>
                        <Toggle checked={m.status} onChange={() => handleToggle(m.id)} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.muted }}>Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} records</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ border: `1px solid ${C.border}`, background: C.white, borderRadius: 6, padding: '5px 10px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}><ChevronLeft size={14} /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{ border: `1px solid ${page === p ? C.primary : C.border}`, background: page === p ? C.primary : C.white, color: page === p ? C.white : C.text, borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ border: `1px solid ${C.border}`, background: C.white, borderRadius: 6, padding: '5px 10px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Brands Tab ── */}
      {activeTab === 'brands' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th>Brand Name</Th><Th>Manufacturer</Th><Th>Medicine Count</Th><Th>Status</Th><Th>Actions</Th></tr>
            </thead>
            <tbody>
              {mockBrands.map(b => (
                <tr key={b.id}>
                  <Td><span style={{ fontWeight: 600, color: C.primary }}>{b.name}</span></Td>
                  <Td>{b.manufacturer}</Td>
                  <Td><Badge label={b.count} color={C.primary} bg="#e8f0fb" /></Td>
                  <Td><Badge label={b.status ? 'Active' : 'Inactive'} color={b.status ? C.success : C.danger} bg={b.status ? '#dcfce7' : '#fee2e2'} /></Td>
                  <Td><button style={{ background: '#e8f0fb', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.primary }}><Edit2 size={13} /></button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Categories Tab ── */}
      {activeTab === 'categories' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th>Category Name</Th><Th>Type</Th><Th>Medicines Count</Th><Th>Status</Th><Th>Actions</Th></tr>
            </thead>
            <tbody>
              {mockCategories.map(c => (
                <tr key={c.id}>
                  <Td><span style={{ fontWeight: 600 }}>{c.name}</span></Td>
                  <Td>
                    <Badge label={c.type} color={c.type === 'Controlled' ? C.danger : c.type === 'OTC' ? '#d97706' : C.primary} bg={c.type === 'Controlled' ? '#fee2e2' : c.type === 'OTC' ? '#fef3c7' : '#e8f0fb'} />
                  </Td>
                  <Td>{c.count}</Td>
                  <Td><Badge label={c.status ? 'Active' : 'Inactive'} color={c.status ? C.success : C.danger} bg={c.status ? '#dcfce7' : '#fee2e2'} /></Td>
                  <Td><button style={{ background: '#e8f0fb', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.primary }}><Edit2 size={13} /></button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tax/GST Tab ── */}
      {activeTab === 'tax' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th>HSN Code</Th><Th>Description</Th><Th>GST %</Th><Th>Status</Th><Th>Actions</Th></tr>
            </thead>
            <tbody>
              {mockTax.map(t => (
                <tr key={t.id}>
                  <Td><span style={{ fontWeight: 700, color: C.primary }}>{t.hsn}</span></Td>
                  <Td><span style={{ fontSize: 12, color: C.muted }}>{t.desc}</span></Td>
                  <Td><Badge label={t.gst} color="#d97706" bg="#fef3c7" /></Td>
                  <Td><Badge label={t.status ? 'Active' : 'Inactive'} color={t.status ? C.success : C.danger} bg={t.status ? '#dcfce7' : '#fee2e2'} /></Td>
                  <Td><button style={{ background: '#e8f0fb', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.primary }}><Edit2 size={13} /></button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add Medicine Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', ...font }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.primary }}>Add New Medicine</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Input label="Medicine Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paracetamol 650mg" />
                <Input label="Generic Name / Composition" value={form.generic} onChange={e => setForm(f => ({ ...f, generic: e.target.value }))} placeholder="e.g. Paracetamol" />
                <Select label="Brand" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}>
                  <option value="">Select Brand</option>
                  {mockBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </Select>
                <Input label="Strength" value={form.strength} onChange={e => setForm(f => ({ ...f, strength: e.target.value }))} placeholder="e.g. 650mg" />
                <Select label="Dosage Form" value={form.form} onChange={e => setForm(f => ({ ...f, form: e.target.value }))}>
                  {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Suspension'].map(o => <option key={o} value={o}>{o}</option>)}
                </Select>
                <Input label="Pack Size" value={form.pack} onChange={e => setForm(f => ({ ...f, pack: e.target.value }))} placeholder="e.g. 10s" />
                <Input label="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. Strip" />
                <Input label="HSN Code" value={form.hsn} onChange={e => setForm(f => ({ ...f, hsn: e.target.value }))} placeholder="e.g. 3004" />
                <Select label="GST %" value={form.gst} onChange={e => setForm(f => ({ ...f, gst: e.target.value }))}>
                  {['0', '5', '12', '18'].map(g => <option key={g} value={g}>{g}%</option>)}
                </Select>
                <Input label="Barcode" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Scan or enter barcode" />
                <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Select Category</option>
                  {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </Select>
              </div>
              <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer' }}>
                  <Toggle checked={form.controlled} onChange={() => setForm(f => ({ ...f, controlled: !f.controlled }))} />
                  Controlled Medicine
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer' }}>
                  <Toggle checked={form.status} onChange={() => setForm(f => ({ ...f, status: !f.status }))} />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.muted }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '9px 22px', border: 'none', borderRadius: 7, background: C.primary, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Medicine</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalMedicineMaster
