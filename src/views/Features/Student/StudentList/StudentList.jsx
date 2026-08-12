/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, AlertTriangle, GraduationCap, Eye } from 'lucide-react'
import { Pagination } from 'antd'
import EnrollmentFormModal from '../../modals/EnrollmentFormModal.jsx'
import ExportButton from '../../components/ExportButton.jsx'
import { getRequest, deleteRequest } from '../../Helpers/index.js'
import { Select } from 'antd'
import StudentEnrollmentFilters from './StudentEnrollmentFilters.jsx'
import StudentEnrollmentFilters from '../../../'
import { useNavigate } from "react-router-dom";

const StudentEnrollmentForm = () => {
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
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    session: 'all',
    class: 'all',
    section: 'all',
    gender: 'all',
    category: 'all',
  })

  const [draftFilters, setDraftFilters] = useState(filters)
  const { Option } = Select

  const ALL_COLUMNS = [
    { key: 'studentId', label: 'Student ID' },
    { key: 'formNo', label: 'Form No' },
    { key: 'rollNumber', label: 'Roll No' },
    { key: 'studentName', label: 'Student Name', fixed: 'left' },
    { key: 'expectedClass', label: 'Class', fixed: 'left' },
    { key: 'section', label: 'Section', fixed: 'left' },

    { key: 'fatherName', label: "Father Name" },
    { key: 'motherName', label: "Mother Name" },
    { key: 'phone', label: 'Phone' },
    { key: 'gender', label: 'Gender' },
    { key: 'dob', label: 'DOB' },
    { key: 'category', label: 'Category' },
    { key: 'religion', label: 'Religion' },
    { key: 'occupation', label: 'Father Occupation' },
    { key: 'medium', label: 'Medium' },
    { key: 'schoolName', label: 'Previous School' },

    { key: 'transportRequired', label: 'Transport Required' },
    { key: 'busNo', label: 'Bus No' },
    { key: 'stationName', label: 'Station Name' },

    { key: 'sessionName', label: 'Session' },
    { key: 'status', label: 'Status' },
    { key: 'admissionDate', label: 'Admission Date' },
  ]


  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.map(col => col.key)
  )

  const classOptions = [...new Set(students.map(s => s.expectedClass).filter(Boolean))]
  const sectionOptions = [...new Set(students.map(s => s.section).filter(Boolean))]
  const genderOptions = [...new Set(students.map(s => s.gender).filter(Boolean))]
  const categoryOptions = [...new Set(students.map(s => s.category).filter(Boolean))]


  /* ================= FETCH ================= */
  const fetchStudents = async () => {
    setLoading(true)

    const query = new URLSearchParams({
      search: searchTerm,
      page,
      limit,
    }).toString()

    try {
      const res = await getRequest(`studentEnrollment?${query}`)
      const responseData = res?.data?.data

      const formattedStudents = (responseData?.students || []).map((stu) => ({
        ...stu,
        studentName: `${stu.firstName} ${stu.middleName || ''} ${stu.lastName}`,
        formNo: stu.studentRegistrationId?.slice(-6),
        classId: stu.currentClass?._id || 'all',
        expectedClass: stu.currentClass?.name || '-',
        sectionId: stu.currentSection?._id || 'all',
        section: stu.currentSection?.name || '-',
        sessionId: stu.session?._id || 'all',
        sessionName: stu.session?.sessionName || '-',
        dob: stu.dob
          ? new Date(stu.dob).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '-',
        admissionDate: new Date(stu.admissionDate).toLocaleDateString('en-GB'),
      }))

      setStudents(formattedStudents)
      setTotal(responseData?.totalStudents || 0)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchStudents()
  }, [page, limit, searchTerm])

  /* ================= FILTER ================= */
  const filteredData = students.filter((item) => {
    const matchesSearch =
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentRegistrationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.formNo?.toLowerCase().includes(searchTerm.toLowerCase())


    const matchesSession =
      filters.session === 'all' ||
      item.sessionId === filters.session

    const matchesClass =
      filters.class === 'all' || item.classId === filters.class

    const matchesSection =
      filters.section === 'all' || item.sectionId === filters.section


    const matchesGender =
      filters.gender === 'all' ||
      item.gender?.toLowerCase() === filters.gender.toLowerCase()

    const matchesCategory =
      filters.category === 'all' ||
      item.category?.toLowerCase() === filters.category.toLowerCase()


    return (
      matchesSearch &&
      matchesSession &&
      matchesClass &&
      matchesSection &&
      matchesGender &&
      matchesCategory
    )
  })

  const paginatedData = filteredData

  const exportData = paginatedData.map((item, index) => {
    const row = {
      "Sr. No.": (page - 1) * limit + index + 1,
    };

    if (visibleColumns.includes("studentId")) {
      row["Student ID"] = item.studentId || "-";
    }

    if (visibleColumns.includes("formNo")) {
      row["Form No"] = item.formNo || "-";
    }

    if (visibleColumns.includes("rollNumber")) {
      row["Roll No"] = item.rollNumber || "-";
    }

    if (visibleColumns.includes("studentName")) {
      row["Student Name"] = item.studentName || "-";
    }

    if (visibleColumns.includes("expectedClass")) {
      row["Class"] = item.expectedClass || "-";
    }

    if (visibleColumns.includes("section")) {
      row["Section"] = item.section || "-";
    }

    if (visibleColumns.includes("fatherName")) {
      row["Father Name"] = item.fatherName || "-";
    }

    if (visibleColumns.includes("phone")) {
      row["Phone Number"] = item.phone || "-";
    }

    if (visibleColumns.includes("gender")) {
      row["Gender"] = item.gender || "-";
    }

    if (visibleColumns.includes("dob")) {
      row["DOB"] = item.dob
        ? new Date(item.dob).toLocaleDateString("en-GB").replace(/\//g, "-")
        : "-";
    }

    if (visibleColumns.includes("category")) {
      row["Category"] = item.category || "-";
    }

    return row;
  });

  return (
    <div className="min-h-screen">
      {/* ================= DELETE MODAL ================= */}
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
                    setUpdateStatus(prev => !prev)
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

      {/* Header */}
      <div className=" text-black px-4 py-2 mb-6 bg-white  rounded-lg  border border-blue-100  ">
        <div className="mx-auto  flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="">
            <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <GraduationCap className="text-[#e24028]" size={36} />
              Student Enrollment Form
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Automated fees tracking system</p>
          </div>
          <div className="flex flex-wrap items-center text-sm gap-2 sm:gap-3">

            <ExportButton
              data={exportData}
              fileName="Student Enrollment Form.xlsx"
              sheetName="Student Enrollment Form"
            />
            <button
              onClick={() => {
                setSelectedItem(null)
                setIsModalOpen(true)
              }}

              className="bg-[#0c3b73] text-white px-4 py-2 hover:bg-blue-800 flex items-center justify-center rounded-md text-sm   w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Enrollment Form
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <StudentEnrollmentFilters
        students={students}
        filters={draftFilters}
        setFilters={setDraftFilters}
        applyFilters={() => {
          setFilters(draftFilters)
          setPage(1)
        }}
        setPage={setPage}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        allColumns={ALL_COLUMNS}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* ================= TABLE ================= */}
      <div className=" relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className=" min-w-max border-collapse w-full">
          {/* <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-sm text-center">Sr. No.</th>

              {ALL_COLUMNS.map(col =>
                visibleColumns.includes(col.key) && (
                  <th key={col.key} className="px-3 py-2 text-sm text-center">
                    {col.label}
                  </th>
                )
              )}

              <th className="px-3 py-2 text-sm text-center">Actions</th>
            </tr>
          </thead> */}
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              {/* Sr No */}
              <th
                className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center"
                style={{ minWidth: 80 }}
              >
                Sr. No.
              </th>

              {ALL_COLUMNS.map((col, idx) =>
                visibleColumns.includes(col.key) && (
                  <th
                    key={col.key}
                    className={`px-3 py-2 text-sm text-center bg-gray-200 ${col.fixed === 'left' ? 'sticky z-20 bg-gray-200' : ''
                      }`}
                    style={{
                      minWidth: 180,
                      left:
                        col.fixed === 'left'
                          ? idx === 0
                            ? 80
                            : idx === 1
                              ? 260
                              : idx === 2
                                ? 440
                                : undefined
                          : undefined,
                    }}
                  >
                    {col.label}
                  </th>
                )
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


          {/* <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-center">
                  {(page - 1) * limit + index + 1}
                </td>

                {visibleColumns.includes('studentId') && (
                  <td className="px-4 py-2 text-sm text-center">{item.studentId}</td>
                )}

                {visibleColumns.includes('formNo') && (
                  <td className="px-4 py-2 text-sm text-center">{item.formNo}</td>
                )}
                {visibleColumns.includes('rollNumber') && (
                  <td className="px-4 py-2 text-sm text-center">{item.rollNumber}</td>
                )}


                {visibleColumns.includes('studentName') && (
                  <td className="px-4 py-2 text-sm text-center font-medium cursor-pointer hover:text-blue-600" onClick={() => navigate(`/student/enrollment/${item._id}`)}>
                    {item.studentName}

                  </td>
                )}

                {visibleColumns.includes('expectedClass') && (
                  <td className="px-4 py-2 text-sm text-center">{item.expectedClass}</td>
                )}

                {visibleColumns.includes('section') && (
                  <td className="px-4 py-2 text-sm text-center">{item.section}</td>
                )}

                {visibleColumns.includes('fatherName') && (
                  <td className="px-4 py-2 text-sm text-center">{item.fatherName}</td>
                )}

                {visibleColumns.includes('phone') && (
                  <td className="px-4 py-2 text-sm text-center">{item.phone}</td>
                )}

                {visibleColumns.includes('gender') && (
                  <td className="px-4 py-2 text-sm text-center">{item.gender}</td>
                )}

                {visibleColumns.includes('dob') && (
                  <td className="px-4 py-2 text-sm text-center">
                    {item.dob
                      ? new Date(item.dob).toLocaleDateString('en-GB').replace(/\//g, '-')
                      : ''}
                  </td>
                )}

                {visibleColumns.includes('category') && (
                  <td className="px-4 py-2 text-sm text-center">{item.category}</td>
                )}



             
                <td className="px-4 py-2 text-center">


                  <div className="flex justify-center gap-3">

                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full
  text-green-600 cursor-pointer
  transition-all duration-300
  hover:bg-green-600 hover:text-white"
                      title="View"
                      onClick={() => navigate(`/student/enrollment/${item._id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </div>


                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full
                 text-blue-600 cursor-pointer
                 transition-all duration-300
                 hover:bg-blue-600 hover:text-white"
                      title="Edit"
                      onClick={() => {
                        setSelectedItem({ ...item })
                        setIsModalOpen(true)
                      }}

                    >
                      <Edit className="w-4 h-4" />
                    </div>


                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full
                 text-red-600 cursor-pointer
                 transition-all duration-300
                 hover:bg-red-600 hover:text-white"
                      title="Delete"
                      onClick={() => {
                        setSelectedItem(item)
                        setShowDeleteModal(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </div>
                  </div>

                </td>
              </tr>
            ))}
          </tbody> */}
          <tbody>
            {paginatedData.map((item, rowIndex) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                {/* Sr No */}
                <td
                  className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center"
                  style={{ minWidth: 80 }}
                >
                  {(page - 1) * limit + rowIndex + 1}
                </td>

                {ALL_COLUMNS.map((col, idx) =>
                  visibleColumns.includes(col.key) && (
                    <td
                      key={col.key}
                      className={`px-3 py-2 text-sm text-center bg-white ${col.fixed === 'left' ? 'sticky z-10 bg-white' : ''
                        }`}
                      style={{
                        minWidth: 180,
                        left:
                          col.fixed === 'left'
                            ? idx === 0
                              ? 80
                              : idx === 1
                                ? 260
                                : idx === 2
                                  ? 440
                                  : undefined
                            : undefined,
                      }}
                    >
                      {item[col.key] ?? '-'}
                    </td>
                  )
                )}

                {/* Actions */}
                <td
                  className="sticky right-0 z-10 bg-white px-3 py-2 text-center"
                  style={{ minWidth: 120 }}
                >
                  <div className="flex justify-center gap-3">
                    <button className='w-8 h-8 flex items-center justify-center rounded-full
              text-green-600 hover:text-white hover:bg-green-600'>
                      <Eye
                        className="w-4 h-4  cursor-pointer"
                        onClick={() => navigate(`/student/enrollment/${item._id}`)}
                      />
                    </button>
                    <button className='w-8 h-8 flex items-center justify-center rounded-full
              text-blue-600 hover:text-white hover:bg-blue-600'>
                      <Edit
                        className="w-4 h-4 cursor-pointer "
                        onClick={() => {
                          setSelectedItem(item)
                          setIsModalOpen(true)
                        }}
                      />
                    </button>
                    <button className='w-8 h-8 flex items-center justify-center rounded-full
              text-red-600 hover:text-white hover:bg-red-600'>
                      <Trash2
                        className="w-4 h-4  cursor-pointer  "
                        onClick={() => {
                          setSelectedItem(item)
                          setShowDeleteModal(true)
                        }}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>



        </table>

        {/* ================= PAGINATION ================= */}
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
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <EnrollmentFormModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          onSuccess={() => {
            fetchStudents()   // 🔥 YAHI MAGIC HAI
          }}
        />

      )}
    </div>
  )
}

export default StudentEnrollmentForm
