/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { BookOpen, Plus, Edit, Trash2, AlertTriangle, Filter, Calendar, Search, X, ClipboardList, FolderOpen } from 'lucide-react'
import { DatePicker, Empty, Pagination, Tooltip } from 'antd'
import { toast } from 'react-toastify'
import { deleteRequest, getRequest } from '../../Helpers'
import { SessionContext } from '../../Context/Seesion'
import AdminHomeworkAssignModal from './AdminHomeworkAssignModal'
import dayjs from 'dayjs'
import Loader from '../../components/Loading/Loader'

const AdminHomeworkAssign = () => {
  const { currentSession } = useContext(SessionContext)

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const [allClasses, setAllClasses] = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filters, setFilters] = useState({ classId: '', sectionId: '', subjectId: '', fromDate: '', toDate: '', search: '' })
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    getRequest('classes?isPagination=false')
      .then(res => setAllClasses(res?.data?.data?.classes || []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!localFilters.classId) { setSections([]); return }
    getRequest(`sections?classId=${localFilters.classId}&isPagination=false`)
      .then(res => setSections(res?.data?.data?.sections || []))
      .catch(console.error)
  }, [localFilters.classId])

  useEffect(() => {
    if (!localFilters.classId) { setSubjects([]); return }
    getRequest(`subjects?classId=${localFilters.classId}&isPagination=false`)
      .then(res => setSubjects(res?.data?.data?.subjects || []))
      .catch(console.error)
  }, [localFilters.classId])

  useEffect(() => {
    if (!currentSession?._id) return
    fetchHomework()
  }, [page, limit, updateStatus, currentSession, filters])

  const fetchHomework = async () => {
    try {
      setLoading(true)
      let url = `homework?page=${page}&limit=${limit}`
      if (filters.classId) url += `&classId=${filters.classId}`
      if (filters.sectionId) url += `&sectionId=${filters.sectionId}`
      if (filters.subjectId) url += `&subjectId=${filters.subjectId}`
      if (filters.fromDate) url += `&fromDate=${filters.fromDate}`
      if (filters.toDate) url += `&toDate=${filters.toDate}`
      const res = await getRequest(url)
      setData(res?.data?.data?.list || [])
      setTotal(res?.data?.data?.pagination?.totalRows || 0)
    } catch {
      toast.error('Failed to fetch homework')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => { setFilters(localFilters); setPage(1) }
  const handleClearFilters = () => {
    const reset = { classId: '', sectionId: '', subjectId: '', fromDate: '', toDate: '', search: '' }
    setLocalFilters(reset); setFilters(reset); setPage(1)
  }

  const handleDelete = async () => {
    if (!selectedItem?._id) return
    try {
      setLoading(true)
      await deleteRequest(`homework/${selectedItem._id}`)
      toast.success('Homework deleted')
      setUpdateStatus(p => !p)
      setShowDeleteModal(false)
      setSelectedItem(null)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  const displayed = data.filter(item => {
    if (!localFilters.search) return true
    const q = localFilters.search.toLowerCase()
    return item.title?.toLowerCase().includes(q) || item.classId?.name?.toLowerCase().includes(q) || item.subjectId?.name?.toLowerCase().includes(q)
  })

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'
  const isOverdue = (d) => d && new Date(d) < new Date()

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
              Are you sure you want to delete <b>"{selectedItem?.title}"</b>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={loading} className={`px-5 py-2 text-sm text-white rounded ${loading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'}`}>
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
            <p className="text-sm text-gray-500">
              {currentSession?.sessionName || 'Current Session'} &middot; {total} total records
            </p>
          </div>
          <button
            onClick={() => { setEditData(null); setIsModalOpen(true) }}
            className="bg-[#0c3b73] hover:bg-blue-800 text-sm text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Assign Homework
          </button>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>
        <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
          {/* Search */}
          <div className="w-full xl:max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search title, class, subject..."
                value={localFilters.search}
                onChange={e => setLocalFilters(p => ({ ...p, search: e.target.value }))}
                className="w-full h-[38px] pl-9 pr-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Class */}
          <div className="w-full sm:w-44">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={localFilters.classId}
              onChange={e => setLocalFilters(p => ({ ...p, classId: e.target.value, sectionId: '', subjectId: '' }))}
              className="w-full h-[38px] border border-gray-300 rounded-md text-sm px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {allClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          {/* Section */}
          <div className="w-full sm:w-44">
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={localFilters.sectionId}
              onChange={e => setLocalFilters(p => ({ ...p, sectionId: e.target.value }))}
              disabled={!localFilters.classId}
              className="w-full h-[38px] border border-gray-300 rounded-md text-sm px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">All Sections</option>
              {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          {/* Subject */}
          <div className="w-full sm:w-44">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={localFilters.subjectId}
              onChange={e => setLocalFilters(p => ({ ...p, subjectId: e.target.value }))}
              disabled={!localFilters.classId}
              className="w-full h-[38px] border border-gray-300 rounded-md text-sm px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          {/* From Date */}
          <div className="w-full sm:w-44">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <DatePicker
              format="DD-MM-YYYY"
              placeholder="From Date"
              value={localFilters.fromDate ? dayjs(localFilters.fromDate) : null}
              onChange={(date) => setLocalFilters(p => ({ ...p, fromDate: date ? dayjs(date).format('YYYY-MM-DD') : '' }))}
              className="w-full h-[38px]"
            />
          </div>
          {/* To Date */}
          <div className="w-full sm:w-44">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <DatePicker
              format="DD-MM-YYYY"
              placeholder="To Date"
              value={localFilters.toDate ? dayjs(localFilters.toDate) : null}
              onChange={(date) => setLocalFilters(p => ({ ...p, toDate: date ? dayjs(date).format('YYYY-MM-DD') : '' }))}
              className="w-full h-[38px]"
            />
          </div>
          {/* Buttons */}
          <button onClick={handleApplyFilters} className="bg-[#0c3b73] hover:bg-[#1b5498] text-white px-6 py-2 rounded h-[38px]">
            Apply
          </button>
          <button onClick={handleClearFilters} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded h-[38px]">
            Reset
          </button>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader />
            <span className="mt-2 text-sm text-gray-500">Loading Homework...</span>
          </div>
        )}

        {!loading && displayed.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Empty description={<span className="text-gray-400 text-sm">No Homework Found</span>} />
          </div>
        ) : (
          <table className="min-w-max border-collapse w-full">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ width: 70 }}>Sr.No</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 220 }}>Title</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 180 }}>Description</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Type</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 160 }}>Subject</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Class</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Section</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 160 }}>Attachments</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 130 }}>Assign Date</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 130 }}>Due Date</th>
                <th className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((item, idx) => {
                const overdue = isOverdue(item.dueDate)
                return (
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
                    <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 180 }}>
                      <Tooltip title={item.description}>
                        <div className="truncate text-gray-600">{item.description || '--'}</div>
                      </Tooltip>
                    </td>

                    {/* TYPE */}
                    <td className="px-3 py-2 text-center bg-white" style={{ minWidth: 120 }}>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.homeworkType === 'ASSIGNMENT' ? 'bg-blue-100 text-blue-600'
                        : item.homeworkType === 'PROJECT' ? 'bg-orange-100 text-orange-600'
                        : 'bg-green-100 text-green-600'
                      }`}>
                        {item.homeworkType === 'ASSIGNMENT' ? 'Assignment'
                          : item.homeworkType === 'PROJECT' ? 'Project'
                          : 'Homework'}
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
                      {formatDate(item.assignDate)}
                    </td>

                    {/* DUE DATE */}
                    <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 130 }}>
                      <span className={overdue ? 'text-red-500 font-medium' : 'text-gray-600'}>
                        {formatDate(item.dueDate)}
                      </span>
                      {overdue && <div className="text-[10px] text-red-400">Overdue</div>}
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
                )
              })}
            </tbody>
          </table>
        )}

        {/* ── PAGINATION ── */}
        {!loading && displayed.length > 0 && (
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
        <AdminHomeworkAssignModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          editData={editData}
          setUpdateStatus={setUpdateStatus}
        />
      )}
    </div>
  )
}

export default AdminHomeworkAssign
