/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Marksheet from './Marksheet'
import { getRequest } from '../../../Helpers'
import MarksModal from './MarksModal'
import { Edit2, Layers, Plus, Printer } from 'lucide-react'
import Loader from '../../../components/Loading/Loader'
import { SessionContext } from '../../../Context/Seesion'
import { useReactToPrint } from 'react-to-print'
import { Empty } from 'antd'

const ViewMarks = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [modaltitle, setModalTitle] = useState('add')
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updateStatus, setUpdateStatus] = useState(false)
  const { currentSession, loading: sessionLoading } = useContext(SessionContext)
  const [prefillStudent, setPrefillStudent] = useState(null)

  const printRef = useRef()

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${data?.studentDetails?.name || 'Marksheet'}_Marksheet`,
    pageStyle: `
      @page { 
        size: A4; 
        margin: 10mm; 
      }
      @media print { 
        body { 
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  })

  useEffect(() => {
    if (!id) return
    if (!currentSession?._id) return
    setLoading(true)
    getRequest(`marks/getFullMarksheet?studentId=${id}&sessionId=${currentSession._id}`)
      .then((res) => {
        setData(res.data.data)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, currentSession, updateStatus])

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
                setModalTitle('add')
                setSelectedItem(null)
                setIsModalOpen(true)
                setPrefillStudent({
                  classId: data?.classId?._id || '',
                  sectionId: data?.sectionId?._id || '',
                  streamId: data?.streamId?._id || '',
                  studentId: data?.studentDetails?.studentId || '',
                })
              }}
              className="bg-[#0c3b73] hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
              <Plus size={16} className="sm:w-4 sm:h-4" />
              Add Marks
            </button>

            <button
              onClick={() => {
                setModalTitle('edit')
                setIsModalOpen(true)
              }}
              className="bg-[#0c3b73] hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
              <Edit2 size={16} className="sm:w-4 sm:h-4" />
              Edit Marks
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
      {/* {!loading && data && <Marksheet data={data} currentSession={currentSession} />} */}

      {!loading && data ? (
        <div className="relative">
          {/* PRINT BUTTON */}
          <button
            disabled={!data}
            onClick={handlePrint}
            className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1 text-xs md:text-sm z-10 print:hidden"
          >
            <Printer size={16} />
            Print
          </button>

          {/* MARKSHEET */}
          <div ref={printRef}>
            <Marksheet data={data} currentSession={currentSession} />
          </div>
        </div>
      ) : !loading ? (
        // 🔴 EMPTY STATE UI
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Empty />

          <p className="text-sm text-gray-500 mb-4">This student does not have a marksheet yet.</p>
        </div>
      ) : null}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <MarksModal
          modaltitle={modaltitle}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
          data={data}
          prefillStudent={prefillStudent} // 🔹 new prop
        />
      )}
    </div>
  )
}

export default ViewMarks
