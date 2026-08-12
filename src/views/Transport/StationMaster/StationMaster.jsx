/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Layers, Edit, Trash2, Plus, AlertTriangle, Filter } from 'lucide-react'
import { Empty, Pagination } from 'antd'
import StationModal from './StationModal'
import { getRequest, deleteRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Loader from '../../../components/Loading/Loader'
import { putRequest } from '../../../Helpers'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { MenuOutlined } from '@ant-design/icons'

const StationMaster = () => {
  const [data,          setData]          = useState([])
  const [routes,        setRoutes]        = useState([])
  const [selectedRoute, setSelectedRoute] = useState('')
  const [total,         setTotal]         = useState(0)
  const [page,          setPage]          = useState(1)
  const [limit,         setLimit]         = useState(10)
  const [isModalOpen,   setIsModalOpen]   = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem,  setSelectedItem]  = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [updateStatus,  setUpdateStatus]  = useState(false)

  /* ── Load Routes ── */
  useEffect(() => {
    getRequest(`transport?isPagination=false`)
      .then((res) => setRoutes(res?.data?.data?.routes || []))
      .catch(() => toast.error('Failed to load routes'))
  }, [])

  /* ── Load Stops ── */
  useEffect(() => {
    if (!selectedRoute) { setData([]); setTotal(0); return }
    setLoading(true)
    getRequest(`transport/stops?routeId=${selectedRoute}&isPagination=false`)
      .then((res) => {
        let stops = res?.data?.data?.stops || []
        stops = stops.map((item, index) => ({ ...item, stopOrder: item.stopOrder ?? index + 1 }))
        stops.sort((a, b) => a.stopOrder - b.stopOrder)
        setData(stops)
        setTotal(stops.length)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to fetch stops'))
      .finally(() => setLoading(false))
  }, [selectedRoute, updateStatus])

  /* ── Delete ── */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    deleteRequest(`transport/stops/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Deleted successfully')
        setData((prev) => prev.filter((item) => item._id !== selectedItem._id))
        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
  }

  /* ── Drag & Drop ── */
  const handleDragEnd = (result) => {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return
    const items = Array.from(data)
    const [movedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, movedItem)
    setData(items.map((item, index) => ({ ...item, stopOrder: index + 1 })))
  }

  const saveOrder = () => {
    const payload = data.map((item) => ({ id: item._id, order: item.stopOrder }))
    setLoading(true)
    postRequest({ url: `transport/stops/reorder`, cred: { stops: payload } })
      .then((res) => toast.success(res?.data?.message || 'Order updated successfully'))
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to update order'))
      .finally(() => setLoading(false))
  }

  const DragHandle = () => <MenuOutlined style={{ cursor: 'grab', color: '#9ca3af' }} />

  return (
    <div className="min-h-screen">

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3">
          <div className="bg-white p-6 w-full max-w-md rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <b>{selectedItem?.stopName}</b>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className={`px-5 py-2 text-white rounded ${loading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="text-black px-4 py-3 mb-4 bg-white rounded-lg border border-blue-100">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Layers className="text-[#e24028]" size={24} />
              Station Master
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage route stops and timings</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => { setSelectedItem(null); setIsModalOpen(true) }}
              className="bg-[#0c3b73] text-white px-4 py-2 hover:bg-blue-800 flex items-center justify-center rounded-md text-sm w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Station
            </button>
            <button
              onClick={saveOrder}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm w-full sm:w-auto"
            >
              Save Order
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-4 mb-4 rounded-lg border border-blue-100">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
          <Filter className="w-4 h-4 text-orange-500" />
          Filters &amp; Search
        </h3>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Routes</label>
          <select
            className="border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-700 focus:outline-none focus:border-blue-400"
            style={{ width: 240 }}
            value={selectedRoute}
            onChange={(e) => { setSelectedRoute(e.target.value); setPage(1) }}
          >
            <option value="">Select Route</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>{r.routeName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-sm text-gray-500 mt-2">Loading stops...</p>
          </div>
        )}
          <table className="w-full text-sm min-w-[600px] border-collapse">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-center bg-gray-200" style={{ width: 40 }}></th>
                <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-center" style={{ width: 70 }}>Sr. No.</th>
                <th className="px-3 py-2 text-center bg-gray-200">Stop</th>
                <th className="px-3 py-2 text-center bg-gray-200" style={{ width: 80 }}>Order</th>
                <th className="px-3 py-2 text-center bg-gray-200" style={{ width: 100 }}>Fee</th>
                <th className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-center" style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="table">
                {(provided) => (
                  <tbody ref={provided.innerRef} {...provided.droppableProps}>
                    {!loading && data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">
                          <Empty description="No stops found. Select a route or add stations." />
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(provided) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="border-t hover:bg-gray-50"
                            >
                              <td className="px-3 py-2 text-center bg-white">
                                <span {...provided.dragHandleProps}>
                                  <DragHandle />
                                </span>
                              </td>
                              <td className="sticky left-0 z-10 bg-white px-3 py-2 text-center" style={{ width: 70 }}>
                                {(page - 1) * limit + index + 1}
                              </td>
                              <td className="px-3 py-2 text-center bg-white font-medium text-gray-800">
                                {item.stopName}
                              </td>
                              <td className="px-3 py-2 text-center bg-white text-gray-600">
                                {item.stopOrder}
                              </td>
                              <td className="px-3 py-2 text-center bg-white text-gray-700 font-medium">
                                ₹ {item.feeAmount}
                              </td>
                              <td className="sticky right-0 z-10 bg-white px-3 py-2 text-center" style={{ width: 110 }}>
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => { setSelectedItem(item); setIsModalOpen(true) }}
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-blue-600 hover:text-white hover:bg-blue-600 transition-all"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedItem(item); setShowDeleteModal(true) }}
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-red-600 hover:text-white hover:bg-red-600 transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </DragDropContext>
          </table>
      </div>
      {!loading && data.length > 0 && (
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
      )}

      {/* ── Modal ── */}
      {isModalOpen && (
        <StationModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
          selectedRoute={selectedRoute}
        />
      )}
    </div>
  )
}

export default StationMaster
