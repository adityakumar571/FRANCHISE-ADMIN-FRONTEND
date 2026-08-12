/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Printer, Filter, Bus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Pagination, Empty, Button, Modal, Select } from 'antd'
import { SessionContext } from '../../../../../Context/Seesion'
import { getRequest } from '../../../../../Helpers'
import ExportButton from '../../../../ExportExcelButton'
import { AppContext } from '../../../../../Context/AppContext'
import { getLedgerRowStatus, STATUS_COLORS, STATUS_LABELS, getItemDisplayStatus } from '../../../../../Utils/feeUtils'
import Loader from '../../../../../components/Loading/Loader'

const { Option } = Select

const FeeCollection = () => {
  const { currentSession } = useContext(SessionContext)

  /* ---------------- TEMP FILTERS ---------------- */
  const [tempSession, setTempSession] = useState('')
  const [tempClassId, setTempClassId] = useState('')
  const [tempSectionId, setTempSectionId] = useState('')
  const [sections, setSections] = useState([])
  const [streams, setStreams] = useState([])
  const [selectedStreamId, setSelectedStreamId] = useState('')
  const [updateStatus, setUpdateStatus] = useState(false)

  /* ---------------- APPLIED FILTERS ---------------- */
  const [classId, setClassId] = useState('')
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showMonthModal, setShowMonthModal] = useState(false)
  const [selectedMonthLedger, setSelectedMonthLedger] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [outstandingAmount, setOutstandingAmount] = useState(0)
  const [ledgerSummary, setLedgerSummary] = useState(null)

  const { tenantDetails } = useContext(AppContext)

  useEffect(() => {
    if (ledgerData.length > 0) {
      // Use backend's currentDue (only current/past months) for Outstanding Amount.
      // totalDue includes future months; currentDue matches visible table rows.
      if (ledgerSummary?.currentDue !== undefined) {
        setOutstandingAmount(parseFloat(ledgerSummary.currentDue))
      } else if (ledgerSummary?.totalDue !== undefined) {
        setOutstandingAmount(parseFloat(ledgerSummary.totalDue))
      } else {
        const total = calculateOutstanding(ledgerData)
        setOutstandingAmount(total)
      }
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

  // Load sections when class changes
  useEffect(() => {
    if (!tempClassId || !currentSession?._id) { setSections([]); setTempSectionId(''); return }
    getRequest(`sections?classId=${tempClassId}&session=${currentSession._id}&isPagination=false`)
      .then((res) => setSections(res.data?.data?.sections || []))
      .catch(console.error)
  }, [tempClassId, currentSession])

  useEffect(() => {
    if (!tempSession || !tempClassId || classes.length === 0) return
    const selectedClass = classes.find((c) => c._id === tempClassId)
    let url = `studentEnrollment?session=${tempSession}&currentClass=${tempClassId}`
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

  /* ---------------- LOAD FEE LEDGER ---------------- */
  useEffect(() => {
    if (!isApplied || !tempSession || !classId) return
    setApplyLoading(true)
    let url = `student-fees/ledger?sessionId=${tempSession}&classId=${classId}`
    if (appliedStudentId) {
      url += `&studentId=${appliedStudentId}`
    }
    const selectedClass = classes.find((c) => c._id === classId)
    if (selectedClass && isSeniorClass(selectedClass) && selectedStreamId) {
      url += `&streamId=${selectedStreamId}`
    }
    getRequest(url)
      .then((res) => {
        const data = res.data?.data
        if (!data?.student || !data?.ledger) {
          setStudentData(null)
          setLedgerData([])
          setLedgerSummary(null)
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

    // setSession(tempSession)
    setClassId(tempClassId)
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
    const printWindow = window.open('', '_blank', 'width=900,height=1000')

    printWindow.document.write(`
<html>
<head>
<meta charset="UTF-8"/>
<title>Fee Receipt</title>

<style>

@page{
 size:A4;
 margin:10mm;
}

body{
 font-family:Arial;
 width:210mm;
 margin:0;
}

.container{
 width:190mm;
 margin:auto;
 border:2px solid black;
 padding:15px;
}

.header{
 display:flex;
 justify-content:space-between;
 align-items:center;
 border-bottom:2px solid black;
 padding-bottom:10px;
}

.school{
 text-align:center;
 flex:1;
}

.school h2{
 margin:0;
}

.title{
 text-align:center;
 font-weight:bold;
 padding:8px;
 border-bottom:1px solid black;
 margin-top:5px;
}

.info-table{
 width:100%;
 margin-top:10px;
 font-size:13px;
}

.info-table td{
 padding:6px;
}

.table{
 width:100%;
 border-collapse:collapse;
 margin-top:12px;
 font-size:13px;
}

.table th,.table td{
 border:1px solid black;
 padding:7px;
 text-align:center;
}

.table th{
 background:#f2f2f2;
}

.total-row{
 font-weight:bold;
 background:#f9f9f9;
}

.signatures{
 display:flex;
 justify-content:space-between;
 margin-top:60px;
 text-align:center;
 font-size:13px;
}

</style>
</head>

<body>
<div class="container">
<!-- HEADER -->
<div class="header">
<div></div>
<div class="header" style="display: flex; align-items: center; justify-content: center; gap: 16px;">
  ${tenantDetails?.logo ? `<img src="${tenantDetails.logo}" alt="School Logo" style="width: 70px; height: 70px; object-fit: contain;" />` : ''}
  <div style="text-align: center;">
    <h1>${tenantDetails?.schoolName || 'YOUR SCHOOL NAME'}</h1>
    <p>${tenantDetails?.schoolAddress || 'School Address Line'}</p>
  </div>
</div>
<div></div>
</div>
<div class="title">
FEE PAYMENT RECEIPT - ${month.period}
</div>
<div style="
margin-top:10px;
font-size:13px;
display:grid;
grid-template-columns: 1fr 1fr 1fr;
gap:8px;
">
<div><b>Form No :</b> ${student.formNo}</div>
<div><b>Student ID :</b> ${student.studentId}</div>
<div><b>Name :</b> ${student.name}</div>
<div><b>Father Name :</b> ${student.fatherName}</div>
<div><b>Phone :</b> ${student.phone}</div>
<div><b>Class :</b> ${student.class}(${student.section}) ${student.stream}</div>
</div>
<!-- FEE TABLE -->
<table class="table">
<thead>
<tr>
<th>Sr.No.</th>
<th>Fee Head</th>
<th>Due Date</th>
<th>Total</th>
<th>Paid</th>
<th>Balance</th>
</tr>
</thead>
<tbody>
${month.items
  .filter((fee) => fee.type !== 'CONCESSION')
  .map(
    (fee, index) => {
      const concessionItem = month.items.find(f => f.type === 'CONCESSION')
      const concessionAmt = concessionItem ? Math.abs(Number(concessionItem.dueAmount)) : 0
      const isTuition = fee.type === 'TUITION' || (fee.feeHead || '').toLowerCase().includes('tuition')
      const showConcession = isTuition && concessionAmt > 0
      return `
<tr>
<td>${index + 1}</td>
<td>${fee.feeHead}${showConcession ? ` <span style="font-size:10px;color:#1d4ed8;font-style:italic;">(- ₹${concessionAmt} concession)</span>` : ''}${fee.isWaived && fee.waiverReason ? ` <span style="font-size:10px;color:#7c3aed;font-style:italic;">(${fee.waiverReason})</span>` : ''}</td>
<td>${fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-GB') : '-'}</td>
<td>${fee.isWaived ? '-' : `₹${fee.totalAmount}`}</td>
<td style="color:green;">${fee.isWaived ? '-' : `₹${fee.paidAmount}`}</td>
<td style="${fee.isWaived ? 'color:#7c3aed;text-decoration:line-through;' : 'color:red;'}">${fee.isWaived ? `₹${fee.totalAmount}` : `₹${fee.dueAmount}`}</td>
</tr>
`
    }
  )
  .join('')}
<tr class="total-row">
<td colspan="3">Grand Total</td>
<td>₹${month.totalAmount}</td>
<td>₹${month.totalPaid}</td>
<td>₹${month.totalDue}</td>
</tr>
</tbody>
</table>
<!-- NOTE -->
<div style="margin-top:10px;font-size:12px;">
<b>Note:</b> Please keep this receipt for future reference.
</div>
</div>

<script>
window.onload=function(){
window.print()
}
</script>

</body>
</html>
`)

    printWindow.document.close()
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
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="text-red-500" />
              Students Ledger
            </h1>
            <p className="text-sm text-gray-500">View student fee ledger details</p>
          </div>
          {isApplied && ledgerData.length > 0 && (
            <ExportButton data={ledgerData} fileName="FeeCollection.xlsx" sheetName="Fee Ledger" />
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Class */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-600 mb-1">Class</label>
            <Select
              allowClear
              placeholder="Select Class"
              value={tempClassId || undefined}
              className="w-[180px]"
              onChange={(v) => setTempClassId(v || '')}
            >
              {classes.map((c) => (
                <Option key={c._id} value={c._id}>{c.name}</Option>
              ))}
            </Select>
          </div>

          {showStreamFilter && (
            <div className="flex flex-col">
              <label className="font-medium text-gray-600 mb-1">Stream</label>
              <Select
                allowClear
                placeholder="Select Stream"
                value={selectedStreamId || undefined}
                className="w-[180px]"
                onChange={(v) => setSelectedStreamId(v || '')}
              >
                {streams.map((s) => (
                  <Option key={s._id} value={s._id}>{s.name}</Option>
                ))}
              </Select>
            </div>
          )}

          {/* Section */}
          {tempClassId && sections.length > 0 && (
            <div className="flex flex-col">
              <label className="font-medium text-gray-600 mb-1">Section</label>
              <Select
                allowClear
                placeholder="All Sections"
                value={tempSectionId || undefined}
                className="w-[160px]"
                onChange={(v) => setTempSectionId(v || '')}
              >
                {sections.map((s) => (
                  <Option key={s._id} value={s._id}>{s.name}</Option>
                ))}
              </Select>
            </div>
          )}

          {/* Search Student */}
          <div className="flex flex-col relative">
            <label className="font-medium text-gray-600 mb-1">Search Student</label>
            <input
              className="border border-gray-300 rounded-md w-64 py-[5px] px-3 text-sm focus:outline-none focus:border-blue-400"
              placeholder="Type name / student id"
              value={searchStudentText}
              onChange={(e) => {
                const value = e.target.value
                setSearchStudentText(value)
                setShowStudentDropdown(true)
                if (!value) setSelectedStudentId('')
              }}
              onFocus={() => setShowStudentDropdown(true)}
            />
            {tempClassId && showStudentDropdown && studentOptions.length > 0 && (
              <div className="absolute top-full left-0 z-50 bg-white border rounded-md w-64 max-h-56 overflow-y-auto shadow mt-1">
                {filteredStudentsForSearch.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No students found</div>
                ) : (
                  filteredStudentsForSearch.map((s) => (
                    <div
                      key={s._id}
                      className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSearchStudentText(`${s.firstName} ${s.lastName} (${s.studentId}) - ${s.fatherName || ''}`)
                        setSelectedStudentId(s?._id)
                        setShowStudentDropdown(false)
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {s.firstName} {s.lastName}
                          <span className="text-xs text-gray-500 ml-2">({s.studentId})</span>
                        </span>
                        {s.fatherName && <span className="text-xs text-gray-600">{s.fatherName}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col">
            <label className="text-xs opacity-0 mb-1">Action</label>
            <Button
              loading={applyLoading}
              disabled={applyLoading}
              className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white"
              onClick={applyFilter}
            >
              Apply
            </Button>
          </div>

          {isApplied && (
            <div className="flex flex-col">
              <label className="text-xs opacity-0 mb-1">Action</label>
              <Button className="border" onClick={clearFilter}>Clear</Button>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {isApplied && ledgerData.length > 0 && ledgerSummary && (
        <div className="bg-white border rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Fee Summary — {studentData?.name}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center border">
              <p className="text-xs text-gray-500 mb-1">Total Fee</p>
              <p className="text-base font-bold text-gray-800">₹{ledgerSummary.totalFee}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
              <p className="text-xs text-blue-500 mb-1">Concession</p>
              <p className="text-base font-bold text-blue-700">₹{ledgerSummary.concession}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
              <p className="text-xs text-purple-500 mb-1">Net Payable</p>
              <p className="text-base font-bold text-purple-700">₹{ledgerSummary.netPayable}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
              <p className="text-xs text-green-500 mb-1">Total Paid</p>
              <p className="text-base font-bold text-green-700">₹{ledgerSummary.totalPaid}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
              <p className="text-xs text-red-500 mb-1">Total Due</p>
              <p className="text-base font-bold text-red-700">₹{ledgerSummary.totalDue}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
              <p className="text-xs text-orange-500 mb-1">Current Due</p>
              <p className="text-base font-bold text-orange-700">₹{ledgerSummary.currentDue}</p>
            </div>
          </div>
          {/* Late Fee row if exists */}
          {parseFloat(ledgerSummary.lateFee) > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
                <p className="text-xs text-yellow-600 mb-1">Late Fee Total</p>
                <p className="text-sm font-bold text-yellow-700">₹{ledgerSummary.lateFee}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
                <p className="text-xs text-yellow-600 mb-1">Late Fee Paid</p>
                <p className="text-sm font-bold text-yellow-700">₹{ledgerSummary.lateFeePaid}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
                <p className="text-xs text-yellow-600 mb-1">Late Fee Due</p>
                <p className="text-sm font-bold text-yellow-700">₹{ledgerSummary.lateFeeDue}</p>
              </div>
            </div>
          )}
        </div>
      )}

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
        <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
          {applyLoading && (
            <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center"><Loader /></div>
          )}
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
                    className="border-b hover:bg-gray-50 cursor-pointer"
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
                      <td className="px-3 py-2 text-sm text-center">
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
                      <td className="px-3 py-2 text-sm text-center">{formatDate(item.dueDate)}</td>
                      <td className="px-3 py-2 text-sm text-center">
                        <div>₹{item.totalAmount}</div>
                        {showConcession && (
                          <div className="text-[11px] text-blue-600 font-medium mt-0.5">- ₹{concessionAmt} concession</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-green-600">{`₹${item.paidAmount}`}</td>
                      <td className="px-3 py-2 text-sm text-center">
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
                      <td className="px-3 py-2 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${itemColor}`}>
                          {itemLabel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>

              {/* Total footer */}
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
                  <td className="px-3 py-2 text-sm text-center">Total</td>
                  <td />
                  <td className="px-3 py-2 text-sm text-center">₹{selectedMonthLedger.totalAmount}</td>
                  <td className="px-3 py-2 text-sm text-center text-green-600">₹{selectedMonthLedger.totalPaid}</td>
                  <td className="px-3 py-2 text-sm text-center text-red-600">₹{selectedMonthLedger.totalDue}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          )
        })()}
      </Modal>
    </div>
  )
}

export default FeeCollection
