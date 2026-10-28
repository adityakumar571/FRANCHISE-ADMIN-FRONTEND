/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'

// Simple table header and cell styling
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function CounterMaster() {
  const [counters, setCounters] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ code: '', name: '', location: '' })
  const [deleteId, setDeleteId] = useState(null)

  // Auto-generate short unique counter code
  const generateCounterCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'C'
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code  // e.g., "CA7K9", "CB2M3"
  }

  // Fetch counters from API
  useEffect(() => {
    fetchCounters()
  }, [])

  const fetchCounters = async () => {
    setLoading(true)
    try {
      const response = await getRequest('/franchise/master/counters')
      const data = response.data
      
      if (data.success) {
        setCounters(data.data || [])
      } else {
        toast.error(data.message || 'Failed to fetch counters')
      }
    } catch (error) {
      toast.error('Error fetching counters: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Filter counters
  const filtered = counters.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.location && c.location.toLowerCase().includes(search.toLowerCase()))
  )

  // Open add/edit modal
  const openModal = (counter = null) => {
    if (counter) {
      setEditingId(counter._id)
      setFormData({ code: counter.code, name: counter.name, location: counter.location || '' })
    } else {
      setEditingId(null)
      // Auto-generate code for new counter
      const autoCode = generateCounterCode()
      setFormData({ code: autoCode, name: '', location: '' })
    }
    setShowModal(true)
  }

  // Save counter
  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Code and Name are required')
      return
    }

    setSaving(true)
    try {
      let response
      if (editingId) {
        response = await putRequest({
          url: `/franchise/master/counters/${editingId}`,
          cred: formData
        })
      } else {
        response = await postRequest({
          url: '/franchise/master/counters',
          cred: formData
        })
      }

      const data = response.data

      if (data.success) {
        toast.success(editingId ? 'Counter updated' : 'Counter added')
        setShowModal(false)
        fetchCounters()
      } else {
        toast.error(data.message || 'Failed to save counter')
      }
    } catch (error) {
      toast.error('Error: ' + error.message)
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // Delete counter
  const handleDelete = async () => {
    setSaving(true)
    try {
      const response = await deleteRequest(`/franchise/master/counters/${deleteId}`)

      const data = response.data

      if (data.success) {
        toast.success('Counter deleted')
        setDeleteId(null)
        fetchCounters()
      } else {
        toast.error(data.message || 'Failed to delete counter')
      }
    } catch (error) {
      toast.error('Error: ' + error.message)
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Counter Master</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage pharmacy counters</p>
        </div>
        <button
          onClick={() => openModal()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={15} /> Add Counter
        </button>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by code, name or location..."
            style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#9ca3af' }}>
              <Loader size={20} className="animate-spin" />
              <span style={{ marginLeft: 10 }}>Loading counters...</span>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <Th c="Code" />
                  <Th c="Name" />
                  <Th c="Location" />
                  <Th c="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <Td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>
                      No counters found
                    </Td>
                  </tr>
                ) : (
                  filtered.map(counter => (
                    <tr key={counter._id}>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>{counter.code}</span></Td>
                      <Td>{counter.name}</Td>
                      <Td>{counter.location}</Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => openModal(counter)}
                            disabled={saving}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 5, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(counter._id)}
                            disabled={saving}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 5, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 24, width: '90%', maxWidth: 400, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                {editingId ? 'Edit Counter' : 'Add New Counter'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                  Code {!editingId && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>(auto-suggested, edit if needed)</span>}
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., CA7K9"
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', fontWeight: 600 }}
                  />
                  {!editingId && (
                    <button
                      onClick={() => setFormData({ ...formData, code: generateCounterCode() })}
                      title="Generate new code"
                      style={{ padding: '8px 12px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      🔄 New
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Counter"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Ground Floor"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                style={{ flex: 1, padding: '9px 14px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, padding: '9px 14px', background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}
              >
                {saving && <Loader size={13} className="animate-spin" />}
                {editingId ? 'Update' : 'Add'} Counter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 24, width: '90%', maxWidth: 350, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Delete Counter?</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteId(null)}
                disabled={saving}
                style={{ flex: 1, padding: '9px 14px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                style={{ flex: 1, padding: '9px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}
              >
                {saving && <Loader size={13} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
