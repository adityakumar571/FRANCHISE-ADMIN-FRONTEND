/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { Layers, Plus, Edit2, Search, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest, putRequest } from '../../../Helpers'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>
const Inp = ({ value, onChange, placeholder }) => (
  <input value={value} onChange={onChange} placeholder={placeholder}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
)

export default function RackManagement() {
  const [racks, setRacks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showAdd, setShowAdd]   = useState(false)
  const [editRack, setEditRack] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ name: '', shelf: '', capacity: '', section: '', warehouse: 'Main Pharmacy', status: 'Active' })

  const fetchRacks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest('/franchise/medicines/racks')
      setRacks(res.data?.data || [])
    } catch { toast.error('Failed to load racks') }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { fetchRacks() }, [fetchRacks])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const openAdd = () => {
    setForm({ name: '', shelf: '', capacity: '', section: '', warehouse: 'Main Pharmacy', status: 'Active' })
    setEditRack(null)
    setShowAdd(true)
  }

  const openEdit = (rack) => {
    setForm({ name: rack.name || '', shelf: rack.shelf || '', capacity: rack.capacity || '', section: rack.section || '', warehouse: rack.warehouse || 'Main Pharmacy', status: rack.status || 'Active' })
    setEditRack(rack)
    setShowAdd(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Rack name is required'); return }
    setSaving(true)
    try {
      if (editRack) {
        await putRequest({ url: `/franchise/medicines/racks/${editRack._id}`, cred: form })
        toast.success('Rack updated')
      } else {
        await postRequest({ url: '/franchise/medicines/racks', cred: form })
        toast.success('Rack added')
      }
      setShowAdd(false)
      fetchRacks()
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save rack') }
    finally { setSaving(false) }
  }

  const filtered = racks.filter(r =>
    search === '' || r.name?.toLowerCase().includes(search.toLowerCase()) || r.warehouse?.toLowerCase().includes(search.toLowerCase())
  )

  const warehouses = [...new Set(racks.map(r => r.warehouse || 'Main Pharmacy'))]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Layers} title="Rack Management" subtitle="Organise medicines in racks and shelves" color="#16a34a">
        <button onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={14} /> Add New Rack
        </button>
      </PageHeader>

      {/* Add/Edit Rack Form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px' }}>{editRack ? 'Edit Rack / Shelf' : 'Add New Rack / Shelf'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 14 }}>
            {[['Rack Name *','name','e.g. RACK-A'],['Shelf Code','shelf','e.g. A-05'],['Capacity','capacity','200'],['Section','section','e.g. Pain Relief'],['Warehouse','warehouse','Main Pharmacy']].map(([l,k,ph]) => (
              <div key={k}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 5 }}>{l}</label>
                <Inp value={form[k]} onChange={set(k)} placeholder={ph} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Save size={13} /> {saving ? 'Saving...' : editRack ? 'Update' : 'Save Rack'}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rack or warehouse..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Warehouse Groups */}
      {loading
        ? <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading racks...</div>
        : warehouses.length === 0
          ? <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9ca3af' }}>No racks found. Add your first rack.</div>
          : warehouses.map(wh => {
            const whRacks = filtered.filter(r => (r.warehouse || 'Main Pharmacy') === wh)
            if (whRacks.length === 0) return null
            return (
              <div key={wh} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#f8faff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>🏪 {wh}</p>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{whRacks.length} racks</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <Th c="Rack Name" /><Th c="Shelf Code" /><Th c="Section" />
                      <Th c="Capacity" align="center" /><Th c="Current Items" align="center" />
                      <Th c="Status" /><Th c="Actions" />
                    </tr></thead>
                    <tbody>
                      {whRacks.map((r, i) => {
                        const pct = r.capacity > 0 ? Math.round(((r.currentItems || 0) / r.capacity) * 100) : 0
                        const full = pct >= 100
                        return (
                          <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                            <Td style={{ fontWeight: 700, color: '#0c3b73' }}>{r.name}</Td>
                            <Td style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.shelf || '—'}</Td>
                            <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.section || '—'}</Td>
                            <Td style={{ textAlign: 'center', fontWeight: 600 }}>{r.capacity || '—'}</Td>
                            <Td style={{ textAlign: 'center' }}>
                              {r.capacity ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                  <span style={{ fontWeight: 700, color: full ? '#dc2626' : '#111827' }}>{r.currentItems || 0}</span>
                                  <div style={{ width: 60, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(pct,100)}%`, height: '100%', background: full ? '#dc2626' : pct > 80 ? '#d97706' : '#16a34a', borderRadius: 3 }} />
                                  </div>
                                  <span style={{ fontSize: 10, color: '#9ca3af' }}>{pct}%</span>
                                </div>
                              ) : '—'}
                            </Td>
                            <Td>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: r.status==='Active'?'#dcfce7':'#fee2e2', color: r.status==='Active'?'#16a34a':'#dc2626' }}>
                                {r.status || 'Active'}
                              </span>
                            </Td>
                            <Td>
                              <button onClick={() => openEdit(r)}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                <Edit2 size={11} /> Edit
                              </button>
                            </Td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })
      }
    </div>
  )
}
