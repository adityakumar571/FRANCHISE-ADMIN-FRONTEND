/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Edit2, Layers, Plus } from 'lucide-react'
import Marksheet from '../../../pages/Marks/Marksheet'
import { getRequest } from '../../../../Helpers'
import TeacherMarksModal from './TeacherMarksModal'
import Loader from '../../../../components/Loading/Loader'
import { SessionContext } from '../../../../Context/Seesion'

const TeacherViewMarks = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updateStatus, setUpdateStatus] = useState(false)
  const { currentSession } = useContext(SessionContext)
  const [prefillStudent, setPrefillStudent] = useState(null)

  useEffect(() => {
    if (!id) return
    if (!currentSession?._id) return
    setLoading(true)
    getRequest(`marks/getFullMarksheet?studentId=${id}&sessionId=${currentSession?._id}`)
      .then((res) => {
        setData(res?.data?.data || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, currentSession?._id, updateStatus])

  return (
    <div className="px-4 py-6">
      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT CONTENT */}
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Layers className="text-[#e24028] w-5 h-5 sm:w-6 sm:h-6" />
              Marksheet
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage marks and student details</p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsModalOpen(true)
                setPrefillStudent({
                  studentId: data?.studentDetails?.studentId,
                  classId: data?.classId?._id,
                  sectionId: data?.sectionId?._id,
                  streamId: data?.streamId?._id ,
                })
              }}
              className="bg-[#0c3b73] hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
              <Plus size={16} className="sm:w-4 sm:h-4" />
              Add Marks
            </button>
          </div>
        </div>
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-10">
          <Loader /> Loading Marks Data...
        </div>
      )}

      {/* ================= MARKSHEET ================= */}
      {!loading && data && <Marksheet data={data} currentSession={currentSession} />}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <TeacherMarksModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
          data={data}
          prefillStudent={prefillStudent}
        />
      )}
    </div>
  )
}

export default TeacherViewMarks
