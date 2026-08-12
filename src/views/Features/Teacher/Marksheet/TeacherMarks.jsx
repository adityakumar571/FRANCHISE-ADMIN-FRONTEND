/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Layers, Plus, Eye, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import TeacherMarksModal from './TeacherMarksModal'
import TeacherMarksFilters from './TeacherMarksFilters'
import CsvUploadModal from '../../../pages/Marks/CsvUploadModal'
import { useNavigate } from 'react-router-dom'
import { getRequest } from '../../../../Helpers'
import Loader from '../../../../components/Loading/Loader'
import { useApp } from '../../../../Context/AppContext'
import { SessionContext } from '../../../../Context/Seesion'

const TeacherMarks = () => {
  const navigate = useNavigate()
  const { user } = useApp()

  const assignedClasses = user?.profile?.classesAssigned || []

  const [filters, setFilters] = useState({
    classId: '',
    sectionId: '',
  })
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [prefillStudent, setPrefillStudent] = useState(null)
  const { currentSession } = useContext(SessionContext)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    if (!filters.classId || !filters.sectionId || !currentSession?._id) return

    setLoading(true)

    const query = new URLSearchParams({
      classId: filters.classId,
      sectionId: filters.sectionId,
      streamId: filters.streamId || '',
      sessionId: currentSession._id,
    }).toString()

    getRequest(`marks/getClassWiseMarksSummary?${query}`)
      .then((res) => {
        setData(res?.data?.data?.students || [])
      })
      .catch(() => toast.error('Failed to fetch marks'))
      .finally(() => setLoading(false))
  }, [filters, currentSession,updateStatus])

  return (
    <div className="min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT CONTENT */}
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Layers className="text-[#e24028] w-5 h-5 sm:w-6 sm:h-6" />
              My Classes
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage classes sections and their marks details
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCsvModalOpen(true)}
              disabled={!filters.classId || !filters.sectionId}
              title={!filters.classId || !filters.sectionId ? 'Pehle filter mein Class & Section select karke Apply karo' : 'Upload marks via Excel'}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white 
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
                setIsModalOpen(true)
              }}
              className="bg-[#0c3b73]  hover:bg-blue-600 text-white 
                   px-3 py-2 sm:px-4 sm:py-2 
                   rounded flex items-center justify-center gap-2
                   text-sm  w-full sm:w-auto text-sm"
            >
              <Plus size={16} className="sm:w-4 sm:h-4" />
              Add Marks
            </button>
          </div>
        </div>
      </div>

      {/* ---------- FILTER ---------- */}
      <TeacherMarksFilters assignedClasses={assignedClasses} onApply={setFilters} />

      {loading && (
        <div className="flex justify-center py-10">
          <Loader />
          Loading Marks Data ....
        </div>
      )}

      {/* ---------- TABLE ---------- */}
      {!loading && (
        <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-center">Sr.No.</th>
                <th className="p-2 text-center">Student</th>
                <th className="p-2 text-center">Obtained</th>
                <th className="p-2 text-center">Total</th>
                <th className="p-2 text-center">Result</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No Records Found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2 text-center">{index + 1}</td>

                    <td className="border p-2 text-center">{item?.name || '-'}</td>

                    <td className="border p-2 text-center">{item?.totalObtained || 0}</td>

                    <td className="border p-2 text-center">{item?.totalMarks || 0}</td>

                    <td className="border p-2 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          item?.result === 'PASS'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item?.result || '-'}
                      </span>
                    </td>

                    <td className="border p-2 text-center flex gap-2 justify-center">
                      {/* VIEW */}
                      <button
                        onClick={() => navigate(`/techer/marks/viewMarks/${item.studentId}`)}
                        className="text-green-600"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- MODAL ---------- */}
      {isModalOpen && (
        <TeacherMarksModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
        />
      )}

      {/* ---------- CSV UPLOAD MODAL ---------- */}
      <CsvUploadModal
        open={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        setUpdateStatus={setUpdateStatus}
        userRole="teacher"
        teacherData={{
          classId: filters.classId,
          sectionId: filters.sectionId,
          streamId: filters.streamId || '',
        }}
      />
    </div>
  )
}

export default TeacherMarks
