import React, { useEffect, useState } from 'react'
import { Briefcase, Edit, Trash2, Plus, AlertTriangle, Filter } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import DesignationModal from './DesignationModal'
import AppTable, { Td } from '../../../components/AppTable'

const STAFF_TYPES = ['Teaching', 'Non-Teaching']
const DEFAULT_FILTERS = { search: '', department: '', staffType: '' }

const DesignationMaster = () => {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updateStatus, setUpdateStatus] = useState(false)

  // Draft
  const [draftSearch, setDraftSearch] = useState('')
  const [draftDept, setDraftDept] = useState('')
  const [draftStaffType, setDraftStaffType] = useState('')

  // Applied
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
    if (appliedFilters.search)     params.search     = appliedFilters.search
    if (appliedFilters.department) params.department = appliedFilters.department
    if (appliedFilters.staffType)  params.staffType  = appliedFilters.staffType
    const query = new URLSearchParams(params).toString()
    getRequest(`hr/designations?${query}`)
      .then((res) => {
        setData(res?.data?.data?.designations || [])
        setTotal(res?.data?.data?.total || 0)
      })
      .catch(() => toast.error('Failed to fetch designations'))
      .finally(() => setLoading(false))
  }, [page, limit, appliedFilters, updateStatus])

  const handleApply = () => {
    setAppliedFilters({ search: draftSearch, department: draftDept, staffType: draftStaffType })
    setPage(1)
  }

  const handleClear = () => {
    setDraftSearch(''); setDraftDept(''); setDraftStaffType('')
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const handleToggle = (id) => {
    if (isToggling) return
    const item = data.find((d) => d._id === id)
    if (!item) return
    setIsToggling(true)
    const newStatus = !item.isActive
    putRequest({ url: `hr/designations/${id}`, cred: { isActive: newStatus } })
      .then(() => {
        toast.success(`Designation ${newStatus ? 'Activated' : 'Deactivated'}`)
        setData((prev) => prev.map((d) => (d._id === id ? { ...d, isActive: newStatus } : d)))
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setIsToggling(false))
  }

  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    deleteRequest(`hr/designations/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Designation deleted')
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete <b>{selectedItem?.name}</b>?</p>
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
              <Briefcase className="text-[#e24028] w-5 h-5" />Designation Master
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage designations linked to departments</p>
          </div>
          <button onClick={() => { setSelectedItem(null); setIsModalOpen(true) }} className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Designation
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-3 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text" placeholder="Search designations..." value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select value={draftDept} onChange={(e) => setDraftDept(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={draftStaffType} onChange={(e) => setDraftStaffType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All Staff Types</option>
          {STAFF_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={handleApply} className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
          <Filter size={14} /> Apply
        </button>
        {hasActiveFilters && (
          <button onClick={handleClear} className="text-sm text-red-500 hover:underline">Clear</button>
        )}
      </div>

      <AppTable
        columns={[
          { key: 'sr', label: 'Sr. No.', align: 'center', width: 70 },
          { key: 'name', label: 'Designation Name', align: 'left', width: 200 },
          { key: 'department', label: 'Department', align: 'left', width: 160 },
          { key: 'staffType', label: 'Staff Type', align: 'center', width: 130 },
          { key: 'status', label: 'Status', align: 'center', width: 100 },
          { key: 'actions', label: 'Actions', align: 'center', width: 100, sticky: 'right' },
        ]}
        data={data}
        loading={loading}
        emptyText="No designations found"
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
            <Td><span className="font-medium text-gray-800">{item.name}</span></Td>
            <Td>{item.department?.name || '—'}</Td>
            <Td align="center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.staffType === 'Teaching' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {item.staffType || '—'}
              </span>
            </Td>
            <Td align="center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={item.isActive} disabled={isToggling} onChange={() => handleToggle(item._id)} />
                <div className="w-9 h-5 bg-red-400 peer-checked:bg-green-500 rounded-full transition-colors" />
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4" />
              </label>
            </Td>
            <Td align="center" sticky="right">
              <div className="flex justify-center gap-2">
                <button onClick={() => { setSelectedItem(item); setIsModalOpen(true) }} className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded transition" title="Edit"><Edit size={15} /></button>
                <button onClick={() => { setSelectedItem(item); setShowDeleteModal(true) }} className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded transition" title="Delete"><Trash2 size={15} /></button>
              </div>
            </Td>
          </>
        )}
      </AppTable>

      {isModalOpen && (
        <DesignationModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
          departments={departments}
        />
      )}
    </div>
  )
}

export default DesignationMaster
