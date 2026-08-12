import React, { useEffect, useState, useContext  } from 'react'
import { FileText, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Pagination } from 'antd'
import DocumentsMasterModal from './DocumentsModal'
import DocumentsFilter from './DocumentsFilter'
import Loader from '../../../components/Loading/Loader'
import { SessionContext } from '../../../Context/Seesion'

const DocumentsMaster = () => {
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [category, setCategory] = useState('')
  const [appliedFilter, setAppliedFilter] = useState(false)
  const { currentSession } = useContext(SessionContext)

  /* ================= FETCH DOCUMENTS ================= */
  useEffect(() => {
    if (!currentSession?._id) return
    setLoading(true)

    const query = new URLSearchParams({
      search: searchTerm,
      page,
      limit,
      ...(category && { category }),
      session: currentSession._id,
    }).toString()

    getRequest(`documents?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.documents || [])
        setTotal(responseData?.totalDocuments || 0)
      })
      .catch(() => toast.error('Failed to fetch documents'))
      .finally(() => setLoading(false))
  }, [page, limit, appliedFilter, updateStatus, searchTerm, category, currentSession])

  const handleApply = () => {
    setPage(1)
    setAppliedFilter((p) => !p)
  }

  const handleReset = () => {
    setSearchTerm('')
    setCategory('')
    setPage(1)
    setAppliedFilter((p) => !p)
  }

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    deleteRequest(`documents/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Document deleted')
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
  }

  /* ================= STATUS TOGGLE ================= */
  const handleToggle = (id) => {
    if (isToggling) return
    const selected = data.find((item) => item._id === id)
    if (!selected) return

    setIsToggling(true)
    const newStatus = !selected.isActive

    putRequest({
      url: `documents/${id}`,
      cred: { isActive: newStatus },
    })
      .then(() => {
        toast.success(`Document ${newStatus ? 'Activated' : 'Deactivated'}`)
        setData((prev) =>
          prev.map((item) => (item._id === id ? { ...item, isActive: newStatus } : item)),
        )
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setIsToggling(false))
  }

  return (
    <div className="min-h-screen">
      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <b>{selectedItem?.name}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-5 py-2 text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="text-[#e24028]" />
              Documents Master
            </h1>
            <p className="text-sm text-gray-500">Manage required documents</p>
          </div>

          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Add Document
          </button>
        </div>
      </div>

      {/* FILTER */}
      <DocumentsFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        category={category}
        setCategory={setCategory}
        onApply={handleApply}
        onReset={handleReset}
        currentSession={currentSession}
      />

      {/* TABLE */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-2 text-center">
            <Loader />
            <p>Loding records...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className=" px-3 py-2 w-20 text-center text-sm font-semibold">Sr. No.</th>
                <th className=" px-3 py-2 text-center text-sm font-semibold">Document Name</th>
                <th className=" px-3 py-2 text-center text-sm font-semibold">Category Name</th>
                <th className=" px-3 py-2  text-center text-sm font-semibold">Status</th>
                <th className=" px-3 py-2 w-40 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No Records Found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">{index + 1}</td>
                    <td className="border px-3 py-2">{item.name}</td>
                    <td className="border px-3 py-2">{item.category}</td>
                    {/* STATUS */}
                    <td className="border px-3 py-2 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.isActive}
                          disabled={isToggling}
                          onChange={() => handleToggle(item._id)}
                        />
                        <div className="w-9 h-5 bg-red-500 peer-checked:bg-green-500 rounded-full" />
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4" />
                      </label>
                    </td>

                    {/* ACTION */}
                    <td className="border px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setIsModalOpen(true)
                          }}
                          className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded"
                        >
                          <Trash2 size={16} />
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
        {!loading && data?.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                results
              </div>
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                pageSizeOptions={['5', '10', '20', '50', '100', '200', '500', '1000']}
                onChange={(newPage) => setPage(newPage)}
                showSizeChanger={true}
                onShowSizeChange={(current, size) => {
                  setLimit(size)
                  setPage(1)
                }}
                showQuickJumper
              />
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <DocumentsMasterModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
          currentSession={currentSession}
        />
      )}
    </div>
  )
}

export default DocumentsMaster
