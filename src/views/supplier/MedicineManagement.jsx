import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Search, Plus, Edit2, Trash2,
  AlertCircle, Download, RefreshCw, X, IndianRupee
} from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../Helpers'
import Cookies from 'js-cookie'

/* ─────────────────────────────────────────────────────────────
   Shared input style helper
───────────────────────────────────────────────────────────── */
const inp = (extra = {}) => ({
  width: '100%', padding: '8px 11px',
  border: '1px solid #e5e7eb', borderRadius: 8,
  fontSize: 13, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
  ...extra,
})

/* ─────────────────────────────────────────────────────────────
   MedicineManagement — main component
───────────────────────────────────────────────────────── */
const MedicineManagement = () => {
  const navigate = useNavigate()

  // ── list state ──
  const [medicines, setMedicines]   = useState([])
  const [loading, setLoading]       = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatus]   = useState('all')

  // ── masters (for dropdowns) ──
  const [categories, setCategories] = useState([])
  const [units, setUnits]           = useState([])
  const [companies, setCompanies]   = useState([])

  // ── modal state ──
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [form, setForm] = useState({
    name: '', genericName: '', manufacturer: '',
    category: '', unit: '', strength: '', packSize: '',
    mrp: '', supplierPrice: '', stock: '', minStock: '',
    gst: '12', description: '', isAvailable: true,
  })

  /* ── auth guard ── */
  useEffect(() => {
    const token = Cookies.get('supplierToken')
    if (!token) navigate('/supplier/login')
  }, [navigate])

  /* ── fetch masters (category / unit / company) ── */
  const fetchMasters = useCallback(async () => {
    try {
      const res = await getRequest('/suppliers/masters/all')
      const d = res?.data?.data || {}
      setCategories(d.categories || [])
      setUnits(d.units || [])
      setCompanies(d.companies || [])
    } catch {
      // fallback: keep empty arrays — user can still type
    }
  }, [])

  /* ── fetch medicines ── */
  const fetchMedicines = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ search: searchText })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await getRequest(`/suppliers/medicines?${params}`)
      setMedicines(res?.data?.data?.medicines || res?.data?.medicines || [])
    } catch {
      alert('Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }, [searchText, statusFilter])

  useEffect(() => {
    fetchMasters()
    fetchMedicines()
  }, [fetchMasters, fetchMedicines])

  /* ── open add modal ── */
  const openAdd = () => {
    setEditing(null)
    setForm({
      name: '', genericName: '', manufacturer: '',
      category: '', unit: '', strength: '', packSize: '',
      mrp: '', supplierPrice: '', stock: '', minStock: '',
      gst: '12', description: '', isAvailable: true,
    })
    setModalOpen(true)
  }

  /* ── open edit modal ── */
  const openEdit = (med) => {
    setEditing(med)
    setForm({
      name:          med.name || '',
      genericName:   med.genericName || '',
      manufacturer:  med.manufacturer || '',
      category:      med.category || '',
      unit:          med.unit || '',
      strength:      med.strength || '',
      packSize:      med.packSize || '',
      mrp:           med.mrp ?? '',
      supplierPrice: med.supplierPrice ?? '',
      stock:         med.stock ?? '',
      minStock:      med.minStock ?? '',
      gst:           med.gst ?? '12',
      description:   med.description || '',
      isAvailable:   med.isAvailable !== false,
    })
    setModalOpen(true)
  }

  /* ── submit form ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.mrp || !form.supplierPrice) {
      alert('Name, MRP and Supplier Price are required')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        mrp:           parseFloat(form.mrp),
        supplierPrice: parseFloat(form.supplierPrice),
        stock:         parseInt(form.stock) || 0,
        minStock:      parseInt(form.minStock) || 0,
        gst:           parseFloat(form.gst) || 0,
      }
      if (editing) {
        await putRequest({ url: `/suppliers/medicines/${editing._id}`, cred: payload })
      } else {
        await postRequest({ url: '/suppliers/medicines', cred: payload })
      }
      setModalOpen(false)
      fetchMedicines()
    } catch (err) {
      alert(err?.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── delete ── */
  const handleDelete = (med) => {
    if (!window.confirm(`Delete "${med.name}"? This cannot be undone.`)) return
    deleteRequest(`/suppliers/medicines/${med._id}`)
      .then(fetchMedicines)
      .catch(() => alert('Failed to delete'))
  }

  /* ── toggle availability ── */
  const toggleAvail = async (med) => {
    try {
      await putRequest({ url: `/suppliers/medicines/${med._id}`, cred: { isAvailable: !med.isAvailable } })
      fetchMedicines()
    } catch { /* ignore */ }
  }

  /* ── discount helper ── */
  const discount = () => {
    const m = parseFloat(form.mrp), p = parseFloat(form.supplierPrice)
    if (m > 0 && p > 0 && p < m) return (((m - p) / m) * 100).toFixed(1)
    return null
  }

  /* ── CSV export ── */
  const exportCSV = () => {
    const rows = medicines.map(m =>
      [m.name, m.category, m.manufacturer, m.mrp, m.supplierPrice, m.stock, m.unit].join(',')
    )
    const blob = new Blob([`Name,Category,Manufacturer,MRP,Price,Stock,Unit\n${rows.join('\n')}`], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'medicines.csv'
    a.click()
  }

  /* ── filtered list ── */
  const filtered = medicines.filter(m => {
    const q = searchText.toLowerCase()
    return !q || m.name?.toLowerCase().includes(q) || m.genericName?.toLowerCase().includes(q)
  })

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .med-row:hover { background: #f9fafb !important; }
        .med-action:hover { opacity: 0.8; }
        select option { font-size: 13px; }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>Medicine Inventory</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Manage your catalog visible to all franchises</p>
          </div>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '10px 20px', background: '#0c3b73',
          border: 'none', borderRadius: 9, color: '#fff',
          fontSize: 13, fontWeight: 700, cursor: 'pointer'
        }}>
          <Plus size={15} /> Add Medicine
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total', value: medicines.length, color: '#0c3b73', bg: '#eff6ff' },
          { label: 'Available', value: medicines.filter(m => m.isAvailable !== false).length, color: '#15803d', bg: '#f0fdf4' },
          { label: 'Out of Stock', value: medicines.filter(m => m.stock <= 0).length, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Low Stock', value: medicines.filter(m => m.stock > 0 && m.stock <= (m.minStock || 20)).length, color: '#d97706', bg: '#fffbeb' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '12px 16px', border: `1px solid ${s.color}22` }}>
            <p style={{ margin: 0, fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search by name, generic..."
            style={{ ...inp(), paddingLeft: 32 }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={{ ...inp({ width: 'auto', minWidth: 140, cursor: 'pointer' }) }}>
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="outofstock">Out of Stock</option>
          <option value="lowstock">Low Stock</option>
        </select>
        <button onClick={fetchMedicines} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
          <RefreshCw size={13} />
        </button>
        <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #f3f4f6', borderTop: '3px solid #0c3b73', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading medicines...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Package size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: '#6b7280' }}>No medicines found</p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Click "Add Medicine" to get started</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['#', 'Medicine', 'Category', 'Strength / Pack', 'MRP', 'My Price', 'Stock', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={{
                      padding: '9px 12px', fontSize: 10, fontWeight: 700,
                      color: '#6b7280', textTransform: 'uppercase', textAlign: 'left',
                      borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap',
                      width: i === 0 ? 36 : 'auto'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const isLow = m.stock > 0 && m.stock <= (m.minStock || 20)
                  const isOut = m.stock <= 0
                  const stockColor = isOut ? '#dc2626' : isLow ? '#d97706' : '#15803d'
                  const stockBg   = isOut ? '#fef2f2' : isLow ? '#fffbeb' : '#f0fdf4'
                  return (
                    <tr key={m._id} className="med-row" style={{ borderBottom: '1px solid #f3f4f6', background: '#fff', transition: 'background 0.1s' }}>
                      <td style={{ padding: '10px 12px', color: '#d1d5db', fontSize: 11 }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{m.name}</div>
                        {m.genericName && <div style={{ fontSize: 11, color: '#9ca3af' }}>{m.genericName}</div>}
                        {m.manufacturer && <div style={{ fontSize: 11, color: '#6b7280' }}>{m.manufacturer}</div>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {m.category ? (
                          <span style={{ padding: '3px 8px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 600 }}>{m.category}</span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#374151' }}>
                        {m.strength || '—'}{m.packSize && <span style={{ color: '#9ca3af' }}> / {m.packSize}</span>}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280' }}>
                        ₹{(m.mrp || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0c3b73' }}>₹{(m.supplierPrice || 0).toFixed(2)}</span>
                        {m.mrp > 0 && m.supplierPrice > 0 && (
                          <div style={{ fontSize: 10, color: '#15803d' }}>
                            {(((m.mrp - m.supplierPrice) / m.mrp) * 100).toFixed(1)}% off
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 20, background: stockBg, color: stockColor, fontSize: 11, fontWeight: 600 }}>
                          {isOut ? 'Out' : m.stock} {!isOut && m.unit ? m.unit : ''}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={() => toggleAvail(m)}
                          style={{
                            padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            background: m.isAvailable !== false ? '#dcfce7' : '#f3f4f6',
                            color: m.isAvailable !== false ? '#15803d' : '#6b7280',
                            fontSize: 11, fontWeight: 600
                          }}
                        >
                          {m.isAvailable !== false ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="med-action" onClick={() => openEdit(m)} style={{ width: 30, height: 30, borderRadius: 7, background: '#eff6ff', border: 'none', cursor: 'pointer', color: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Edit2 size={13} />
                          </button>
                          <button className="med-action" onClick={() => handleDelete(m)} style={{ width: 30, height: 30, borderRadius: 7, background: '#fef2f2', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        )}
      </div>

      {/* ══════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════ */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} color="#0c3b73" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{editing ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Fill in the details below</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Row 1: Generic name + Brand name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Generic Name <span style={{ color: '#dc2626' }}>*</span></label>
                  <input value={form.genericName} onChange={e => setForm({ ...form, genericName: e.target.value })} placeholder="e.g. Paracetamol" style={inp()} />
                </div>
                <div>
                  <label style={lbl}>Brand / Product Name <span style={{ color: '#dc2626' }}>*</span></label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Dolo 650" style={inp()} />
                </div>
              </div>

              {/* Row 2: Category + Unit + Manufacturer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp({ cursor: 'pointer' })}>
                    <option value="">Select category</option>
                    {categories.length > 0
                      ? categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)
                      : ['Tablet','Capsule','Syrup','Injection','Drops','Cream','Ointment','Powder','Gel','Other'].map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label style={lbl}>Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={inp({ cursor: 'pointer' })}>
                    <option value="">Select unit</option>
                    {units.length > 0
                      ? units.map(u => <option key={u._id} value={u.name}>{u.name}</option>)
                      : ['Strip','Box','Bottle','Pack','Piece','Vial','Tube','Sachet'].map(u => <option key={u} value={u}>{u}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label style={lbl}>Manufacturer</label>
                  <select value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} style={inp({ cursor: 'pointer' })}>
                    <option value="">Select company</option>
                    {companies.length > 0
                      ? companies.map(c => <option key={c._id} value={c.name}>{c.name}</option>)
                      : ['Sun Pharma','Cipla','Dr. Reddy\'s','Lupin','Abbott','Pfizer','Mankind'].map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                  {/* allow manual entry if company not in list */}
                  <input
                    value={companies.find(c => c.name === form.manufacturer) ? '' : form.manufacturer}
                    onChange={e => setForm({ ...form, manufacturer: e.target.value })}
                    placeholder="Or type company name..."
                    style={{ ...inp({ marginTop: 6, fontSize: 12 }) }}
                  />
                </div>
              </div>

              {/* Row 3: Strength + Pack size */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Strength</label>
                  <input value={form.strength} onChange={e => setForm({ ...form, strength: e.target.value })} placeholder="e.g. 650mg" style={inp()} />
                </div>
                <div>
                  <label style={lbl}>Pack Size</label>
                  <input value={form.packSize} onChange={e => setForm({ ...form, packSize: e.target.value })} placeholder="e.g. 15 Tablets" style={inp()} />
                </div>
              </div>

              {/* Row 4: MRP + Supplier Price + GST */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>MRP (₹) <span style={{ color: '#dc2626' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input type="number" min="0" step="0.01" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} required placeholder="0.00" style={{ ...inp({ paddingLeft: 28 }) }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>My Price (₹) <span style={{ color: '#dc2626' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input type="number" min="0" step="0.01" value={form.supplierPrice} onChange={e => setForm({ ...form, supplierPrice: e.target.value })} required placeholder="0.00" style={{ ...inp({ paddingLeft: 28 }) }} />
                  </div>
                  {discount() && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#15803d' }}>{discount()}% discount on MRP</p>}
                </div>
                <div>
                  <label style={lbl}>GST (%)</label>
                  <select value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} style={inp({ cursor: 'pointer' })}>
                    {['0','5','12','18','28'].map(g => <option key={g} value={g}>{g}%</option>)}
                  </select>
                </div>
              </div>

              {/* Row 5: Stock + Min Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Current Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" style={inp()} />
                </div>
                <div>
                  <label style={lbl}>Min Stock Alert</label>
                  <input type="number" min="0" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} placeholder="20" style={inp()} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={lbl}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Medicine description / notes..." style={{ ...inp({ resize: 'none' }) }} />
              </div>

              {/* Availability toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={lbl}>Availability</label>
                <select value={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.value === 'true' })} style={{ ...inp({ width: 'auto', minWidth: 140, cursor: 'pointer' }) }}>
                  <option value="true">Available</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              {/* Footer buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '9px 20px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ padding: '9px 22px', background: submitting ? '#d1d5db' : '#0c3b73', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Saving...' : editing ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }

export default MedicineManagement
