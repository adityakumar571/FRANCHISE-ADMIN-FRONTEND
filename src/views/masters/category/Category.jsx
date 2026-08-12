/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Edit, Trash2, Plus, AlertTriangle, Tag } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination } from 'antd'
import Loader from '../../../components/Loading/Loader'
import CategoryMasterModal from './categoryModal'

const Category = () => {
  const [data, setData] = useState([])
  console.log('data===', data)

  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updateStatus, setUpdateStatus] = useState(false)

  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)

  /* ================= FETCH CATEGORY ================= */

  useEffect(() => {
    console.log('hill')

    setLoading(true)

    getRequest(`categoryMaster/list?page=${page}&limit=${limit}`)
      .then((res) => {
        console.log('API RESPONSE', res)

        const response = res?.data?.data || []
        const pagination = res?.data?.pagination || {}

        setData(response)
        setTotal(pagination.total || 0)
      })
      .catch(() => toast.error('Failed to fetch categories'))
      .finally(() => setLoading(false))
  }, [page, limit, updateStatus])

  /* ================= DELETE ================= */

  const confirmDelete = () => {
    if (!selectedItem?._id) return

    setLoading(true)

    deleteRequest(`categoryMaster/delete/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Category deleted')
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
      })
      .catch(() => toast.error('Delete failed'))
      .finally(() => setLoading(false))
  }

  /* ================= STATUS TOGGLE ================= */

  const handleToggle = (id) => {
    const selected = data.find((item) => item._id === id)

    if (!selected) return

    const newStatus = !selected.status

    putRequest({
      url: `categoryMaster/update/${id}`,
      cred: { status: newStatus },
    })
      .then(() => {
        toast.success(`Category ${newStatus ? 'Activated' : 'Deactivated'}`)

        setData((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item)),
        )
      })
      .catch(() => toast.error('Status update failed'))
  }

  return (
    <div className="min-h-screen">
      {/* DELETE MODAL */}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-3" />
              <h3 className="font-semibold text-lg">Confirm Delete</h3>
            </div>

            <p className="mb-6">
              Delete <b>{selectedItem?.name}</b> ?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>

              <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}

      {/* HEADER */}

      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Tag className="text-[#e24028] w-5 h-5 sm:w-6 sm:h-6" />
              Category Master
            </h1>

            <p className="text-xs sm:text-sm text-gray-500">
              Manage categories used across the system
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">
            <Loader />
            <p>Loading records...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 text-center w-20">Sr. No.</th>
                <th className="px-3 py-2">Category Name</th>
                <th className="px-3 py-2">Description </th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-center w-40">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    <Empty />
                    No Records Found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id}>
                    <td className="border px-3 py-2 text-center">
                      {(page - 1) * limit + index + 1}
                    </td>

                    <td className="border px-3 py-2">{item.name}</td>
                    <td className="border px-3 py-2">{item.description}</td>

                    {/* STATUS */}

                    <td className="border px-3 py-2 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.status}
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

        {/* PAGINATION */}

        {!loading && data.length > 0 && (
          <div className="p-4 border flex justify-between items-center">
            <div>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </div>

            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              onChange={(p) => setPage(p)}
              showSizeChanger
              onShowSizeChange={(c, size) => {
                setLimit(size)
                setPage(1)
              }}
            />
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <CategoryMasterModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
        />
      )}
    </div>
  )
}

export default Category
