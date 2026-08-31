/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import {
  Search, Plus, Eye, Edit2, ShieldCheck, ShieldOff, X, ChevronLeft, ChevronRight,
  MapPin, Phone, Package, CheckCircle, Clock, AlertCircle,
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

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockDistributors = [
  { id: 'SUP-001', business: 'MedLine Pharma Distributors', type: 'Distributor', owner: 'Rajesh Kumar', state: 'Maharashtra', city: 'Mumbai', phone: '9876543210', catalogue: 1240, status: true, verified: 'Verified', gstin: '27AABCU9603R1ZX', drug: 'MH-MUM-2019-1234', email: 'rajesh@medline.in', address: '12 BKC, Bandra East, Mumbai 400051' },
  { id: 'SUP-002', business: 'HealthHub Wholesale Pvt Ltd', type: 'Wholesaler', owner: 'Sunita Sharma', state: 'Delhi', city: 'New Delhi', phone: '9812345678', catalogue: 870, status: true, verified: 'Verified', gstin: '07AAACH1234D1Z5', drug: 'DL-DEL-2020-5678', email: 'sunita@healthhub.in', address: 'Plot 5, Azadpur Mandi, New Delhi 110033' },
  { id: 'SUP-003', business: 'PharmaLink Distribution Co.', type: 'Distributor', owner: 'Anand Mehta', state: 'Gujarat', city: 'Ahmedabad', phone: '9023456789', catalogue: 1100, status: true, verified: 'Pending', gstin: '24AAACH9876E2ZP', drug: 'GJ-AMD-2021-9012', email: 'anand@pharmalink.in', address: 'Ring Road, Naroda, Ahmedabad 382330' },
  { id: 'SUP-004', business: 'Shree Drugs & Chemicals', type: 'Distributor', owner: 'Priya Nair', state: 'Kerala', city: 'Kochi', phone: '9934567890', catalogue: 560, status: false, verified: 'Unverified', gstin: '32AAACH7654F3ZQ', drug: 'KL-COK-2022-3456', email: 'priya@shreedrugs.in', address: '8 Marine Drive, Ernakulam, Kochi 682031' },
  { id: 'SUP-005', business: 'Karnataka Medical Suppliers', type: 'Wholesaler', owner: 'Vikram Rao', state: 'Karnataka', city: 'Bengaluru', phone: '9845678901', catalogue: 980, status: true, verified: 'Verified', gstin: '29AAACH4321G4ZR', drug: 'KA-BLR-2018-7890', email: 'vikram@kmsuppliers.in', address: 'Rajajinagar Industrial Area, Bengaluru 560044' },
  { id: 'SUP-006', business: 'NovaMed Trade Solutions', type: 'Distributor', owner: 'Deepak Joshi', state: 'Rajasthan', city: 'Jaipur', phone: '9756789012', catalogue: 720, status: true, verified: 'Pending', gstin: '08AAACH1111H5ZS', drug: 'RJ-JAI-2023-0123', email: 'deepak@novamed.in', address: 'Tonk Road Industrial Area, Jaipur 302015' },
  { id: 'SUP-007', business: 'Tamil Nadu Pharma Works', type: 'Wholesaler', owner: 'Meena Krishnan', state: 'Tamil Nadu', city: 'Chennai', phone: '9667890123', catalogue: 1050, status: true, verified: 'Verified', gstin: '33AAACH2222I6ZT', drug: 'TN-CHE-2019-4567', email: 'meena@tnpharma.in', address: 'Ambattur Industrial Estate, Chennai 600058' },
  { id: 'SUP-008', business: 'Capital Pharma Suppliers', type: 'Distributor', owner: 'Sanjay Gupta', state: 'Uttar Pradesh', city: 'Lucknow', phone: '9578901234', catalogue: 630, status: false, verified: 'Pending', gstin: '09AAACH3333J7ZU', drug: 'UP-LKO-2022-8901', email: 'sanjay@capitalpharma.in', address: 'Alambagh, Lucknow 226005' },
  { id: 'SUP-009', business: 'East India Drug House', type: 'Wholesaler', owner: 'Rina Das', state: 'West Bengal', city: 'Kolkata', phone: '9489012345', catalogue: 890, status: true, verified: 'Verified', gstin: '19AAACH4444K8ZV', drug: 'WB-KOL-2020-2345', email: 'rina@eidh.in', address: 'Park Street, Kolkata 700016' },
  { id: 'SUP-010', business: 'Deccan Pharma Distributors', type: 'Distributor', owner: 'Ravi Reddy', state: 'Telangana', city: 'Hyderabad', phone: '9390123456', catalogue: 760, status: true, verified: 'Verified', gstin: '36AAACH5555L9ZW', drug: 'TS-HYD-2021-6789', email: 'ravi@deccanpharma.in', address: 'Kukatpally Industrial Area, Hyderabad 500072' },
]

const emptyForm = { business: '', owner: '', email: '', phone: '', type: 'Distributor', state: '', city: '', address: '', gstin: '', drug: '', status: true }

// ─── Sub-components ───────────────────────────────────────────────────────────
const Th = ({ children }) => (
  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: C.muted, background: C.bg, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{children}</th>
)
const Td = ({ children }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: C.text, borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle' }}>{children}</td>
)
const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, color, background: bg, whiteSpace: 'nowrap' }}>{label}</span>
)
const StatCard = ({ label, value, color, icon }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 110, display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: color || C.primary }}>{icon}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: color || C.primary }}>{value}</span>
    </div>
    <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
  </div>
)
const LabelInput = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>{label}</label>
    <input {...props} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
  </div>
)
const LabelSelect = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>{label}</label>
    <select {...props} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none', background: C.white, boxSizing: 'border-box' }}>
      {children}
    </select>
  </div>
)

const veriBadge = (v) => {
  if (v === 'Verified') return <Badge label="✓ Verified" color={C.success} bg="#dcfce7" />
  if (v === 'Pending') return <Badge label="⏳ Pending" color="#d97706" bg="#fef3c7" />
  return <Badge label="✗ Unverified" color={C.danger} bg="#fee2e2" />
}

const typeBadge = (t) => t === 'Distributor'
  ? <Badge label="Distributor" color="#1d4ed8" bg="#dbeafe" />
  : <Badge label="Wholesaler" color="#7c3aed" bg="#f3e8ff" />

// ─── Side Panel ───────────────────────────────────────────────────────────────
const ViewPanel = ({ supplier, onClose }) => (
  <div style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100vh', background: C.white, boxShadow: '-4px 0 30px rgba(0,0,0,0.12)', zIndex: 999, display: 'flex', flexDirection: 'column', ...font }}>
    <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.primary }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.white }}>Supplier Profile</h2>
      <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, cursor: 'pointer', color: C.white, padding: '4px 8px' }}><X size={18} /></button>
    </div>
    <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 4 }}>{supplier.business}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>{typeBadge(supplier.type)}{veriBadge(supplier.verified)}</div>
        <div style={{ fontSize: 13, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {supplier.city}, {supplier.state}</div>
      </div>
      <Section title="Contact">
        <Row label="Owner" value={supplier.owner} />
        <Row label="Phone" value={supplier.phone} />
        <Row label="Email" value={supplier.email} />
        <Row label="Address" value={supplier.address} />
      </Section>
      <Section title="Legal">
        <Row label="GSTIN" value={supplier.gstin} />
        <Row label="Drug License" value={supplier.drug} />
      </Section>
      <Section title="Catalogue Summary">
        <div style={{ display: 'flex', gap: 12 }}>
          <StatMini label="Total Items" value={supplier.catalogue} />
          <StatMini label="Active" value={Math.floor(supplier.catalogue * 0.9)} />
          <StatMini label="Inactive" value={Math.floor(supplier.catalogue * 0.1)} />
        </div>
      </Section>
      <Section title="Assigned Franchises">
        {['MedPlus - Andheri', 'Apollo - Bandra', 'Generic One - Thane'].map(f => (
          <div key={f} style={{ padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.text }}>{f}</div>
        ))}
      </Section>
      <Section title="Recent Orders">
        {[{ date: '2025-06-28', amount: '₹1,24,500', status: 'Delivered' }, { date: '2025-06-15', amount: '₹98,200', status: 'Delivered' }, { date: '2025-05-30', amount: '₹2,10,000', status: 'Completed' }].map((o, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
            <span style={{ color: C.muted }}>{o.date}</span>
            <span style={{ fontWeight: 600 }}>{o.amount}</span>
            <Badge label={o.status} color={C.success} bg="#dcfce7" />
          </div>
        ))}
      </Section>
    </div>
  </div>
)

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${C.border}` }}>{title}</div>
    {children}
  </div>
)
const Row = ({ label, value }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
    <span style={{ color: C.muted, minWidth: 90 }}>{label}:</span>
    <span style={{ color: C.text, fontWeight: 500 }}>{value}</span>
  </div>
)
const StatMini = ({ label, value }) => (
  <div style={{ background: C.bg, borderRadius: 8, padding: '10px 14px', flex: 1, textAlign: 'center' }}>
    <div style={{ fontSize: 18, fontWeight: 700, color: C.primary }}>{value}</div>
    <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const DistributorManagement = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [viewPanel, setViewPanel] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [distributors, setDistributors] = useState(mockDistributors)
  const perPage = 10

  const tabs = [
    { key: 'all', label: 'All Suppliers' },
    { key: 'distributor', label: 'Distributors' },
    { key: 'wholesaler', label: 'Wholesalers' },
    { key: 'pending', label: 'Pending Verification' },
  ]

  const filtered = distributors.filter(d => {
    const s = search.toLowerCase()
    const matchSearch = !s || d.business.toLowerCase().includes(s) || d.owner.toLowerCase().includes(s) || d.id.toLowerCase().includes(s)
    const matchType = !typeFilter || d.type === typeFilter
    const matchState = !stateFilter || d.state === stateFilter
    const matchStatus = !statusFilter || (statusFilter === 'active' ? d.status : !d.status)
    const matchTab = activeTab === 'all' || (activeTab === 'distributor' && d.type === 'Distributor') || (activeTab === 'wholesaler' && d.type === 'Wholesaler') || (activeTab === 'pending' && d.verified === 'Pending')
    return matchSearch && matchType && matchState && matchStatus && matchTab
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const handleSave = () => {
    if (!form.business) return
    setDistributors(prev => [...prev, { ...form, id: `SUP-0${prev.length + 1}`, catalogue: 0, verified: 'Pending' }])
    setForm(emptyForm)
    setShowModal(false)
  }

  const states = [...new Set(mockDistributors.map(d => d.state))].sort()

  return (
    <div style={{ ...font, background: C.bg, minHeight: '100vh', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>Distributor / Wholesaler Management</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>Manage and verify your supplier network across India</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Add Distributor
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard label="Total Suppliers" value="48" icon={<Package size={18} />} />
        <StatCard label="Active" value="42" color={C.success} icon={<CheckCircle size={18} />} />
        <StatCard label="Distributors" value="28" color="#1d4ed8" icon={<ShieldCheck size={18} />} />
        <StatCard label="Wholesalers" value="20" color="#7c3aed" icon={<Package size={18} />} />
        <StatCard label="Pending Verification" value="6" color="#d97706" icon={<Clock size={18} />} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 6, marginBottom: 18, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1) }} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: activeTab === t.key ? C.primary : 'transparent', color: activeTab === t.key ? C.white : C.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search supplier, owner, ID..." style={{ width: '100%', padding: '8px 10px 8px 32px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white }}>
          <option value="">All Types</option>
          <option value="Distributor">Distributor</option>
          <option value="Wholesaler">Wholesaler</option>
        </select>
        <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white }}>
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
          <thead>
            <tr>
              <Th>Supplier ID</Th><Th>Business Name</Th><Th>Type</Th><Th>Owner</Th><Th>State / City</Th>
              <Th>Phone</Th><Th>Catalogue Items</Th><Th>Status</Th><Th>Verification</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(d => (
              <tr key={d.id} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = C.white}>
                <Td><span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>{d.id}</span></Td>
                <Td><span style={{ fontWeight: 600 }}>{d.business}</span></Td>
                <Td>{typeBadge(d.type)}</Td>
                <Td>{d.owner}</Td>
                <Td>
                  <div style={{ fontSize: 13 }}>{d.city}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.state}</div>
                </Td>
                <Td><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} color={C.muted} />{d.phone}</span></Td>
                <Td><Badge label={d.catalogue} color={C.primary} bg="#e8f0fb" /></Td>
                <Td><Badge label={d.status ? 'Active' : 'Inactive'} color={d.status ? C.success : C.danger} bg={d.status ? '#dcfce7' : '#fee2e2'} /></Td>
                <Td>{veriBadge(d.verified)}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setViewPanel(d)} title="View" style={{ background: '#e8f0fb', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: C.primary }}><Eye size={13} /></button>
                    <button title="Edit" style={{ background: '#fef9ec', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}><Edit2 size={13} /></button>
                    <button title="Verify" style={{ background: '#dcfce7', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: C.success }}><ShieldCheck size={13} /></button>
                    <button title="Suspend" style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: C.danger }}><ShieldOff size={13} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, color: C.muted }}>Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ border: `1px solid ${C.border}`, background: C.white, borderRadius: 6, padding: '5px 10px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ border: `1px solid ${page === p ? C.primary : C.border}`, background: page === p ? C.primary : C.white, color: page === p ? C.white : C.text, borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ border: `1px solid ${C.border}`, background: C.white, borderRadius: 6, padding: '5px 10px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* View Panel */}
      {viewPanel && <ViewPanel supplier={viewPanel} onClose={() => setViewPanel(null)} />}

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', ...font }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.primary }}>Add New Distributor</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <LabelInput label="Business Name *" value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))} placeholder="e.g. MedLine Pharma" />
                <LabelInput label="Owner Name" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} placeholder="e.g. Rajesh Kumar" />
                <LabelInput label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@company.in" />
                <LabelInput label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile" />
                <LabelSelect label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="Distributor">Distributor</option>
                  <option value="Wholesaler">Wholesaler</option>
                </LabelSelect>
                <LabelInput label="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="e.g. Maharashtra" />
                <LabelInput label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Mumbai" />
                <LabelInput label="GSTIN" value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} placeholder="27XXXXX1234X1ZX" />
                <LabelInput label="Drug License No." value={form.drug} onChange={e => setForm(f => ({ ...f, drug: e.target.value }))} placeholder="e.g. MH-MUM-2024-1234" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>Address</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address..." rows={2} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.muted }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '9px 22px', border: 'none', borderRadius: 7, background: C.primary, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Distributor</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DistributorManagement
