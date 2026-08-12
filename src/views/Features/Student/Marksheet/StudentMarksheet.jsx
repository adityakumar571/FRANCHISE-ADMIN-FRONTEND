/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext, useRef } from 'react'
import Marksheet from '../../../pages/Marks/Marksheet'
import Loader from '../../../../components/Loading/Loader'
import { getRequest } from '../../../../Helpers'
import { SessionContext } from '../../../../Context/Seesion'
import { useRoles } from '../../../../Context/AuthContext'
import { useApp } from '../../../../Context/AppContext'
import { Layers, Printer } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

const StudentMarksheet = () => {
  const { currentSession, loading: sessionLoading } = useContext(SessionContext)


  const { role } = useRoles()
  const { user } = useApp()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
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
    if (role !== 'Student') return
    if (!user?.profile?._id) return
    if (!currentSession?._id) return

    setLoading(true)

    getRequest(
      `marks/getFullMarksheet?studentId=${user?.profile?._id}&sessionId=${currentSession._id}&publishedOnly=true`,
    )
      .then((res) => {
        setData(res.data.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [role, user, currentSession])

  //   if (loading || sessionLoading) {
  //     return (
  //       <div className="flex justify-center py-10">
  //         <Loader /> Loading Marksheet...
  //       </div>
  //     )
  //   }

  //   return <>{data && <Marksheet data={data} />}</>
  // }

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
        </div>
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-10">
          <Loader /> Loading Marksheet...
        </div>
      )}

      {/* ================= MARKSHEET ================= */}
      {!loading && data && (
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
      )}
    </div>
  )
}
export default StudentMarksheet
