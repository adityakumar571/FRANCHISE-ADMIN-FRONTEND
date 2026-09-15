/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback, useRef } from 'react'
import { UserCheck, Plus, Eye, Edit, Search, Phone, Mail, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const attColors = {
  Present:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Late:     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Absent:   { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  Leave:    { bg: '#f0f4ff', color: '#4f46e5', border: '#c7d2fe' },
}

const statusColors = {
  Active:     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'On Leave': { bg: '#f0f4ff', color: '#4f46e5', border: '#c7d2fe' },
  Inactive:   { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
}

const Badge = ({ val, colorMap }) => {
  const c = colorMap[val] || colorMap['Active']
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{val}</span>
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function Staff() {
  const [staffList, setStaffList] = useState([])
  const [kpi, setKpi]             = useState({ total: 0, present: 0, absent: 0, late: 0 })
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [dept, setDept]           = useState('All')
  const [status, setStatus]       = useState('All')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const debounceRef               = useRef()

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    try {
      const deptParam   = dept   !== 'All' ? dept   : ''
      const statusParam = status !== 'All' ? status : ''
      const res = await getRequest(
        `/franchise/staff?search=${encodeURIComponent(search)}&dept=${encodeURIComponent(deptParam)}&status=${encodeURIComponent(statusParam)}&page=${page}&limit=10`
      )
      const d = res.data?.data
      setStaffList(d?.staff  || [])
      setTotal(d?.total      || 0)
      if (d?.kpi) setKpi(d.kpi)
    } catch {
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }, [search, dept, status, page])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  const handleSearchChange = (val) => {
    setSearch(val)
    setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchStaff, 400)
  }

  const handleAttendance = async (id, att) => {
    try {
      await putRequest({ url: `/franchise/staff/${id}/attendance`, cred: { attendance: att } })
      setStaffList(prev => prev.map(s => s._id === id ? { ...s, attendance: att } : s))
    } catch {
      toast.error('Failed to update attendance')
    }
  }

  // All unique departments from loaded data
  const depts = ['All', ...new Set(staffList.map(s => s.department).filter(Boolean))]

  const filtered = staffList // server-side filtering already applied

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Staff Management</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage all staff members</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Staff',    value: loading ? '...' : kpi.total,   color: '#0c3b73' },
          { label: 'Present Today',  value: loading ? '...' : kpi.present, color: '#16a34a' },
          { label: 'Absent Today',   value: loading ? '...' : kpi.absent,  color: '#dc2626' },
          { label: 'Late Arrivals',  value: loading ? '...' : kpi.late,    color: '#d97706' },
        ].map((c) => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by name or role..."
            style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }}
          />
        </div>
        <select value={dept} onChange={e => { setDept(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option>All</option><option>Active</option><option>On Leave</option><option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['ID', 'Name', 'Role', 'Dept', 'Phone', 'Shift', "Today's Sales", 'Attendance', 'Status', 'Actions'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(10).fill(0).map((_, j) => (
                      <td key={j} style={{ padding: '10px 12px' }}>
                        <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
                : filtered.length === 0
                  ? <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No staff found</td></tr>
                  : filtered.map((s) => (
                    <tr key={s._id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{s.staffId}</span>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0c3b7322', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0c3b73', flexShrink: 0 }}>
                            {s.name?.slice(0, 1)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 13 }}>{s.name}</p>
                            {s.email && <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{s.email}</p>}
                          </div>
                        </div>
                      </Td>
                      <Td>{s.role}</Td>
                      <Td>
                        <span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4, color: '#374151' }}>{s.department}</span>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                          <Phone size={12} />{s.phone}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                          <Clock size={12} />{s.shift}
                        </div>
                      </Td>
                      <Td style={{ fontWeight: 600 }}>
                        {s.todaySales > 0 ? `₹${s.todaySales.toLocaleString('en-IN')}` : '—'}
                      </Td>
                      <Td>
                        {/* Attendance dropdown — clicking updates via API */}
                        <select
                          value={s.attendance}
                          onChange={e => handleAttendance(s._id, e.target.value)}
                          style={{
                            padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer', outline: 'none',
                            background: (attColors[s.attendance] || attColors.Present).bg,
                            color:      (attColors[s.attendance] || attColors.Present).color,
                            border:     `1px solid ${(attColors[s.attendance] || attColors.Present).border}`,
                          }}
                        >
                          {['Present', 'Absent', 'Late', 'Leave'].map(a => <option key={a}>{a}</option>)}
                        </select>
                      </Td>
                      <Td>
                        <Badge val={s.status} colorMap={statusColors} />
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button title="View" style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73' }}><Eye size={13} /></button>
                          <button title="Edit" style={{ background: '#fffbeb', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}><Edit size={13} /></button>
                        </div>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Showing {filtered.length} of {total} staff members
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <button style={{ background: '#0c3b73', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>{page}</button>
            <button onClick={() => setPage(p => p + 1)} disabled={filtered.length < 10}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: filtered.length < 10 ? 'not-allowed' : 'pointer', opacity: filtered.length < 10 ? 0.5 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
