import React, { useEffect, useState } from 'react'
import { Users, Plus, Edit, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import AppTable, { Td } from '../../../components/AppTable'

const ROLES = ['HRManager', 'HRStaff']
const initialForm = { name: '', userId: '', password: '', role: '', email: '', phone: '' }

const HRUserManagement = () => {
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [limit]                   = useState(20)
  const [search, setSearch]       = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [filterRole, setFilterRole]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit]       = useState(false)
  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState(initialForm)
  const [errors, setErrors]       = useState({})
  const [showPwd, setShowPwd]     = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem]       = useState(null)
  const [refresh, setRefresh]     = useState(false)

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams({ page, limit })
    if (search)     q.set('search', search)
    if (filterRole) q.set('role', filterRole)
    getRequest(`hr/users?${q.toString()}`)
      .then((res) => {
        setData(res?.data?.data?.users || [])
        setTotal(res?.data?.data?.total || 0)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to load HR users'))
      .finally(() => setLoading(false))
  }, [refresh, page, search, filterRole])

  const validate = () => {
    const errs = {}
    if (!form.name.trim())   errs.name   = 'Name is required'
    if (!form.userId.trim()) errs.userId  = 'User ID is required'
    if (!isEdit && !form.password.trim()) errs.password = 'Password is required'
    if (!isEdit && form.password.length < 6) errs.password = 'Min 6 characters'
    if (!form.role)          errs.role   = 'Role is required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (form.phone && !/^\d{10}$/.test(form.phone)) errs.phone = 'Enter 10-digit number'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const payload = { ...form }
    if (isEdit && !payload.password) delete payload.password
    const req = isEdit
      ? putRequest({ url: `hr/users/${editId}`, cred: payload })
      : postRequest({ url: 'hr/users', cred: payload })
    req.then(() => {
      toast.success(isEdit ? 'User updated' : 'HR user created')
      setShowModal(false); setForm(initialForm); setIsEdit(false); setEditId(null); setErrors({})
      setPage(1); setRefresh((p) => !p)
    })
      .catch((err) => toast.error(err?.response?.data?.message || 'Operation failed'))
      .finally(() => setLoading(false))
  }

  const confirmDelete = () => {
    setLoading(true)
    deleteRequest(`hr/users/${selectedItem?._id}`)
      .then(() => { toast.success('User deleted'); setShowDeleteModal(false); setRefresh((p) => !p) })
      .catch(() => toast.error('Delete failed'))
      .finally(() => setLoading(false))
  }

  const openEdit = (item) => {
    setForm({ name: item.name || '', userId: item.userId || '', password: '', role: item.role || '', email: item.email || '', phone: item.phone || '' })
    setEditId(item._id); setIsEdit(true); setErrors({}); setShowModal(true)
  }

  const openAdd = () => { setForm(initialForm); setIsEdit(false); setEditId(null); setErrors({}); setShowModal(true) }
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: '' })) }

  const Field = ({ label, field, type = 'text', placeholder, required }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder}
        className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors[field] ? 'border-red-400' : 'border-gray-300'}`} />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-sm rounded shadow-xl">
            <div className="flex items-center mb-4 gap-3"><AlertTriangle className="text-red-500 w-6 h-6" /><h3 className="font-semibold text-lg">Confirm Delete</h3></div>
            <p className="text-gray-600 mb-6">Delete <b>{selectedItem?.name}</b> ({selectedItem?.role})?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={confirmDelete} disabled={loading} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:bg-red-300">{loading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-base flex items-center gap-2"><Users className="w-4 h-4 text-[#e24028]" />{isEdit ? 'Edit HR User' : 'Add HR User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <Field label="Full Name" field="name" placeholder="e.g. Rahul Sharma" required />
              <Field label="User ID" field="userId" placeholder="e.g. hr_rahul" required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {!isEdit && <span className="text-red-500">*</span>}
                  {isEdit && <span className="text-xs text-gray-400 ml-1">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder={isEdit ? '••••••' : 'Min 6 characters'}
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10 ${errors.password ? 'border-red-400' : 'border-gray-300'}`} />
                  <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select value={form.role} onChange={set('role')} className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.role ? 'border-red-400' : 'border-gray-300'}`}>
                  <option value="">— Select Role —</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>
              <Field label="Email" field="email" type="email" placeholder="email@example.com" />
              <Field label="Mobile" field="phone" placeholder="10-digit number" />
              {form.role && (
                <div className="bg-blue-50 border border-blue-100 rounded p-3 text-xs text-blue-700">
                  {form.role === 'HRManager' ? 'HRManager: Edit Staff, Approve Leave, Generate Payroll, Record Salary Payment' : 'HRStaff: Add Staff, Enter Attendance, View Reports'}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-[#0c3b73] hover:bg-blue-700 text-white rounded disabled:bg-blue-300">{loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2"><Users className="text-[#e24028] w-5 h-5" />HR User Management</h1>
            <p className="text-xs text-gray-500">Manage HR login credentials and roles</p>
          </div>
          <button onClick={openAdd} className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"><Plus size={15} /> Add HR User</button>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white border rounded p-3 flex flex-wrap gap-3 items-center mb-4">
        <input
          type="text"
          value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(draftSearch); setPage(1) } }}
          placeholder="Search name, user ID, email..."
          className="border border-gray-300 rounded px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={() => { setSearch(draftSearch); setPage(1) }}
          className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          Search
        </button>
        {(search || filterRole) && (
          <button
            onClick={() => { setDraftSearch(''); setSearch(''); setFilterRole(''); setPage(1) }}
            className="text-sm text-red-500 hover:underline"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">Total: <b>{total}</b></span>
      </div>

      {/* ROLE INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm font-semibold text-[#0c3b73] mb-1">HRManager</p>
          <p className="text-xs text-gray-500">Edit Staff · Approve Leave · Generate Payroll · Record Salary Payment · View Reports</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-700 mb-1">HRStaff</p>
          <p className="text-xs text-gray-500">Add Staff · Enter Attendance · Add Income & Expense · View Reports</p>
        </div>
      </div>

      {/* TABLE */}
      <AppTable
        columns={[
          { key: 'sr', label: 'Sr.', align: 'center', width: 50 },
          { key: 'name', label: 'Name', align: 'left', width: 180 },
          { key: 'userId', label: 'User ID', align: 'left', width: 130 },
          { key: 'role', label: 'Role', align: 'center', width: 120 },
          { key: 'email', label: 'Email', align: 'left', width: 180 },
          { key: 'status', label: 'Status', align: 'center', width: 90 },
          { key: 'actions', label: 'Actions', align: 'center', width: 90, sticky: 'right' },
        ]}
        data={data}
        loading={loading}
        emptyText="No HR users found"
        page={page}
        limit={limit}
        total={total}
        onPageChange={(p) => setPage(p)}
        rowKey={(item) => item._id}
      >
        {(item, idx) => (
          <>
            <Td align="center">{(page - 1) * limit + idx + 1}</Td>
            <Td>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0c3b73] text-white flex items-center justify-center text-xs font-bold">{item.name?.charAt(0)?.toUpperCase()}</div>
                <span className="font-medium text-gray-800">{item.name}</span>
              </div>
            </Td>
            <Td><span className="font-mono text-xs text-gray-600">{item.userId}</span></Td>
            <Td align="center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.role === 'HRManager' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.role}</span>
            </Td>
            <Td>{item.email || '—'}</Td>
            <Td align="center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {item.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </Td>
            <Td align="center" sticky="right">
              <div className="flex justify-center gap-2">
                <button onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded transition" title="Edit"><Edit size={15} /></button>
                <button onClick={() => { setSelectedItem(item); setShowDeleteModal(true) }} className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded transition" title="Delete"><Trash2 size={15} /></button>
              </div>
            </Td>
          </>
        )}
      </AppTable>
    </div>
  )
}

export default HRUserManagement
