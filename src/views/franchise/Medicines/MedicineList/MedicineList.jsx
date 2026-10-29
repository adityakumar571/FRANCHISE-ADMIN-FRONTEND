/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FlaskConical, Search, Plus, Edit2, Eye, Download,
  ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
  ImageIcon, Package, Activity, AlertTriangle, XCircle,
  MapPin, RefreshCw,
} from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { getRequest, patchRequest } from '../../../../Helpers'
import toast from 'react-hot-toast'

const PER = 10

/* ─── KPI card ── */
const KpiCard = ({ label, value, icon: Icon, color, loading }) => (
  <div className={`bg-white border-l-4 border border-gray-100 rounded-xl p-4 flex items-center gap-3`}
    style={{ borderLeftColor: color }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold mt-0.5" style={{ color }}>
        {loading ? '…' : value}
      </p>
    </div>
  </div>
)

/* ─── stock badge ── */
const StockBadge = ({ stock, reorderLevel }) => {
  if (stock === 0)              return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-50 text-red-600 border border-red-200"><XCircle size={10}/> Out</span>
  if (stock <= reorderLevel)    return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-600 border border-amber-200"><AlertTriangle size={10}/> Low</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-50 text-green-700 border border-green-200"><Activity size={10}/> {stock}</span>
}

/* ════════════════════════════════════════════════════ */
export default function MedicineList() {
  const navigate = useNavigate()

  const [data,       setData]       = useState([])
  const [kpi,        setKpi]        = useState({ totalMeds:0, activeMeds:0, inactiveMeds:0, lowStock:0 })
  const [categories, setCategories] = useState(['All Categories'])
  const [formulations, setFormulations] = useState(['All Formulations'])
  const [companies,  setCompanies]  = useState(['All Companies'])
  const [search,     setSearch]     = useState('')
  const [cat,        setCat]        = useState('All Categories')
  const [form,       setForm]       = useState('All Formulations')
  const [comp,       setComp]       = useState('All Companies')
  const [status,     setStatus]     = useState('All Status')
  const [page,       setPage]       = useState(1)
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)
  const debounceRef = useRef()

  const fetchMedicines = useCallback(async () => {
    setLoading(true)
    try {
      const catParam  = cat    !== 'All Categories'   ? cat    : ''
      const formParam = form   !== 'All Formulations' ? form   : ''
      const compParam = comp   !== 'All Companies'    ? comp   : ''
      const stParam   = status !== 'All Status'       ? status : ''
      const res = await getRequest(
        `/franchise/medicines?search=${encodeURIComponent(search)}&category=${encodeURIComponent(catParam)}&formulation=${encodeURIComponent(formParam)}&company=${encodeURIComponent(compParam)}&status=${encodeURIComponent(stParam)}&page=${page}&limit=${PER}`
      )
      const d = res.data?.data
      setData(d?.medicines || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      if (d?.kpi)          setKpi(d.kpi)
      if (d?.categories)   setCategories(d.categories)
      if (d?.formulations) setFormulations(d.formulations)
      if (d?.companies)    setCompanies(d.companies)
    } catch { toast.error('Failed to load medicines') }
    finally   { setLoading(false) }
  }, [search, cat, form, comp, status, page])

  useEffect(() => { fetchMedicines() }, [fetchMedicines])

  const handleSearch = (val) => {
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

  const exportCSV = () => {
    const rows = data.map(m =>
      `"${m.name}","${m.salt||''}","${typeof m.formulation === 'object' ? (m.formulation?.name || '') : (m.formulation || '')}","${m.company||''}","${m.rackLocation?.position||''}",${m.mrp||0},${m.currentStock||0},"${m.isActive?'Active':'Inactive'}"`
    )
    const csv = `Name,Salt,Formulation,Company,Rack Location,MRP,Stock,Status\n${rows.join('\n')}`
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = 'medicines.csv'; a.click()
    toast.success(`Exported ${data.length} medicines`)
  }

  /* pagination pages */
  const pageNums = () => {
    const pages = []
    const start = Math.max(1, page - 2)
    const end   = Math.min(totalPages, start + 4)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const selCls = 'px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-purple-600 cursor-pointer text-gray-700'

  return (
    <div className="font-sans flex flex-col gap-5">

      {/* Header */}
      <PageHeader icon={FlaskConical} title="Medicine List" subtitle="Manage all your medicine items" color="#7c3aed">
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition text-gray-700">
          <Download size={13}/> Export CSV
        </button>
        <button onClick={fetchMedicines}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition text-gray-700">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
        </button>
        <button onClick={() => navigate('/franchise/medicines/add')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition shadow-lg shadow-blue-900/20">
          <Plus size={15}/> Add Medicine
        </button>
      </PageHeader>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Medicines"    value={kpi.totalMeds}    icon={Package}        color="#7c3aed" loading={loading}/>
        <KpiCard label="Active Medicines"   value={kpi.activeMeds}   icon={Activity}       color="#16a34a" loading={loading}/>
        <KpiCard label="Inactive"           value={kpi.inactiveMeds} icon={XCircle}        color="#dc2626" loading={loading}/>
        <KpiCard label="Low Stock"          value={kpi.lowStock}     icon={AlertTriangle}  color="#d97706" loading={loading}/>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name / salt / brand / barcode…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-600 bg-gray-50"/>
        </div>
        {/* Dropdowns */}
        {[
          [['All Status','Active','Inactive','Low Stock'], status, setStatus, 'All Status'],
        ].map(([opts, val, setter, ph]) => (
          <select key={ph} value={val} onChange={e => { setter(e.target.value); setPage(1) }} className={selCls}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Image','Medicine Name','Salt / Strength','Rack','MRP','Stock','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(PER).fill(0).map((_,i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array(10).fill(0).map((_,j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3.5 bg-gray-100 rounded animate-pulse"/>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-sm text-gray-400">
                    <Package size={36} className="mx-auto mb-3 text-gray-200"/>
                    No medicines found
                  </td>
                </tr>
              ) : data.map(m => (
                <tr key={m._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">

                  {/* Image */}
                  <td className="px-4 py-3">
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt={m.name}
                        className="w-11 h-11 rounded-lg object-cover border border-gray-100 bg-gray-50"
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
                    ) : null}
                    <div className={`w-11 h-11 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-100 items-center justify-center text-xl ${m.imageUrl ? 'hidden' : 'flex'}`}>
                      💊
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{m.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{m.category || '—'}</p>
                  </td>

                  {/* Salt */}
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px]">
                    <span className="block truncate">{m.salt || '—'}</span>
                    {m.strength && <span className="text-[10px] text-gray-400">{m.strength}</span>}
                  </td>

                  {/* Formulation */}
                  {/* <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium w-fit">
                        {typeof m.formulation === 'object' ? (m.formulation?.name || '—') : (m.formulation || '—')}
                      </span>
                      {typeof m.formulation === 'object' && m.formulation?.type && (
                        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 w-fit">
                          {m.formulation.type}
                        </span>
                      )}
                    </div>
                  </td> */}

                  {/* Company */}
                  {/* <td className="px-4 py-3 text-xs text-gray-600">{typeof m.company === 'object' ? (m.company?.name || '—') : (m.company || '—')}</td> */}

                  {/* Rack */}
                  <td className="px-4 py-3">
                    {m.rackLocation?.position ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                        <MapPin size={9}/> {m.rackLocation.position}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-300">—</span>
                    )}
                  </td>

                  {/* MRP */}
                  <td className="px-4 py-3 text-sm font-bold text-blue-900">
                    ₹{Number(m.mrp || 0).toFixed(2)}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <StockBadge stock={m.currentStock ?? m.stock ?? 0} reorderLevel={m.reorderLevel ?? 10}/>
                  </td>

                  {/* Status + Toggle */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        m.isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => toggleStatus(m._id)}
                        title={m.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1 rounded-md border transition ${
                          m.isActive
                            ? 'bg-red-50 border-red-100 hover:bg-red-100'
                            : 'bg-green-50 border-green-100 hover:bg-green-100'
                        }`}>
                        {m.isActive
                          ? <ToggleRight size={15} className="text-green-600"/>
                          : <ToggleLeft  size={15} className="text-red-500"/>}
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => navigate(`/franchise/medicines/${m._id}`)}
                        title="View Details"
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition border border-indigo-100">
                        <Eye size={13}/>
                      </button>
                      <button onClick={() => navigate(`/franchise/medicines/${m._id}/edit`)}
                        title="Edit"
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition border border-amber-100">
                        <Edit2 size={13}/>
                      </button>
                      <button onClick={() => navigate(`/franchise/medicines/${m._id}/images`)}
                        title="Manage Images"
                        className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition border border-green-100">
                        <ImageIcon size={13}/>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{data.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{total}</span> medicines
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page<=1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <ChevronLeft size={14}/>
            </button>
            {pageNums().map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 text-xs font-semibold rounded-lg border transition ${
                  n === page
                    ? 'bg-blue-900 border-blue-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page>=totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
