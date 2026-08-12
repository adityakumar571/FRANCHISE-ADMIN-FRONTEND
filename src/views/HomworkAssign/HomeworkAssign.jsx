/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { AlertTriangle, BookOpen, Edit, Plus, Trash2, Filter } from 'lucide-react'
import { Empty, Pagination, Tooltip } from 'antd'
import HomeworkAssignModal from './HomeworkAssignModal'
import Loader from '../../components/Loading/Loader'
import { useApp } from '../../context/AppContext'
import { deleteRequest, getRequest } from '../../Helpers'
import { toast } from 'react-toastify'
import HomeworkFilter from './HomeworkFilter'

const HomeworkAssign = () => {
  const { user } = useApp()
  const [editData, setEditData] = useState(null)
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    classId: '',
    streamId: '',
    subjectId: '',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  })

  /* ================= FETCH ================= */
  useEffect(() => {
    if (user?.profile?._id) {
      fetchHomework()
    }
  }, [page, limit, updateStatus, user, filters])

  const fetchHomework = async () => {
    const teacherId = user?.profile?._id
    if (!teacherId) return
    try {
      setLoading(true)
      const res = await getRequest(
        `homework/teacher?teacherId=${teacherId}&page=${page}&limit=${limit}&classId=${filters.classId || ''}&streamId=${filters.streamId || ''}&subjectId=${filters.subjectId || ''}&fromDate=${filters.fromDate}&toDate=${filters.toDate}`
      )
      setData(res?.data?.data?.list || [])
      setTotal(res?.data?.data?.pagination?.totalRows || 0)
    } catch {
      toast.error('Failed to fetch homework')
    } finally {
      setLoading(false)
    }
  }

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!selectedItem?._id) return
    try {
      setLoading(true)
      const res = await deleteRequest(`homework/${selectedItem._id}`)
      toast.success(res?.data?.message || 'Deleted successfully')
      setUpdateStatus((prev) => !prev)
      setShowDeleteModal(false)
      setSelectedItem(null)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  const assigned = user?.profile?.classesAssigned || []
  const classList = [...new Map(assigned.map((item) => [item.classId?._id, item.classId])).values()]
  const streamList = [...new Map(assigned.filter((item) => item.stream).map((item) => [item.stream._id, item.stream])).values()]
  const subjectList = [...new Map(assigned.map((item) => [item.subjectId?._id, item.subjectId])).values()]

  return (
    <div className="min-h-screen">

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <b>{selectedItem?.title}</b>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className={`px-5 py-2 text-sm text-white rounded ${loading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="px-4 py-3 bg-white rounded border mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="text-[#e24028]" />
              Homework Management
            </h1>
            <p className="text-sm text-gray-500">Manage and track homework assignments</p>
          </div>
          <button
            onClick={() => { setEditData(null); setIsModalOpen(true) }}
            className="bg-[#0c3b73] hover:bg-blue-800 text-sm text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Add Homework
          </button>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <HomeworkFilter
        filters={filters}
        setFilters={setFilters}
        setPage={setPage}
        classList={classList}
        streamList={streamList}
        subjectList={subjectList}
      />

      {/* ── TABLE ── */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader />
            <span className="mt-2 text-sm text-gray-500">Loading Homework...</span>
          </div>
        )}

        {!loading && data.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Empty description={<span className="text-gray-400 text-sm">No Homework Found</span>} />
          </div>
        ) : (
          <table className="min-w-max border-collapse w-full">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ width: 70 }}>Sr.No</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 220 }}>Title</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 220 }}>Description</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Type</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 160 }}>Subject</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Class</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Section</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 150 }}>Teacher</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 160 }}>Attachments</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 130 }}>Assign Date</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 130 }}>Due Date</th>
                <th className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item._id} className="hover:bg-gray-50 transition border-t border-gray-100">

                  {/* SR NO */}
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ width: 70 }}>
                    {(page - 1) * limit + idx + 1}
                  </td>

                  {/* TITLE */}
                  <td className="px-3 py-2 bg-white" style={{ minWidth: 220 }}>
                    <Tooltip title={item.title}>
                      <div className="font-medium text-gray-800 truncate">{item.title}</div>
                    </Tooltip>
                  </td>

                  {/* DESCRIPTION */}
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 220 }}>
                    <Tooltip title={item.description}>
                      <div className="truncate text-gray-600">{item.description || '--'}</div>
                    </Tooltip>
                  </td>

                  {/* TYPE */}
                  <td className="px-3 py-2 text-center bg-white" style={{ minWidth: 120 }}>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.homeworkType === 'ASSIGNMENT'
                        ? 'bg-orange-100 text-orange-600'
                        : item.homeworkType === 'PROJECT'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.homeworkType}
                    </span>
                  </td>

                  {/* SUBJECT */}
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 160 }}>
                    {item.subjectId?.name || '--'}
                  </td>

                  {/* CLASS */}
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 120 }}>
                    {item.classId?.name || '--'}
                  </td>

                  {/* SECTION */}
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 120 }}>
                    {item.sectionId?.name || '--'}
                  </td>

                  {/* TEACHER */}
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 150 }}>
                    {item.teacherId?.firstName} {item.teacherId?.lastName}
                  </td>

                  {/* ATTACHMENTS */}
                  <td className="px-3 py-2 bg-white" style={{ minWidth: 160 }}>
                    {item.attachments?.length > 0 ? (
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <Tooltip placement="top" color="#fff" overlayInnerStyle={{ padding: 6, borderRadius: 8 }}
                            title={<img src={item.attachments[0]} alt="preview" className="w-48 h-48 object-cover rounded-lg" />}
                          >
                            <a href={item.attachments[0]} target="_blank" rel="noreferrer">
                              <img src={item.attachments[0]} alt="attachment" className="w-9 h-9 rounded-lg object-cover border cursor-pointer hover:scale-110 transition" />
                            </a>
                          </Tooltip>
                          {item.attachments.length > 1 && (
                            <Tooltip placement="top" title={
                              <div className="flex flex-wrap gap-2 p-1 max-h-64 overflow-y-auto">
                                {item.attachments.slice(1).map((file, i) => (
                                  <a key={i} href={file} target="_blank" rel="noreferrer">
                                    <img src={file} alt="attachment" className="w-16 h-16 rounded object-cover border" />
                                  </a>
                                ))}
                              </div>
                            }>
                              <div className="absolute -top-1 -right-6 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold border border-white cursor-pointer hover:bg-blue-200">
                                +{item.attachments.length - 1}
                              </div>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No File</span>
                    )}
                  </td>

                  {/* ASSIGN DATE */}
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 130 }}>
                    {item.assignDate ? new Date(item.assignDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
                  </td>

                  {/* DUE DATE */}
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 130 }}>
                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
                  </td>

                  {/* ACTIONS */}
                  <td className="sticky right-0 z-10 bg-white px-3 py-2 text-center" style={{ minWidth: 130 }}>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip title="Edit">
                        <button
                          onClick={() => { setEditData(item); setIsModalOpen(true) }}
                          className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-full transition"
                        >
                          <Edit size={15} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <button
                          onClick={() => { setSelectedItem(item); setShowDeleteModal(true) }}
                          className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-full transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </Tooltip>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ── PAGINATION ── */}
        {!loading && data.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white">
            <span className="text-xs text-gray-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              onChange={(p) => setPage(p)}
              showSizeChanger
              onShowSizeChange={(c, size) => { setLimit(size); setPage(1) }}
              size="small"
            />
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <HomeworkAssignModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setUpdateStatus={setUpdateStatus}
          user={user}
          editData={editData}
        />
      )}
    </div>
  )
}

export default HomeworkAssign
