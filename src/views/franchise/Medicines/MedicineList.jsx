/* eslint-disable prettier/prettier */
/**
 * MedicineList — Browse the central medicine master + local franchise medicines
 * SOW §8: Global Medicine Master & Central Catalogue
 */
import { useState, useEffect, useCallback } from 'react'
import { FlaskConical, Search, Plus, Edit, Eye, Filter, Download } from 'lucide-react'
import { getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import MedicineFormModal from './MedicineFormModal'
import MedicineDetailModal from './MedicineDetailModal'

const MedicineList = () => {
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [limit, setLimit]         = useState(20)
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [refresh, setRefresh]     = useState(false)
  const [formOpen, setFormOpen]   = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [isToggling, setIsToggling] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams({ search, page, limit }).toString()
    getRequest(`franchise/medicines?${q}`)
      .then((res) => {
        setData(res?.data?.data?.medicines || res?.data?.data || [])
        setTotal(res?.data?.data?.total || res?.data?.total || 0)
      })
      .catch(() => toast.error('Failed to load medicines'))
      .finally(() => setLoading(false))
  }, [search, page, limit, refresh])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggle = (id) => {
    if (isToggling) return
    const item = data.find((d) => d._id === id)
    if (!item) return
    setIsToggling(true)
    putRequest({ url: `franchise/medicines/${id}`, cred: { isActive: !item.isActive } })
      .then(() => {
        toast.success(`Medicine ${!item.isActive ? 'activated' : 'deactivated'}`)
        setRefresh((p) => !p)
      })
      .catch(() => toast.error('Status update failed'))
      .finally(() => setIsToggling(false))
  }

  const columns = [
    { title: '#',           key: '_idx',        width: 50, align: 'center', render: (_, __, i) => (page - 1) * limit + i + 1 },
    { title: 'Medicine',    key: 'name',         render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: '#111827' }}>{v}</div>
        {row.genericName && <div style={{ fontSize: 11, color: '#6b7280' }}>{row.genericName}</div>}
      </div>
    )},
    { title: 'Brand',       key: 'brand',        render: (v) => v || '—' },
    { title: 'Category',    key: 'category',     render: (v) => v || '—' },
    { title: 'Pack / Unit', key: 'packUnit',     render: (v, row) => `${row.packSize || ''}  ${row.unit || ''}`.trim() || '—' },
    { title: 'HSN / GST',   key: 'hsn',          render: (v, row) => (
      <div style={{ fontSize: 12 }}>
        {v ? <span>HSN: {v}</span> : '—'}
        {row.gstRate !== undefined && <div style={{ color: '#6b7280' }}>GST: {row.gstRate}%</div>}
      </div>
    )},
    { title: 'Status',      key: 'isActive',     align: 'center', render: (v) => <StatusBadge status={v ? 'active' : 'inactive'} /> },
    { title: 'Actions',     key: '_actions',     align: 'center', width: 120, render: (_, row) => (
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        <button onClick={() => { setSelected(row); setDetailOpen(true) }}
          style={actionBtn('#0c3b73')} title="View">
          <Eye size={14} />
        </button>
        <button onClick={() => { setSelected(row); setFormOpen(true) }}
          style={actionBtn('#7c3aed')} title="Edit">
          <Edit size={14} />
        </button>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" className="sr-only" checked={row.isActive} disabled={isToggling}
            onChange={() => handleToggle(row._id)} />
          <div style={{
            width: 36, height: 20, borderRadius: 10, position: 'relative',
            background: row.isActive ? '#16a34a' : '#d1d5db', transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: row.isActive ? 18 : 3,
              width: 14, height: 14, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s',
            }} />
          </div>
        </label>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader icon={FlaskConical} title="Medicine Master" subtitle="Browse and manage medicines in your franchise" color="#7c3aed">
        <button onClick={() => { setSelected(null); setFormOpen(true) }} style={primaryBtn}>
          <Plus size={14} /> Add Medicine
        </button>
        <button style={secondaryBtn}><Download size={14} /> Export</button>
      </PageHeader>

      {/* Search + Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by name, generic, brand, barcode…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ ...searchInput, paddingLeft: 32 }}
          />
        </div>
        <button style={secondaryBtn}><Filter size={14} /> Filter</button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(s) => { setLimit(s); setPage(1) }}
      />

      {formOpen && (
        <MedicineFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          data={selected}
          onSaved={() => { setRefresh((p) => !p); setFormOpen(false) }}
        />
      )}
      {detailOpen && (
        <MedicineDetailModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          data={selected}
        />
      )}
    </div>
  )
}

const primaryBtn = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 8, border: 'none',
  background: '#0c3b73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
}
const secondaryBtn = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 8,
  border: '1px solid #e5e7eb', background: '#fff', color: '#374151',
  fontWeight: 500, fontSize: 13, cursor: 'pointer',
}
const searchInput = {
  width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '0 12px', fontSize: 13, outline: 'none', background: '#fff',
}
const actionBtn = (color) => ({
  width: 28, height: 28, borderRadius: 6, border: `1px solid ${color}20`,
  background: color + '10', color, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
})

export default MedicineList
