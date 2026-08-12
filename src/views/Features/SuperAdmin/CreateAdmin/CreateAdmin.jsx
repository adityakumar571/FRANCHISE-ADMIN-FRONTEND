/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext } from 'react'
import {
  Trash2,
  Edit,
  Plus,
  AlertTriangle,
  Filter,
  ShieldCheck,
  Calculator,
  Search,
  EyeOff,
  Eye,
  Check,
  Copy,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Pagination, Input } from 'antd'
import CreateAdminModal from './CreateAdminModal'
import { deleteRequest, getRequest } from '../../../../Helpers'
import { SessionContext } from '../../../../Context/Seesion'
import Loader from '../../../../components/Loading/Loader'

const TABS = [
  { key: 'Admin', label: 'Admins', icon: ShieldCheck },
  { key: 'Accountant', label: 'Accountants', icon: Calculator },
]

const PasswordCell = ({ password }) => {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="font-mono text-sm">{visible ? password : '••••••••'}</span>
      <button
        onClick={() => setVisible((p) => !p)}
        className="text-gray-400 hover:text-gray-600 transition"
        title={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <button
        onClick={handleCopy}
        className="text-gray-400 hover:text-gray-600 transition"
        title="Copy password"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>
    </div>
  )
}

const CreateAdmin = () => {
  const { currentSession } = useContext(SessionContext)
  const [activeTab, setActiveTab] = useState('Admin')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [draftFilters, setDraftFilters] = useState({ search: '' })
  const [appliedFilters, setAppliedFilters] = useState({ search: '' })

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  /* ================= FETCH ================= */
  const fetchAdmins = () => {
    setLoading(true)
    const params = {
      page,
      role: activeTab,
      limit,
      ...(appliedFilters.search && { search: appliedFilters.search }),
    }

    const query = new URLSearchParams(params).toString()

    getRequest(`admins?${query}`)
      .then((res) => {
        const list = res?.data?.data?.data || []
        const total = res?.data?.data?.total || 0
        setData(Array.isArray(list) ? list : [])
        setTotal(total)
      })
      .catch((err) => {
        console.error('❌ Fetch error:', err)
        setData([])
      })
      .finally(() => setLoading(false))
  }

  /* Reset page & filters when tab changes */
  useEffect(() => {
    setPage(1)
    setDraftFilters({ search: '' })
    setAppliedFilters({ search: '' })
  }, [activeTab])

  useEffect(() => {
    fetchAdmins()
  }, [activeTab, appliedFilters, page, limit])

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!selectedItem?._id) return

    setDeleteLoading(true)
    try {
      await deleteRequest(`admins/${selectedItem._id}`)
      toast.success('Admin deleted successfully')
      fetchAdmins()
      setShowDeleteModal(false)
      setSelectedItem(null)
    } catch (err) {
      toast.error('Delete failed')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleClearFilters = () => {
    const reset = { search: '' }
    setDraftFilters(reset)
    setAppliedFilters(reset)
    setPage(1)
  }

  const currentTab = TABS.find((t) => t.key === activeTab)

  return (
    <div className="min-h-screen">
      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded shadow-xl">
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <b>{selectedItem?.fullName}</b>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className={`px-5 py-2 text-white rounded ${deleteLoading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="bg-white p-4 rounded border mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {activeTab === 'Admin' ? (
                <ShieldCheck className="text-[#0c3b73]" />
              ) : (
                <Calculator className="text-[#0c3b73]" />
              )}
              {currentTab?.label} Management
            </h1>
            <p className="text-sm font-medium text-gray-500">
              {activeTab === 'Admin'
                ? 'Create and manage system administrators'
                : 'Create and manage accountant staff'}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] hover:bg-[#062447] text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add {activeTab}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.key
                    ? 'border-[#0c3b73] text-[#0c3b73]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white p-4 rounded border mb-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-[19px] font-semibold text-gray-700 mb-4">
          <Filter className="w-4 h-4 text-orange-500" />
          Filters & Search
        </h3>
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search Input */}
          <div className="w-full sm:w-[250px]">
            <label className="block text-xs font-medium mb-1 text-gray-500">Search Admin</label>
            <Input
              placeholder="Name or Email..."
              prefix={<Search size={14} className="text-gray-400" />}
              value={draftFilters.search}
              onChange={(e) => setDraftFilters((p) => ({ ...p, search: e.target.value }))}
              onPressEnter={() => {
                setPage(1)
                setAppliedFilters({ ...draftFilters })
              }}
            />
          </div>

          {/* Status Select */}
          {/* <div className="w-full sm:w-[200px]">
            <label className="block text-xs font-medium mb-1 text-gray-500">Status</label>
            <Select
              value={draftFilters.status}
              placeholder="Select Status"
              allowClear
              className="w-full"
              onChange={(v) => setDraftFilters((p) => ({ ...p, status: v ?? null }))}
            >
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </div> */}

          <button
            onClick={() => {
              setPage(1)
              setAppliedFilters({ ...draftFilters })
            }}
            className="h-[32px] px-5 rounded bg-[#0c3b73] text-white hover:bg-[#0a2f5c] transition"
          >
            Apply
          </button>

          {appliedFilters.search && (
            <button
              onClick={handleClearFilters}
              className="h-[32px] px-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded border overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-10 text-center">
            <Loader />
            <p className="mt-2 text-gray-500">Loading administrators...</p>
          </div>
        ) : (
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-2 py-3 w-[60px] text-center">Sr.No</th>
                <th className="px-2 py-3 w-[120px] text-center">UserId</th>
                <th className="px-2 py-3 w-[120px] text-center">Password</th>
                <th className="px-2 py-3 w-[90px] text-left">Name</th>
                <th className="px-2 py-3 w-[120px] text-left">Email</th>
                <th className="px-2 py-3 w-[100px] text-center">Status</th>
                <th className="px-2 py-3 w-[120px] text-center">Created</th>
                <th className="px-2 py-3 w-[100px] text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400 italic">
                    No {activeTab === 'Admin' ? 'Admins' : 'Accountants'} Found
                  </td>
                </tr>
              ) : (
                data.map((admin, index) => (
                  <tr key={admin._id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Sr No */}
                    <td className="px-2 py-1.5 text-center text-gray-500">
                      {(page - 1) * limit + index + 1}
                    </td>

                    {/* UserId */}
                    <td className="px-2 py-1.5 text-center text-gray-600">{admin.userId}</td>

                    {/* Password */}
                    <td className="px-2 py-1.5 text-center text-gray-600">
                      <PasswordCell password={admin.password} />
                    </td>
                    {/* Name */}
                    <td className="px-2 py-1.5 font-medium text-gray-800">{admin.name}</td>

                    {/* Email */}
                    <td className="px-2 py-1.5 truncate" title={admin.email}>
                      {admin.email}
                    </td>

                    {/* Status */}
                    <td className="px-2 py-1.5 text-center">
                      <span
                        className={`px-2 py-[2px] rounded-full text-xs font-medium ${
                          admin.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {admin.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-2 py-1.5 text-center text-gray-600">
                      {new Date(admin.createdAt).toLocaleDateString('en-GB')}
                    </td>

                    {/* Actions */}
                    <td className="px-2 py-1.5 text-center">
                      <div className="flex justify-center items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedItem(admin)
                            setIsModalOpen(true)
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedItem(admin)
                            setShowDeleteModal(true)
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ---------- Pagination ---------- */}
        {!loading && data.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50">
            <div className="text-xs text-gray-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records
            </div>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              showSizeChanger
              onChange={(p) => setPage(p)}
              onShowSizeChange={(_, size) => {
                setLimit(size)
                setPage(1)
              }}
              size="small"
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateAdminModal
          key={selectedItem?._id || 'new'}
          open={isModalOpen}
          editData={selectedItem}
          defaultRole={activeTab}
          onClose={() => setIsModalOpen(false)}
          refresh={fetchAdmins}
        />
      )}
    </div>
  )
}

export default CreateAdmin
