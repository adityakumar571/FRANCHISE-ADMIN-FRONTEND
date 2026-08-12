/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Printer, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { Pagination, Empty, Button, Modal, Tooltip } from 'antd'
import FeePaymentModal from './AddCollection'
import { SessionContext } from '../../../../Context/Seesion'
import { getRequest } from '../../../../Helpers'
import ExportButton from '../../../ExportExcelButton'
import { AppContext } from '../../../../Context/AppContext'
import { getLedgerRowStatus, STATUS_COLORS, STATUS_LABELS, getItemDisplayStatus } from '../../../../Utils/feeUtils'
import { Bus, Plus } from 'lucide-react'
import { buildSingleMonthReceiptHTML, buildFeeReceiptPageHTML, generateReceiptPdfBlob, sharePdfOnWhatsApp } from './receiptUtils'

const FeeCollection = () => {
  const { currentSession } = useContext(SessionContext)
  const { tenantDetails, user } = useContext(AppContext)
  const collectedByName = user?.user?.name || user?.user?.fullName || 'Staff'

  /* ---------------- TEMP FILTERS ---------------- */
  const [tempSession, setTempSession] = useState('')
  const [tempClassId, setTempClassId] = useState('')
  const [streams, setStreams] = useState([])
  const [selectedStreamId, setSelectedStreamId] = useState('')
  const [sections, setSections] = useState([])
  const [tempSectionId, setTempSectionId] = useState('')
  const [updateStatus, setUpdateStatus] = useState(false)

  /* ---------------- APPLIED FILTERS ---------------- */
  const [classId, setClassId] = useState('')
  const [appliedSectionId, setAppliedSectionId] = useState('')
  const [isApplied, setIsApplied] = useState(false)
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  const [searchStudentText, setSearchStudentText] = useState('')
  const [appliedStudentId, setAppliedStudentId] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)

  /* ---------------- DATA ---------------- */
  const [classes, setClasses] = useState([])
  const [studentData, setStudentData] = useState(null)
  const [ledgerData, setLedgerData] = useState([])
  const [studentOptions, setStudentOptions] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')

  /* ---------------- UI ---------------- */
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [total, setTotal] = useState(0)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showMonthModal, setShowMonthModal] = useState(false)
  const [selectedMonthLedger, setSelectedMonthLedger] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [outstandingAmount, setOutstandingAmount] = useState(0)
  const [ledgerSummary, setLedgerSummary] = useState(null)
  const [sharingRow, setSharingRow] = useState(null) // period key of row being shared

  useEffect(() => {
    if (ledgerData.length > 0) {
      if (ledgerSummary?.totalDue !== undefined) {
        setOutstandingAmount(parseFloat(ledgerSummary.totalDue))
      } else {
        setOutstandingAmount(calculateOutstanding(ledgerData))
      }
    } else {
      setOutstandingAmount(0)
    }
  }, [ledgerData, ledgerSummary])

  const isSeniorClass = (classObj) => {
    return classObj?.isSenior === true
  }

  const convertToQuarter = (month) => {
    const map = {
      APRIL: 'APR-JUN',
      MAY: 'APR-JUN',
      JUNE: 'APR-JUN',

      JULY: 'JUL-SEP',
      AUGUST: 'JUL-SEP',
      SEPTEMBER: 'JUL-SEP',

      OCTOBER: 'OCT-DEC',
      NOVEMBER: 'OCT-DEC',
      DECEMBER: 'OCT-DEC',

      JANUARY: 'JAN-MAR',
      FEBRUARY: 'JAN-MAR',
      MARCH: 'JAN-MAR',
    }

    return map[month] || month
  }

  /* ---------------- DEFAULT SESSION ---------------- */
  useEffect(() => {
    if (currentSession?._id) {
      setTempSession(currentSession._id)
    }
  }, [currentSession])

  /* ---------------- LOAD CLASSES ---------------- */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res.data?.data?.classes || []))
      .catch(console.error)
  }, [currentSession])

  useEffect(() => {
    setSelectedStudentId('')
    setSearchStudentText('')
    setStudentOptions([])
    setSelectedStreamId('')
    setSections([])
    setTempSectionId('')
  }, [tempClassId])

  useEffect(() => {
    if (!tempSession || !tempClassId || classes.length === 0) return
    const selectedClass = classes.find((c) => c._id === tempClassId)
    let url = `studentEnrollment?session=${tempSession}&currentClass=${tempClassId}&isPagination=false&sortBy=rollNumber`
    if (selectedClass?.isSenior && selectedStreamId) {
      url += `&stream=${selectedStreamId}`
    }
    if (tempSectionId) {
      url += `&currentSection=${tempSectionId}`
    }
    getRequest(url)
      .then((res) => {
        setStudentOptions(res.data?.data?.students || [])
      })
      .catch(console.error)
  }, [tempSession, tempClassId, tempSectionId, selectedStreamId, classes])

  // ✅ classes add karo
  useEffect(() => {
    const selectedClass = classes.find((c) => c._id === tempClassId)
    if (!selectedClass) return
    if (isSeniorClass(selectedClass)) {
      getRequest(`streams?classId=${tempClassId}`)
        .then((res) => setStreams(res.data?.data?.streams || []))
        .catch(console.error)
    } else {
      setStreams([])
      setSelectedStreamId('')
    }
  }, [tempClassId, classes])

  // ===== LOAD SECTIONS by classId =====
  useEffect(() => {
    if (!tempClassId || !currentSession?._id) {
      setSections([])
      setTempSectionId('')
      return
    }
    getRequest(`sections?classId=${tempClassId}&session=${currentSession._id}&isPagination=false`)
      .then((res) => setSections(res.data?.data?.sections || []))
      .catch(console.error)
  }, [tempClassId, currentSession])

  /* ---------------- LOAD FEE LEDGER ---------------- */
  useEffect(() => {
    if (!isApplied || !tempSession || !classId || !appliedStudentId) return
    let url = `student-fees/ledger?sessionId=${tempSession}&classId=${classId}&studentId=${appliedStudentId}`
    const selectedClass = classes.find((c) => c._id === classId)
    // ✅ CORRECT CHECK
    if (selectedClass && isSeniorClass(selectedClass) && selectedStreamId) {
      url += `&streamId=${selectedStreamId}`
    }
    getRequest(url)
      .then((res) => {
        const data = res.data?.data
        if (!data?.student || !data?.ledger) {
          setStudentData(null)
          setLedgerData([])
          return
        }
        setStudentData(data.student)
        setLedgerSummary(data.summary || null)

        const rawLedger = data.ledger || []
        const grouped = {}

        rawLedger.forEach((item) => {
          const key =
            currentSession?.installmentType === 'QUARTERLY'
              ? convertToQuarter(item.period)
              : item.period

          if (!grouped[key]) {
            grouped[key] = {
              ...item,
              period: key,
              totalAmount: Number(item.totalAmount),
              totalPaid: Number(item.totalPaid),
              totalDue: Number(item.totalDue),
              items: [...item.items],
            }
          } else {
            grouped[key].totalAmount += Number(item.totalAmount)
            grouped[key].totalPaid += Number(item.totalPaid)
            grouped[key].totalDue += Number(item.totalDue)
            grouped[key].items.push(...item.items)
          }
        })

        const finalLedger = Object.values(grouped)

        setLedgerData(finalLedger)
        setTotal(finalLedger.length)
        setPage(1)
        setSelectedRows([])
        setSelectedAmount(0)
      })
      .catch((err) => {
        console.error(err)
        setStudentData(null)
        setLedgerData([])
      })
      .finally(() => {
        setApplyLoading(false)
      })
  }, [isApplied, tempSession, classId, appliedStudentId, selectedStreamId, updateStatus])

  /* ---------------- SEARCH + PAGINATION ---------------- */
  const paginatedData = ledgerData.slice((page - 1) * limit, page * limit)
  const filteredStudentsForSearch = studentOptions.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.studentId} ${s.fatherName || ''}`
      .toLowerCase()
      .includes(searchStudentText.toLowerCase()),
  )

  /* ---------------- APPLY & CLEAR ---------------- */
  const applyFilter = () => {
    if (!currentSession?._id || !tempClassId) {
      toast.error('Please select class')
      return
    }
    if (!selectedStudentId) {
      toast.error('Please select a student')
      return
    }

    setApplyLoading(true)
    setClassId(tempClassId)
    setAppliedSectionId(tempSectionId)
    setSelectedStreamId(selectedStreamId)
    setAppliedStudentId(selectedStudentId)
    setIsApplied(true)
    setPage(1)
  }

  const clearFilter = () => {
    // setTempSession('')
    setTempClassId('')
    setTempSectionId('')
    // setSession('')
    setClassId('')
    setAppliedSectionId('')
    setStudentData(null)
    setLedgerData([])
    setLedgerSummary(null)
    setStudentOptions([])
    setSelectedStudentId('')
    setAppliedStudentId('')
    setSearchStudentText('')
    setShowStudentDropdown(false)
    setSelectedStreamId('')
    setSections([])
    setIsApplied(false)
  }

  const selectedTempClass = classes.find((c) => c._id === tempClassId)
  const showStreamFilter = selectedTempClass && isSeniorClass(selectedTempClass)

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN')
  }

  const handlePrint = (month, student) => {
    const printWindow = window.open('', '_blank', 'width=900,height=1200')
    if (!printWindow) { toast?.error?.('Pop-up blocked. Please allow pop-ups.'); return }

    const studentObj = {
      name:            student?.name            || '-',
      fatherName:      student?.fatherName      || '-',
      class:           student?.class           || student?.className   || '-',
      section:         student?.section         || student?.sectionName || '',
      stream:          student?.stream          || '',
      studentId:       student?.studentId       || '',
      studentIdNumber: student?.studentId       || student?.studentIdNumber || '',
      formNo:          student?.formNo          || student?.registrationNo || '-',
      phone:           student?.phone           || '-',
    }

    const html = buildSingleMonthReceiptHTML({
      month,
      student: studentObj,
      tenantDetails,
      collectedByName,
    })

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  // WhatsApp share for a specific ledger row (month)
  const handleWhatsAppShare = async (month, student) => {
    setSharingRow(month.period)
    try {
      const html = buildSingleMonthReceiptHTML({
        student,
        month,
        tenantDetails,
        collectedByName,
      })
      const blob = await generateReceiptPdfBlob(html)
      const fileName = `Fee_Receipt_${(student.name || 'Student').replace(/\s+/g, '_')}_${month.period}.pdf`
      await sharePdfOnWhatsApp(blob, fileName, student.phone, student.name, {
        schoolName: tenantDetails?.schoolName || '',
        amountPaid: month.totalPaid,
        totalPaid: month.totalPaid,
        paymentMode: month.paymentMode || null,
        receiptNo: month.receiptNos?.length ? month.receiptNos.join(', ') : null,
      })
    } catch (err) {
      console.error(err)
      toast.error('Could not generate or share receipt PDF')
    } finally {
      setSharingRow(null)
    }
  }

  const calculateOutstanding = (ledger) => {
    const today = new Date()
    let total = 0

    ledger.forEach((month) => {
      month.items.forEach((item) => {
        if (item.type === 'CONCESSION') return // concession items skip karo
        const dueDate = new Date(item.dueDate)
        if (dueDate <= today) {
          total += Number(item.dueAmount || 0)
        }
      })
    })

    return total
  }
  const currentDate = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white rounded-lg border px-4 py-2 mb-6 flex items-center">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <IndianRupee className="text-[#e24028]" />
            Fee Collection
          </h1>
          <p className="text-sm text-gray-500 mt-1">View and manage student fee payments</p>
        </div>

        {isApplied && ledgerData.length > 0 && (
          <div className="ml-auto">
            <ExportButton data={ledgerData} fileName="FeeCollection.xlsx" sheetName="Fee Ledger" />
          </div>
        )}
      </div>

      {/* FILTERS */}

      <div className="bg-white rounded border p-4 mb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2 relative">
          <div className="flex items-center  gap-1">
            <div className=" rounded-lg flex items-center justify-center ">
              <Filter className="w-5 h-5 text-orange-500 " />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-0">Filters & Search</h3>
            </div>
          </div>
        </div>

        <div className=" flex flex-wrap gap-4  text-sm">
          {/* Class */}
          <div className="w-40">
            <label className="mb-1">Class</label>
            <select
              className="border rounded-md w-full py-2 px-4"
              value={tempClassId}
              onChange={(e) => setTempClassId(e.target.value)}
            >
              <option value="">Select</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="w-40">
            <label className="mb-1">Section</label>
            <select
              className="border rounded-md w-full py-2 px-4 disabled:bg-gray-100"
              value={tempSectionId}
              onChange={(e) => setTempSectionId(e.target.value)}
              disabled={!sections.length}
            >
              <option value="">{tempClassId ? 'All Sections' : 'Select Class first'}</option>
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {showStreamFilter && (
            <div className="w-40">
              <label className="mb-1">Stream</label>
              <select
                className="border rounded-md w-full py-2 px-4"
                value={selectedStreamId}
                onChange={(e) => setSelectedStreamId(e.target.value)}
              >
                <option value="">Select Stream</option>
                {streams.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search */}
          <div className="w-64 relative">
            <label className="mb-1">Search Student</label>
            <input
              className="border rounded-md w-full py-2 px-4"
              placeholder="Type name / student id"
              value={searchStudentText}
              onChange={(e) => {
                const value = e.target.value
                setSearchStudentText(value)
                setShowStudentDropdown(true)

                if (!value) {
                  setSelectedStudentId('')
                }
              }}
              onFocus={() => setShowStudentDropdown(true)}
            />

            {/* DROPDOWN */}
            {tempClassId && showStudentDropdown && studentOptions.length > 0 && (
              <div className="absolute z-50 bg-white border rounded-md w-full max-h-56 overflow-y-auto shadow">
                {filteredStudentsForSearch.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No students found</div>
                ) : (
                  filteredStudentsForSearch.map((s) => (
                    <div
                      key={s._id}
                      className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        setSearchStudentText(
                          `${s.firstName} ${s.lastName} (${s.studentId}) - ${s.fatherName || ''}`,
                        )
                        setSelectedStudentId(s?._id)

                        setShowStudentDropdown(false)
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {s.firstName} {s.lastName}
                          <span className="text-xs text-gray-500 ml-2">({s.studentId})</span>
                        </span>
                        {s.fatherName && (
                          <span className="text-xs text-gray-600">{s.fatherName}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={applyFilter}
              disabled={applyLoading}
              className={`px-4 py-2 rounded text-white flex items-center gap-2
    ${applyLoading ? 'bg-[#0c3b73] cursor-not-allowed' : 'bg-[#0c3b73]'}
  `}
            >
              {applyLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {applyLoading ? 'Applying...' : 'Apply'}
            </button>

            <button onClick={clearFilter} className="border px-4 py-2 rounded">
              Clear
            </button>
          </div>
          {isApplied && ledgerData.length > 0 && (
            <div className="ml-auto text-right mr-4">
              <div className="text-black font-bold text-lg mb-2">Fee Ledger ({currentDate})</div>

              {ledgerSummary && (
                <div className="text-gray-600 text-sm mb-1 flex flex-wrap gap-x-3 gap-y-1 items-center">
                  <span>Gross Fee : ₹{ledgerSummary.grossTotal || ledgerSummary.totalFee}</span>
                  {parseFloat(ledgerSummary.concession) > 0 && (
                    <><span className="text-gray-400">|</span><span>Concession : ₹{ledgerSummary.concession}</span></>
                  )}
                  {parseFloat(ledgerSummary.waived || 0) > 0 && (
                    <><span className="text-gray-400">|</span><span className="text-violet-600">Waived : ₹{ledgerSummary.waived}</span></>
                  )}
                  <span className="text-gray-400">|</span>
                  <span className="font-semibold text-gray-800">Net Payable : ₹{ledgerSummary.netPayable}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-green-600 font-semibold">Total Paid : ₹{ledgerSummary.totalPaid}</span>
                </div>
              )}

              <div className="text-red-600 font-semibold text-lg">
                Outstanding Amount : ₹{outstandingAmount}
              </div>

              <button
                className="bg-[#0c3b73] mt-4 hover:bg-[#0c3b73] text-white px-6 py-2 rounded-md font-medium shadow"
                onClick={() => {
                  let amountToPay = selectedAmount

                  if (selectedRows.length === 0) {
                    const firstDue = ledgerData.find((l) => l.totalDue > 0)
                    amountToPay = firstDue?.totalDue || 0
                  }

                  setSelectedStudent({
                    sessionId: currentSession?._id,
                    studentId: appliedStudentId,        // MongoDB _id for API calls
                    classId: classId,
                    streamId: selectedStreamId || null,
                    stream: studentData?.stream || null,
                    name: studentData?.name,
                    fatherName: studentData?.fatherName || '',
                    studentIdNumber: studentData?.studentId,  // human-readable ID
                    formNo: studentData?.formNo || studentData?.registrationNo || '',
                    className: studentData?.class,
                    sectionName: studentData?.section,
                    phone: studentData?.phone || '',
                    amount: amountToPay,
                  })
                  setIsModalOpen(true)
                }}
              >
                Pay Now
              </button>
            </div>
          )}

          {/* PAY NOW ACTION BAR */}
        </div>
      </div>

      {/* TABLE / EMPTY STATES */}
      {!isApplied ? (
        <div className="bg-white border rounded-lg p-6 text-center">
          <Empty description="Please select filters and click Apply to show data" />
        </div>
      ) : ledgerData.length === 0 ? (
        <div className="bg-white border rounded-lg p-6 text-center">
          <Empty description="No Fee Records Found" />
        </div>
      ) : (
        <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-200">
              <tr>
                {[
                  'Sr. No.',
                  'Month',
                  'Total Amount',
                  'Paid Amount',
                  'Due Amount',
                  'Status',
                  'Action',
                ].map((h) => (
                  <th key={h} className="px-4 py-2 text-center text-sm font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item, i) => {
                const status = getLedgerRowStatus(item)
                const statusColor = STATUS_COLORS[status]

                return (
                  <tr
                    key={item.period}
                    className="border-b hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      setSelectedMonthLedger(item)
                      setShowMonthModal(true)
                    }}
                  >
                    {/* CHECKBOX COLUMN */}
                    {/* <td className="text-center">
                      <input
                        type="checkbox"
                        checked={
                          item.totalDue === 0 || selectedRows.some((r) => r.period === item.period)
                        }
                        disabled={item.totalDue === 0 || item.totalPaid > 0}
                        onChange={(e) => handleCheckboxChange(e.target.checked, item)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td> */}
                    <td className="text-center py-2 w-20">{(page - 1) * limit + i + 1}</td>
                    <td className="text-center font-semibold">{item.period}</td>
                    <td className="text-center font-semibold">₹{item.totalAmount}</td>
                    <td className="text-center text-green-600 font-semibold">₹{item.totalPaid}</td>
                    <td className="text-center text-red-600 font-semibold">₹{item.totalDue}</td>
                    <td className="text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                        {STATUS_LABELS[status] || status}
                      </span>
                    </td>
                    <td className="text-center">
                      <Button
                        size="small"
                        type="link"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePrint(item, studentData)
                        }}
                      >
                        <Printer size={13} /> Print
                      </Button>
                      <Tooltip title={studentData?.phone ? `Send to ${studentData.phone}` : 'No phone number'}>
                        <Button
                          size="small"
                          type="link"
                          loading={sharingRow === item.period}
                          disabled={sharingRow === item.period}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleWhatsAppShare(item, studentData)
                          }}
                          style={{ color: '#25D366', paddingLeft: 4 }}
                        >
                          {sharingRow === item.period ? null : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 13, height: 13, display: 'inline', verticalAlign: 'middle' }}>
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          )}
                          {' '}WhatsApp
                        </Button>
                      </Tooltip>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="p-4 flex justify-end">
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              pageSizeOptions={['5', '10', '20', '50', '100', '200', '500', '1000']}
              showSizeChanger
              showQuickJumper
              onChange={(newPage) => setPage(newPage)}
              onShowSizeChange={(_current, size) => {
                setLimit(size)
                setPage(1)
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <FeePaymentModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          studentData={selectedStudent}
          setUpdateStatus={setUpdateStatus}
          ledgerData={ledgerData}
        />
      )}

       <Modal
        open={showMonthModal}
        onCancel={() => setShowMonthModal(false)}
        footer={null}
        centered
        width={700}
        destroyOnHidden
        title={
          <span className="text-lg font-semibold">{selectedMonthLedger?.period} Fee Details</span>
        }
      >
        {selectedMonthLedger && (() => {
          const concessionItem = selectedMonthLedger.items.find(i => i.type === 'CONCESSION')
          const concessionAmt = concessionItem ? Math.abs(Number(concessionItem.dueAmount)) : 0
          const regularItems = selectedMonthLedger.items.filter(i => i.type !== 'CONCESSION')

          return (
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  {['Fee Head', 'Due Date', 'Total', 'Paid', 'Due', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2 text-sm font-semibold text-center">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {regularItems.map((item) => {
                  const { label: itemLabel, color: itemColor } = getItemDisplayStatus(item, selectedMonthLedger)
                  const isTuition = item.type === 'TUITION' || item.feeHead?.toLowerCase().includes('tuition')
                  const showConcession = isTuition && concessionAmt > 0

                  return (
            <tr key={item.referenceId} className="border-b">
  <td className="text-center px-3 py-2">
    <div className="flex items-center justify-center gap-1">
      {item.type === 'TRANSPORT' && (
        <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-700">
          <Bus size={12} />
        </span>
      )}
      {item.type === 'ADDITIONAL' && (
        <span className="flex items-center justify-center w-5 h-5 rounded bg-purple-100 text-purple-700">
          <Plus size={12} />
        </span>
      )}
      {item.feeHead}
      {item.isWaived && (
        <span className="ml-1 text-[11px] text-purple-500 italic font-normal">
          {item.waiverReason ? `(${item.waiverReason})` : '(Waived)'}
        </span>
      )}
    </div>
  </td>
  <td className="text-center px-3 py-2">{formatDate(item.dueDate)}</td>
  <td className="text-center px-3 py-2">
    <div>₹{item.totalAmount}</div>
    {showConcession && (
      <div className="text-[11px] text-blue-600 font-medium mt-0.5">- ₹{concessionAmt} concession</div>
    )}
  </td>
  <td className="text-center px-3 py-2 text-green-600">{`₹${item.paidAmount}`}</td>
  <td className="text-center px-3 py-2">
    {item.isWaived ? (
      <span className="text-purple-500 line-through">₹{item.dueAmount}</span>
    ) : showConcession ? (
      <div>
        <span className="text-gray-400 line-through text-xs">₹{Number(item.totalAmount).toFixed(2)}</span>
        <div className="text-red-600">₹{item.dueAmount}</div>
      </div>
    ) : (
      <span className="text-red-600">₹{item.dueAmount}</span>
    )}
  </td>
  <td className="text-center px-3 py-2">
    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${itemColor}`}>
      {itemLabel}
    </span>
  </td>
</tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          )
        })()}
      </Modal>
    </div>
  )
}

export default FeeCollection
