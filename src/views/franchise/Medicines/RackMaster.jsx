/* eslint-disable prettier/prettier */
import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'

// Simple table header and cell styling
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function RackMaster() {
  // State
  const [counters, setCounters] = useState([])
  const [racks, setRacks] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedCounter, setSelectedCounter] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ code: '', name: '', shelves: '', capacity: '', rowsPerShelf: '', columnsPerRow: '' })
  const [deleteId, setDeleteId] = useState(null)

  // Fetch counters on mount
  useEffect(() => {
    fetchCounters()
    fetchRacks()  // ← Fetch all racks on mount
  }, [])

  // Remove counter selection dependency
  useEffect(() => {
    if (selectedCounter) {
      fetchRacks()
    }
  }, [selectedCounter])

  // Fetch counters from API
  const fetchCounters = async () => {
    try {
      const response = await getRequest('/franchise/master/counters')
      const data = response.data
      
      console.log('📍 [RackMaster] Counters fetched:', data.data?.length || 0, data.data)
      
      if (data.success) {
        setCounters(data.data || [])
      } else {
        toast.error(data.message || 'Failed to fetch counters')
      }
    } catch (error) {
      console.error('❌ [RackMaster] Error fetching counters:', error.message)
      toast.error('Error fetching counters: ' + error.message)
    }
  }

  // Fetch racks - show ALL racks on page load
  const fetchRacks = async () => {
    setLoading(true)
    try {
      const response = await getRequest('/franchise/master/racks')
      const data = response.data
      
      if (data.success) {
        setRacks(data.data || [])
      } else {
        toast.error(data.message || 'Failed to fetch racks')
      }
    } catch (error) {
      toast.error('Error fetching racks: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Filter racks by search only (show ALL racks)
  const filtered = useMemo(() => {
    return racks.filter(r =>
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, racks])

  // Auto-generate short unique rack code
  const generateRackCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'R'
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code  // e.g., "RA7K9", "RB2M3"
  }

  // Open add/edit modal
  const openModal = (rack = null) => {
    if (rack) {
      setEditingId(rack._id)
      setFormData({ 
        code: rack.code, 
        name: rack.name, 
        shelves: rack.shelves?.toString() || '5',
        capacity: rack.capacity?.toString() || '200',
        rowsPerShelf: rack.rowsPerShelf?.toString() || '3',
        columnsPerRow: rack.columnsPerRow?.toString() || '4'
      })
      // Set the counter if editing
      if (rack.counterId) {
        const counterId = typeof rack.counterId === 'object' ? rack.counterId._id : rack.counterId
        setSelectedCounter(counterId)
      }
    } else {
      setEditingId(null)
      // Auto-generate code for new rack
      const autoCode = generateRackCode()
      setFormData({ code: autoCode, name: '', shelves: '5', capacity: '200', rowsPerShelf: '3', columnsPerRow: '4' })
      setSelectedCounter('')
    }
    setShowModal(true)
  }

  // Save rack
  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim() || !formData.shelves || !formData.capacity || !formData.rowsPerShelf || !formData.columnsPerRow) {
      toast.error('All fields are required')
      return
    }

    if (!selectedCounter) {
      toast.error('Please select a counter')
      return
    }

    setSaving(true)
    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        shelves: parseInt(formData.shelves),
        capacity: parseInt(formData.capacity),
        rowsPerShelf: parseInt(formData.rowsPerShelf),
        columnsPerRow: parseInt(formData.columnsPerRow),
        counterId: selectedCounter
      }

      let response
      if (editingId) {
        response = await putRequest({
          url: `/franchise/master/racks/${editingId}`,
          cred: payload
        })
      } else {
        response = await postRequest({
          url: '/franchise/master/racks',
          cred: payload
        })
      }

      const data = response.data

      if (data.success) {
        toast.success(editingId ? 'Rack updated' : 'Rack added')
        setShowModal(false)
        fetchRacks()
      } else {
        toast.error(data.message || 'Failed to save rack')
      }
    } catch (error) {
      toast.error('Error: ' + error.message)
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // Delete rack
  const handleDelete = async () => {
    setSaving(true)
    try {
      const response = await deleteRequest(`/franchise/master/racks/${deleteId}`)

      const data = response.data

      if (data.success) {
        toast.success('Rack deleted')
        setDeleteId(null)
        fetchRacks()
      } else {
        toast.error(data.message || 'Failed to delete rack')
      }
    } catch (error) {
      toast.error('Error: ' + error.message)
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // Get counter name for display
  const getCounterName = (rack) => {
    // Handle new format where counterId is an object with counter details
    if (rack.counterId && typeof rack.counterId === 'object') {
      return `${rack.counterId.code} - ${rack.counterId.name}`
    }
    // Handle old format where counterId is just an ID
    if (rack.counterId && typeof rack.counterId === 'string') {
      const counter = counters.find(c => c._id === rack.counterId)
      return counter ? `${counter.code} - ${counter.name}` : 'Unknown'
    }
    return 'Unknown'
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Rack Master</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage racks in counters</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setSelectedCounter('')  // Reset counter selection
            setFormData({ code: '', name: '', shelves: '', capacity: '' })
            setShowModal(true)
          }}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
        >
          <Plus size={15} /> Add Rack
        </button>
      </div>

      {/* Search Only - NO Counter Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by code or name..."
            style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Table - Show ALL Racks */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#9ca3af' }}>
              <Loader size={20} className="animate-spin" />
              <span style={{ marginLeft: 10 }}>Loading racks...</span>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <Th c="Code" />
                  <Th c="Name" />
                  <Th c="Shelves" />
                  <Th c="Rows/Shelf" />
                  <Th c="Cols/Row" />
                  <Th c="Capacity" />
                  <Th c="Counter" />
                  <Th c="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <Td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>
                      No racks found. Click "Add Rack" to create one.
                    </Td>
                  </tr>
                ) : (
                  filtered.map(rack => (
                    <tr key={rack._id}>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>{rack.code}</span></Td>
                      <Td>{rack.name}</Td>
                      <Td style={{ textAlign: 'center' }}>{rack.shelves}</Td>
                      <Td style={{ textAlign: 'center', background: '#fef3c7', fontWeight: 500, color: '#92400e' }}>{rack.rowsPerShelf || 3}</Td>
                      <Td style={{ textAlign: 'center', background: '#dbeafe', fontWeight: 500, color: '#1e40af' }}>{rack.columnsPerRow || 4}</Td>
                      <Td style={{ textAlign: 'center' }}>{rack.capacity}</Td>
                      <Td><span style={{ fontSize: 12, color: '#6b7280' }}>{getCounterName(rack)}</span></Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => openModal(rack)}
                            disabled={saving}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 5, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(rack._id)}
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
                {editingId ? 'Edit Rack' : 'Add New Rack'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                style={{ background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: '#9ca3af', opacity: saving ? 0.5 : 1 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Counter Selection - always editable */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                  Counter {editingId && <span style={{ color: '#dc2626' }}>*</span>}
                </label>
                <select
                  value={selectedCounter}
                  onChange={e => setSelectedCounter(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="">Select Counter</option>
                  {counters.map(c => (
                    <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                  ))}
                </select>
                {editingId && <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>Update counter assignment for this rack</p>}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                  Code {!editingId && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>(auto-suggested, edit if needed)</span>}
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., RA7K9"
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', fontWeight: 600 }}
                  />
                  {!editingId && (
                    <button
                      onClick={() => setFormData({ ...formData, code: generateRackCode() })}
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
                  placeholder="e.g., Rack A1"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                    Shelves
                  </label>
                  <input
                    type="number"
                    value={formData.shelves}
                    onChange={e => setFormData({ ...formData, shelves: e.target.value })}
                    placeholder="5"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="200"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                    Rows per Shelf
                  </label>
                  <input
                    type="number"
                    value={formData.rowsPerShelf}
                    onChange={e => setFormData({ ...formData, rowsPerShelf: e.target.value })}
                    placeholder="3"
                    min="1"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                    Columns per Row
                  </label>
                  <input
                    type="number"
                    value={formData.columnsPerRow}
                    onChange={e => setFormData({ ...formData, columnsPerRow: e.target.value })}
                    placeholder="4"
                    min="1"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
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
                {editingId ? 'Update' : 'Add'} Rack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 24, width: '90%', maxWidth: 350, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Delete Rack?</h2>
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
