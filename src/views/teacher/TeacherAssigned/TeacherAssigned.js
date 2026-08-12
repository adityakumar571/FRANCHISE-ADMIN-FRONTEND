/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { AlertTriangle, Edit, Plus, Trash2, Users } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination, Spin } from 'antd'
import TeacherAssignedFilters from './TeacherAssignedFilters'
import { SessionContext } from '../../../Context/Seesion'
import TeacherAssignedModal from './TeacherAssignedModal'
import Loader from '../../../components/Loading/Loader'

const TeacherAssigned = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData] = useState(null)
  const [teacherList, setTeacherList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [appliedTeacherId, setAppliedTeacherId] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  /* ================= LOAD TEACHERS ================= */
  useEffect(() => {
    getRequest('teachers?isPagination=false')
      .then((res) => {
        setTeacherList(res?.data?.data?.teachers || [])
      })
      .catch(() => toast.error('Failed to fetch teachers'))
  }, [])

  /* ================= FETCH ASSIGNED CLASSES ================= */
  useEffect(() => {
    if (!appliedTeacherId || !currentSession?._id) return

    setLoading(true)

    const query = new URLSearchParams({
      session: currentSession._id,
      search: searchTerm,
      page,
      limit,
    }).toString()

    getRequest(`teachers/${appliedTeacherId}/assigned-classes?${query}`)
      .then((res) => {
        const response = res?.data?.data
        setData(response)
        setTotal(res?.data?.pagination?.totalRows || response?.classesAssigned?.length || 0)
      })
      .catch(() => toast.error('Failed to fetch assigned classes'))
      .finally(() => {
        setLoading(false)
        setIsApplying(false)
      })
  }, [page, limit, searchTerm, appliedTeacherId, currentSession, updateStatus])

  /* ================= RESET ================= */
  const handleReset = () => {
    setSearchTerm('')
    setSelectedTeacherId('')
    setAppliedTeacherId('')
    setPage(1)
    setLimit(10)
    setData(null)
    setTotal(0)
  }

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    deleteRequest(`subjects/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Class deleted')
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
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
              <Users className="text-[#e24028] w-5 h-5 sm:w-6 sm:h-6" />
              Teacher Assigned Class
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              View teacher class, section & subject lists{' '}
            </p>
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] hover:bg-[#1b5498] text-white 
                 px-3 py-2 sm:px-4 sm:py-2 
                 rounded flex items-center justify-center gap-2
                 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={16} className="sm:w-4 sm:h-4" />
            Add Assigned Class
          </button>
        </div>
      </div>

      {/* ================= FILTER ================= */}
      <TeacherAssignedFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTeacherId={selectedTeacherId}
        setSelectedTeacherId={setSelectedTeacherId}
        teacherList={teacherList}
        isApplying={isApplying}
        setPage={setPage}
        onApply={() => {
          setIsApplying(true)
          setAppliedTeacherId(selectedTeacherId)
          setPage(1)
        }}
        onReset={handleReset}
        isFilterApplied={!!appliedTeacherId}
      />

      {/* ================= TABLE ================= */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-3 py-2 text-center">Sr No.</th>
              <th className="border px-3 py-2 text-center">Teacher ID</th>
              <th className="border px-3 py-2 text-center">Teacher Name</th>
              <th className="border px-3 py-2 text-center">Session</th>
              <th className="border px-3 py-2 text-center">Class</th>
              <th className="border px-3 py-2 text-center">Section</th>
              <th className="border px-3 py-2 text-center">Stream</th>
              <th className="border px-3 py-2 text-center">Subject</th>
              <th className="border px-3 py-2 text-center">Class Teacher</th>
              <th className="border px-3 py-2 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-6">
                  {/* <BookStackLoader /> */}
                  <Loader />
                </td>
              </tr>
            ) : !appliedTeacherId ? (
              <tr>
                <td colSpan="10" className="text-center py-6 text-gray-500">
                  Please select Teacher
                  <Empty />
                </td>
              </tr>
            ) : !data || data.classesAssigned.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-6 text-gray-500">
                  No Records Found
                </td>
              </tr>
            ) : (
              data.classesAssigned.map((assigned, idx) => (
                <tr key={assigned._id}>
                  <td className="border px-3 py-2 text-center">{idx + 1}</td>

                  <td className="border px-3 py-2 text-center">{data.employeeId}</td>

                  <td className="border px-3 py-2 text-center">
                    {data.firstName} {data.lastName}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {currentSession?.sessionName || '-'}
                  </td>

                  <td className="border px-3 py-2 text-center">{assigned.classId?.name || '-'}</td>

                  <td className="border px-3 py-2 text-center">
                    {assigned.sectionId?.name || '-'}
                  </td>

                  <td className="border px-3 py-2 text-center">{assigned.stream?.name || '-'}</td>

                  <td className="border px-3 py-2 text-center">
                    {assigned.subjectId?.name || '-'}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {assigned.isClassTeacher ? 'Yes' : 'No'}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(assigned)
                          setIsModalOpen(true)
                        }}
                        className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedItem(assigned)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded"
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

        {/* ---------- Pagination ---------- */}
        {!loading && data?.classesAssigned?.length > 0 && (
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
        <TeacherAssignedModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
          selectedClassId={selectedClassId}
        />
      )}
    </div>
  )
}

export default TeacherAssigned
