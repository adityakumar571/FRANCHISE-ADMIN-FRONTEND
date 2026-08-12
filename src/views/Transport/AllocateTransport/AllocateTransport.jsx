/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Layers, Trash2, Plus, AlertTriangle, Filter, Edit } from 'lucide-react'
import { Empty, Pagination } from 'antd'
import { getRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Loader from '../../../components/Loading/Loader'
import AllocateTransportModal from './AllocateTransportModal'

const AssignBusMaster = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    setLoading(true)

    getRequest('transport/buses/assign')
      .then((res) => {
        const responseData = res?.data?.data || []

        setData(responseData)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to fetch data'))
      .finally(() => setLoading(false))
  }, [updateStatus])

  /* ================= SEARCH FILTER ================= */
  useEffect(() => {
    let filtered = data

    if (searchTerm) {
      filtered = data.filter((item) => {
        const bus = item?.busId
        const route = item?.routeId

        return (
          bus?.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bus?.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          route?.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          route?.startLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          route?.endLocation?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    setFilteredData(filtered)
    setTotal(filtered.length)
    setPage(1)
  }, [searchTerm, data])

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return

    setLoading(true)

    deleteRequest(`transport/buses/assign/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Deleted successfully')

        setData((prev) => prev.filter((item) => item._id !== selectedItem._id))

        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
  }

  /* ================= PAGINATION ================= */
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit)

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
              Remove bus <b>{selectedItem?.busId?.busNumber}</b> from route?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 bg-white rounded-lg border border-blue-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Layers className="text-[#e24028]" />
              Assign Bus Master
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage bus & route assignments</p>
          </div>

          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] hover:bg-blue-800 text-white px-4 py-2 rounded-md flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
          >
            <Plus size={16} />
            Assign Bus
          </button>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="bg-white p-4 rounded border border-blue-100 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>
        <label className="text-sm font-medium mb-1 block">Search</label>
        <input
          type="text"
          placeholder="Search bus / route..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
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
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Bus Number</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 150 }}>Driver Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 140 }}>Driver Phone</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Capacity</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 150 }}>Route Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 110 }}>Route Code</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 150 }}>Start Location</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 150 }}>End Location</th>
              <th className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading && paginatedData.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-10">
                  <Empty />
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ minWidth: 70 }}>{(page - 1) * limit + index + 1}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 120 }}>{item?.busId?.busNumber}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 150 }}>{item?.busId?.driverName}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 140 }}>{item?.busId?.driverPhone}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>{item?.busId?.capacity}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 150 }}>{item?.routeId?.routeName}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 110 }}>{item?.routeId?.routeCode}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 150 }}>{item?.routeId?.startLocation}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 150 }}>{item?.routeId?.endLocation}</td>
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
        <AllocateTransportModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setUpdateStatus={setUpdateStatus}
          modalData={selectedItem}
        />
      )}
    </div>
  )
}

export default AssignBusMaster
