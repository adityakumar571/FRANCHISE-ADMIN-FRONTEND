/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext } from 'react'
import { Layers, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination } from 'antd'
import ExamMasterModal from './ExamMasterModal'
import ExamFilters from './ExamFilters'
import Loader from '../../../components/Loading/Loader'

import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuOutlined } from '@ant-design/icons'
import { SessionContext } from '../../../Context/Seesion'

const ExamMaster = () => {
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
  const { currentSession } = useContext(SessionContext)
  /* ================= FETCH EXAMS ================= */
  useEffect(() => {
    if (!currentSession?._id) return
    setLoading(true)
    const query = new URLSearchParams({
      search: searchTerm,
      page,
      limit,
      session: currentSession._id,
    }).toString()

    getRequest(`exams?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.exams || [])
        setTotal(responseData?.totalExams || 0)
      })
      .catch(() => toast.error('Failed to fetch exams'))
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, updateStatus, currentSession])

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)

    deleteRequest(`exams/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Exam deleted')
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
      url: `exams/${id}`,
      cred: { isActive: newStatus },
    })
      .then(() => {
        toast.success(`Exam ${newStatus ? 'Activated' : 'Deactivated'}`)
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

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setData((prev) => {
      const oldIndex = prev.findIndex((i) => i._id === active.id)
      const newIndex = prev.findIndex((i) => i._id === over.id)

      const reordered = arrayMove(prev, oldIndex, newIndex)

      return reordered.map((item, index) => ({
        ...item,
        order: index + 1,
      }))
    })
  }

  /* ================= SAVE ORDER ================= */
  const saveExamOrder = async () => {
    try {
      if (!data.length) return

      const payload = {
        exams: data.map((item, index) => ({
          id: item._id,
          order: item.order ?? index + 1,
        })),
      }

      const res = await putRequest({
        url: 'exams/migrateExamOrder',
        cred: payload,
      })

      toast.success(res?.data?.message || 'Exam order updated successfully')
      setUpdateStatus((p) => !p)
    } catch (err) {
      toast.error('Failed to update exam order')
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
              Are you sure you want to delete <b>{selectedItem?.examName}</b>?
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
          {/* LEFT */}
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Layers className="text-[#e24028] w-5 h-5 sm:w-6 sm:h-6" />
              Exam Master
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage exams and their test</p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={() => {
                setSelectedItem(null)
                setIsModalOpen(true)
              }}
              className="bg-[#0c3b73] hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={16} className="sm:w-4 sm:h-4" />
              Add Exams
            </button>

            <button
              onClick={saveExamOrder}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold shadow-md"
            >
              Save Order
            </button>
          </div>
        </div>
      </div>

      {/* ================= FILTER ================= */}
      <ExamFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentSession={currentSession}
      />

      {/* ================= TABLE ================= */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-2 text-center">
            <Loader />
            <p>Loading records...</p>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={data.map((i) => i._id)} strategy={verticalListSortingStrategy}>
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-3 py-2 w-12 text-center"></th>
                    <th className="px-3 py-2 text-center w-20">Sr. No.</th>
                    <th className="px-3 py-2 text-center">Exam Name</th>
                    <th className="px-3 py-2 text-center">Exam Type</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>

                {data.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-gray-500">
                        No Records Found
                        <Empty />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {data.map((item, index) => (
                      <SortableRow key={item._id} id={item._id}>
                        {/* DRAG */}
                        <td className="border px-2 text-center">
                          <DragHandle />
                        </td>

                        <td className="border px-3 py-2 text-center">{index + 1}</td>
                        <td className="border px-3 py-2 text-center">{item.examName}</td>
                        <td className="border px-3 py-2 text-center">{item.category}</td>

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
                    ))}
                  </tbody>
                )}
              </table>
            </SortableContext>
          </DndContext>
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
              />
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <ExamMasterModal
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

export default ExamMaster
