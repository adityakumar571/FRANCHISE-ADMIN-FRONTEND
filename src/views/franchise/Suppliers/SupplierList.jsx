/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Search, Plus, Eye, Edit2, ChevronLeft, ChevronRight, Download, Users, UserCheck, UserX, IndianRupee } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function SupplierList() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([])
  const [kpi, setKpi]             = useState({ total: 0, active: 0, inactive: 0, totalPayable: 0 })
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]     = useState(true)
  const PER = 10
  const debounceRef = useRef()

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/suppliers?search=${encodeURIComponent(search)}&status=${statusFilter}&page=${page}&limit=${PER}`)
      const d = res.data?.data
      setSuppliers(d?.suppliers || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      if (d?.kpi) setKpi(d.kpi)
    } catch { toast.error('Failed to load suppliers') }
    finally   { setLoading(false) }
  }, [search, statusFilter, page])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  const handleSearchChange = (val) => {
    setSearch(val); setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchSuppliers, 400)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Truck} title="Supplier List" subtitle="Manage all your suppliers" color="#d97706">
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
        <button onClick={() => navigate('/franchise/suppliers/add')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#d97706', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={14} /> + Add Supplier
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Suppliers',    value: loading ? '...' : kpi.total,    icon: Users,        color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Active Suppliers',   value: loading ? '...' : kpi.active,   icon: UserCheck,    color: '#16a34a', bg: '#dcfce7' },
          { label: 'Inactive Suppliers', value: loading ? '...' : kpi.inactive, icon: UserX,        color: '#dc2626', bg: '#fee2e2' },
          { label: 'Total Payable',      value: loading ? '...' : `₹${(kpi.totalPayable/1000).toFixed(1)}K`, icon: IndianRupee, color: '#d97706', bg: '#fef3c7' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '2px 0 0' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by name, code, phone..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={12} /> Export
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Supplier Code', 'Supplier Name', 'Phone', 'Email', 'City', 'Outstanding', 'Status', 'Action'].map(h => <Th key={h} c={h} />)}
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : suppliers.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No suppliers found</td></tr>
                  : suppliers.map(s => (
                    <tr key={s._id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{s.id}</span></Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#d97706', fontSize: 13, flexShrink: 0 }}>
                            {s.name?.[0]}
                          </div>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{s.name}</span>
                        </div>
                      </Td>
                      <Td style={{ color: '#6b7280' }}>{s.phone}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.email}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.city}</Td>
                      <Td style={{ fontWeight: 700, color: s.outstanding > 0 ? '#dc2626' : '#16a34a' }}>
                        ₹{Number(s.outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Td>
                      <Td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: s.status === 'Active' ? '#dcfce7' : '#fee2e2', color: s.status === 'Active' ? '#16a34a' : '#dc2626' }}>
                          {s.status}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => navigate(`/franchise/suppliers/${s._id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <Eye size={11} /> View
                          </button>
                          <button style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <Edit2 size={11} />
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
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {suppliers.length} of {total} suppliers</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} style={{ background: n === page ? '#0c3b73' : 'none', border: `1px solid ${n === page ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: n === page ? '#fff' : '#374151', fontSize: 12 }}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}


