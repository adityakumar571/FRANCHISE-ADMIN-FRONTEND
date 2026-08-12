/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Layers, Edit, Trash2, Plus, AlertTriangle, Filter } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination } from 'antd'
import BusModal from './BusModal'
import Loader from '../../../components/Loading/Loader'

const BusMaster = () => {
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

  /* ================= FETCH BUSES ================= */
  useEffect(() => {
    setLoading(true)

    const query = new URLSearchParams({
      search: searchTerm,
      page,
      limit,
    }).toString()

    getRequest(`transport/buses?${query}`)
      .then((res) => {
        const responseData = res?.data?.data

        setData(responseData?.buses || [])
        setTotal(responseData?.pagination?.totalRows || 0)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to fetch buses'))
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, updateStatus])

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return

    setLoading(true)

    deleteRequest(`transport/buses/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Bus deleted')
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

    const newStatus = !selected.isActive
    setIsToggling(true)

    putRequest({
      url: `transport/buses/${id}`,
      cred: { isActive: newStatus },
    })
      .then(() => {
        toast.success(`Bus ${newStatus ? 'Activated' : 'Deactivated'}`)
        setData((prev) =>
          prev.map((item) => (item._id === id ? { ...item, isActive: newStatus } : item)),
        )
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setIsToggling(false))
  }

  return (
    <div className="min-h-screen">
      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3">
          <div className="bg-white p-6 w-full max-w-md rounded">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Delete <b>{selectedItem?.busNumber}</b> ?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className={`px-5 py-2 text-white ${
                  loading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 bg-white rounded-lg border border-blue-100 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Layers className="text-[#e24028]" />
              Bus Master
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage buses and driver details</p>
          </div>

          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] hover:bg-blue-800 text-white px-4 py-2 rounded-md flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
          >
            <Plus size={16} />
            Add Bus
          </button>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="bg-white p-4 rounded border border-blue-100 mb-4">
        <div className="sm:col-span-12 flex items-center gap-2">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Search</label>
          <input
            type="text"
            placeholder="Search bus..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader /> Loading...
          </div>
        )}
        <table className="min-w-max border-collapse w-full table-fixed">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 70 }}>Sr. No.</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Bus No</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Capacity</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 150 }}>Driver</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 140 }}>Phone</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Status</th>
              <th className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  <Empty />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ minWidth: 70 }}>
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 120 }}>{item.busNumber}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>{item.capacity}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 150 }}>{item.driverName}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 140 }}>{item.driverPhone}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>
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
                  <td className="sticky right-0 z-10 bg-white px-3 py-2 text-center" style={{ minWidth: 120 }}>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => { setSelectedItem(item); setIsModalOpen(true) }}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => { setSelectedItem(item); setShowDeleteModal(true) }}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
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
      </div>
      <div className="mt-4 flex justify-end">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          showSizeChanger
          pageSizeOptions={['5', '10', '20', '50']}
          onChange={(p) => setPage(p)}
          onShowSizeChange={(c, size) => { setLimit(size); setPage(1) }}
        />
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <BusModal
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

export default BusMaster
