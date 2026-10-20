/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import {
  Search, Plus, Eye, Edit2, ShieldCheck, ShieldOff, X,
  ChevronLeft, ChevronRight, MapPin, Phone, Package,
  CheckCircle, Clock, AlertCircle, RefreshCw, Save, Trash2,
} from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest, patchRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

const C = {
  primary: '#0c3b73', accent: '#fabf22', success: '#16a34a',
  danger: '#dc2626', border: '#e5e7eb', bg: '#f8f9fb', white: '#ffffff',
  text: '#111827', muted: '#6b7280',
}

/* ─── Sub-components ── */
const Th = ({ children }) => (
  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600,
    color: C.muted, background: C.bg, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{children}</th>
)
const Td = ({ children }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: C.text, borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle' }}>{children}</td>
)
const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, color, background: bg, whiteSpace: 'nowrap' }}>{label}</span>
)
const StatCard = ({ label, value, color, icon, loading }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: '16px 20px', flex: 1, minWidth: 110, display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: color || C.primary }}>{icon}</span>
      {loading
        ? <div style={{ height: 24, width: 40, background: '#f3f4f6', borderRadius: 4 }} />
        : <span style={{ fontSize: 22, fontWeight: 700, color: color || C.primary }}>{value ?? 0}</span>
      }
    </div>
    <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
  </div>
)

const veriBadge = (v) => {
  if (v === 'Verified')   return <Badge label="✓ Verified"    color={C.success} bg="#dcfce7" />
  if (v === 'Pending')    return <Badge label="⏳ Pending"    color="#d97706"   bg="#fef3c7" />
  return                          <Badge label="✗ Unverified" color={C.danger}  bg="#fee2e2" />
}
const typeBadge = (t) => t === 'Distributor'
  ? <Badge label="Distributor" color="#1d4ed8" bg="#dbeafe" />
  : <Badge label="Wholesaler"  color="#7c3aed" bg="#f3e8ff" />

const LabelInput = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>{label}</label>
    <input {...props} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`,
      borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
  </div>
)
const LabelSelect = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>{label}</label>
    <select {...props} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`,
      borderRadius: 6, fontSize: 13, outline: 'none', background: C.white, boxSizing: 'border-box' }}>
      {children}
    </select>
  </div>
)

/* ─── Side Panel ── */
const ViewPanel = ({ distributor: d, onClose, onToggle, onVerify }) => (
  <div style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100vh', background: C.white,
    boxShadow: '-4px 0 30px rgba(0,0,0,0.12)', zIndex: 999, display: 'flex', flexDirection: 'column',
    fontFamily: "'Inter', sans-serif" }}>
    <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex',
      justifyContent: 'space-between', alignItems: 'center', background: C.primary }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.white }}>Supplier Profile</h2>
      <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6,
        cursor: 'pointer', color: C.white, padding: '4px 8px' }}><X size={18} /></button>
    </div>
    <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 4 }}>{d.name}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {typeBadge(d.type)}{veriBadge(d.verificationStatus || 'Unverified')}
          <Badge label={d.isActive ? 'Active' : 'Inactive'} color={d.isActive ? C.success : C.danger} bg={d.isActive ? '#dcfce7' : '#fee2e2'} />
        </div>
        <div style={{ fontSize: 13, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={13} /> {d.city || '—'}, {d.state || '—'}
        </div>
      </div>

      {/* Contact */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${C.border}` }}>Contact</div>
        {[['Owner / Contact', d.contactPerson || '—'], ['Phone', d.mobile], ['Email', d.email || '—'], ['Address', d.addressLine1 || '—']].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
            <span style={{ color: C.muted, minWidth: 110 }}>{label}:</span>
            <span style={{ color: C.text, fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Legal */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${C.border}` }}>Legal</div>
        {[['GSTIN', d.gstNo || '—'], ['Drug License', d.drugLicenseNo || '—'], ['PAN', d.panNo || '—']].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
            <span style={{ color: C.muted, minWidth: 110 }}>{label}:</span>
            <span style={{ color: C.text, fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={() => onToggle(d._id)} style={{
          flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          background: d.isActive ? '#fef2f2' : '#f0fdf4',
          color: d.isActive ? C.danger : C.success,
        }}>
          {d.isActive ? 'Deactivate' : 'Activate'}
        </button>
        {d.verificationStatus !== 'Verified' && (
          <button onClick={() => onVerify(d._id)} style={{
            flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#dcfce7', color: C.success, fontWeight: 600, fontSize: 13,
          }}>
            Mark Verified
          </button>
        )}
      </div>
    </div>
  </div>
)

const EMPTY_FORM = {
  name: '', mobile: '', email: '', contactPerson: '', type: 'Distributor',
  state: '', city: '', addressLine1: '', gstNo: '', drugLicenseNo: '', panNo: '', password: '',
}

const PER_PAGE = 10

export default function DistributorManagement() {
  const [distributors, setDistributors] = useState([])
  const [total, setTotal]               = useState(0)
  const [stats, setStats]               = useState({ total: 0, active: 0, distributors: 0, wholesalers: 0, pending: 0 })
  const [loading, setLoading]           = useState(false)
  const [search, setSearch]             = useState('')
  const [draftSearch, setDraftSearch]   = useState('')
  const [activeTab, setActiveTab]       = useState('all')
  const [statusFilter, setStatusFilter] = useState('')
  const [stateFilter, setStateFilter]   = useState('')
  const [page, setPage]                 = useState(1)
  const [viewPanel, setViewPanel]       = useState(null)
  const [showModal, setShowModal]       = useState(false)
  const [editDist, setEditDist]         = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [submitting, setSubmitting]     = useState(false)

  /* ── Fetch ── */
  const fetchDistributors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE })
      if (search)       params.append('search', search)
      if (statusFilter) params.append('isActive', statusFilter === 'active' ? 'true' : 'false')
      if (activeTab === 'distributor') params.append('type', 'Distributor')
      if (activeTab === 'wholesaler')  params.append('type', 'Wholesaler')
      if (activeTab === 'pending')     params.append('verificationStatus', 'Pending')

      const res  = await getRequest(`distributor/all?${params.toString()}`)
      const data = res?.data?.data
      const list = data?.distributors || []
      setDistributors(list)
      setTotal(data?.total || 0)

      // Derive stats
      setStats({
        total:        data?.total || 0,
        active:       list.filter(d => d.isActive).length,
        distributors: list.filter(d => d.type === 'Distributor').length,
        wholesalers:  list.filter(d => d.type === 'Wholesaler').length,
        pending:      list.filter(d => (d.verificationStatus || '') === 'Pending').length,
      })
    } catch (err) {
      console.error('[DistributorMgmt] fetch error:', err)
      toast.error('Failed to load distributors')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, activeTab])

  useEffect(() => { fetchDistributors() }, [fetchDistributors])

  /* ── Toggle status ── */
  const handleToggle = async (id) => {
    try {
      await patchRequest({ url: `distributor/${id}/toggle`, cred: {} })
      toast.success('Status updated')
      fetchDistributors()
      if (viewPanel?._id === id) setViewPanel(prev => ({ ...prev, isActive: !prev.isActive }))
    } catch { toast.error('Failed to update status') }
  }

  /* ── Verify ── */
  const handleVerify = async (id) => {
    try {
      await putRequest({ url: `distributor/${id}`, cred: { verificationStatus: 'Verified' } })
      toast.success('Distributor verified')
      fetchDistributors()
      if (viewPanel?._id === id) setViewPanel(prev => ({ ...prev, verificationStatus: 'Verified' }))
    } catch { toast.error('Failed to verify') }
  }

  /* ── Delete ── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteRequest(`distributor/${id}`)
      toast.success('Deleted successfully')
      fetchDistributors()
    } catch { toast.error('Failed to delete') }
  }

  /* ── Open create modal ── */
  const openCreate = () => {
    setEditDist(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  /* ── Open edit modal ── */
  const openEdit = (d) => {
    setEditDist(d)
    setForm({
      name:          d.name          || '',
      mobile:        d.mobile        || '',
      email:         d.email         || '',
      contactPerson: d.contactPerson || '',
      type:          d.type          || 'Distributor',
      state:         d.state         || '',
      city:          d.city          || '',
      addressLine1:  d.addressLine1  || '',
      gstNo:         d.gstNo         || '',
      drugLicenseNo: d.drugLicenseNo || '',
      panNo:         d.panNo         || '',
      password:      '',
    })
    setShowModal(true)
  }

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      toast.error('Name and mobile are required')
      return
    }
    setSubmitting(true)
    try {
      if (editDist) {
        const { password, ...body } = form
        await putRequest({ url: `distributor/${editDist._id}`, cred: body })
        toast.success('Distributor updated')
      } else {
        if (!form.password.trim()) { toast.error('Password is required'); setSubmitting(false); return }
        await postRequest({ url: 'distributor/register', cred: form })
        toast.success('Distributor registered successfully')
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchDistributors()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)
  const tabs = [
    { key: 'all',         label: 'All Suppliers' },
    { key: 'distributor', label: 'Distributors'  },
    { key: 'wholesaler',  label: 'Wholesalers'   },
    { key: 'pending',     label: 'Pending Verification' },
  ]

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.bg, minHeight: '100vh', padding: 4 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.primary, margin: 0 }}>Distributor / Wholesaler Management</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>Manage and verify your supplier network</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchDistributors}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.white,
              border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: C.white,
              border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> Add Distributor
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard loading={loading} label="Total Suppliers"        value={total}             icon={<Package size={18} />}     color={C.primary} />
        <StatCard loading={loading} label="Active"                 value={stats.active}       icon={<CheckCircle size={18} />}  color={C.success} />
        <StatCard loading={loading} label="Distributors"           value={stats.distributors} icon={<ShieldCheck size={18} />}  color="#1d4ed8" />
        <StatCard loading={loading} label="Wholesalers"            value={stats.wholesalers}  icon={<Package size={18} />}      color="#7c3aed" />
        <StatCard loading={loading} label="Pending Verification"   value={stats.pending}      icon={<Clock size={18} />}        color="#d97706" />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 6, marginBottom: 18, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1) }}
            style={{ padding: '8px 18px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeTab === t.key ? C.primary : 'transparent',
              color: activeTab === t.key ? C.white : C.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
          <input value={draftSearch} onChange={e => setDraftSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(draftSearch); setPage(1) } }}
            onBlur={() => { if (draftSearch !== search) { setSearch(draftSearch); setPage(1) } }}
            placeholder="Search name, mobile, code… (Enter)"
            style={{ width: '100%', padding: '8px 10px 8px 32px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || statusFilter) && (
          <button onClick={() => { setDraftSearch(''); setSearch(''); setStatusFilter(''); setPage(1) }}
            style={{ fontSize: 12, color: C.danger, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto', marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
          <thead>
            <tr>
              <Th>#</Th><Th>Business Name</Th><Th>Type</Th><Th>Contact Person</Th>
              <Th>Mobile</Th><Th>State / City</Th><Th>Status</Th><Th>Verification</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={9} style={{ padding: '12px 12px' }}>
                    <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} />
                  </td>
                </tr>
              ))
            ) : distributors.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '40px 0', textAlign: 'center', color: C.muted }}>
                  <AlertCircle size={24} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                  No distributors found
                </td>
              </tr>
            ) : distributors.map((d, i) => (
              <tr key={d._id}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = C.white}>
                <Td><span style={{ fontSize: 11, fontWeight: 700, color: C.primary, fontFamily: 'monospace' }}>{(page - 1) * PER_PAGE + i + 1}</span></Td>
                <Td>
                  <div>
                    <span style={{ fontWeight: 600, color: C.text }}>{d.name}</span>
                    <div style={{ fontSize: 11, color: C.muted }}>{d.distributorCode}</div>
                  </div>
                </Td>
                <Td>{typeBadge(d.type)}</Td>
                <Td>{d.contactPerson || '—'}</Td>
                <Td><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} color={C.muted} />{d.mobile}</span></Td>
                <Td>
                  <div style={{ fontSize: 13 }}>{d.city || '—'}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.state || '—'}</div>
                </Td>
                <Td><Badge label={d.isActive ? 'Active' : 'Inactive'} color={d.isActive ? C.success : C.danger} bg={d.isActive ? '#dcfce7' : '#fee2e2'} /></Td>
                <Td>{veriBadge(d.verificationStatus || 'Unverified')}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => setViewPanel(d)} title="View"
                      style={{ background: '#e8f0fb', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: C.primary }}>
                      <Eye size={13} />
                    </button>
                    <button onClick={() => openEdit(d)} title="Edit"
                      style={{ background: '#fef9ec', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleToggle(d._id)} title={d.isActive ? 'Deactivate' : 'Activate'}
                      style={{ background: d.isActive ? '#fee2e2' : '#dcfce7', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: d.isActive ? C.danger : C.success }}>
                      {d.isActive ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                    </button>
                    <button onClick={() => handleDelete(d._id, d.name)} title="Delete"
                      style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: C.danger }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            {total > 0 ? `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} of ${total}` : '0 results'}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ border: `1px solid ${C.border}`, background: C.white, borderRadius: 6, padding: '5px 10px',
                cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, page - 2)
              const n = start + i
              if (n > totalPages) return null
              return (
                <button key={n} onClick={() => setPage(n)}
                  style={{ border: `1px solid ${page === n ? C.primary : C.border}`,
                    background: page === n ? C.primary : C.white, color: page === n ? C.white : C.text,
                    borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              style={{ border: `1px solid ${C.border}`, background: C.white, borderRadius: 6, padding: '5px 10px',
                cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                opacity: (page === totalPages || totalPages === 0) ? 0.5 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── View Panel ── */}
      {viewPanel && <ViewPanel distributor={viewPanel} onClose={() => setViewPanel(null)} onToggle={handleToggle} onVerify={handleVerify} />}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 640,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.primary }}>
                {editDist ? 'Edit Distributor' : 'Add New Distributor'}
              </h2>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <LabelInput label="Business Name *"  value={form.name}          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}          placeholder="e.g. MedLine Pharma" />
                <LabelInput label="Contact Person"   value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Owner / Manager name" />
                <LabelInput label="Mobile *"         value={form.mobile}        onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}        placeholder="10-digit mobile" />
                <LabelInput label="Email"            value={form.email}         onChange={e => setForm(f => ({ ...f, email: e.target.value }))}         placeholder="email@company.in" type="email" />
                {!editDist && (
                  <LabelInput label="Password *" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Login password" type="password" />
                )}
                <LabelSelect label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="Distributor">Distributor</option>
                  <option value="Wholesaler">Wholesaler</option>
                </LabelSelect>
                <LabelInput label="State"            value={form.state}         onChange={e => setForm(f => ({ ...f, state: e.target.value }))}         placeholder="e.g. Maharashtra" />
                <LabelInput label="City"             value={form.city}          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}          placeholder="e.g. Mumbai" />
                <LabelInput label="GSTIN"            value={form.gstNo}         onChange={e => setForm(f => ({ ...f, gstNo: e.target.value }))}         placeholder="27XXXXX1234X1ZX" />
                <LabelInput label="Drug License No." value={form.drugLicenseNo} onChange={e => setForm(f => ({ ...f, drugLicenseNo: e.target.value }))} placeholder="e.g. MH-MUM-2024-1234" />
                <LabelInput label="PAN"              value={form.panNo}         onChange={e => setForm(f => ({ ...f, panNo: e.target.value }))}         placeholder="AABCD1234E" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>Address</label>
                <textarea value={form.addressLine1} onChange={e => setForm(f => ({ ...f, addressLine1: e.target.value }))}
                  placeholder="Full address..." rows={2}
                  style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => setShowModal(false)}
                  style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.muted }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', border: 'none', borderRadius: 7,
                    background: submitting ? '#6fa3d0' : C.primary, color: C.white, fontSize: 13, fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  <Save size={14} />
                  {submitting ? 'Saving…' : editDist ? 'Save Changes' : 'Register Distributor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
