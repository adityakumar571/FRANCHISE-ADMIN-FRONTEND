/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import {
  Search, Plus, X, Trash2, ChevronDown, Info, MapPin, Building2,
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
const mockFranchises = [
  { id: 1, name: 'MedPlus Pharmacy', city: 'Mumbai', state: 'Maharashtra', plan: 'Enterprise', suppliers: 4 },
  { id: 2, name: 'Apollo Pharmacy - Andheri', city: 'Andheri', state: 'Maharashtra', plan: 'Professional', suppliers: 3 },
  { id: 3, name: 'Generic One - Thane', city: 'Thane', state: 'Maharashtra', plan: 'Basic', suppliers: 2 },
  { id: 4, name: 'LifeCare Drugs', city: 'Pune', state: 'Maharashtra', plan: 'Professional', suppliers: 5 },
  { id: 5, name: 'CureMed Pharmacy', city: 'Bengaluru', state: 'Karnataka', plan: 'Enterprise', suppliers: 6 },
  { id: 6, name: 'Wellness Plus', city: 'Chennai', state: 'Tamil Nadu', plan: 'Basic', suppliers: 2 },
  { id: 7, name: 'PharmaEase Stores', city: 'Hyderabad', state: 'Telangana', plan: 'Professional', suppliers: 3 },
  { id: 8, name: 'MediWorld Retail', city: 'Kolkata', state: 'West Bengal', plan: 'Enterprise', suppliers: 4 },
]

const mockAssignments = [
  { id: 1, supplier: 'MedLine Pharma Distributors', type: 'Distributor', assignType: 'Assigned', date: '2025-04-10', notes: 'Primary supplier for OTC medicines' },
  { id: 2, supplier: 'HealthHub Wholesale Pvt Ltd', type: 'Wholesaler', assignType: 'Recommended', date: '2025-05-02', notes: 'Good for bulk generic orders' },
  { id: 3, supplier: 'Deccan Pharma Distributors', type: 'Distributor', assignType: 'Preferred', date: '2025-03-18', notes: 'Best rates for injectables' },
  { id: 4, supplier: 'Shree Drugs & Chemicals', type: 'Distributor', assignType: 'Blocked', date: '2025-06-01', notes: 'Compliance issue pending' },
]

const allSuppliers = [
  'MedLine Pharma Distributors', 'HealthHub Wholesale Pvt Ltd', 'PharmaLink Distribution Co.',
  'Shree Drugs & Chemicals', 'Karnataka Medical Suppliers', 'NovaMed Trade Solutions',
  'Tamil Nadu Pharma Works', 'Capital Pharma Suppliers', 'East India Drug House', 'Deccan Pharma Distributors',
]

const assignTypes = [
  { key: 'Assigned', label: 'Assigned', color: '#1d4ed8', bg: '#dbeafe', desc: 'Mandatory supplier for this franchise' },
  { key: 'Recommended', label: 'Recommended', color: C.success, bg: '#dcfce7', desc: 'Suggested but not mandatory' },
  { key: 'Preferred', label: 'Preferred', color: '#d97706', bg: '#fef3c7', desc: 'High-priority preferred partner' },
  { key: 'Blocked', label: 'Blocked', color: C.danger, bg: '#fee2e2', desc: 'Supplier is blocked for this franchise' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, color, background: bg, whiteSpace: 'nowrap' }}>{label}</span>
)

const assignBadge = (type) => {
  const t = assignTypes.find(a => a.key === type)
  if (!t) return null
  return <Badge label={t.label} color={t.color} bg={t.bg} />
}

const Th = ({ children }) => (
  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: C.muted, background: C.bg, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{children}</th>
)
const Td = ({ children }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: C.text, borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle' }}>{children}</td>
)

const StatCard = ({ label, value, color }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 110 }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: color || C.primary }}>{value}</div>
    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const SupplierAssignment = () => {
  const [franchiseSearch, setFranchiseSearch] = useState('')
  const [selectedFranchise, setSelectedFranchise] = useState(null)
  const [assignments, setAssignments] = useState(mockAssignments)
  const [newForm, setNewForm] = useState({ supplier: '', assignType: 'Assigned', notes: '' })
  const [showAssignForm, setShowAssignForm] = useState(false)

  const filteredFranchises = mockFranchises.filter(f =>
    !franchiseSearch || f.name.toLowerCase().includes(franchiseSearch.toLowerCase()) || f.city.toLowerCase().includes(franchiseSearch.toLowerCase())
  )

  const handleAssign = () => {
    if (!newForm.supplier) return
    setAssignments(prev => [...prev, {
      id: prev.length + 1,
      supplier: newForm.supplier,
      type: 'Distributor',
      assignType: newForm.assignType,
      date: new Date().toISOString().split('T')[0],
      notes: newForm.notes,
    }])
    setNewForm({ supplier: '', assignType: 'Assigned', notes: '' })
    setShowAssignForm(false)
  }

  const handleRemove = (id) => setAssignments(prev => prev.filter(a => a.id !== id))

  const handleChangeType = (id, newType) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, assignType: newType } : a))
  }

  return (
    <div style={{ ...font, background: C.bg, minHeight: '100vh', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>Supplier Assignment</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>Assign or recommend distributors to franchise branches</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard label="Total Assignments" value="284" />
        <StatCard label="Assigned" value="156" color="#1d4ed8" />
        <StatCard label="Recommended" value="98" color={C.success} />
        <StatCard label="Blocked" value="30" color={C.danger} />
      </div>

      {/* Two-panel layout */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* LEFT PANEL — Franchise List */}
        <div style={{ width: '38%', minWidth: 260, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, background: C.primary }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.white }}>Select Franchise</h3>
          </div>
          <div style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
              <input value={franchiseSearch} onChange={e => setFranchiseSearch(e.target.value)} placeholder="Search franchise..." style={{ width: '100%', padding: '8px 10px 8px 30px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 480 }}>
            {filteredFranchises.map(f => {
              const isSelected = selectedFranchise?.id === f.id
              return (
                <div key={f.id} onClick={() => setSelectedFranchise(f)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${C.border}`, background: isSelected ? '#e8f0fb' : C.white, borderLeft: isSelected ? `4px solid ${C.primary}` : '4px solid transparent', transition: 'all .15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: isSelected ? C.primary : C.text }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <MapPin size={11} />{f.city}, {f.state}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 12, color: C.primary, background: '#e8f0fb' }}>{f.plan}</span>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{f.suppliers} suppliers</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selectedFranchise ? (
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 60, textAlign: 'center' }}>
              <Building2 size={48} color={C.border} style={{ marginBottom: 16 }} />
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>Select a franchise from the left panel to manage its supplier assignments.</p>
            </div>
          ) : (
            <div>
              {/* Franchise Banner */}
              <div style={{ background: `linear-gradient(135deg, ${C.primary}, #1a5ba8)`, borderRadius: 12, padding: '16px 22px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.white }}>{selectedFranchise.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={12} />{selectedFranchise.city}, {selectedFranchise.state}
                    <span style={{ background: C.accent, color: '#000', borderRadius: 12, padding: '1px 8px', marginLeft: 4, fontSize: 11, fontWeight: 700 }}>{selectedFranchise.plan}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.white }}>{assignments.length}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Current Assignments</div>
                </div>
              </div>

              {/* Current Assignments Table */}
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'auto', marginBottom: 18 }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>Current Assignments</h3>
                  <button onClick={() => setShowAssignForm(!showAssignForm)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: C.white, border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={14} /> Assign Supplier
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><Th>Supplier Name</Th><Th>Type</Th><Th>Assignment Type</Th><Th>Assigned Date</Th><Th>Notes</Th><Th>Actions</Th></tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={a.id} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = C.white}>
                        <Td><span style={{ fontWeight: 600 }}>{a.supplier}</span></Td>
                        <Td>
                          <Badge label={a.type} color={a.type === 'Distributor' ? '#1d4ed8' : '#7c3aed'} bg={a.type === 'Distributor' ? '#dbeafe' : '#f3e8ff'} />
                        </Td>
                        <Td>
                          <select value={a.assignType} onChange={e => handleChangeType(a.id, e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', background: C.white, cursor: 'pointer' }}>
                            {assignTypes.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                          </select>
                        </Td>
                        <Td><span style={{ fontSize: 12, color: C.muted }}>{a.date}</span></Td>
                        <Td><span style={{ fontSize: 12, color: C.muted }}>{a.notes}</span></Td>
                        <Td>
                          <button onClick={() => handleRemove(a.id)} title="Remove" style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: C.danger }}>
                            <Trash2 size={13} />
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Assign Supplier Form */}
              {showAssignForm && (
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>Assign New Supplier</h3>
                    <button onClick={() => setShowAssignForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={16} /></button>
                  </div>

                  {/* Supplier Select */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>Select Supplier *</label>
                    <div style={{ position: 'relative' }}>
                      <select value={newForm.supplier} onChange={e => setNewForm(f => ({ ...f, supplier: e.target.value }))} style={{ width: '100%', padding: '9px 32px 9px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white, appearance: 'none', boxSizing: 'border-box' }}>
                        <option value="">Search & select supplier...</option>
                        {allSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Assignment Type Radio */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 8 }}>Assignment Type</label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {assignTypes.map(t => (
                        <label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '7px 14px', borderRadius: 8, border: `2px solid ${newForm.assignType === t.key ? t.color : C.border}`, background: newForm.assignType === t.key ? t.bg : C.white, transition: 'all .15s' }}>
                          <input type="radio" name="assignType" value={t.key} checked={newForm.assignType === t.key} onChange={e => setNewForm(f => ({ ...f, assignType: e.target.value }))} style={{ accentColor: t.color }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: newForm.assignType === t.key ? t.color : C.muted }}>{t.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>Notes</label>
                    <textarea value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes about this assignment..." rows={2} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowAssignForm(false)} style={{ padding: '9px 18px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.muted }}>Cancel</button>
                    <button onClick={handleAssign} style={{ padding: '9px 22px', border: 'none', borderRadius: 7, background: C.primary, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Assign Supplier</button>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Info size={14} color={C.primary} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Assignment Type Legend</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {assignTypes.map(t => (
                    <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: t.bg, border: `1px solid ${t.color}22` }}>
                      <Badge label={t.label} color={t.color} bg={t.bg} />
                      <span style={{ fontSize: 12, color: C.muted }}>{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupplierAssignment
