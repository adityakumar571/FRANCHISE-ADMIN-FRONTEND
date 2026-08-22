/* eslint-disable prettier/prettier */
/**
 * SupplierList — View assigned / recommended distributors & wholesalers
 * SOW §9, §10: B2B Marketplace + Supplier Assignment
 */
import { useState, useEffect, useCallback } from 'react'
import { Truck, Search, Eye, Phone, MapPin, Star, CheckCircle2, AlertCircle } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import SupplierDetailModal from './SupplierDetailModal'

const ASSIGNMENT_BADGE = {
  assigned:    { bg: '#eff6ff', color: '#2563eb', label: 'Assigned', icon: CheckCircle2 },
  preferred:   { bg: '#f0fdf4', color: '#16a34a', label: 'Preferred', icon: Star },
  recommended: { bg: '#fffbeb', color: '#d97706', label: 'Recommended', icon: AlertCircle },
  blocked:     { bg: '#fff1f2', color: '#e11d48', label: 'Blocked', icon: AlertCircle },
}

const AssignmentBadge = ({ type = 'recommended' }) => {
  const c = ASSIGNMENT_BADGE[type] || ASSIGNMENT_BADGE.recommended
  const Icon = c.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>
      <Icon size={11} /> {c.label}
    </span>
  )
}

const SupplierList = () => {
  const [data, setData]           = useState([])
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selected, setSelected]   = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams({ search, ...(typeFilter ? { assignmentType: typeFilter } : {}) }).toString()
    getRequest(`franchise/suppliers?${q}`)
      .then((res) => setData(res?.data?.data || []))
      .catch(() => toast.error('Failed to load suppliers'))
      .finally(() => setLoading(false))
  }, [search, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = data.filter((s) => {
    const q = search.toLowerCase()
    return !q || s.businessName?.toLowerCase().includes(q) || s.contactPerson?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader icon={Truck} title="Suppliers & Distributors" subtitle="View your assigned and recommended suppliers" color="#d97706" />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" placeholder="Search suppliers…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...searchInput, paddingLeft: 32 }} />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="">All Types</option>
          <option value="assigned">Assigned</option>
          <option value="preferred">Preferred</option>
          <option value="recommended">Recommended</option>
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 14 }}>Loading suppliers…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <Truck size={40} color="#d1d5db" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>No suppliers found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map((s) => (
            <div key={s._id} style={card}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={20} color="#d97706" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>{s.businessName}</p>
                    {s.type && <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0', textTransform: 'capitalize' }}>{s.type}</p>}
                  </div>
                </div>
                <AssignmentBadge type={s.assignmentType} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {s.contactPerson && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#374151' }}>
                    <Eye size={12} color="#9ca3af" /> {s.contactPerson}
                  </div>
                )}
                {s.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#374151' }}>
                    <Phone size={12} color="#9ca3af" /> {s.phone}
                  </div>
                )}
                {s.city && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#374151' }}>
                    <MapPin size={12} color="#9ca3af" /> {s.city}{s.state ? `, ${s.state}` : ''}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                <StatusBadge status={s.isActive ? 'active' : 'inactive'} />
                <button onClick={() => { setSelected(s); setDetailOpen(true) }} style={viewBtn}>
                  <Eye size={12} /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailOpen && (
        <SupplierDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} data={selected} />
      )}
    </div>
  )
}

const card = {
  background: '#fff', borderRadius: 12, padding: '18px 18px 14px',
  border: '1px solid #e5e7eb',
  transition: 'box-shadow 0.15s',
}
const searchInput = {
  width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '0 12px', fontSize: 13, outline: 'none', background: '#fff',
}
const selectStyle = {
  height: 38, border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '0 12px', fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer',
}
const viewBtn = {
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb',
  background: '#fff', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer',
}

export default SupplierList
