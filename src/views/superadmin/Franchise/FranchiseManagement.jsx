/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import {
  Building2, Search, Filter, Plus, Eye, Edit2, Trash2,
  CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  Download, MapPin, Phone, CreditCard, RefreshCw,
} from 'lucide-react'
import { getRequest, postRequest, patchRequest } from '../../../Helpers/index'

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const STATES = ['All States', 'Maharashtra', 'Karnataka', 'Telangana', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Madhya Pradesh', 'Punjab']

const CITIES_BY_STATE = {
  Maharashtra:    ['Mumbai', 'Pune', 'Nashik', 'Nagpur'],
  Karnataka:      ['Bengaluru', 'Mysuru', 'Hubli'],
  Telangana:      ['Hyderabad', 'Warangal'],
  'Tamil Nadu':   ['Chennai', 'Coimbatore', 'Madurai'],
  Gujarat:        ['Ahmedabad', 'Surat', 'Vadodara'],
  'Uttar Pradesh':['Noida', 'Lucknow', 'Kanpur', 'Agra'],
  'West Bengal':  ['Kolkata', 'Durgapur'],
  Rajasthan:      ['Jaipur', 'Jodhpur'],
  'Madhya Pradesh':['Bhopal', 'Indore'],
  Punjab:         ['Chandigarh'],
}

const PLANS = ['All Plans', 'Basic', 'Professional', 'Enterprise']

/* ─────────────────────────────────────────────
   REUSABLE COMPONENTS
───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    Active:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Inactive:  { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
    Suspended: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  }
  const s = map[status] || map.Inactive
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}

const PlanBadge = ({ plan }) => {
  const p = (plan || 'Basic')
  const map = {
    Enterprise:   { bg: '#eff6ff', color: '#0c3b73', border: '#bfdbfe' },
    Professional: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
    Basic:        { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
    Trial:        { bg: '#fef9c3', color: '#b45309', border: '#fde68a' },
  }
  const s = map[p] || map.Basic
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {p}
    </span>
  )
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 13,
  color: '#111827',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 5,
  display: 'block',
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '16', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0', fontWeight: 500 }}>{label}</p>
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
const CreateFranchiseModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    business: '', owner: '', email: '', phone: '',
    state: '', city: '', address: '', plan: 'Basic',
  })
  const [errors, setErrors] = useState({})

  const cityOptions = form.state && CITIES_BY_STATE[form.state] ? CITIES_BY_STATE[form.state] : []

  const set = (key) => (e) => {
    const val = e.target.value
    setForm(prev => ({ ...prev, [key]: val, ...(key === 'state' ? { city: '' } : {}) }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.business.trim()) e.business = 'Business name is required'
    if (!form.owner.trim())    e.owner    = 'Owner name is required'
    if (!form.email.trim())    e.email    = 'Email is required'
    if (!form.phone.trim())    e.phone    = 'Phone is required'
    if (!form.state)           e.state    = 'State is required'
    if (!form.city)            e.city     = 'City is required'
    if (!form.address.trim())  e.address  = 'Address is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) onSubmit(form)
  }

  return (
    /* backdrop */
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* modal box */}
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', fontFamily: 'Inter, -apple-system, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#0c3b7314', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={17} color="#0c3b73" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Create New Franchise</h3>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '1px 0 0' }}>Fill in the details to register a franchise</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6b7280' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Business Name */}
          <div>
            <label style={labelStyle}>Business Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input style={{ ...inputStyle, borderColor: errors.business ? '#dc2626' : '#e5e7eb' }} placeholder="e.g. MedPlus Pharmacy - Andheri" value={form.business} onChange={set('business')} />
            {errors.business && <p style={{ fontSize: 11, color: '#dc2626', margin: '3px 0 0' }}>{errors.business}</p>}
          </div>

          {/* Owner + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Owner Name <span style={{ color: '#dc2626' }}>*</span></label>
              <input style={{ ...inputStyle, borderColor: errors.owner ? '#dc2626' : '#e5e7eb' }} placeholder="Full name" value={form.owner} onChange={set('owner')} />
              {errors.owner && <p style={{ fontSize: 11, color: '#dc2626', margin: '3px 0 0' }}>{errors.owner}</p>}
            </div>
            <div>
              <label style={labelStyle}>Email Address <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="email" style={{ ...inputStyle, borderColor: errors.email ? '#dc2626' : '#e5e7eb' }} placeholder="owner@pharmacy.com" value={form.email} onChange={set('email')} />
              {errors.email && <p style={{ fontSize: 11, color: '#dc2626', margin: '3px 0 0' }}>{errors.email}</p>}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>Phone Number <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="tel" style={{ ...inputStyle, borderColor: errors.phone ? '#dc2626' : '#e5e7eb' }} placeholder="+91 98XXX XXXXX" value={form.phone} onChange={set('phone')} />
            {errors.phone && <p style={{ fontSize: 11, color: '#dc2626', margin: '3px 0 0' }}>{errors.phone}</p>}
          </div>

          {/* State + City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>State <span style={{ color: '#dc2626' }}>*</span></label>
              <select style={{ ...inputStyle, borderColor: errors.state ? '#dc2626' : '#e5e7eb' }} value={form.state} onChange={set('state')}>
                <option value="">Select state</option>
                {STATES.filter(s => s !== 'All States').map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p style={{ fontSize: 11, color: '#dc2626', margin: '3px 0 0' }}>{errors.state}</p>}
            </div>
            <div>
              <label style={labelStyle}>City <span style={{ color: '#dc2626' }}>*</span></label>
              <select style={{ ...inputStyle, borderColor: errors.city ? '#dc2626' : '#e5e7eb' }} value={form.city} onChange={set('city')} disabled={!form.state}>
                <option value="">Select city</option>
                {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <p style={{ fontSize: 11, color: '#dc2626', margin: '3px 0 0' }}>{errors.city}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label style={labelStyle}>Address <span style={{ color: '#dc2626' }}>*</span></label>
            <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical', borderColor: errors.address ? '#dc2626' : '#e5e7eb' }} placeholder="Full address with landmark" value={form.address} onChange={set('address')} />
            {errors.address && <p style={{ fontSize: 11, color: '#dc2626', margin: '3px 0 0' }}>{errors.address}</p>}
          </div>

          {/* Plan */}
          <div>
            <label style={labelStyle}>Subscription Plan</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {['Basic', 'Professional', 'Enterprise'].map(p => {
                const active = form.plan === p
                const colorMap = { Basic: '#6b7280', Professional: '#7c3aed', Enterprise: '#0c3b73' }
                const c = colorMap[p]
                return (
                  <button key={p} onClick={() => setForm(prev => ({ ...prev, plan: p }))}
                    style={{ padding: '10px 6px', borderRadius: 9, border: `2px solid ${active ? c : '#e5e7eb'}`, background: active ? c + '12' : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: active ? c : '#374151', margin: 0 }}>{p}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>
                      {p === 'Basic' ? 'Starter features' : p === 'Professional' ? 'Most popular' : 'Full access'}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 22px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Create Franchise
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────── */
const Pagination = ({ page, total, perPage, onPage }) => {
  const totalPages = Math.ceil(total / perPage)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>
        Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total} franchises
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #e5e7eb', background: page === 1 ? '#f9fafb' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? '#d1d5db' : '#374151' }}
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map(p => (
          <button key={p} onClick={() => onPage(p)}
            style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${p === page ? '#0c3b73' : '#e5e7eb'}`, background: p === page ? '#0c3b73' : '#fff', color: p === page ? '#fff' : '#374151', fontSize: 12, fontWeight: p === page ? 700 : 400, cursor: 'pointer' }}>
            {p}
          </button>
        ))}

        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #e5e7eb', background: page === totalPages ? '#f9fafb' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === totalPages ? '#d1d5db' : '#374151' }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const PER_PAGE = 7

export default function FranchiseManagement() {
  const [search, setSearch]           = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [statusFilter, setStatus]     = useState('All')
  const [stateFilter, setState]       = useState('All States')
  const [planFilter, setPlan]         = useState('All Plans')
  const [page, setPage]               = useState(1)
  const [showModal, setShowModal]     = useState(false)
  const [franchises, setFranchises]   = useState([])
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(false)
  const [toast, setToast]             = useState(null)

  /* ── fetch from backend ── */
  const fetchFranchises = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE })
      if (search)                        params.append('search', search)
      if (statusFilter !== 'All')        params.append('isActive', statusFilter === 'Active' ? 'true' : 'false')

      const res  = await getRequest(`schools?${params.toString()}`)
      const data = res?.data?.data
      setFranchises(data?.tenants || [])
      setTotal(data?.total || 0)
    } catch (err) {
      console.error('[FranchiseManagement] fetch error:', err)
      setFranchises([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchFranchises() }, [fetchFranchises])

  /* ── helpers ── */
  const showToast = (msg, color = '#16a34a') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2500)
  }

  /* ── client-side secondary filters (state, plan) ── */
  const filtered = franchises.filter(f => {
    const matchState = stateFilter === 'All States' || f.state === stateFilter
    const matchPlan  = planFilter  === 'All Plans'  || (f.planName || '').toLowerCase() === planFilter.toLowerCase()
    return matchState && matchPlan
  })

  /* ── stats derived from current page; re-fetch gives real counts ── */
  const active    = franchises.filter(f => f.isActive === true).length
  const inactive  = franchises.filter(f => f.isActive === false && f.planStatus !== 'SUSPENDED').length
  const suspended = franchises.filter(f => f.planStatus === 'SUSPENDED').length

  /* ── toggle status ── */
  const handleToggleStatus = async (id) => {
    try {
      await patchRequest({ url: `schools/toggle-status/${id}`, cred: {} })
      showToast('Franchise status updated.')
      fetchFranchises()
    } catch (err) {
      console.error(err)
      showToast('Failed to update status.', '#dc2626')
    }
  }

  /* ── create ── */
  const handleCreate = async (form) => {
    try {
      await postRequest({
        url: 'schools',
        cred: {
          schoolName:         form.business,
          franchiseAdminName: form.owner,
          schoolEmail:        form.email,
          franchiseAdminPhone:form.phone,
          state:              form.state,
          city:               form.city,
          addressLine1:       form.address,
          subdomain:          form.business.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        },
      })
      setShowModal(false)
      showToast('Franchise created successfully!', '#16a34a')
      fetchFranchises()
    } catch (err) {
      console.error(err)
      showToast(err?.response?.data?.message || 'Failed to create franchise.', '#dc2626')
    }
  }

  const filterSelectStyle = {
    padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12,
    color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer',
  }

  /* ── search on Enter / debounce ── */
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') { setSearch(draftSearch); setPage(1) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13, minHeight: '100vh', background: '#f8f9fb', padding: 4 }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, background: toast.color, color: '#fff', padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={14} /> {toast.msg}
        </div>
      )}

      {/* ══════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="#fabf22" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Franchise Management</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
              Manage and monitor all registered franchise partners
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={fetchFranchises}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, padding: '9px 14px', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#0c3b73', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px #0c3b7340' }}
          >
            <Plus size={15} /> Create Franchise
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STATS ROW
      ══════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard icon={Building2}    label="Total Franchises"      value={total}    color="#0c3b73" />
        <StatCard icon={CheckCircle}  label="Active Franchises"     value={active}   color="#16a34a" />
        <StatCard icon={XCircle}      label="Inactive Franchises"   value={inactive} color="#6b7280" />
        <StatCard icon={AlertTriangle}label="Suspended Franchises"  value={suspended}color="#dc2626" />
      </div>

      {/* ══════════════════════════════════════
          FILTER BAR + TABLE
      ══════════════════════════════════════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
            <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={draftSearch}
              onChange={e => setDraftSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => { if (draftSearch !== search) { setSearch(draftSearch); setPage(1) } }}
              placeholder="Search by name or ID… (Enter to search)"
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Status filter */}
          <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1) }} style={filterSelectStyle}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* State filter */}
          <select value={stateFilter} onChange={e => { setState(e.target.value); setPage(1) }} style={filterSelectStyle}>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Plan filter */}
          <select value={planFilter} onChange={e => { setPlan(e.target.value); setPage(1) }} style={filterSelectStyle}>
            {PLANS.map(p => <option key={p}>{p}</option>)}
          </select>

          {/* Export */}
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <Download size={13} /> Export
          </button>

          {/* Filter icon */}
          <button style={{ width: 34, height: 34, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
            <Filter size={14} />
          </button>
        </div>

        {/* Results count */}
        <div style={{ padding: '8px 18px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            {loading ? 'Loading…' : `${total} franchise${total !== 1 ? 's' : ''} found`}
            {(search || statusFilter !== 'All' || stateFilter !== 'All States' || planFilter !== 'All Plans') && (
              <button onClick={() => { setDraftSearch(''); setSearch(''); setStatus('All'); setState('All States'); setPlan('All Plans'); setPage(1) }}
                style={{ marginLeft: 8, fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Clear filters
              </button>
            )}
          </span>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'Business Name', 'City / State', 'Owner Name', 'Phone', 'Plan', 'Status', 'Subdomain', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8 }} />
                    Loading franchises…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    No franchises match your current filters.
                  </td>
                </tr>
              ) : filtered.map((f, i) => {
                const statusLabel = f.planStatus === 'SUSPENDED' ? 'Suspended' : f.isActive ? 'Active' : 'Inactive'
                const expiry = f.planEndDate
                  ? new Date(f.planEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : f.trialEndDate
                  ? new Date(f.trialEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'

                return (
                  <tr key={f._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {/* Row number */}
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0c3b73', fontFamily: 'monospace', background: '#eff6ff', padding: '3px 7px', borderRadius: 5 }}>
                        {(page - 1) * PER_PAGE + i + 1}
                      </span>
                    </td>

                    {/* Business Name */}
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0c3b7312', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Building2 size={14} color="#0c3b73" />
                        </div>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{f.schoolName || '—'}</span>
                          {f.isTrial && (
                            <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#fef9c3', color: '#b45309', border: '1px solid #fde68a' }}>TRIAL</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* City / State */}
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} color="#9ca3af" />
                        <div>
                          <p style={{ fontSize: 12, color: '#374151', margin: 0, fontWeight: 500 }}>{f.city || '—'}</p>
                          <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>{f.state || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#374151', fontWeight: 500 }}>
                      {f.franchiseAdminName || f.managedBy || '—'}
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Phone size={11} color="#9ca3af" />
                        <span style={{ fontSize: 11, color: '#374151' }}>{f.franchiseAdminPhone || f.schoolContact || '—'}</span>
                      </div>
                    </td>

                    {/* Plan */}
                    <td style={{ padding: '11px 16px' }}>
                      <PlanBadge plan={f.planName || (f.isTrial ? 'Trial' : 'Basic')} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '11px 16px' }}><StatusBadge status={statusLabel} /></td>

                    {/* Subdomain */}
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CreditCard size={11} color="#9ca3af" />
                        <span style={{ fontSize: 11, color: '#374151', fontFamily: 'monospace' }}>{f.subdomain || '—'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* View */}
                        <button title="View Details" style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0c3b73' }}>
                          <Eye size={13} />
                        </button>
                        {/* Edit */}
                        <button title="Edit Franchise" style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#d97706' }}>
                          <Edit2 size={13} />
                        </button>
                        {/* Toggle Status */}
                        <button title={f.isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleStatus(f._id)}
                          style={{ width: 28, height: 28, border: `1px solid ${f.isActive ? '#fecaca' : '#bbf7d0'}`, borderRadius: 6, background: f.isActive ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          {f.isActive
                            ? <XCircle size={13} color="#dc2626" />
                            : <CheckCircle size={13} color="#16a34a" />}
                        </button>
                        {/* Delete */}
                        <button title="Delete" style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination page={page} total={total} perPage={PER_PAGE} onPage={setPage} />
      </div>

      {/* MODAL */}
      {showModal && <CreateFranchiseModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
    </div>
  )
}
