import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid3x3, Package, Building2, Plus, Pencil, Trash2,
  CheckCircle2, XCircle, AlertCircle, BookOpen, Search, RefreshCw
} from 'lucide-react'
import Cookies from 'js-cookie'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../Helpers'

/* ─── Tab config ──────────────────────────────────────────────── */
const TABS = [
  {
    key: 'category',
    label: 'Categories',
    icon: Grid3x3,
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    desc: 'e.g. Tablet, Capsule, Syrup, Injection',
    placeholder: 'e.g. Tablet',
  },
  {
    key: 'unit',
    label: 'Units',
    icon: Package,
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    desc: 'e.g. Strip, Box, Bottle, Pack',
    placeholder: 'e.g. Strip',
  },
  {
    key: 'company',
    label: 'Companies',
    icon: Building2,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    desc: 'e.g. Sun Pharma, Cipla, Abbott',
    placeholder: 'e.g. Sun Pharma',
  },
]

/* ─── Single tab panel ────────────────────────────────────────── */
const MasterTab = ({ tab }) => {
  const { key: type, color, bg, border, desc, placeholder } = tab

  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]             = useState({ name: '', description: '' })
  const [togglingId, setTogglingId] = useState(null)

  /* fetch — all (active + inactive) for master management view */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/suppliers/masters?type=${type}&showAll=true`)
      setData(res?.data?.data || [])
    } catch {
      alert(`Failed to load ${type} list`)
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => { fetchData() }, [fetchData])

  /* open add */
  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', description: '' })
    setModalOpen(true)
  }

  /* open edit */
  const openEdit = (record) => {
    setEditing(record)
    setForm({ name: record.name, description: record.description || '' })
    setModalOpen(true)
  }

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    try {
      if (editing) {
        await putRequest({ url: `/suppliers/masters/${editing._id}`, cred: form })
      } else {
        await postRequest({ url: '/suppliers/masters', cred: { type, ...form } })
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      alert(err?.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  /* toggle active */
  const toggleActive = async (record) => {
    setTogglingId(record._id)
    try {
      await putRequest({ url: `/suppliers/masters/${record._id}`, cred: { isActive: !record.isActive } })
      fetchData()
    } catch {
      alert('Failed to update status')
    } finally {
      setTogglingId(null)
    }
  }

  /* delete */
  const handleDelete = (record) => {
    if (!window.confirm(`Delete "${record.name}"? It will be removed from all dropdowns.`)) return
    deleteRequest(`/suppliers/masters/${record._id}`)
      .then(fetchData)
      .catch(() => alert('Failed to delete'))
  }

  /* filtered list */
  const filtered = data.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  )

  const active = filtered.filter((d) => d.isActive !== false)
  const inactive = filtered.filter((d) => d.isActive === false)

  return (
    <div>
      {/* Description */}
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>{desc}</p>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${type}s...`}
            style={{
              width: '100%', padding: '7px 10px 7px 32px',
              border: '1px solid #e5e7eb', borderRadius: 8,
              fontSize: 13, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Count badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', background: bg,
          border: `1px solid ${border}`, borderRadius: 8
        }}>
          <span style={{ fontSize: 13, color: color, fontWeight: 600 }}>{data.length}</span>
          <span style={{ fontSize: 12, color: color }}>total</span>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchData}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 12px', background: '#f9fafb',
            border: '1px solid #e5e7eb', borderRadius: 8,
            fontSize: 12, cursor: 'pointer', color: '#6b7280'
          }}
        >
          <RefreshCw size={13} />
        </button>

        {/* Add button */}
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', background: color,
            border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer'
          }}
        >
          <Plus size={14} />
          Add {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `3px solid ${bg}`, borderTop: `3px solid ${color}`,
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
          <AlertCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, color: '#6b7280' }}>No {type}s found</p>
          <p style={{ fontSize: 12 }}>
            {search ? 'Try a different search' : `Click "Add ${type.charAt(0).toUpperCase() + type.slice(1)}" to create one`}
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'Name', 'Description', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 14px', fontSize: 11, fontWeight: 700,
                    color: '#6b7280', textTransform: 'uppercase',
                    textAlign: i === 4 ? 'center' : 'left',
                    borderBottom: '1px solid #e5e7eb',
                    width: i === 0 ? 40 : i === 3 ? 100 : i === 4 ? 110 : 'auto'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Active rows first */}
              {active.map((record, i) => (
                <tr key={record._id} style={{ borderBottom: '1px solid #f3f4f6', background: '#fff' }}>
                  <td style={{ padding: '10px 14px', color: '#d1d5db', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{record.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 13 }}>{record.description || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => toggleActive(record)}
                      disabled={togglingId === record._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 20,
                        border: 'none', cursor: 'pointer',
                        background: '#dcfce7', color: '#15803d',
                        fontSize: 11, fontWeight: 600
                      }}
                    >
                      <CheckCircle2 size={12} /> Active
                    </button>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button onClick={() => openEdit(record)} style={actionBtn(color, bg)}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(record)} style={actionBtn('#dc2626', '#fee2e2')}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Inactive rows */}
              {inactive.map((record, i) => (
                <tr key={record._id} style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa', opacity: 0.7 }}>
                  <td style={{ padding: '10px 14px', color: '#d1d5db', fontSize: 12 }}>{active.length + i + 1}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, color: '#9ca3af', fontSize: 14, textDecoration: 'line-through' }}>{record.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 13 }}>{record.description || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => toggleActive(record)}
                      disabled={togglingId === record._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 20,
                        border: 'none', cursor: 'pointer',
                        background: '#f3f4f6', color: '#6b7280',
                        fontSize: 11, fontWeight: 600
                      }}
                    >
                      <XCircle size={12} /> Inactive
                    </button>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button onClick={() => openEdit(record)} style={actionBtn('#6b7280', '#f3f4f6')}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(record)} style={actionBtn('#dc2626', '#fee2e2')}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden'
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pencil size={16} color={color} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>
                  {editing ? `Edit ${type}` : `Add New ${type}`}
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
                  {editing ? 'Update the details below' : `Fill in the details to create a new ${type}`}
                </p>
              </div>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} style={{ padding: 22 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder={placeholder}
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: `1.5px solid ${form.name ? color : '#e5e7eb'}`,
                    borderRadius: 8, fontSize: 14, outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.15s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = color}
                  onBlur={(e) => e.target.style.borderColor = form.name ? color : '#e5e7eb'}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Description <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description or notes..."
                  rows={2}
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: '1.5px solid #e5e7eb', borderRadius: 8,
                    fontSize: 13, outline: 'none', resize: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = color}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '9px 20px', background: '#f9fafb',
                    border: '1px solid #e5e7eb', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.name.trim()}
                  style={{
                    padding: '9px 22px', background: submitting || !form.name.trim() ? '#d1d5db' : color,
                    border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, color: '#fff',
                    cursor: submitting || !form.name.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const actionBtn = (color, bg) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 30, borderRadius: 7,
  background: bg, border: 'none', cursor: 'pointer', color
})

/* ─── MAIN PAGE ───────────────────────────────────────────────── */
const MedicineMasters = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('category')

  useEffect(() => {
    const token = Cookies.get('supplierToken')
    if (!token) navigate('/supplier/login')
  }, [navigate])

  const currentTab = TABS.find((t) => t.key === activeTab)

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: '#0c3b73', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <BookOpen size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>
            Medicine Masters
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            Manage Categories, Units and Companies used across medicine inventory
          </p>
        </div>
      </div>

      {/* Tab bar + Content card */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 22px', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? tab.color : '#6b7280',
                  background: isActive ? tab.bg : 'transparent',
                  borderBottom: isActive ? `2.5px solid ${tab.color}` : '2.5px solid transparent',
                  whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <MasterTab key={activeTab} tab={currentTab} />
        </div>
      </div>
    </div>
  )
}

export default MedicineMasters
