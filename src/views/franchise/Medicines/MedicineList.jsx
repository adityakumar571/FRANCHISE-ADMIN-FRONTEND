/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, Search, Plus, Edit2, Eye, Filter, Download, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, patchRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function MedicineList() {
  const navigate = useNavigate()
  const [data, setData]         = useState([])
  const [kpi, setKpi]           = useState({ totalMeds: 0, activeMeds: 0, inactiveMeds: 0, lowStock: 0 })
  const [categories, setCategories]     = useState(['All Categories'])
  const [formulations, setFormulations] = useState(['All Formulations'])
  const [companies, setCompanies]       = useState(['All Companies'])
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('All Categories')
  const [form, setForm]         = useState('All Formulations')
  const [comp, setComp]         = useState('All Companies')
  const [status, setStatus]     = useState('All Status')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(true)
  const PER = 8
  const debounceRef = useRef()

  const fetchMedicines = useCallback(async () => {
    setLoading(true)
    try {
      const catParam  = cat  !== 'All Categories'   ? cat  : ''
      const formParam = form !== 'All Formulations' ? form : ''
      const compParam = comp !== 'All Companies'    ? comp : ''
      const stParam   = status !== 'All Status'     ? status : ''
      const res = await getRequest(
        `/franchise/medicines?search=${encodeURIComponent(search)}&category=${encodeURIComponent(catParam)}&formulation=${encodeURIComponent(formParam)}&company=${encodeURIComponent(compParam)}&status=${encodeURIComponent(stParam)}&page=${page}&limit=${PER}`
      )
      const d = res.data?.data
      setData(d?.medicines || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      if (d?.kpi) setKpi(d.kpi)
      if (d?.categories)   setCategories(d.categories)
      if (d?.formulations) setFormulations(d.formulations)
      if (d?.companies)    setCompanies(d.companies)
    } catch { toast.error('Failed to load medicines') }
    finally   { setLoading(false) }
  }, [search, cat, form, comp, status, page])

  useEffect(() => { fetchMedicines() }, [fetchMedicines])

  const handleSearchChange = (val) => {
    setSearch(val); setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchMedicines, 400)
  }

  const toggleStatus = async (id) => {
    try {
      const res = await patchRequest({ url: `/franchise/medicines/${id}/status`, cred: {} })
      setData(prev => prev.map(m => m._id === id ? { ...m, isActive: res.data?.data?.isActive } : m))
      toast.success('Status updated')
    } catch { toast.error('Failed to toggle status') }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FlaskConical} title="Medicine List" subtitle="Manage all your medicine items" color="#7c3aed">
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
        <button onClick={() => navigate('/franchise/medicines/add')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0c3b73', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={14} /> + Add Medicine
        </button>
      </PageHeader>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Medicines',    value: loading ? '...' : kpi.totalMeds,    color: '#0c3b73' },
          { label: 'Active Medicines',   value: loading ? '...' : kpi.activeMeds,   color: '#16a34a' },
          { label: 'Inactive Medicines', value: loading ? '...' : kpi.inactiveMeds, color: '#dc2626' },
          { label: 'Low Stock Items',    value: loading ? '...' : kpi.lowStock,     color: '#d97706' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${k.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search medicine by name / salt / brand / barcode"
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        {[
          [categories,   cat,    setCat,    'All Categories'],
          [formulations, form,   setForm,   'All Formulations'],
          [companies,    comp,   setComp,   'All Companies'],
          [['All Status', 'Active', 'Inactive', 'Low Stock'], status, setStatus, 'All Status'],
        ].map(([opts, val, setter, ph]) => (
          <select key={ph} value={val} onChange={e => { setter(e.target.value); setPage(1) }}
            style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#f9fafb', cursor: 'pointer', outline: 'none' }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Medicine Name', 'Salt / Strength', 'Formulation', 'Company', 'MRP (₹)', 'Stock', 'Status', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {loading
                ? Array(PER).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : data.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No medicines found</td></tr>
                  : data.map(m => (
                    <tr key={m._id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td>
                        <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 13 }}>{m.name}</p>
                        <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{m.rackLabel || '—'}</p>
                      </Td>
                      <Td style={{ fontSize: 12, color: '#6b7280' }}>{m.salt}</Td>
                      <Td style={{ fontSize: 12 }}>{m.formulation}</Td>
                      <Td style={{ fontSize: 12 }}>{m.company}</Td>
                      <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{Number(m.mrp || 0).toFixed(2)}</Td>
                      <Td style={{ fontWeight: 600, color: m.stock === 0 ? '#dc2626' : m.stock <= m.reorderLevel ? '#d97706' : '#16a34a' }}>{m.stock}</Td>
                      <Td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: m.isActive ? '#dcfce7' : '#fee2e2', color: m.isActive ? '#16a34a' : '#dc2626' }}>
                          {m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button onClick={() => navigate(`/franchise/medicines/${m._id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <Eye size={11} /> View
                          </button>
                          <button onClick={() => navigate(`/franchise/medicines/${m._id}/edit`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <Edit2 size={11} /> Edit
                          </button>
                          <button onClick={() => toggleStatus(m._id)}
                            style={{ padding: '5px 7px', border: 'none', borderRadius: 6, background: m.isActive ? '#fee2e2' : '#dcfce7', cursor: 'pointer' }}>
                            {m.isActive ? <ToggleRight size={14} color="#16a34a" /> : <ToggleLeft size={14} color="#dc2626" />}
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {data.length} of {total} medicines</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ background: n === page ? '#0c3b73' : 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: n === page ? '#fff' : '#374151', fontSize: 12 }}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}


