/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Layers, Edit, Trash2, Plus, AlertTriangle, Eye, Upload } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination } from 'antd'
import MarksFilters from './MarksFilters'
import MarksModal from './MarksModal'
import CsvUploadModal from './CsvUploadModal'
import Loader from '../../../components/Loading/Loader'
import { useNavigate } from 'react-router-dom'
import { SessionContext } from '../../../Context/Seesion'

const Marks = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [prefillStudent, setPrefillStudent] = useState(null)
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    examListId: '',
    classId: '',
    sectionId: '',
    streamId: '',
    result: '',
    session: '',
  })
  const { currentSession } = useContext(SessionContext)

  useEffect(() => {
    if (!filters.classId || !currentSession?._id) return

    setLoading(true)

    const query = new URLSearchParams({
      classId: filters.classId,
      sectionId: filters.sectionId || '',
      streamId: filters.streamId || '',
      examListId: filters.examListId || '',
      sessionId: currentSession._id,
      search: filters.search || '',
    }).toString()

    getRequest(`marks/getClassWiseMarksSummary?${query}`)
      .then((res) => {
        const responseData = res?.data?.data?.students || []
        setData(responseData)
        setTotal(responseData.length)
      })
      .catch(() => toast.error('Failed to fetch class wise marks summary'))
      .finally(() => setLoading(false))
  }, [filters, currentSession, updateStatus])

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)

    deleteRequest(`marks/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Section deleted')
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
  }
  const getStudentFullName = (item) => {
    return item?.name || '-'
  }

  const getRelationText = (item) => {
    return item?.fatherName ? `S/o ${item.fatherName}` : ''
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
          {/* LEFT CONTENT */}
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Layers className="text-[#e24028] w-5 h-5 sm:w-6 sm:h-6" />
              Marks Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage classes sections and their marks details
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCsvModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white 
                   px-3 py-2 sm:px-4 sm:py-2 
                   rounded flex items-center justify-center gap-2
                   text-sm w-full sm:w-auto"
            >
              <Upload size={16} />
              Upload CSV
            </button>
            <button
              onClick={() => {
                setSelectedItem(null)
                setPrefillStudent(null)
                setIsModalOpen(true)
              }}
              className="bg-[#0c3b73] hover:bg-blue-600 text-white 
                   px-3 py-2 sm:px-4 sm:py-2 
                   rounded flex items-center justify-center gap-2
                   text-sm w-full sm:w-auto"
            >
              <Plus size={16} className="sm:w-4 sm:h-4" />
              Add Marks
            </button>
          </div>
        </div>
      </div>
      {/* ================= FILTER ================= */}

      <MarksFilters
        onApply={(newFilters) => {
          setFilters(newFilters)
          setPage(1)
        }}
      />

      {loading && (
        <div className="flex flex-col justify-center items-center py-10">
          <Loader /> Loading Marks Data ....
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!loading && (
        <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 text-center">Sr. No.</th>
                <th className="px-3 py-2 text-center">Student Name</th>
                <th className="px-3 py-2 text-center">Class</th>
                <th className="px-3 py-2 text-center">Section</th>
                <th className="px-3 py-2 text-center">Streams</th>
                <th className="px-3 py-2 text-center">Obtained Marks</th>
                <th className="px-3 py-2 text-center">Total Marks</th>
                <th className="px-3 py-2 text-center">Percentage</th>
                <th className="px-3 py-2 text-center">Result Status</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    Please select class to show data
                    <Empty />
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">{index + 1}</td>

                    {/* Student Name */}
                    <td className="border px-3 py-2 text-center">
                      <div className="font-semibold text-gray-800">{getStudentFullName(item)}</div>

                      <div className="text-xs text-gray-500">{getRelationText(item)}</div>
                    </td>

                    {/* Class */}
                    <td className="border px-3 py-2 text-center"> {item?.class || '-'}</td>

                    {/* Section */}
                    <td className="border px-3 py-2 text-center"> {item?.section || '-'}</td>

                    {/* Streams */}
                    <td className="border px-3 py-2 text-center"> {item?.stream?.name || '-'}</td>

                    {/* Obtained Marks */}
                    <td className="border px-3 py-2 text-center">{item?.totalObtained || 0} </td>

                    {/* Total Marks */}
                    <td className="border px-3 py-2 text-center">{item?.totalMarks || 0}</td>

                    {/* Percentage */}
                    <td className="border px-3 py-2 text-center">
                      {item?.percentage ? `${item.percentage}%` : '0%'}
                    </td>

                    {/* Result */}
                    <td className="border px-3 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item?.result === 'PASS'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item?.result || '-'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="border px-3 py-2 text-center">
                      <button
                        onClick={() => navigate(`/marks/viewMarks/${item.studentId}`)}
                        className="text-green-600 hover:bg-green-600 hover:text-white p-2 rounded"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

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
      )}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <MarksModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
          prefillStudent={prefillStudent}
          setPrefillStudent={setPrefillStudent}
        />
      )}

      {/* ================= CSV UPLOAD MODAL ================= */}
      <CsvUploadModal
        open={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        setUpdateStatus={setUpdateStatus}
      />
    </div>
  )
}

export default Marks
