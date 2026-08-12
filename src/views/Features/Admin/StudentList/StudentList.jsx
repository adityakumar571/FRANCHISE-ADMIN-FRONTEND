/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import { Search, Plus, Edit, Trash2, AlertTriangle, GraduationCap, Eye } from 'lucide-react'
import { Empty, Pagination } from 'antd'
import { Select } from 'antd'
import { useNavigate } from 'react-router-dom'
import EnrollmentFormModal from '../../../../modals/EnrollmentFormModal'
import StudentEnrollmentFilters from '../../../admission/StudentEnrollmentFilters'
import ExportButton from '../../../../components/ExportButton'
import { getRequest } from '../../../../Helpers'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { SessionContext } from '../../../../Context/Seesion'
dayjs.extend(utc)
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import Loader from '../../../../components/Loading/Loader'

const AdminStudentList = () => {
  const { currentSession } = useContext(SessionContext)
  const DEFAULT_FILTERS = useMemo(
    () => ({
      session: currentSession?._id || 'all',
      currentClass: 'all',
      currentSection: 'all',
      gender: 'all',
      category: 'all',
      dob: '',
    }),
    [currentSession],
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const isDefaultFilters = (data) => {
    return JSON.stringify(data) === JSON.stringify(DEFAULT_FILTERS)
  }
  const handleResetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS)
    setFilters(DEFAULT_FILTERS)
    setSearchTerm('')
    setPage(1)
  }
  const ALL_COLUMNS = [
    { key: 'studentId', label: 'Student ID', width: 120 },
    { key: 'formNo', label: 'Form No', width: 100 },
    { key: 'rollNumber', label: 'Roll No', width: 100 },
    { key: 'studentName', label: 'Student Name', width: 180 },
    { key: 'expectedClass', label: 'Class', width: 100 },
    { key: 'section', label: 'Section', width: 100 },
    { key: 'fatherName', label: 'Father Name', width: 200 },
    { key: 'motherName', label: 'Mother Name', width: 200 },
    { key: 'phone', label: 'Phone', width: 150 },
    { key: 'gender', label: 'Gender', width: 100 },
    { key: 'dob', label: 'DOB', width: 120 },
    { key: 'category', label: 'Category', width: 100 },
    { key: 'religion', label: 'Religion', width: 100 },
    { key: 'fatherOccupation', label: 'Father Occupation', width: 200 },
    { key: 'medium', label: 'Medium', width: 100 },
    { key: 'schoolName', label: 'Previous School', width: 220 },

    { key: 'sessionName', label: 'Session', width: 120 },
    { key: 'status', label: 'Status', width: 120 },
    { key: 'createdAt', label: 'Admission Date', width: 150 },
  ]
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.map((col) => col.key))

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!currentSession?._id) return
    setLoading(true)
    const queryParams = {
      search: searchTerm,
      page,
      limit,
    }
    if (filters.currentClass !== 'all') queryParams.currentClass = filters.currentClass
    if (filters.currentSection !== 'all') queryParams.currentSection = filters.currentSection
    if (filters.gender !== 'all') queryParams.gender = filters.gender
    if (filters.category !== 'all') queryParams.category = filters.category
    if (filters.dob) queryParams.dob = filters.dob
    const query = new URLSearchParams(queryParams).toString()
    getRequest(`studentEnrollment?session=${currentSession?._id}&${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        const formattedStudents = (responseData?.students || []).map((stu) => ({
          ...stu,
          studentName: `${stu.firstName} ${stu.middleName || ''} ${stu.lastName}`,
          formNo: stu.studentRegistrationId?.formNo,
          classId: stu.currentClass?._id || 'all',
          expectedClass: stu.currentClass?.name || '-',
          sectionId: stu.currentSection?._id || 'all',
          section: stu.currentSection?.name || '-',
          sessionId: stu.session?._id || 'all',
          sessionName: stu.session?.sessionName || '-',
          dob: stu.dob ? dayjs.utc(stu.dob).format('DD-MM-YYYY') : '-',
          createdAt: new Date(stu.createdAt).toLocaleDateString('en-GB'),
        }))
        setStudents(formattedStudents)
        setTotal(responseData?.totalStudents || 0)
      })
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, filters, updateStatus, currentSession])

  const paginatedData = students

  const handleExport = async () => {
    try {
      setLoading(true) // optional: show loading

      const queryParams = {
        search: searchTerm,
        isPagination: false, // tells API to ignore limit & page
      }

      if (filters.session !== 'all') queryParams.session = filters.session
      if (filters.currentClass !== 'all') queryParams.currentClass = filters.currentClass
      if (filters.currentSection !== 'all') queryParams.currentSection = filters.currentSection
      if (filters.gender !== 'all') queryParams.gender = filters.gender
      if (filters.category !== 'all') queryParams.category = filters.category
      if (filters.dob) queryParams.dob = filters.dob

      const query = new URLSearchParams(queryParams).toString()
      const res = await getRequest(`studentEnrollment?${query}`)
      const allStudents = res?.data?.data?.students || []

      const formattedStudents = allStudents.map((stu, index) => ({
        ...stu,
        studentName: `${stu.firstName} ${stu.middleName || ''} ${stu.lastName}`,
        formNo: stu.studentRegistrationId?.slice(-6),
        expectedClass: stu.currentClass?.name || '-',
        section: stu.currentSection?.name || '-',
        sessionName: stu.session?.sessionName || '-',
        dob: stu.dob ? dayjs.utc(stu.dob).format('DD-MM-YYYY') : '-',
        createdAt: stu.createdAt ? new Date(stu.createdAt).toLocaleDateString('en-GB') : '-',
        srNo: index + 1,
      }))

      const rows = formattedStudents.map((item) => {
        const row = { 'Sr. No.': item.srNo }

        // Map all columns dynamically
        ALL_COLUMNS.forEach((col) => {
          row[col.label] = item[col.key] || '-'
        })

        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
      saveAs(blob, 'Student_List.xlsx')
    } catch (err) {
      console.error(err)
      toast.error('Export failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <p className="mb-6">
              Are you sure you want to delete <strong>{selectedItem?.studentName}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border">
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteRequest(`studentEnrollment/${selectedItem._id}`)
                    setUpdateStatus((prev) => !prev)
                  } catch (err) {
                    alert('Delete failed')
                  } finally {
                    setShowDeleteModal(false)
                    setSelectedItem(null)
                  }
                }}
                className="px-6 py-2 bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className=" text-black px-4 py-3 mb-6 bg-white  rounded-lg  border border-blue-100  ">
        <div className="mx-auto  flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="">
            <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <GraduationCap className="text-[#e24028]" size={36} />
              Student List
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 mb-0">Automated fees tracking system</p>
          </div>
          <div className="flex flex-wrap items-center text-sm gap-2 sm:gap-3">
            <ExportButton onClick={handleExport} loading={loading} />
          </div>
        </div>
      </div>
      <StudentEnrollmentFilters
        students={students}
        filters={draftFilters}
        setFilters={setDraftFilters}
        applyFilters={() => {
          setFilters({ ...draftFilters })
          setPage(1)
        }}
        setPage={setPage}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        allColumns={ALL_COLUMNS}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onReset={handleResetFilters}
        isDefaultFilters={isDefaultFilters}
      />
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader /> Loading Student List ....
          </div>
        )}
        <table className=" min-w-max border-collapse w-full table-fixed">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              {/* Sr No */}
              <th
                className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center"
                style={{ minWidth: 60 }}
              >
                Sr. No.
              </th>
              {ALL_COLUMNS.map(
                (col, idx) =>
                  visibleColumns.includes(col.key) && (
                    <th
                      key={col.key}
                      className={`px-3 py-2 text-sm text-center bg-gray-200 ${
                        col.fixed === 'left' ? 'sticky z-20' : ''
                      }`}
                      style={{
                        width: col.width,
                        minWidth: col.width,
                        maxWidth: col.width,
                        left:
                          col.fixed === 'left'
                            ? ALL_COLUMNS.filter((c) => c.fixed === 'left')
                                .slice(0, idx)
                                .reduce((sum, c) => sum + c.width, 80)
                            : undefined,
                      }}
                    >
                      {col.label}
                    </th>
                  ),
              )}

              {/* Actions */}
              <th
                className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center"
                style={{ minWidth: 120 }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {!loading && paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 2}>
                  <div className="flex items-start justify-start pt-4 pl-[20%] text-gray-500">
                    <div className="flex items-start gap-4">
                      {/* <AlertTriangle className="w-8 h-8 text-gray-400 mt-0.5" /> */}
                      <div>
                        No Student Record found <Empty />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  {/* Sr No */}
                  <td
                    className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center"
                    style={{ minWidth: 80 }}
                  >
                    {(page - 1) * limit + rowIndex + 1}
                  </td>

                  {ALL_COLUMNS.map(
                    (col, idx) =>
                      visibleColumns.includes(col.key) && (
                        <td
                          key={col.key}
                          className={`px-3 py-2 text-sm text-center bg-white truncate ${
                            col.fixed === 'left' ? 'sticky z-10' : ''
                          }`}
                          style={{
                            width: col.width,
                            minWidth: col.width,
                            maxWidth: col.width,
                            left:
                              col.fixed === 'left'
                                ? ALL_COLUMNS.filter((c) => c.fixed === 'left')
                                    .slice(0, idx)
                                    .reduce((sum, c) => sum + c.width, 80)
                                : undefined,
                          }}
                          title={item[col.key]}
                        >
                          {item[col.key] ?? '-'}
                        </td>
                      ),
                  )}

                  {/* Actions */}
                  <td
                    className="sticky right-0 z-10 bg-white px-3 py-2 text-center"
                    style={{ minWidth: 120 }}
                  >
                    <div className="flex justify-center gap-3">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full
              text-green-600 hover:text-white hover:bg-green-600"
                      >
                        <Eye
                          className="w-4 h-4  cursor-pointer"
                          onClick={() => navigate(`/student/enrollment/${item._id}`)}
                        />
                      </button>
                      {/* <button
                      className="w-8 h-8 flex items-center justify-center rounded-full
              text-blue-600 hover:text-white hover:bg-blue-600"
                    >
                      <Edit
                        className="w-4 h-4 cursor-pointer "
                        onClick={() => {
                          setSelectedItem(item)
                          setIsModalOpen(true)
                        }}
                      />
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full
              text-red-600 hover:text-white hover:bg-red-600"
                    >
                      <Trash2
                        className="w-4 h-4  cursor-pointer  "
                        onClick={() => {
                          setSelectedItem(item)
                          setShowDeleteModal(true)
                        }}
                      />
                    </button> */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          showSizeChanger
          pageSizeOptions={['5', '10', '20', '50']}
          onChange={setPage}
          onShowSizeChange={(c, s) => {
            setLimit(s)
            setPage(1)
          }}
        />
      </div>
      {isModalOpen && (
        <EnrollmentFormModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          onSuccess={() => setUpdateStatus((prev) => !prev)}
        />
      )}
    </div>
  )
}
export default AdminStudentList
