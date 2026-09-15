/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Plus, X, Trash2, ChevronDown, Info, MapPin, Building2,
  RefreshCw, ChevronLeft, ChevronRight, Truck,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const C = {
  primary: '#0c3b73', accent: '#fabf22', success: '#16a34a',
  danger: '#dc2626', border: '#e5e7eb', bg: '#f8f9fb',
  white: '#ffffff', text: '#111827', muted: '#6b7280',
}
const font = { fontFamily: "'Inter', sans-serif" }

const assignTypes = [
  { key: 'Assigned',    label: 'Assigned',    color: '#1d4ed8', bg: '#dbeafe', desc: 'Mandatory supplier for this franchise' },
  { key: 'Recommended', label: 'Recommended', color: C.success, bg: '#dcfce7', desc: 'Suggested but not mandatory' },
  { key: 'Preferred',   label: 'Preferred',   color: '#d97706', bg: '#fef3c7', desc: 'High-priority preferred partner' },
  { key: 'Blocked',     label: 'Blocked',     color: C.danger,  bg: '#fee2e2', desc: 'Supplier is blocked for this franchise' },
]

/* ─── helpers ─── */
const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, color, background: bg, whiteSpace: 'nowrap' }}>
    {label}
  </span>
)
const Th = ({ children }) => (
  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: C.muted,
    background: C.bg, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{children}</th>
)
const Td = ({ children }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: C.text, borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle' }}>{children}</td>
)
const StatCard = ({ label, value, color, loading }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 110 }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: color || C.primary }}>
      {loading ? <div style={{ height: 24, width: 48, background: '#f3f4f6', borderRadius: 6 }} /> : value}
    </div>
    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</div>
  </div>
)

/* ─── skeleton rows ─── */
const SkeletonFranchise = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ height: 12, background: '#f3f4f6', borderRadius: 5, width: '70%', marginBottom: 6 }} />
        <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, width: '40%' }} />
      </div>
    ))}
  </>
)

/* ─── pagination ─── */
const PaginationBar = ({ page, totalPages, total, perPage, setPage }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 12px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 6 }}>
    <span style={{ fontSize: 11, color: C.muted }}>
      {total === 0 ? 'No records' : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}`}
    </span>
    <div style={{ display: 'flex', gap: 3 }}>
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
        style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
        <ChevronLeft size={12} />
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
        <button key={n} onClick={() => setPage(n)}
          style={{ width: 26, height: 26, borderRadius: 6,
            border: `1px solid ${n === page ? C.primary : C.border}`,
            background: n === page ? C.primary : C.white,
            color: n === page ? '#fff' : '#374151',
            fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
      ))}
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
        style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>
        <ChevronRight size={12} />
      </button>
    </div>
  </div>
)

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const SupplierAssignment = () => {
  /* ── franchise list ── */
  const [franchises,      setFranchises]      = useState([])
  const [franchiseTotal,  setFranchiseTotal]  = useState(0)
  const [franchisePage,   setFranchisePage]   = useState(1)
  const [franchisePages,  setFranchisePages]  = useState(1)
  const [franchiseSearch, setFranchiseSearch] = useState('')
  const [franchiseLoading,setFranchiseLoading]= useState(false)

  /* ── supplier (distributor) list ── */
  const [allSuppliers,     setAllSuppliers]     = useState([])
  const [supplierTotal,    setSupplierTotal]    = useState(0)
  const [supplierLoading,  setSupplierLoading]  = useState(false)

  /* ── selected franchise & local assignments ── */
  const [selectedFranchise, setSelectedFranchise] = useState(null)
  /* assignments[franchiseId] = [] — stored per franchise in local state */
  const [assignmentsMap,    setAssignmentsMap]    = useState({})
  const [newForm,           setNewForm]           = useState({ supplierId: '', assignType: 'Assigned', notes: '' })
  const [showAssignForm,    setShowAssignForm]     = useState(false)

  const F_PER = 8

  /* ── stats derived from real data ── */
  const allAssignments = Object.values(assignmentsMap).flat()
  const assignedCount    = allAssignments.filter(a => a.assignType === 'Assigned').length
  const recommendedCount = allAssignments.filter(a => a.assignType === 'Recommended').length
  const blockedCount     = allAssignments.filter(a => a.assignType === 'Blocked').length

  /* ── fetch franchises ── */
  const fetchFranchises = useCallback(() => {
    setFranchiseLoading(true)
    const p = new URLSearchParams({ page: franchisePage, limit: F_PER, isPagination: 'true' })
    if (franchiseSearch) p.set('search', franchiseSearch)
    getRequest(`schools?${p}`)
      .then(res => {
        const d    = res?.data?.data
        const list = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []
        setFranchises(list)
        setFranchiseTotal(d?.total || list.length)
        setFranchisePages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load franchises'))
      .finally(() => setFranchiseLoading(false))
  }, [franchisePage, franchiseSearch])

  useEffect(() => { fetchFranchises() }, [fetchFranchises])

  /* ── fetch all suppliers (distributors) once ── */
  const fetchSuppliers = useCallback(() => {
    setSupplierLoading(true)
    getRequest('distributor/all?isPagination=false&limit=200')
      .then(res => {
        const d    = res?.data?.data
        const list = Array.isArray(d?.data) ? d.data
                   : Array.isArray(d?.distributors) ? d.distributors
                   : Array.isArray(d) ? d : []
        setAllSuppliers(list)
        setSupplierTotal(list.length)
      })
      .catch(() => toast.error('Failed to load suppliers'))
      .finally(() => setSupplierLoading(false))
  }, [])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  /* ── current franchise assignments ── */
  const currentAssignments = selectedFranchise
    ? (assignmentsMap[selectedFranchise._id] || [])
    : []

  /* ── assign supplier ── */
  const handleAssign = () => {
    if (!newForm.supplierId) {
      toast.error('Please select a supplier')
      return
    }
    const supplier = allSuppliers.find(s => s._id === newForm.supplierId)
    if (!supplier) return

    const already = currentAssignments.find(a => a.supplierId === newForm.supplierId)
    if (already) {
      toast.error('This supplier is already assigned to this franchise')
      return
    }

    const entry = {
      id:          `${selectedFranchise._id}-${newForm.supplierId}-${Date.now()}`,
      supplierId:  supplier._id,
      supplier:    supplier.name,
      type:        supplier.type || 'Distributor',
      assignType:  newForm.assignType,
      date:        new Date().toISOString().split('T')[0],
      notes:       newForm.notes,
    }

    setAssignmentsMap(prev => ({
      ...prev,
      [selectedFranchise._id]: [...(prev[selectedFranchise._id] || []), entry],
    }))
    setNewForm({ supplierId: '', assignType: 'Assigned', notes: '' })
    setShowAssignForm(false)
    toast.success(`${supplier.name} assigned to ${selectedFranchise.schoolName}`)
  }

  /* ── remove assignment ── */
  const handleRemove = (entryId) => {
    if (!selectedFranchise) return
    setAssignmentsMap(prev => ({
      ...prev,
      [selectedFranchise._id]: (prev[selectedFranchise._id] || []).filter(a => a.id !== entryId),
    }))
    toast.success('Assignment removed')
  }

  /* ── change assignment type ── */
  const handleChangeType = (entryId, newType) => {
    if (!selectedFranchise) return
    setAssignmentsMap(prev => ({
      ...prev,
      [selectedFranchise._id]: (prev[selectedFranchise._id] || []).map(a =>
        a.id === entryId ? { ...a, assignType: newType } : a
      ),
    }))
  }

  /* ── active suppliers not yet assigned to current franchise ── */
  const assignedIds = new Set(currentAssignments.map(a => a.supplierId))
  const availableSuppliers = allSuppliers.filter(s => s.isActive && !assignedIds.has(s._id))

  return (
    <div style={{ ...font, background: C.bg, minHeight: '100vh', padding: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>Supplier Assignment</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>
            Assign or recommend distributors to franchise branches
          </p>
        </div>
        <button
          onClick={() => { fetchFranchises(); fetchSuppliers() }}
          disabled={franchiseLoading || supplierLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.white, color: '#374151',
            border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 16px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            opacity: (franchiseLoading || supplierLoading) ? 0.6 : 1 }}>
          <RefreshCw size={14} style={{ animation: (franchiseLoading || supplierLoading) ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard label="Total Assignments" value={allAssignments.length} loading={false} />
        <StatCard label="Assigned"    value={assignedCount}    color="#1d4ed8" loading={false} />
        <StatCard label="Recommended" value={recommendedCount} color={C.success} loading={false} />
        <StatCard label="Blocked"     value={blockedCount}     color={C.danger} loading={false} />
        <StatCard label="Total Suppliers" value={supplierLoading ? '…' : supplierTotal} color="#7c3aed" loading={supplierLoading} />
        <StatCard label="Total Franchises" value={franchiseLoading ? '…' : franchiseTotal} loading={franchiseLoading} />
      </div>

      {/* Two-panel layout */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* ── LEFT PANEL — Franchise List ── */}
        <div style={{ width: '36%', minWidth: 260, background: C.white,
          border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, background: C.primary }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.white }}>
              Select Franchise
              {franchiseTotal > 0 && (
                <span style={{ marginLeft: 8, fontSize: 11, background: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                  {franchiseTotal}
                </span>
              )}
            </h3>
          </div>

          {/* Search */}
          <div style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
              <input
                value={franchiseSearch}
                onChange={e => { setFranchiseSearch(e.target.value); setFranchisePage(1) }}
                placeholder="Search franchise…"
                style={{ width: '100%', padding: '8px 10px 8px 30px', border: `1px solid ${C.border}`,
                  borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', maxHeight: 440 }}>
            {franchiseLoading ? (
              <SkeletonFranchise />
            ) : franchises.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
                No franchises found
              </div>
            ) : (
              franchises.map(f => {
                const isSelected = selectedFranchise?._id === f._id
                const fAssignCount = (assignmentsMap[f._id] || []).length
                return (
                  <div
                    key={f._id}
                    onClick={() => { setSelectedFranchise(f); setShowAssignForm(false) }}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${C.border}`,
                      background: isSelected ? '#e8f0fb' : C.white,
                      borderLeft: isSelected ? `4px solid ${C.primary}` : '4px solid transparent',
                      transition: 'all .15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: isSelected ? C.primary : C.text,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.schoolName}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <MapPin size={11} />
                          {[f.city, f.state].filter(Boolean).join(', ') || 'Location not set'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                          color: f.isActive ? C.success : C.danger,
                          background: f.isActive ? '#dcfce7' : '#fee2e2' }}>
                          {f.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                          {fAssignCount} assigned
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Franchise pagination */}
          {!franchiseLoading && franchisePages > 1 && (
            <PaginationBar
              page={franchisePage}
              totalPages={franchisePages}
              total={franchiseTotal}
              perPage={F_PER}
              setPage={setFranchisePage}
            />
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selectedFranchise ? (
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: 60, textAlign: 'center' }}>
              <Building2 size={48} color={C.border} style={{ marginBottom: 16 }} />
              <p style={{ color: C.muted, fontSize: 14, margin: '0 0 8px', fontWeight: 600 }}>
                No Franchise Selected
              </p>
              <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
                Select a franchise from the left panel to manage its supplier assignments.
              </p>
            </div>
          ) : (
            <div>
              {/* Franchise banner */}
              <div style={{ background: `linear-gradient(135deg, ${C.primary}, #1a5ba8)`,
                borderRadius: 12, padding: '16px 22px', marginBottom: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.white }}>{selectedFranchise.schoolName}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4,
                    display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={12} />
                    {[selectedFranchise.city, selectedFranchise.state].filter(Boolean).join(', ') || 'Location not set'}
                    {selectedFranchise.schoolEmail && (
                      <span style={{ marginLeft: 4 }}>· {selectedFranchise.schoolEmail}</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.white }}>{currentAssignments.length}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Current Assignments</div>
                </div>
              </div>

              {/* Assignments table */}
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
                overflow: 'auto', marginBottom: 18 }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>
                    Current Assignments
                    {currentAssignments.length > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 11, background: '#e8f0fb',
                        color: C.primary, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                        {currentAssignments.length}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowAssignForm(v => !v)}
                    disabled={supplierLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary,
                      color: C.white, border: 'none', borderRadius: 7, padding: '7px 14px',
                      fontSize: 12, fontWeight: 600, cursor: supplierLoading ? 'not-allowed' : 'pointer',
                      opacity: supplierLoading ? 0.6 : 1 }}>
                    <Plus size={14} />
                    {showAssignForm ? 'Cancel' : 'Assign Supplier'}
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <Th>Supplier Name</Th>
                      <Th>Type</Th>
                      <Th>Assignment Type</Th>
                      <Th>Assigned Date</Th>
                      <Th>Notes</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAssignments.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
                          <Truck size={28} color={C.border} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                          No suppliers assigned yet. Click "Assign Supplier" to get started.
                        </td>
                      </tr>
                    ) : (
                      currentAssignments.map(a => (
                        <tr key={a.id}
                          onMouseEnter={e => e.currentTarget.style.background = C.bg}
                          onMouseLeave={e => e.currentTarget.style.background = C.white}>
                          <Td><span style={{ fontWeight: 600, color: C.text }}>{a.supplier}</span></Td>
                          <Td>
                            <Badge
                              label={a.type}
                              color={a.type === 'Distributor' ? '#1d4ed8' : '#7c3aed'}
                              bg={a.type === 'Distributor' ? '#dbeafe' : '#f3e8ff'}
                            />
                          </Td>
                          <Td>
                            <select
                              value={a.assignType}
                              onChange={e => handleChangeType(a.id, e.target.value)}
                              style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px',
                                fontSize: 12, outline: 'none', background: C.white, cursor: 'pointer' }}>
                              {assignTypes.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                            </select>
                          </Td>
                          <Td><span style={{ fontSize: 12, color: C.muted }}>{a.date}</span></Td>
                          <Td>
                            <span style={{ fontSize: 12, color: C.muted, maxWidth: 160,
                              display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.notes || '—'}
                            </span>
                          </Td>
                          <Td>
                            <button
                              onClick={() => handleRemove(a.id)}
                              title="Remove assignment"
                              style={{ background: '#fee2e2', border: 'none', borderRadius: 6,
                                padding: '5px 7px', cursor: 'pointer', color: C.danger }}>
                              <Trash2 size={13} />
                            </button>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Assign form */}
              {showAssignForm && (
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: 20, marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>Assign New Supplier</h3>
                    <button onClick={() => setShowAssignForm(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                      <X size={16} />
                    </button>
                  </div>

                  {/* Supplier select */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>
                      Select Supplier *
                      {supplierLoading && <span style={{ marginLeft: 8, fontSize: 11, color: C.muted }}>Loading…</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={newForm.supplierId}
                        onChange={e => setNewForm(f => ({ ...f, supplierId: e.target.value }))}
                        disabled={supplierLoading}
                        style={{ width: '100%', padding: '9px 32px 9px 12px', border: `1px solid ${C.border}`,
                          borderRadius: 7, fontSize: 13, outline: 'none', background: C.white,
                          appearance: 'none', boxSizing: 'border-box', cursor: supplierLoading ? 'wait' : 'pointer' }}>
                        <option value="">
                          {supplierLoading
                            ? 'Loading suppliers…'
                            : availableSuppliers.length === 0
                              ? 'All active suppliers already assigned'
                              : 'Select a supplier…'}
                        </option>
                        {availableSuppliers.map(s => (
                          <option key={s._id} value={s._id}>
                            {s.name} — {s.type || 'Distributor'}{s.city ? ` (${s.city})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%',
                        transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
                    </div>
                    {allSuppliers.length === 0 && !supplierLoading && (
                      <p style={{ fontSize: 11, color: C.danger, margin: '6px 0 0' }}>
                        No suppliers found. Please add distributors first.
                      </p>
                    )}
                  </div>

                  {/* Assignment type */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 8 }}>
                      Assignment Type
                    </label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {assignTypes.map(t => (
                        <label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                          padding: '7px 14px', borderRadius: 8,
                          border: `2px solid ${newForm.assignType === t.key ? t.color : C.border}`,
                          background: newForm.assignType === t.key ? t.bg : C.white, transition: 'all .15s' }}>
                          <input type="radio" name="assignType" value={t.key}
                            checked={newForm.assignType === t.key}
                            onChange={e => setNewForm(f => ({ ...f, assignType: e.target.value }))}
                            style={{ accentColor: t.color }} />
                          <span style={{ fontSize: 12, fontWeight: 600,
                            color: newForm.assignType === t.key ? t.color : C.muted }}>
                            {t.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>Notes</label>
                    <textarea
                      value={newForm.notes}
                      onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Optional notes about this assignment…"
                      rows={2}
                      style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`,
                        borderRadius: 7, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowAssignForm(false)}
                      style={{ padding: '9px 18px', border: `1px solid ${C.border}`, borderRadius: 7,
                        background: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.muted }}>
                      Cancel
                    </button>
                    <button onClick={handleAssign}
                      disabled={!newForm.supplierId || supplierLoading}
                      style={{ padding: '9px 22px', border: 'none', borderRadius: 7,
                        background: (!newForm.supplierId || supplierLoading) ? '#93c5fd' : C.primary,
                        color: C.white, fontSize: 13, fontWeight: 600,
                        cursor: (!newForm.supplierId || supplierLoading) ? 'not-allowed' : 'pointer' }}>
                      Assign Supplier
                    </button>
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
                    <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8, background: t.bg, border: `1px solid ${t.color}22` }}>
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default SupplierAssignment
