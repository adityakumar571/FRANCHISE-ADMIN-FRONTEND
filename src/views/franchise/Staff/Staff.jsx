/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback, useRef } from 'react'
import { UserCheck, Plus, Eye, Edit, Search, Phone, Clock, X, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'
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

const ROLES = ['Franchise Owner','Branch Manager','Pharmacist','Cashier','Staff','Helper','Security','Cleaner']
const SHIFTS = ['Morning','Evening','Night','Full Day']
const DEPTS  = ['Management','Pharmacy','Sales','Operations','Security','Housekeeping']

const Badge = ({ val, colorMap }) => {
  const c = (colorMap && colorMap[val]) || { bg:'#f3f4f6', color:'#374151', border:'#e5e7eb' }
  return <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>{val}</span>
}

const Th = ({ c }) => <th style={{ padding:'10px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, style={} }) => <td style={{ padding:'10px 12px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', ...style }}>{children}</td>

/* ── FORM MODAL (Add + Edit) ── */
function StaffModal({ staff, onClose, onSaved }) {
  const isEdit = !!staff
  const [form, setForm] = useState({
    name:        staff?.name        || '',
    role:        staff?.role        || 'Pharmacist',
    department:  staff?.department  || 'Pharmacy',
    phone:       staff?.phone       || '',
    email:       staff?.email       || '',
    shift:       staff?.shift       || 'Morning',
    salary:      staff?.salary      || '',
    joiningDate: staff?.joiningDate ? staff.joiningDate.slice(0,10) : '',
    address:     staff?.address     || '',
    isActive:    staff?.isActive !== false,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())  { toast.error('Name is required'); return }
    if (!form.phone.trim()) { toast.error('Phone is required'); return }
    setSaving(true)
    try {
      if (isEdit) {
        await putRequest({ url: `/franchise/staff/${staff._id}`, cred: form })
        toast.success('Staff updated successfully')
      } else {
        await postRequest({ url: '/franchise/staff', cred: form })
        toast.success('Staff added successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inpStyle = { width:'100%', padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }
  const lblStyle = { display:'block', fontSize:11, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.4px' }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:600, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', maxHeight:'92vh', overflow:'auto' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid #f3f4f6' }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#111827' }}>{isEdit ? 'Edit Staff' : 'Add New Staff'}</h3>
          <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X size={15} color="#6b7280" />
          </button>
        </div>
        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lblStyle}>Full Name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Enter full name" style={inpStyle} /></div>
              <div><label style={lblStyle}>Phone *</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="10-digit mobile" style={inpStyle} /></div>
              <div><label style={lblStyle}>Email</label><input value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@example.com" type="email" style={inpStyle} /></div>
              <div>
                <label style={lblStyle}>Role</label>
                <select value={form.role} onChange={e=>set('role',e.target.value)} style={{ ...inpStyle, cursor:'pointer' }}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={lblStyle}>Department</label>
                <select value={form.department} onChange={e=>set('department',e.target.value)} style={{ ...inpStyle, cursor:'pointer' }}>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={lblStyle}>Shift</label>
                <select value={form.shift} onChange={e=>set('shift',e.target.value)} style={{ ...inpStyle, cursor:'pointer' }}>
                  {SHIFTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={lblStyle}>Monthly Salary (₹)</label><input value={form.salary} onChange={e=>set('salary',e.target.value)} placeholder="0" type="number" min="0" style={inpStyle} /></div>
              <div><label style={lblStyle}>Joining Date</label><input value={form.joiningDate} onChange={e=>set('joiningDate',e.target.value)} type="date" style={inpStyle} /></div>
            </div>
            <div><label style={lblStyle}>Address</label><textarea value={form.address} onChange={e=>set('address',e.target.value)} rows={2} placeholder="Staff address..." style={{ ...inpStyle, resize:'vertical' }} /></div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e=>set('isActive',e.target.checked)} style={{ width:16, height:16, cursor:'pointer' }} />
              <label htmlFor="isActive" style={{ fontSize:13, color:'#374151', cursor:'pointer', fontWeight:600 }}>Active Staff Member</label>
            </div>
          </div>
          {/* Footer */}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', padding:'14px 22px', borderTop:'1px solid #f3f4f6' }}>
            <button type="button" onClick={onClose} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', color:'#374151' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:saving?'#94a3b8':'#0c3b73', fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', color:'#fff', display:'flex', alignItems:'center', gap:6 }}>
              <Save size={13} /> {saving ? 'Saving…' : isEdit ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── VIEW MODAL ── */
function ViewModal({ staff, onClose, onEdit }) {
  if (!staff) return null
  const fields = [
    ['Staff ID',      staff.staffId],
    ['Role',         staff.role],
    ['Department',   staff.department],
    ['Phone',        staff.phone],
    ['Email',        staff.email || '—'],
    ['Shift',        staff.shift],
    ['Salary',       staff.salary ? `₹${Number(staff.salary).toLocaleString('en-IN')}` : '—'],
    ['Attendance',   staff.attendance],
    ["Today's Sales",staff.todaySales > 0 ? `₹${staff.todaySales.toLocaleString('en-IN')}` : '—'],
    ['Status',       staff.status],
  ]
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:480, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid #f3f4f6' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:'50%', background:'#0c3b7320', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#0c3b73' }}>
              {staff.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#111827' }}>{staff.name}</h3>
              <span style={{ fontSize:12, color:'#6b7280' }}>{staff.role} · {staff.department}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X size={15} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding:'20px 22px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {fields.map(([label, val]) => (
            <div key={label} style={{ background:'#f9fafb', borderRadius:8, padding:'10px 14px' }}>
              <p style={{ margin:0, fontSize:11, color:'#9ca3af', fontWeight:500 }}>{label}</p>
              <p style={{ margin:'3px 0 0', fontSize:13, color:'#111827', fontWeight:600 }}>{val}</p>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', padding:'14px 22px', borderTop:'1px solid #f3f4f6' }}>
          <button onClick={onClose} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', color:'#374151' }}>Close</button>
          <button onClick={() => { onClose(); onEdit(staff) }} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:'#0c3b73', fontSize:13, fontWeight:600, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', gap:6 }}>
            <Edit size={13} /> Edit
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── MAIN COMPONENT ── */
export default function Staff() {
  const [staffList, setStaffList] = useState([])
  const [kpi, setKpi]             = useState({ total:0, present:0, absent:0, late:0 })
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [dept, setDept]           = useState('All')
  const [status, setStatus]       = useState('All')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [showAdd, setShowAdd]     = useState(false)
  const [editStaff, setEditStaff] = useState(null)
  const [viewStaff, setViewStaff] = useState(null)
  const [delId, setDelId]         = useState(null)
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
      setStaffList(d?.staff || [])
      setTotal(d?.total    || 0)
      if (d?.kpi) setKpi(d.kpi)
    } catch { toast.error('Failed to load staff') }
    finally  { setLoading(false) }
  }, [search, dept, status, page])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  const handleSearchChange = (val) => {
    setSearch(val); setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchStaff, 400)
  }

  const handleAttendance = async (id, att) => {
    try {
      await putRequest({ url: `/franchise/staff/${id}/attendance`, cred: { attendance: att } })
      setStaffList(prev => prev.map(s => s._id === id ? { ...s, attendance: att } : s))
    } catch { toast.error('Failed to update attendance') }
  }

  const handleDelete = async (id) => {
    try {
      await deleteRequest(`/franchise/staff/${id}`)
      toast.success('Staff deleted')
      setDelId(null)
      fetchStaff()
    } catch { toast.error('Failed to delete staff') }
  }

  const depts = ['All', ...new Set(staffList.map(s => s.department).filter(Boolean))]

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>

      {/* Modals */}
      {(showAdd || editStaff) && (
        <StaffModal staff={editStaff} onClose={() => { setShowAdd(false); setEditStaff(null) }} onSaved={fetchStaff} />
      )}
      {viewStaff && (
        <ViewModal staff={viewStaff} onClose={() => setViewStaff(null)} onEdit={s => { setViewStaff(null); setEditStaff(s) }} />
      )}
      {delId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:14, padding:28, maxWidth:340, width:'90%', textAlign:'center' }}>
            <p style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 8px' }}>Delete Staff Member?</p>
            <p style={{ fontSize:13, color:'#6b7280', margin:'0 0 24px' }}>This action cannot be undone.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDelId(null)} style={{ flex:1, padding:10, border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(delId)} style={{ flex:1, padding:10, border:'none', borderRadius:8, fontSize:13, cursor:'pointer', background:'#dc2626', color:'#fff', fontWeight:600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:0 }}>Staff Management</h1>
          <p style={{ fontSize:12, color:'#9ca3af', margin:'2px 0 0' }}>Manage all staff members</p>
        </div>
        <button onClick={() => { setEditStaff(null); setShowAdd(true) }}
          style={{ display:'flex', alignItems:'center', gap:6, background:'#0c3b73', color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {/* KPI */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12 }}>
        {[
          { label:'Total Staff',   value: loading?'...':kpi.total,   color:'#0c3b73' },
          { label:'Present Today', value: loading?'...':kpi.present, color:'#16a34a' },
          { label:'Absent Today',  value: loading?'...':kpi.absent,  color:'#dc2626' },
          { label:'Late Arrivals', value: loading?'...':kpi.late,    color:'#d97706' },
        ].map(c => (
          <div key={c.label} style={{ background:'#fff', borderRadius:10, padding:'14px 16px', border:'1px solid #e5e7eb' }}>
            <p style={{ fontSize:11, color:'#6b7280', margin:'0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize:20, fontWeight:700, color:c.color, margin:0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
          <input value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Search by name or role..."
            style={{ width:'100%', paddingLeft:30, padding:'8px 10px 8px 30px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none', background:'#f9fafb' }} />
        </div>
        <select value={dept} onChange={e => { setDept(e.target.value); setPage(1) }} style={{ padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, background:'#f9fafb', cursor:'pointer' }}>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} style={{ padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, background:'#f9fafb', cursor:'pointer' }}>
          <option>All</option><option>Active</option><option>On Leave</option><option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['ID','Name','Role','Dept','Phone','Shift',"Today's Sales",'Attendance','Status','Actions'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_,i) => <tr key={i}>{Array(10).fill(0).map((_,j) => <td key={j} style={{ padding:'10px 12px' }}><div style={{ height:14, background:'#f3f4f6', borderRadius:4 }} /></td>)}</tr>)
                : staffList.length === 0
                  ? <tr><td colSpan={10} style={{ padding:40, textAlign:'center', color:'#9ca3af', fontSize:13 }}>No staff found</td></tr>
                  : staffList.map(s => (
                    <tr key={s._id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <Td><span style={{ fontFamily:'monospace', fontSize:11, background:'#f3f4f6', padding:'2px 7px', borderRadius:4 }}>{s.staffId}</span></Td>
                      <Td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:'#0c3b7322', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#0c3b73', flexShrink:0 }}>
                            {s.name?.[0]}
                          </div>
                          <span style={{ fontWeight:600, color:'#111827' }}>{s.name}</span>
                        </div>
                      </Td>
                      <Td>{s.role}</Td>
                      <Td><span style={{ fontSize:11, background:'#f3f4f6', padding:'2px 7px', borderRadius:4, color:'#374151' }}>{s.department}</span></Td>
                      <Td><div style={{ display:'flex', alignItems:'center', gap:4, color:'#6b7280' }}><Phone size={12} />{s.phone}</div></Td>
                      <Td><div style={{ display:'flex', alignItems:'center', gap:4, color:'#6b7280' }}><Clock size={12} />{s.shift}</div></Td>
                      <Td style={{ fontWeight:600 }}>{s.todaySales > 0 ? `₹${s.todaySales.toLocaleString('en-IN')}` : '—'}</Td>
                      <Td>
                        <select value={s.attendance} onChange={e => handleAttendance(s._id, e.target.value)}
                          style={{ padding:'3px 8px', borderRadius:20, fontSize:10, fontWeight:600, cursor:'pointer', outline:'none',
                            background:(attColors[s.attendance]||attColors.Present).bg,
                            color:(attColors[s.attendance]||attColors.Present).color,
                            border:`1px solid ${(attColors[s.attendance]||attColors.Present).border}` }}>
                          {['Present','Absent','Late','Leave'].map(a => <option key={a}>{a}</option>)}
                        </select>
                      </Td>
                      <Td><Badge val={s.status} colorMap={statusColors} /></Td>
                      <Td>
                        <div style={{ display:'flex', gap:5 }}>
                          <button title="View" onClick={() => setViewStaff(s)}
                            style={{ background:'#e0e7ff', border:'none', borderRadius:6, padding:'5px 7px', cursor:'pointer', color:'#0c3b73' }}>
                            <Eye size={13} />
                          </button>
                          <button title="Edit" onClick={() => setEditStaff(s)}
                            style={{ background:'#fffbeb', border:'none', borderRadius:6, padding:'5px 7px', cursor:'pointer', color:'#d97706' }}>
                            <Edit size={13} />
                          </button>
                          <button title="Delete" onClick={() => setDelId(s._id)}
                            style={{ background:'#fee2e2', border:'none', borderRadius:6, padding:'5px 7px', cursor:'pointer', color:'#dc2626' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderTop:'1px solid #f3f4f6' }}>
          <span style={{ fontSize:12, color:'#6b7280' }}>Showing {staffList.length} of {total} staff members</span>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page<=1}
              style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 8px', cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?0.5:1 }}>
              <ChevronLeft size={14} />
            </button>
            <button style={{ background:'#0c3b73', border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer', color:'#fff', fontSize:12 }}>{page}</button>
            <button onClick={() => setPage(p=>p+1)} disabled={staffList.length<10}
              style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 8px', cursor:staffList.length<10?'not-allowed':'pointer', opacity:staffList.length<10?0.5:1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
