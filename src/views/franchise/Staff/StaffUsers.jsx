/* eslint-disable prettier/prettier */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  UserCheck, Plus, Edit2, Search,
  X, Save, ShieldCheck, Trash2,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'

const ROLES  = ['Franchise Owner', 'Branch Manager', 'Pharmacist', 'Cashier']
const SHIFTS = ['Morning', 'Evening', 'Night']

const ROLE_COLORS = {
  'Franchise Owner': '#0c3b73',
  'Branch Manager':  '#7c3aed',
  Pharmacist:        '#16a34a',
  Cashier:           '#d97706',
}
const ATT_COLORS = {
  Present:   '#16a34a',
  Absent:    '#dc2626',
  Late:      '#d97706',
  'Half Day':'#0891b2',
}

const Th = ({ c }) => (
  <th style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>
    {c}
  </th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>
    {children}
  </td>
)

const EMPTY_FORM = { name: '', role: 'Cashier', department: 'Operations', phone: '', email: '', shift: 'Morning', salary: '' }
const EMPTY_KPI  = { total: 0, present: 0, absent: 0, late: 0 }

export default function StaffUsers() {
  const navigate = useNavigate()

  const [staff, setStaff]           = useState([])
  const [kpi, setKpi]               = useState(EMPTY_KPI)
  const [search, setSearch]         = useState('')
  const [deptFilter, setDept]       = useState('')
  const [statusFilter, setStatus]   = useState('')
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)

  // Modal state
  const [modalOpen, setModal]       = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  const debounceRef = useRef()

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(
        `/franchise/staff?search=${encodeURIComponent(search)}&dept=${encodeURIComponent(deptFilter)}&status=${statusFilter}&page=${page}&limit=10`
      )
      const d = res.data?.data
      setStaff(d?.staff || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      if (d?.kpi) setKpi(d.kpi)
    } catch {
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }, [search, deptFilter, statusFilter, page])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  const handleSearchChange = (val) => {
    setSearch(val)
    setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchStaff, 400)
  }

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  const openEdit = (s) => {
    setForm({ name: s.name, role: s.role, department: s.department, phone: s.phone, email: s.email || '', shift: s.shift, salary: s.salary })
    setEditId(s._id)
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.role) { toast.error('Name and role are required'); return }
    setSaving(true)
    try {
      if (editId) {
        await putRequest({ url: `/franchise/staff/${editId}`, cred: form })
        toast.success('Staff updated')
      } else {
        await postRequest({ url: '/franchise/staff', cred: form })
        toast.success('Staff member added')
      }
      setModal(false)
      fetchStaff()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return
    try {
      await deleteRequest(`/franchise/staff/${id}`)
      toast.success('Staff deleted')
      fetchStaff()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleAttendance = async (id, att) => {
    try {
      await putRequest({ url: `/franchise/staff/${id}/attendance`, cred: { attendance: att } })
      setStaff(p => p.map(s => s._id === id ? { ...s, attendance: att } : s))
    } catch {
      toast.error('Failed to update attendance')
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page Header */}
      <PageHeader icon={UserCheck} title="Staff & Users" subtitle="Manage franchise team members and their access" color="#7c3aed">
        <button
          onClick={() => navigate('/franchise/staff/menu-access')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#0c3b73', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <ShieldCheck size={14} /> Menu Access
        </button>
        <button
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Add Staff
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Staff', value: loading ? '...' : kpi.total,   color: '#0c3b73' },
          { label: 'Present',     value: loading ? '...' : kpi.present, color: '#16a34a' },
          { label: 'Absent',      value: loading ? '...' : kpi.absent,  color: '#dc2626' },
          { label: 'Late',        value: loading ? '...' : kpi.late,    color: '#d97706' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', borderLeft: `4px solid ${k.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search staff..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }}
          />
        </div>
        <select value={deptFilter} onChange={e => { setDept(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Departments</option>
          {['Management', 'Pharmacy', 'Sales', 'Operations'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['ID', 'Name', 'Role', 'Dept', 'Phone', 'Shift', "Today's Sales", 'Attendance', 'Status', 'Actions'].map(h => (
                  <Th key={h} c={h} />
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(10).fill(0).map((_, j) => (
                      <td key={j} style={{ padding: '11px 14px' }}>
                        <div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
                : staff.length === 0
                  ? (
                    <tr>
                      <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                        No staff found
                      </td>
                    </tr>
                  )
                  : staff.map(s => (
                    <tr key={s._id}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                          {s.staffId}
                        </span>
                      </Td>
                      <Td style={{ fontWeight: 600 }}>{s.name}</Td>
                      <Td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: (ROLE_COLORS[s.role] || '#6b7280') + '18', color: ROLE_COLORS[s.role] || '#6b7280' }}>
                          {s.role}
                        </span>
                      </Td>
                      <Td style={{ color: '#6b7280' }}>{s.department}</Td>
                      <Td style={{ color: '#6b7280' }}>{s.phone}</Td>
                      <Td style={{ color: '#6b7280' }}>{s.shift}</Td>
                      <Td style={{ fontWeight: 600, color: '#0c3b73' }}>
                        {s.todaySales > 0 ? `₹${s.todaySales.toLocaleString('en-IN')}` : '—'}
                      </Td>
                      <Td>
                        <select
                          value={s.attendance}
                          onChange={e => handleAttendance(s._id, e.target.value)}
                          style={{ padding: '3px 8px', border: `1px solid ${ATT_COLORS[s.attendance] || '#e5e7eb'}`, borderRadius: 6, fontSize: 11, fontWeight: 700, background: (ATT_COLORS[s.attendance] || '#6b7280') + '18', color: ATT_COLORS[s.attendance] || '#6b7280', cursor: 'pointer' }}>
                          {['Present', 'Absent', 'Late', 'Half Day'].map(a => <option key={a}>{a}</option>)}
                        </select>
                      </Td>
                      <Td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: s.status === 'Active' ? '#f0fdf4' : '#fee2e2', color: s.status === 'Active' ? '#16a34a' : '#dc2626' }}>
                          {s.status}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => openEdit(s)}
                            style={{ padding: '4px 8px', border: 'none', borderRadius: 5, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Edit2 size={10} /> Edit
                          </button>
                          <button onClick={() => handleDelete(s._id)}
                            style={{ padding: '4px 7px', border: 'none', borderRadius: 5, background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={11} />
                          </button>
                          <button onClick={() => navigate('/franchise/staff/menu-access')}
                            style={{ padding: '4px 7px', border: '1px solid #c7d2fe', borderRadius: 5, background: '#e0e7ff', color: '#0c3b73', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Menu Access">
                            <ShieldCheck size={11} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {staff.length} of {total} staff members</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}>←</button>
            <span style={{ padding: '5px 10px', fontSize: 12, color: '#374151' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}>→</button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 480, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editId ? 'Edit Staff' : 'Add Staff Member'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Full Name *',  key: 'name',       placeholder: 'Staff name' },
                  { label: 'Phone',        key: 'phone',      placeholder: '10-digit mobile' },
                  { label: 'Email',        key: 'email',      placeholder: 'email@example.com' },
                  { label: 'Department',   key: 'department', placeholder: 'e.g. Pharmacy' },
                  { label: 'Salary (₹)',  key: 'salary',     placeholder: '0', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Role *</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Shift</label>
                  <select value={form.shift} onChange={e => setForm(p => ({ ...p, shift: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    {SHIFTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ padding: '9px 20px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Save size={14} /> {saving ? 'Saving...' : editId ? 'Update' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
