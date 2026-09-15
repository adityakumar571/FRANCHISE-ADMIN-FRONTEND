/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Plus, Edit2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X, Package, Tag, Layers, FileText, RefreshCw, Trash2,
} from 'lucide-react'
import { getRequest, postRequest, putRequest, patchRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

/* ─── palette ─── */
const C = {
  primary: '#0c3b73', accent: '#fabf22', success: '#16a34a',
  danger: '#dc2626', border: '#e5e7eb', bg: '#f8f9fb',
  white: '#ffffff', text: '#111827', muted: '#6b7280',
}
const font = { fontFamily: "'Inter', sans-serif" }

/* ─── shared components ─── */
const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color, background: bg, whiteSpace: 'nowrap' }}>
    {label}
  </span>
)

const StatCard = ({ label, value, color, loading }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', minWidth: 130, flex: 1 }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: color || C.primary }}>
      {loading ? <div style={{ height: 24, width: 56, background: '#f3f4f6', borderRadius: 6 }} /> : value}
    </div>
    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</div>
  </div>
)

const Th = ({ children, w }) => (
  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: C.muted,
    background: C.bg, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap', width: w }}>
    {children}
  </th>
)
const Td = ({ children }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: C.text, borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle' }}>
    {children}
  </td>
)

const Toggle = ({ checked, onChange }) => (
  <div onClick={onChange} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
    {checked
      ? <ToggleRight size={24} color={C.success} />
      : <ToggleLeft  size={24} color={C.muted} />}
  </div>
)

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>{label}</label>}
    <input {...props} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`,
      borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box', ...props.style }} />
  </div>
)

const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>{label}</label>}
    <select {...props} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`,
      borderRadius: 6, fontSize: 13, outline: 'none', background: C.white, boxSizing: 'border-box', ...props.style }}>
      {children}
    </select>
  </div>
)

/* ─── skeleton rows ─── */
const SkeletonRows = ({ cols = 8, rows = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={{ padding: '12px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ height: 12, borderRadius: 5, background: '#f3f4f6', width: j === 0 ? '70%' : '50%' }} />
          </td>
        ))}
      </tr>
    ))}
  </>
)

/* ─── pagination ─── */
const PaginationBar = ({ page, totalPages, total, perPage, setPage }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
    <span style={{ fontSize: 12, color: C.muted }}>
      {total === 0 ? 'No records'
        : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}`}
    </span>
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
        style={{ border: `1px solid ${C.border}`, background: C.white, borderRadius: 6, padding: '5px 10px',
          cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
        <ChevronLeft size={14} />
      </button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const delta = 3
        const n = totalPages <= 7 ? i + 1
                : i === 0 ? 1
                : i === 6 ? totalPages
                : Math.max(2, Math.min(page - delta + i, totalPages - 1))
        return (
          <button key={n} onClick={() => setPage(n)}
            style={{ border: `1px solid ${n === page ? C.primary : C.border}`,
              background: n === page ? C.primary : C.white,
              color: n === page ? C.white : C.text,
              borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {n}
          </button>
        )
      })}
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
        style={{ border: `1px solid ${C.border}`, background: C.white, borderRadius: 6, padding: '5px 10px',
          cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}>
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
)

/* ─── empty form shapes ─── */
const EMPTY_MED  = { name:'', generic:'', brand:'', strength:'', form:'Tablet', pack:'', unit:'', hsn:'3004', gst:'12', barcode:'', category:'', controlled:false, isActive:true }
const EMPTY_BRAND= { name:'', manufacturer:'', isActive:true }
const EMPTY_CAT  = { name:'', type:'Therapeutic', isActive:true }

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const GlobalMedicineMaster = () => {
  const [activeTab, setActiveTab] = useState('medicines')

  /* ── Medicine state ── */
  const [medicines,    setMedicines]    = useState([])
  const [medTotal,     setMedTotal]     = useState(0)
  const [medPages,     setMedPages]     = useState(1)
  const [medPage,      setMedPage]      = useState(1)
  const [medLoading,   setMedLoading]   = useState(false)
  const [medStats,     setMedStats]     = useState(null)
  const [medSearch,    setMedSearch]    = useState('')
  const [medCatFilter, setMedCatFilter] = useState('')
  const [medStatusFilter,setMedStatusFilter] = useState('all')
  const [medModal,     setMedModal]     = useState(false)
  const [editMed,      setEditMed]      = useState(null)
  const [medForm,      setMedForm]      = useState(EMPTY_MED)
  const [medSaving,    setMedSaving]    = useState(false)

  /* ── Brand state ── */
  const [brands,      setBrands]      = useState([])
  const [brandTotal,  setBrandTotal]  = useState(0)
  const [brandPages,  setBrandPages]  = useState(1)
  const [brandPage,   setBrandPage]   = useState(1)
  const [brandLoading,setBrandLoading]= useState(false)
  const [brandSearch, setBrandSearch] = useState('')
  const [brandModal,  setBrandModal]  = useState(false)
  const [editBrand,   setEditBrand]   = useState(null)
  const [brandForm,   setBrandForm]   = useState(EMPTY_BRAND)
  const [brandSaving, setBrandSaving] = useState(false)

  /* ── Category state ── */
  const [categories,    setCategories]    = useState([])
  const [catTotal,      setCatTotal]      = useState(0)
  const [catPages,      setCatPages]      = useState(1)
  const [catPage,       setCatPage]       = useState(1)
  const [catLoading,    setCatLoading]    = useState(false)
  const [catSearch,     setCatSearch]     = useState('')
  const [catModal,      setCatModal]      = useState(false)
  const [editCat,       setEditCat]       = useState(null)
  const [catForm,       setCatForm]       = useState(EMPTY_CAT)
  const [catSaving,     setCatSaving]     = useState(false)

  /* ── HSN state ── */
  const [hsnList,    setHsnList]    = useState([])
  const [hsnLoading, setHsnLoading] = useState(false)

  const PER = 15

  /* ── fetch medicines ── */
  const fetchMedicines = useCallback(() => {
    setMedLoading(true)
    const p = new URLSearchParams({ page: medPage, limit: PER })
    if (medSearch)                   p.set('search',   medSearch)
    if (medCatFilter)                p.set('category', medCatFilter)
    if (medStatusFilter !== 'all')   p.set('isActive', medStatusFilter === 'active' ? 'true' : 'false')

    Promise.all([
      getRequest(`medicine?${p}`),
      getRequest('medicine/stats'),
    ]).then(([listRes, statsRes]) => {
      const d = listRes?.data?.data
      setMedicines(d?.medicines || [])
      setMedTotal(d?.total || 0)
      setMedPages(d?.totalPages || 1)
      setMedStats(statsRes?.data?.data || null)
    })
    .catch(() => toast.error('Failed to load medicines'))
    .finally(() => setMedLoading(false))
  }, [medPage, medSearch, medCatFilter, medStatusFilter])

  useEffect(() => { if (activeTab === 'medicines') fetchMedicines() }, [activeTab, fetchMedicines])

  /* ── fetch brands ── */
  const fetchBrands = useCallback(() => {
    setBrandLoading(true)
    const p = new URLSearchParams({ page: brandPage, limit: PER })
    if (brandSearch) p.set('search', brandSearch)
    getRequest(`medicine/brands?${p}`)
      .then(res => {
        const d = res?.data?.data
        setBrands(d?.brands || [])
        setBrandTotal(d?.total || 0)
        setBrandPages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load brands'))
      .finally(() => setBrandLoading(false))
  }, [brandPage, brandSearch])

  useEffect(() => { if (activeTab === 'brands') fetchBrands() }, [activeTab, fetchBrands])

  /* ── fetch categories ── */
  const fetchCategories = useCallback(() => {
    setCatLoading(true)
    const p = new URLSearchParams({ page: catPage, limit: PER })
    if (catSearch) p.set('search', catSearch)
    getRequest(`medicine/categories?${p}`)
      .then(res => {
        const d = res?.data?.data
        setCategories(d?.categories || [])
        setCatTotal(d?.total || 0)
        setCatPages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setCatLoading(false))
  }, [catPage, catSearch])

  useEffect(() => { if (activeTab === 'categories') fetchCategories() }, [activeTab, fetchCategories])

  /* ── fetch HSN ── */
  useEffect(() => {
    if (activeTab !== 'tax') return
    setHsnLoading(true)
    getRequest('medicine/hsn')
      .then(res => setHsnList(res?.data?.data?.hsnList || []))
      .catch(() => toast.error('Failed to load HSN list'))
      .finally(() => setHsnLoading(false))
  }, [activeTab])

  /* ═══ Medicine CRUD ═══ */
  const handleSaveMedicine = () => {
    if (!medForm.name.trim()) return toast.error('Medicine name is required')
    setMedSaving(true)
    const req = editMed
      ? putRequest({ url: `medicine/${editMed._id}`, cred: medForm })
      : postRequest({ url: 'medicine', cred: medForm })
    req
      .then(() => { toast.success(editMed ? 'Medicine updated ✅' : 'Medicine created ✅'); setMedModal(false); fetchMedicines() })
      .catch(err => toast.error(err?.response?.data?.message || 'Failed to save'))
      .finally(() => setMedSaving(false))
  }

  const handleToggleMedicine = (med) => {
    patchRequest({ url: `medicine/${med._id}/toggle`, cred: {} })
      .then(() => fetchMedicines())
      .catch(() => toast.error('Toggle failed'))
  }

  const handleDeleteMedicine = (med) => {
    if (!window.confirm(`Delete "${med.name}"?`)) return
    deleteRequest(`medicine/${med._id}`)
      .then(() => { toast.success('Deleted'); fetchMedicines() })
      .catch(() => toast.error('Delete failed'))
  }

  /* ═══ Brand CRUD ═══ */
  const handleSaveBrand = () => {
    if (!brandForm.name.trim()) return toast.error('Brand name is required')
    setBrandSaving(true)
    const req = editBrand
      ? putRequest({ url: `medicine/brands/${editBrand._id}`, cred: brandForm })
      : postRequest({ url: 'medicine/brands', cred: brandForm })
    req
      .then(() => { toast.success(editBrand ? 'Brand updated ✅' : 'Brand created ✅'); setBrandModal(false); fetchBrands() })
      .catch(err => toast.error(err?.response?.data?.message || 'Failed to save'))
      .finally(() => setBrandSaving(false))
  }

  const handleToggleBrand = (brand) => {
    patchRequest({ url: `medicine/brands/${brand._id}/toggle`, cred: {} })
      .then(() => fetchBrands())
      .catch(() => toast.error('Toggle failed'))
  }

  const handleDeleteBrand = (brand) => {
    if (!window.confirm(`Delete brand "${brand.name}"?`)) return
    deleteRequest(`medicine/brands/${brand._id}`)
      .then(() => { toast.success('Brand deleted'); fetchBrands() })
      .catch(() => toast.error('Delete failed'))
  }

  /* ═══ Category CRUD ═══ */
  const handleSaveCategory = () => {
    if (!catForm.name.trim()) return toast.error('Category name is required')
    setCatSaving(true)
    const req = editCat
      ? putRequest({ url: `medicine/categories/${editCat._id}`, cred: catForm })
      : postRequest({ url: 'medicine/categories', cred: catForm })
    req
      .then(() => { toast.success(editCat ? 'Category updated ✅' : 'Category created ✅'); setCatModal(false); fetchCategories() })
      .catch(err => toast.error(err?.response?.data?.message || 'Failed to save'))
      .finally(() => setCatSaving(false))
  }

  const handleToggleCategory = (cat) => {
    patchRequest({ url: `medicine/categories/${cat._id}/toggle`, cred: {} })
      .then(() => fetchCategories())
      .catch(() => toast.error('Toggle failed'))
  }

  const handleDeleteCategory = (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return
    deleteRequest(`medicine/categories/${cat._id}`)
      .then(() => { toast.success('Category deleted'); fetchCategories() })
      .catch(() => toast.error('Delete failed'))
  }

  const tabs = [
    { key: 'medicines',  label: 'Medicines',   icon: <Package  size={14} /> },
    { key: 'brands',     label: 'Brands',      icon: <Tag      size={14} /> },
    { key: 'categories', label: 'Categories',  icon: <Layers   size={14} /> },
    { key: 'tax',        label: 'Tax / GST',   icon: <FileText size={14} /> },
  ]

  /* ─── unique categories from fetched medicines (for filter dropdown) ─── */
  const uniqueCats = [...new Set(medicines.map(m => m.category).filter(Boolean))]

  return (
    <div style={{ ...font, background: C.bg, minHeight: '100vh', padding: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>Global Medicine Master</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>Central medicine catalogue for the network</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              if (activeTab === 'medicines')  fetchMedicines()
              if (activeTab === 'brands')     fetchBrands()
              if (activeTab === 'categories') fetchCategories()
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.white, color: '#374151',
              border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          {activeTab === 'medicines' && (
            <button onClick={() => { setEditMed(null); setMedForm(EMPTY_MED); setMedModal(true) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: C.white,
                border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={16} /> Add Medicine
            </button>
          )}
          {activeTab === 'brands' && (
            <button onClick={() => { setEditBrand(null); setBrandForm(EMPTY_BRAND); setBrandModal(true) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: C.white,
                border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={16} /> Add Brand
            </button>
          )}
          {activeTab === 'categories' && (
            <button onClick={() => { setEditCat(null); setCatForm(EMPTY_CAT); setCatModal(true) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: C.white,
                border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={16} /> Add Category
            </button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 6, marginBottom: 22, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 7,
              border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeTab === t.key ? C.primary : 'transparent',
              color:      activeTab === t.key ? C.white   : C.muted,
              transition: 'all .15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════ MEDICINES TAB ════ */}
      {activeTab === 'medicines' && (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatCard label="Total Medicines" value={(medStats?.total    || 0).toLocaleString()} loading={medLoading} />
            <StatCard label="Active"          value={(medStats?.active   || 0).toLocaleString()} color={C.success} loading={medLoading} />
            <StatCard label="Inactive"        value={(medStats?.inactive || 0).toLocaleString()} color={C.danger}  loading={medLoading} />
            <StatCard label="Generic Mapped"  value={(medStats?.genericMapped || 0).toLocaleString()} color="#7c3aed" loading={medLoading} />
            <StatCard label="Categories"      value={(medStats?.categoryCount  || 0).toLocaleString()} color="#0891b2" loading={medLoading} />
          </div>

          {/* Filters */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 16, marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
              <input value={medSearch}
                onChange={e => { setMedSearch(e.target.value); setMedPage(1) }}
                placeholder="Search name / generic / barcode / brand…"
                style={{ width: '100%', padding: '8px 10px 8px 32px', border: `1px solid ${C.border}`,
                  borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <select value={medCatFilter} onChange={e => { setMedCatFilter(e.target.value); setMedPage(1) }}
              style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white }}>
              <option value="">All Categories</option>
              {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={medStatusFilter} onChange={e => { setMedStatusFilter(e.target.value); setMedPage(1) }}
              style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1050 }}>
              <thead>
                <tr>
                  <Th>Medicine Name</Th><Th>Generic</Th><Th>Brand</Th><Th>Strength</Th>
                  <Th>Form</Th><Th>Pack</Th><Th>HSN</Th><Th>GST%</Th><Th>Status</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {medLoading ? <SkeletonRows cols={10} rows={8} />
                  : medicines.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: C.muted }}>
                      No medicines found
                    </td></tr>
                  ) : medicines.map(m => (
                    <tr key={m._id}
                      onMouseEnter={e => e.currentTarget.style.background = C.bg}
                      onMouseLeave={e => e.currentTarget.style.background = C.white}>
                      <Td><span style={{ fontWeight: 600, color: C.primary }}>{m.name}</span></Td>
                      <Td><span style={{ color: C.muted, fontSize: 12 }}>{m.generic || '—'}</span></Td>
                      <Td>{m.brand || '—'}</Td>
                      <Td><Badge label={m.strength || '—'} color={C.primary}  bg="#e8f0fb" /></Td>
                      <Td><Badge label={m.form}            color="#7c3aed"    bg="#f3e8ff" /></Td>
                      <Td><span style={{ fontSize: 12 }}>{m.pack || '—'}</span></Td>
                      <Td><span style={{ fontSize: 12, color: C.muted }}>{m.hsn || '—'}</span></Td>
                      <Td><Badge label={`${m.gst || 0}%`} color="#d97706" bg="#fef3c7" /></Td>
                      <Td>
                        <Badge
                          label={m.isActive ? 'Active' : 'Inactive'}
                          color={m.isActive ? C.success : C.danger}
                          bg={m.isActive ? '#dcfce7' : '#fee2e2'}
                        />
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button onClick={() => { setEditMed(m); setMedForm({ name:m.name, generic:m.generic||'', brand:m.brand||'', strength:m.strength||'', form:m.form||'Tablet', pack:m.pack||'', unit:m.unit||'', hsn:m.hsn||'3004', gst:m.gst||'12', barcode:m.barcode||'', category:m.category||'', controlled:m.controlled||false, isActive:m.isActive }); setMedModal(true) }}
                            style={{ background: '#e8f0fb', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.primary }}>
                            <Edit2 size={13} />
                          </button>
                          <Toggle checked={m.isActive} onChange={() => handleToggleMedicine(m)} />
                          <button onClick={() => handleDeleteMedicine(m)}
                            style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.danger }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
            <PaginationBar page={medPage} totalPages={medPages} total={medTotal} perPage={PER} setPage={setMedPage} />
          </div>
        </>
      )}

      {/* ════ BRANDS TAB ════ */}
      {activeTab === 'brands' && (
        <>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 16, marginBottom: 18, display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
              <input value={brandSearch}
                onChange={e => { setBrandSearch(e.target.value); setBrandPage(1) }}
                placeholder="Search brand / manufacturer…"
                style={{ width: '100%', padding: '8px 10px 8px 32px', border: `1px solid ${C.border}`,
                  borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><Th>Brand Name</Th><Th>Manufacturer</Th><Th>Medicine Count</Th><Th>Status</Th><Th>Actions</Th></tr>
              </thead>
              <tbody>
                {brandLoading ? <SkeletonRows cols={5} rows={6} />
                  : brands.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No brands found</td></tr>
                  ) : brands.map(b => (
                    <tr key={b._id}
                      onMouseEnter={e => e.currentTarget.style.background = C.bg}
                      onMouseLeave={e => e.currentTarget.style.background = C.white}>
                      <Td><span style={{ fontWeight: 600, color: C.primary }}>{b.name}</span></Td>
                      <Td><span style={{ fontSize: 12, color: C.muted }}>{b.manufacturer || '—'}</span></Td>
                      <Td><Badge label={b.count || 0} color={C.primary} bg="#e8f0fb" /></Td>
                      <Td>
                        <Badge
                          label={b.isActive ? 'Active' : 'Inactive'}
                          color={b.isActive ? C.success : C.danger}
                          bg={b.isActive ? '#dcfce7' : '#fee2e2'}
                        />
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditBrand(b); setBrandForm({ name:b.name, manufacturer:b.manufacturer||'', isActive:b.isActive }); setBrandModal(true) }}
                            style={{ background: '#e8f0fb', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.primary }}>
                            <Edit2 size={13} />
                          </button>
                          <Toggle checked={b.isActive} onChange={() => handleToggleBrand(b)} />
                          <button onClick={() => handleDeleteBrand(b)}
                            style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.danger }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
            <PaginationBar page={brandPage} totalPages={brandPages} total={brandTotal} perPage={PER} setPage={setBrandPage} />
          </div>
        </>
      )}

      {/* ════ CATEGORIES TAB ════ */}
      {activeTab === 'categories' && (
        <>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 16, marginBottom: 18 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
              <input value={catSearch}
                onChange={e => { setCatSearch(e.target.value); setCatPage(1) }}
                placeholder="Search category…"
                style={{ width: '100%', padding: '8px 10px 8px 32px', border: `1px solid ${C.border}`,
                  borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><Th>Category Name</Th><Th>Type</Th><Th>Medicine Count</Th><Th>Status</Th><Th>Actions</Th></tr>
              </thead>
              <tbody>
                {catLoading ? <SkeletonRows cols={5} rows={5} />
                  : categories.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No categories found</td></tr>
                  ) : categories.map(cat => (
                    <tr key={cat._id}
                      onMouseEnter={e => e.currentTarget.style.background = C.bg}
                      onMouseLeave={e => e.currentTarget.style.background = C.white}>
                      <Td><span style={{ fontWeight: 600 }}>{cat.name}</span></Td>
                      <Td>
                        <Badge
                          label={cat.type}
                          color={cat.type === 'Controlled' ? C.danger : cat.type === 'OTC' ? '#d97706' : C.primary}
                          bg={cat.type === 'Controlled' ? '#fee2e2' : cat.type === 'OTC' ? '#fef3c7' : '#e8f0fb'}
                        />
                      </Td>
                      <Td><span style={{ fontWeight: 600, color: '#374151' }}>{cat.count || 0}</span></Td>
                      <Td>
                        <Badge
                          label={cat.isActive ? 'Active' : 'Inactive'}
                          color={cat.isActive ? C.success : C.danger}
                          bg={cat.isActive ? '#dcfce7' : '#fee2e2'}
                        />
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditCat(cat); setCatForm({ name:cat.name, type:cat.type||'Therapeutic', isActive:cat.isActive }); setCatModal(true) }}
                            style={{ background: '#e8f0fb', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.primary }}>
                            <Edit2 size={13} />
                          </button>
                          <Toggle checked={cat.isActive} onChange={() => handleToggleCategory(cat)} />
                          <button onClick={() => handleDeleteCategory(cat)}
                            style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: C.danger }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
            <PaginationBar page={catPage} totalPages={catPages} total={catTotal} perPage={PER} setPage={setCatPage} />
          </div>
        </>
      )}

      {/* ════ TAX / HSN TAB ════ */}
      {activeTab === 'tax' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th>HSN Code</Th><Th>Description</Th><Th>GST %</Th><Th>Status</Th></tr>
            </thead>
            <tbody>
              {hsnLoading ? <SkeletonRows cols={4} rows={6} />
                : hsnList.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No HSN data</td></tr>
                ) : hsnList.map((h, i) => (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = C.white}>
                    <Td><span style={{ fontWeight: 700, color: C.primary }}>{h.hsn}</span></Td>
                    <Td><span style={{ fontSize: 12, color: C.muted }}>{h.desc}</span></Td>
                    <Td><Badge label={`${h.gst}%`} color="#d97706" bg="#fef3c7" /></Td>
                    <Td>
                      <Badge
                        label={h.isActive ? 'Active' : 'Inactive'}
                        color={h.isActive ? C.success : C.danger}
                        bg={h.isActive ? '#dcfce7' : '#fee2e2'}
                      />
                    </Td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* ════ ADD/EDIT MEDICINE MODAL ════ */}
      {medModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 640,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', ...font }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.primary }}>
                {editMed ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <button onClick={() => setMedModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Input label="Medicine Name *" value={medForm.name} onChange={e => setMedForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paracetamol 650mg" />
                <Input label="Generic Name / Composition" value={medForm.generic} onChange={e => setMedForm(f => ({ ...f, generic: e.target.value }))} placeholder="e.g. Paracetamol" />
                <Input label="Brand" value={medForm.brand} onChange={e => setMedForm(f => ({ ...f, brand: e.target.value }))} placeholder="Brand name" />
                <Input label="Strength" value={medForm.strength} onChange={e => setMedForm(f => ({ ...f, strength: e.target.value }))} placeholder="e.g. 650mg" />
                <Select label="Dosage Form" value={medForm.form} onChange={e => setMedForm(f => ({ ...f, form: e.target.value }))}>
                  {['Tablet','Capsule','Syrup','Injection','Cream','Ointment','Drops','Suspension','Gel','Powder','Other'].map(o => <option key={o} value={o}>{o}</option>)}
                </Select>
                <Input label="Pack Size" value={medForm.pack} onChange={e => setMedForm(f => ({ ...f, pack: e.target.value }))} placeholder="e.g. 10s" />
                <Input label="Unit" value={medForm.unit} onChange={e => setMedForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. Strip" />
                <Input label="HSN Code" value={medForm.hsn} onChange={e => setMedForm(f => ({ ...f, hsn: e.target.value }))} placeholder="e.g. 3004" />
                <Select label="GST %" value={medForm.gst} onChange={e => setMedForm(f => ({ ...f, gst: e.target.value }))}>
                  {['0','5','12','18'].map(g => <option key={g} value={g}>{g}%</option>)}
                </Select>
                <Input label="Barcode" value={medForm.barcode} onChange={e => setMedForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Scan or enter barcode" />
                <Input label="Category" value={medForm.category} onChange={e => setMedForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Analgesic" />
              </div>
              <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer' }}>
                  <Toggle checked={medForm.controlled} onChange={() => setMedForm(f => ({ ...f, controlled: !f.controlled }))} />
                  Controlled Medicine
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer' }}>
                  <Toggle checked={medForm.isActive} onChange={() => setMedForm(f => ({ ...f, isActive: !f.isActive }))} />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => setMedModal(false)}
                  style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.muted }}>
                  Cancel
                </button>
                <button onClick={handleSaveMedicine} disabled={medSaving}
                  style={{ padding: '9px 22px', border: 'none', borderRadius: 7,
                    background: medSaving ? '#93c5fd' : C.primary, color: C.white,
                    fontSize: 13, fontWeight: 600, cursor: medSaving ? 'not-allowed' : 'pointer' }}>
                  {medSaving ? 'Saving…' : editMed ? 'Update Medicine' : 'Save Medicine'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ ADD/EDIT BRAND MODAL ════ */}
      {brandModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', ...font }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.primary }}>
                {editBrand ? 'Edit Brand' : 'Add Brand'}
              </h2>
              <button onClick={() => setBrandModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <Input label="Brand Name *" value={brandForm.name} onChange={e => setBrandForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sun Pharma" />
              <Input label="Manufacturer" value={brandForm.manufacturer} onChange={e => setBrandForm(f => ({ ...f, manufacturer: e.target.value }))} placeholder="Full manufacturer name" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer', marginBottom: 18 }}>
                <Toggle checked={brandForm.isActive} onChange={() => setBrandForm(f => ({ ...f, isActive: !f.isActive }))} /> Active
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => setBrandModal(false)} style={{ padding: '9px 18px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.muted }}>Cancel</button>
                <button onClick={handleSaveBrand} disabled={brandSaving}
                  style={{ padding: '9px 22px', border: 'none', borderRadius: 7, background: brandSaving ? '#93c5fd' : C.primary, color: C.white, fontSize: 13, fontWeight: 600, cursor: brandSaving ? 'not-allowed' : 'pointer' }}>
                  {brandSaving ? 'Saving…' : editBrand ? 'Update Brand' : 'Save Brand'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ ADD/EDIT CATEGORY MODAL ════ */}
      {catModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', ...font }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.primary }}>
                {editCat ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setCatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <Input label="Category Name *" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Analgesic" />
              <Select label="Type" value={catForm.type} onChange={e => setCatForm(f => ({ ...f, type: e.target.value }))}>
                {['Therapeutic','OTC','Controlled','Surgical','Ayurvedic','Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer', marginBottom: 18 }}>
                <Toggle checked={catForm.isActive} onChange={() => setCatForm(f => ({ ...f, isActive: !f.isActive }))} /> Active
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => setCatModal(false)} style={{ padding: '9px 18px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.muted }}>Cancel</button>
                <button onClick={handleSaveCategory} disabled={catSaving}
                  style={{ padding: '9px 22px', border: 'none', borderRadius: 7, background: catSaving ? '#93c5fd' : C.primary, color: C.white, fontSize: 13, fontWeight: 600, cursor: catSaving ? 'not-allowed' : 'pointer' }}>
                  {catSaving ? 'Saving…' : editCat ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalMedicineMaster
