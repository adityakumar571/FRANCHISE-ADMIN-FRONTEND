import React, { useContext, useEffect, useState } from 'react'
import { Users, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination } from 'antd'
import ClassMasterModal from './ClassMasterModal'
import ClassFilter from './classFilter'
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

const ClassMaster = () => {
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const { currentSession } = useContext(SessionContext)
  const [isSenior, setIsSenior] = useState('')

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    if (!currentSession?._id) return
    setLoading(true)
    const queryParams = {
      search: searchTerm,
      page,
      limit,
      session: currentSession?._id,
    }

    if (isSenior !== '') {
      queryParams.isSenior = isSenior
    }

    const query = new URLSearchParams(queryParams).toString()

    getRequest(`classes?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.classes || [])
        setTotal(responseData?.totalClasses || 0)
      })
      .catch(() => toast.error('Failed to fetch classes'))
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, currentSession, isSenior, updateStatus])

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    deleteRequest(`classes/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Class deleted')
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
      url: `classes/${id}`,
      cred: { isActive: newStatus },
    })
      .then(() => {
        toast.success(`Class ${newStatus ? 'Activated' : 'Deactivated'}`)
        setData((prev) =>
          prev.map((item) => (item._id === id ? { ...item, isActive: newStatus } : item)),
        )
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setIsToggling(false))
  }

  /* ================= DRAG AND DROP ================= */
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

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setData((prev) => {
      const oldIndex = prev.findIndex((i) => i._id === active.id)
      const newIndex = prev.findIndex((i) => i._id === over.id)

      const reordered = arrayMove(prev, oldIndex, newIndex)

      return reordered.map((item, index) => ({
        ...item,
        order: index + 1, // ✅ order recalculated
      }))
    })
  }

  const saveClassOrder = async () => {
    try {
      if (!data.length) return

      const payload = {
        classes: data.map((item, index) => ({
          id: item._id,
          order: item.order ?? index + 1,
        })),
      }

      const res = await putRequest({
        url: 'classes/migrateClassOrder',
        cred: payload,
      })

      toast.success(res?.data?.message || 'Class order updated successfully')
      setUpdateStatus((prev) => !prev)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update class order')
    }
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
              Are you sure you want to delete <b>{selectedItem?.name}</b>?
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="text-[#e24028] w-5 h-5 sm:w-6 sm:h-6" />
              Class Master
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage classes used across the school system
            </p>
          </div>

          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={() => {
                setSelectedItem(null)
                setIsModalOpen(true)
              }}
              className="bg-[#0c3b73] hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={16} /> Add Class
            </button>

            <button
              onClick={saveClassOrder}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold shadow-md"
            >
              Save Order
            </button>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <ClassFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setPage={setPage}
        isSenior={isSenior}
        setIsSenior={setIsSenior}
      />

      {/* ================= TABLE ================= */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-2 text-center">
            <Loader />
            <p>Loding records...</p>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={data.map((i) => i._id)} strategy={verticalListSortingStrategy}>
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-3 py-2 w-12 text-center"></th>
                    <th className="px-3 py-2 text-center w-20">Sr. No.</th>
                    <th className="px-3 py-2">Class Name</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center w-40">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500">
                        {/* <Empty className="w-8 h-8 mx-auto mb-2 text-gray-400" /> */}
                        <Empty />
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

                        <td className="border px-3 py-2 text-center">{index + 1}</td>
                        <td className="border px-3 py-2">{item.name}</td>

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
                      </SortableRow>
                    ))
                  )}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        )}
        {/* PAGINATION */}
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
                pageSizeOptions={['5', '10', '15']}
                onChange={(newPage) => setPage(newPage)}
                showSizeChanger={true}
                onShowSizeChange={(current, size) => {
                  setLimit(size)
                  setPage(1)
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <ClassMasterModal
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

export default ClassMaster
