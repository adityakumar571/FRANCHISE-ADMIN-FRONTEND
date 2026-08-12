/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-no-undef */
import React, { useContext, useEffect, useState } from 'react'
import { Users, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination } from 'antd'
import SessionFilter from './SessionFilter'
import SessionMasterModal from './SessionMasterModal'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuOutlined } from '@ant-design/icons'
import Loader from '../../../components/Loading/Loader'
import { SessionContext } from '../../../Context/Seesion'

const SessionMaster = () => {
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
  const { refreshSessions } = useContext(SessionContext)

  /* ================= FETCH SESSIONS ================= */
  useEffect(() => {
    setLoading(true)

    const query = new URLSearchParams({
      page,
      limit,
      search: searchTerm,
      sortBy: 'recent',
    }).toString()

    getRequest(`sessions?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.sessions || [])
        setTotal(responseData?.totalSessions || 0)
      })
      .catch(() => toast.error('Failed to fetch sessions'))
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, updateStatus])

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return

    setLoading(true)
    deleteRequest(`sessions/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Session deleted')
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
      url: `sessions/${id}`,
      cred: { isActive: newStatus },
    })
      .then(() => {
        toast.success(`Session ${newStatus ? 'Activated' : 'Deactivated'}`)
        setData((prev) =>
          prev.map((item) => (item._id === id ? { ...item, isActive: newStatus } : item)),
        )
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setIsToggling(false))
  }
  /* ================= DRAG & SAVE ORDER ================= */
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setData((prev) => {
      const oldIndex = prev.findIndex((i) => i._id === active.id)
      const newIndex = prev.findIndex((i) => i._id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)

      // Assign global order
      return reordered.map((item, index) => ({
        ...item,
        order: (page - 1) * limit + index + 1,
      }))
    })
  }

  const saveSessionOrder = async () => {
    try {
      const payload = {
        sessions: data.map((item) => ({
          id: item._id,
          order: item.order,
        })),
      }

      const res = await putRequest({
        url: 'sessions/migrateSessionOrder',
        cred: payload,
      })

      toast.success(res?.data?.message || 'Session order saved successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to save session order')
    }
  }

  const DragHandle = () => <MenuOutlined className="cursor-grab text-gray-500 hover:text-black" />
  const SortableRow = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <tr ref={setNodeRef} style={style}>
        {React.Children.map(children, (child, index) =>
          index === 0 ? React.cloneElement(child, { ...attributes, ...listeners }) : child,
        )}
      </tr>
    )
  }
  // const handleDragEnd = (event) => {
  //   const { active, over } = event
  //   if (!over || active.id === over.id) return

  //   setData((prev) => {
  //     const oldIndex = prev.findIndex((i) => i._id === active.id)
  //     const newIndex = prev.findIndex((i) => i._id === over.id)
  //     return arrayMove(prev, oldIndex, newIndex)
  //   })
  // }

  /* ================= DATE FORMAT ================= */
  const formatDDMMYYYY = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
      2,
      '0',
    )}/${d.getFullYear()}`
  }

  return (
    <div className="min-h-screen">
      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <b>{selectedItem?.sessionName}</b>?
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
      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Left content */}
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="text-[#e24028] w-5 h-5" />
              Session Master
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage academic sessions</p>
          </div>

          {/* Right buttons */}
          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={() => {
                setSelectedItem(null)
                setIsModalOpen(true)
              }}
              className="bg-[#0c3b73] hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={16} /> Add Session
            </button>

            <button
              onClick={saveSessionOrder}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold shadow-md"
            >
              Save Order
            </button>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <SessionFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* ================= TABLE ================= */}
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
                <th className="px-3 py-2 text-center"></th>
                <th className="px-3 py-2 text-center w-20">Sr.No.</th>
                <th className="px-3 py-2">Session Name</th>
                <th className="px-3 py-2 text-center">Current</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={data.map((i) => i._id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-6">
                        <Empty className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <SortableRow key={item._id} id={item._id}>
                        {/* DRAG HANDLE */}
                        <td className="border px-2 text-center">
                          <DragHandle />
                        </td>

                        {/* SR */}
                        <td className="border px-3 py-2 text-center">
                          {(page - 1) * limit + index + 1}
                        </td>

                        {/* SESSION NAME */}
                        <td className="border px-3 py-2">{item.sessionName}</td>

                        {/* CURRENT TOGGLE */}
                        <td className="border px-3 py-2 text-center">
                          <label className="relative inline-flex cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item.isCurrent}
                              onChange={async () => {
                                try {
                                  const res = await putRequest({
                                    url: `sessions/${item._id}`,
                                    cred: { isCurrent: true },
                                  })

                                  // ✅ NOW res is defined
                                  toast.success(
                                    res?.data?.message || 'Session updated successfully',
                                  )
                                  refreshSessions()

                                  // ✅ UI sync (only one current)
                                  setData((prev) =>
                                    prev.map((s) => ({
                                      ...s,
                                      isCurrent: s._id === item._id,
                                    })),
                                  )
                                } catch (err) {
                                  toast.error(
                                    err?.response?.data?.message || 'Failed to update session',
                                  )
                                }
                              }}
                            />
                            <div className="w-9 h-5 bg-red-300 peer-checked:bg-green-500 rounded-full" />
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-4 transition" />
                          </label>
                        </td>
                        <td className="border px-3 py-2 text-center">
                          <label className="relative inline-flex cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item.isActive}
                              onChange={() =>
                                putRequest({
                                  url: `sessions/${item._id}`,
                                  cred: { isActive: !item.isActive },
                                })
                                  .then((res) => {
                                    // ✅ TOAST SHOW
                                    toast.success(
                                      res?.data?.message || 'Session status updated successfully',
                                    )

                                    // ✅ UI UPDATE
                                    setData((prev) =>
                                      prev.map((s) =>
                                        s._id === item._id ? { ...s, isActive: !s.isActive } : s,
                                      ),
                                    )
                                  })
                                  .catch((err) => {
                                    toast.error(
                                      err?.response?.data?.message ||
                                        'Failed to update session status',
                                    )
                                  })
                              }
                            />
                            <div className="w-9 h-5 bg-red-300 peer-checked:bg-green-500 rounded-full" />
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-4 transition" />
                          </label>
                        </td>
                        {/* STATUS */}
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

                        {/* ACTION */}
                      </SortableRow>
                    ))
                  )}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        )}
        {/* PAGINATION */}
        {!loading && data.length > 0 && (
          <div className="px-6 py-4 border flex justify-between">
            <span className="text-sm">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </span>

            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              showSizeChanger
              onChange={(p) => setPage(p)}
              onShowSizeChange={(c, s) => {
                setLimit(s)
                setPage(1)
              }}
            />
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <SessionMasterModal
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

export default SessionMaster
