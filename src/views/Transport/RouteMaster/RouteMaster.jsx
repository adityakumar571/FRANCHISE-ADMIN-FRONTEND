/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Layers, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination } from 'antd'
import RouteModal from './RouteModal'
import Loader from '../../../components/Loading/Loader'

/* 🔥 DRAG DROP */
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuOutlined } from '@ant-design/icons'
import RouteFilter from './RouteFilter'

const RouteMaster = () => {
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

  /* ================= FETCH ROUTES ================= */
  useEffect(() => {
    setLoading(true)

    const params = new URLSearchParams({
      search: searchTerm,
      page,
      limit,
    }).toString()

    getRequest(`transport?${params}&isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.routes || [])
        setTotal(responseData?.pagination?.totalRoutes || 0)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Fetch failed'))
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, updateStatus])

  /* ================= DRAG END ================= */
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setData((prev) => {
      const oldIndex = prev.findIndex((i) => i._id === active.id)
      const newIndex = prev.findIndex((i) => i._id === over.id)

      const reordered = arrayMove(prev, oldIndex, newIndex)

      return reordered.map((item, index) => ({
        ...item,
        order: (page - 1) * limit + index + 1,
      }))
    })
  }

  /* ================= SAVE ORDER ================= */
  const saveRouteOrder = async () => {
    try {
      if (!data.length) return

      const payload = {
        routes: data.map((item) => ({
          _id: item._id,
          order: item.order,
        })),
      }

      const res = await putRequest({
        url: 'transport/updateRouteOrder',
        cred: payload,
      })

      toast.success(res?.data?.message || 'Route order updated')
      setUpdateStatus((prev) => !prev)
    } catch (error) {
      toast.error('Failed to update order')
    }
  }

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)

    deleteRequest(`transport/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Route deleted')
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

    const selected = data.find((i) => i._id === id)
    if (!selected) return

    const newStatus = !selected.isActive
    setIsToggling(true)

    putRequest({
      url: `transport/${id}`,
      cred: { isActive: newStatus },
    })
      .then(() => {
        toast.success(`Route ${newStatus ? 'Activated' : 'Deactivated'}`)
        setData((prev) => prev.map((i) => (i._id === id ? { ...i, isActive: newStatus } : i)))
      })
      .catch(() => toast.error('Status update failed'))
      .finally(() => setIsToggling(false))
  }

  /* ================= DRAG UI ================= */
  const DragHandle = () => <MenuOutlined className="cursor-grab text-gray-500 hover:text-black" />

  const SortableRow = ({ id, children, className }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <tr ref={setNodeRef} style={style} className={className}>
        {React.Children.map(children, (child, index) =>
          index === 0 ? React.cloneElement(child, { ...attributes, ...listeners }) : child,
        )}
      </tr>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3">
          <div className="bg-white p-6 w-full max-w-md rounded">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-2" />
              <h3 className="font-semibold">Confirm Delete</h3>
            </div>

            <p className="mb-4">
              Delete <b>{selectedItem?.routeName}</b> ?
            </p>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 bg-white rounded border mb-6 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-semibold">
            <Layers className="text-[#e24028]" />
            Route Master
          </h1>
          <p className="text-sm text-gray-500">Manage routes</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Add Route
          </button>

          {/* <button onClick={saveRouteOrder} className="bg-purple-600 text-white px-4 py-2 rounded">
            Save Order
          </button> */}
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <RouteFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {/* ================= TABLE ================= */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader /> Loading...
          </div>
        )}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={data.map((i) => i._id)} strategy={verticalListSortingStrategy}>
              <table className="min-w-max border-collapse w-full table-fixed">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 70 }}>Sr.No.</th>
                    <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 160 }}>Route</th>
                    <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Code</th>
                    <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 140 }}>Start</th>
                    <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 140 }}>End</th>
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
                      <SortableRow key={item._id} id={item._id} className="border-t hover:bg-gray-50">
                        <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ minWidth: 70 }}>{(page - 1) * limit + index + 1}</td>
                        <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 160 }}>{item.routeName}</td>
                        <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>{item.routeCode}</td>
                        <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 140 }}>{item.startLocation}</td>
                        <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 140 }}>{item.endLocation}</td>
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
                      </SortableRow>
                    ))
                  )}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
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
        <RouteModal
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

export default RouteMaster
