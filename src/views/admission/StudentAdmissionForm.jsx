/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react'
import { useEffect } from 'react'
import { deleteRequest, getRequest } from '../../Helpers/index.js'
import { Search, Plus, Edit, Trash2, AlertTriangle, GraduationCap, Filter } from 'lucide-react'
import { Pagination } from 'antd'
import StudentAdmissionFormModal from '../../modals/StudentAdmissionFormModal.jsx'
import ExportButton from '../../components/ExportButton.jsx'
import { Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import Loader from '../../components/Loading/Loader.jsx'
import { SessionContext } from '../../Context/Seesion.js'
import { AppContext } from '../../Context/AppContext.js'

const StudentAdmissionForm = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [student, setstudent] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [applyFilter, setApplyFilter] = useState(false)
  const [tempClassId, setTempClassId] = useState('')
  const [exportData, setExportData] = useState([])
  const [exportLoading, setExportLoading] = useState(false)
  const { currentSession } = useContext(SessionContext)

  const { tenantDetails } = useContext(AppContext)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const TableLoader = () => (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading students...</span>
      </div>
    </div>
  )

  /* ------------------ LOAD CLASSES ---------------- */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession._id}&isPagination=false`)
      .then((res) => {
        setClasses(res?.data?.data?.classes || [])
      })
      .catch(() => toast.error('Failed to load classes'))
  }, [currentSession])

  useEffect(() => {
    if (!currentSession) return
    setLoading(true)

    const queryObj = {
      page,
      limit,
      session: currentSession._id,
    }

    if (searchTerm) queryObj.search = searchTerm
    if (classId) queryObj.currentClass = classId

    const query = new URLSearchParams(queryObj).toString()

    getRequest(`studentRegistrations?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setstudent(responseData?.students || [])
        setTotal(responseData?.totalStudents || 0)
      })
      .catch(console.log)
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, classId, currentSession, updateStatus])

  const handleExport = async () => {
    try {
      setExportLoading(true)

      const queryObj = {}
      if (searchTerm) queryObj.search = searchTerm
      if (classId) queryObj.currentClass = classId
      queryObj.isPagination = false

      const query = new URLSearchParams(queryObj).toString()
      const res = await getRequest(`studentRegistrations?${query}`)

      const students = res?.data?.data?.students || []

      if (!students.length) {
        toast.error('No data to export')
        return
      }

      const exportData = students.map((item, index) => ({
        'Sr. No.': index + 1,
        'Form No': item.formNo,
        'Registration Date': formatDate(item.registrationDate),
        // Session: item.session?.sessionName || '-',
        'Student Name': `${item.firstName} ${item.lastName}`,
        "Father's Name": item.fatherName,
        "Father's Contact": item.phone || '-',
        'Expected Class': item.currentClass?.name || '-',
        'Registration Fee': `₹${item.registrationFee}`,
        'Payment Mode': item.paymentMode,
        Enroll: item.isEnroll === true || item.isEnroll === 'True' ? 'Yes' : 'No',
      }))

      // 🔥 AUTO DOWNLOAD (FIRST CLICK)
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Registration Form')

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      const blob = new Blob([excelBuffer], {
        type: 'application/octet-stream',
      })

      saveAs(blob, 'Student Registration Form.xlsx')
    } catch (err) {
      console.error(err)
      toast.error('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem?._id) {
      toast.error('No record selected')
      return
    }

    try {
      await deleteRequest(`studentRegistrations/${selectedItem._id}`)

      toast.success('Deleted successfully')
      setShowDeleteModal(false)
      setSelectedItem(null)
      setUpdateStatus((prev) => !prev)
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Delete failed')
    }
  }

  const handlePrintReceipt = (item) => {
    const receiptWindow = window.open('', '_blank', 'width=794,height=1123')

    receiptWindow.document.write(`
<html>
<head>
<meta charset="UTF-8" />
<title>Student Registration Receipt</title>

<style>
@page {
  size: A4;
  margin: 10mm;
}

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  margin: 0;
  padding: 0;
  background: #fff;
}

.container {
  width: 190mm;
  margin: auto;
  border: 1px solid #333;
  padding: 20px;
}

/* HEADER */
.header {
  text-align: center;
  margin-bottom: 10px;
}

.header h1 {
  margin: 0;
  font-size: 22px;
  letter-spacing: 1px;
}

.header p {
  margin: 2px 0;
  font-size: 12px;
  color: #555;
}

/* TITLE */
.receipt-title {
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  margin: 10px 0;
  padding: 6px;
  border-top: 1px solid #000;
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 13px;
}

td {
  border: 1px solid #999;
  padding: 7px;
}

.label {
  background: #f7f7f7;
  font-weight: 600;
  width: 40%;
}

/* NOTE */
.note {
  font-size: 12px;
  padding: 10px;
  background: #fafafa;
}

/* SIGNATURE */
.signatures {
  margin-top: 60px;
  display: flex;
  justify-content: space-between;
}

.signature-box {
  width: 40%;
  text-align: center;
}

.sign-label {
  margin-top: 30px;
  font-weight: 500;
  font-size: 13px;
}

/* PRINT */
@media print {
  body {
    -webkit-print-color-adjust: exact;
  }
}
</style>
</head>

<body>

<div class="container">

  <!-- HEADER -->
<div class="header" style="position: relative; display: flex; align-items: center;">
  ${tenantDetails?.logo ? `<img src="${tenantDetails.logo}" alt="School Logo" style="width: 70px; height: 70px; object-fit: contain; position: absolute; left: 0;" />` : ''}
  <div style="text-align: center; width: 100%;">
    <h1>${tenantDetails?.schoolName || 'YOUR SCHOOL NAME'}</h1>
    <p>${tenantDetails?.schoolAddress || 'School Address Line'}</p>
  </div>
</div>

  <!-- TITLE -->
  <div class="receipt-title">
    STUDENT REGISTRATION RECEIPT
  </div>

  <!-- TABLE -->
  <table>
    <tr>
      <td class="label">Receipt No</td>
      <td>${item.formNo || '-'}</td>
    </tr>

    <tr>
      <td class="label">Registration Date</td>
      <td>${formatDate(item.registrationDate)}</td>
    </tr>

    <tr>
      <td class="label">Student Name</td>
      <td>${item.firstName} ${item.lastName}</td>
    </tr>

    <tr>
      <td class="label">Father's Name</td>
      <td>${item.fatherName || '-'}</td>
    </tr>

    <tr>
      <td class="label">Contact Number</td>
      <td>${item.phone || '-'}</td>
    </tr>

    <tr>
      <td class="label">Session</td>
      <td>${item.session?.sessionName || '-'}</td>
    </tr>

    <tr>
      <td class="label">Expected Class</td>
      <td>${item.currentClass?.name || '-'}</td>
    </tr>

    <tr>
      <td class="label">Address</td>
      <td>${item.address || '-'}</td>
    </tr>

    <tr>
      <td class="label">Registration Fee (₹)</td>
      <td>${item.registrationFee || '-'}</td>
    </tr>

    <tr>
      <td class="label">Payment Mode</td>
      <td>${item.paymentMode || '-'}</td>
    </tr>

    <tr>
      <td colspan="2" class="note">
        <b>Note:</b> Please keep this receipt for future reference.
      </td>
    </tr>
  </table>

  <!-- SIGNATURE -->
  <div class="signatures">

    <div class="signature-box">
      <div class="sign-label">Authorized Signatory</div>
    </div>

    <div class="signature-box">
      <div class="sign-label">Parent / Student Signature</div>
    </div>

  </div>

</div>

<script>
window.onload = function () {
  window.print();
}
</script>

</body>
</html>
`)

    receiptWindow.document.close()
  }

  return (
    <div className="min-h-screen">
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedItem?.studentName}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-black  px-4 py-3 bg-white rounded-lg border border-blue-100 mb-6">
        <div className="mx-auto  flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="">
            <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <GraduationCap className="text-[#e24028]" size={36} />
              Student Registration Form
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 mb-0 ">Automated fees tracking system</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm ">
            <ExportButton onClick={handleExport} loading={exportLoading} />

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0c3b73] text-white px-4 py-2 hover:bg-blue-800 flex items-center justify-center rounded-md text-sm   w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Registration Form
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded border p-4 mb-4">
        {/* Header */}
        <div className="flex items-center gap-1 mb-2">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700 mb-0">Filters & Search</h3>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Search */}
          <div className="w-full lg:max-w-sm">
            <label className="block text-xs font-medium  mb-1 tracking-wide">SEARCH</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search student, father or form no..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-9 pr-8 py-1.5 w-full border rounded-lg text-sm
          focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Class */}
          <div className="w-full lg:w-56">
            <label className="block text-xs font-medium  mb-1 tracking-wide">CLASS</label>
            <select
              value={tempClassId}
              onChange={(e) => setTempClassId(e.target.value)}
              className=" w-full text-sm border border-gray-300 px-3 py-2 rounded-md
        focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Apply */}
          <button
            onClick={() => {
              setClassId(tempClassId)
              setPage(1)
            }}
            className=" px-5 py-2 bg-[#0c3b73] text-white rounded-md text-sm
      hover:bg-blue-800 transition"
          >
            Apply
          </button>

          {/* Clear */}
          <button
            onClick={() => {
              setTempClassId('')
              setClassId('')
              setSearchTerm('')
              setPage(1)
            }}
            className=" px-5 py-2 bg-gray-200 text-gray-700 rounded-md text-sm
      hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">
        <div className="bg-white overflow-hidden rounded-lg border border-blue-100 relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
              <Loader /> Loading Student Data ....
            </div>
          )}

          {student.length === 0 && !loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <GraduationCap className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 overflow-hidden table-fixed">
                <colgroup>
                  <col className="min-w-[70px]" /> {/* Sr No */}
                  <col className="min-w-[120px]" /> {/* Form No */}
                  <col className="min-w-[130px]" /> {/* Registration Date */}
                  {/* <col className="min-w-[120px]" /> Session */}
                  <col className="min-w-[180px]" /> {/* Student Name */}
                  <col className="min-w-[160px]" /> {/* Father Name */}
                  <col className="min-w-[140px]" /> {/* Father Contact */}
                  <col className="min-w-[140px]" /> {/* Expected Class */}
                  <col className="min-w-[150px]" /> {/* Registration Fee */}
                  <col className="min-w-[140px]" /> {/* Payment Mode */}
                  <col className="min-w-[100px]" /> {/* Enroll */}
                  <col className="min-w-[120px]" /> {/* Actions */}
                </colgroup>
                <thead className="bg-gray-200 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-center text-sm font-semibold">Sr. No.</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">Form No</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">
                      Registration Date
                    </th>
                    {/* <th className="px-4 py-2 text-center text-sm font-semibold">Session</th> */}
                    <th className="px-4 py-2 text-center text-sm font-semibold">Student Name</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">Father's Name</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">
                      Father's Contact
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">Expected Class</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">
                      Registration Fee
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">Payment Mode</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">Enroll</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className=" bg-white divide-y divide-gray-200">
                  {student.map((item, index) => {
                    const isEnrolled = item.isEnroll === true || item.isEnroll === 'True'

                    return (
                      <tr key={item._id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-center text-sm">
                          {(page - 1) * limit + (index + 1)}
                        </td>

                        <td className="px-4 py-2 text-center text-sm">{item.formNo}</td>
                        <td className="px-4 py-2 text-center text-sm">
                          {formatDate(item.registrationDate)}
                        </td>
                        {/* <td className="px-4 py-2 text-center text-sm">
                          {item.session?.sessionName}
                        </td> */}
                        <td className="px-4 py-2 text-center text-sm font-medium">
                          {item.firstName} {item.lastName}
                        </td>
                        <td className="px-4 py-2 text-center text-sm">{item.fatherName}</td>
                        <td className="px-4 py-2 text-center text-sm">{item.phone || '-'}</td>
                        <td className="px-4 py-2 text-center text-sm">{item.currentClass?.name}</td>
                        <td className="px-4 py-2 text-center text-sm">₹{item.registrationFee}</td>
                        <td className="px-4 py-2 text-center text-sm">{item.paymentMode}</td>

                        {/*  FIXED ENROLL COLUMN */}
                        <td className="px-4 py-2 text-center text-sm">
                          <span
                            className={`rounded-full text-xs font-medium px-2 py-1 ${
                              isEnrolled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isEnrolled ? 'Yes' : 'No'}
                          </span>
                        </td>

                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              disabled={isEnrolled}
                              onClick={() => {
                                setSelectedItem(item)
                                setIsModalOpen(true)
                              }}
                              className={`w-8 h-8 flex items-center justify-center rounded-full transition
                                  ${
                                    isEnrolled
                                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                      : 'text-blue-600 hover:text-white hover:bg-blue-600 cursor-pointer'
                                  }`}
                              title={isEnrolled ? 'Enrolled student cannot be edited' : 'Edit'}
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              disabled={isEnrolled}
                              onClick={() => {
                                setSelectedItem(item)
                                setShowDeleteModal(true)
                              }}
                              className={`w-8 h-8 flex items-center justify-center rounded-full transition
    ${
      isEnrolled
        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
        : 'text-red-600 hover:text-white hover:bg-red-600 cursor-pointer'
    }`}
                              title={isEnrolled ? 'Enrolled student cannot be deleted' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handlePrintReceipt(item)}
                              className="w-8 h-8 flex items-center justify-center rounded-full
             text-green-600 hover:text-white hover:bg-green-600 transition"
                              title="Print Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}

          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-end">
              {/* <div className="text-sm text-gray-700">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, filteredData)} of{" "}
                  {filteredData.length} results
                </div> */}
              <Pagination
                current={page}
                pageSize={limit}
                total={total} // ✅ API ka totalStudents
                pageSizeOptions={['5', '10', '20', '50']}
                showSizeChanger
                onChange={(p) => setPage(p)}
                onShowSizeChange={(p, size) => {
                  setLimit(size)
                  setPage(1)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <StudentAdmissionFormModal
          setUpdateStatus={setUpdateStatus}
          modalData={selectedItem} // selected student data
          setModalData={setSelectedItem} // function to update selected student
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  )
}

export default StudentAdmissionForm
