import React, { useEffect, useState } from 'react'
import { Users, Edit, Trash2, Plus, AlertTriangle, Eye, Filter } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import AppTable, { Td } from '../../../components/AppTable'

const EMPLOYMENT_TYPES = ['Permanent', 'Temporary', 'Contract', 'Part-Time']
const STAFF_TYPES = ['Teaching', 'Non-Teaching']

const DEFAULT_FILTERS = { search: '', staffType: '', department: '', employmentType: '' }

const StaffList = () => {
  const navigate = useNavigate()

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updateStatus, setUpdateStatus] = useState(false)

  // Draft filters (what user is selecting)
  const [draftSearch, setDraftSearch] = useState('')
  const [draftStaffType, setDraftStaffType] = useState('')
  const [draftDept, setDraftDept] = useState('')
  const [draftEmpType, setDraftEmpType] = useState('')

  // Applied filters (triggers actual fetch)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean)

  useEffect(() => {
    getRequest('hr/departments?limit=200')
      .then((res) => setDepartments(res?.data?.data?.departments || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit }
    if (appliedFilters.search)       params.search        = appliedFilters.search
    if (appliedFilters.staffType)    params.staffType     = appliedFilters.staffType
    if (appliedFilters.department)   params.department    = appliedFilters.department
    if (appliedFilters.employmentType) params.employmentType = appliedFilters.employmentType
    const query = new URLSearchParams(params).toString()
    getRequest(`hr/staff?${query}`)
      .then((res) => {
        setData(res?.data?.data?.staff || [])
        setTotal(res?.data?.data?.total || 0)
      })
      .catch(() => toast.error('Failed to fetch staff'))
      .finally(() => setLoading(false))
  }, [page, limit, appliedFilters, updateStatus])

  const handleApply = () => {
    setAppliedFilters({
      search: draftSearch,
      staffType: draftStaffType,
      department: draftDept,
      employmentType: draftEmpType,
    })
    setPage(1)
  }

  const handleClear = () => {
    setDraftSearch(''); setDraftStaffType(''); setDraftDept(''); setDraftEmpType('')
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const handleToggle = (id) => {
    if (isToggling) return
    const item = data.find((d) => d._id === id)
    if (!item) return
    setIsToggling(true)
    const newStatus = !item.isActive
    putRequest({ url: `hr/staff/${id}`, cred: { isActive: newStatus } })
      .then(() => {
        toast.success(`Staff ${newStatus ? 'Activated' : 'Deactivated'}`)
        setData((prev) => prev.map((d) => (d._id === id ? { ...d, isActive: newStatus } : d)))
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setIsToggling(false))
  }

  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    deleteRequest(`hr/staff/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Staff deleted')
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen">
      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete <b>{selectedItem?.employeeName}</b>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={confirmDelete} disabled={loading} className={`px-5 py-2 text-white rounded ${loading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'}`}>
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="text-[#e24028] w-5 h-5" />Staff List
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage all teaching and non-teaching staff</p>
          </div>
          <button onClick={() => navigate('/hr/staff/add')} className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-3 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text" placeholder="Search by name, code..." value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select value={draftStaffType} onChange={(e) => setDraftStaffType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All Staff Types</option>
          {STAFF_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={draftDept} onChange={(e) => setDraftDept(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={draftEmpType} onChange={(e) => setDraftEmpType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All Employment Types</option>
          {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={handleApply} className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
          <Filter size={14} /> Apply
        </button>
        {hasActiveFilters && (
          <button onClick={handleClear} className="text-sm text-red-500 hover:underline">Clear</button>
        )}
        <span className="ml-auto text-sm text-gray-500">Total: <b>{total}</b></span>
      </div>

      {/* TABLE */}
      <AppTable
        columns={[
          { key: 'sr', label: 'Sr.', align: 'center', width: 50 },
          { key: 'employee', label: 'Employee', align: 'left', width: 200 },
          { key: 'code', label: 'Code', align: 'left', width: 100 },
          { key: 'department', label: 'Department', align: 'left', width: 140 },
          { key: 'designation', label: 'Designation', align: 'left', width: 140 },
          { key: 'staffType', label: 'Staff Type', align: 'center', width: 110 },
          { key: 'empType', label: 'Emp. Type', align: 'center', width: 110 },
          { key: 'mobile', label: 'Mobile', align: 'center', width: 120 },
          { key: 'status', label: 'Status', align: 'center', width: 80 },
          { key: 'actions', label: 'Actions', align: 'center', width: 110, sticky: 'right' },
        ]}
        data={data}
        loading={loading}
        emptyText="No staff records found"
        page={page}
        limit={limit}
        total={total}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => { setLimit(size); setPage(1) }}
        rowKey={(item) => item._id}
      >
        {(item, index) => (
          <>
            <Td align="center">{(page - 1) * limit + index + 1}</Td>
            <Td>
              <div className="flex items-center gap-2">
                {item.photo ? (
                  <img src={item.photo} alt={item.employeeName} className="w-8 h-8 rounded-full object-cover border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0c3b73] text-white flex items-center justify-center text-xs font-bold">
                    {item.employeeName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-gray-800">{item.employeeName}</span>
              </div>
            </Td>
            <Td><span className="font-mono text-xs text-gray-600">{item.employeeCode || '—'}</span></Td>
            <Td>{item.department?.name || '—'}</Td>
            <Td>{item.designation?.name || '—'}</Td>
            <Td align="center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.staffType === 'Teaching' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {item.staffType}
              </span>
            </Td>
            <Td align="center">
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{item.employmentType || '—'}</span>
            </Td>
            <Td align="center">{item.mobile || '—'}</Td>
            <Td align="center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={item.isActive} disabled={isToggling} onChange={() => handleToggle(item._id)} />
                <div className="w-9 h-5 bg-red-400 peer-checked:bg-green-500 rounded-full transition-colors" />
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4" />
              </label>
            </Td>
            <Td align="center" sticky="right">
              <div className="flex justify-center gap-1">
                <button onClick={() => navigate(`/hr/staff/${item._id}`)} className="text-green-600 hover:bg-green-600 hover:text-white p-2 rounded transition" title="View"><Eye size={15} /></button>
                <button onClick={() => navigate(`/hr/staff/edit/${item._id}`)} className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded transition" title="Edit"><Edit size={15} /></button>
                <button onClick={() => { setSelectedItem(item); setShowDeleteModal(true) }} className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded transition" title="Delete"><Trash2 size={15} /></button>
              </div>
            </Td>
          </>
        )}
      </AppTable>
    </div>
  )
}

export default StaffList
