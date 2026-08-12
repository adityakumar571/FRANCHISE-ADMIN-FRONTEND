/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react'
import { Eye, Edit, GraduationCap } from 'lucide-react'
import { Pagination, Select, Input, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getRequest } from '../../../../Helpers'
import TeacherFilters from '../../../teacher/TeacherFilters'
import ExportButton from '../../../ExportExcelButton'
import Loader from '../../../../components/Loading/Loader'
import { SessionContext } from '../../../../Context/Seesion'
const { Option } = Select
const ALL_COLUMNS = [
  { key: 'employeeId', label: 'Teacher ID' },
  { key: 'teacherName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'dob', label: 'DOB' },
  { key: 'gender', label: 'Gender' },
  { key: 'religion', label: 'Religion' },
  { key: 'designation', label: 'Designation' },
  { key: 'department', label: 'Department' },
  { key: 'employmentType', label: 'EmploymentType' },
  { key: 'medium', label: 'Medium' },
  // { key: 'subject', label: 'Subject' },
  { key: 'totalExperience', label: 'Total Experience' },
  { key: 'salary', label: 'Salary' },
  { key: 'status', label: 'Status' },
]

const COLUMN_WIDTHS = {
  sr: '80px',
  employeeId: '120px',
  teacherName: '180px',
  email: '220px',
  phone: '130px',
  dob: '110px',
  gender: '100px',
  religion: '120px',
  designation: '160px',
  department: '160px',
  employmentType: '160px',
  medium: '100px',
  subject: '140px',
  totalExperience: '150px',
  salary: '120px',
  status: '110px',
  action: '120px',
}

const AdminTeachersList = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  // const [filters, setFilters] = useState({
  //   status: 'all',
  //   department: 'all',
  //   designation: 'all',
  //   employmentType: 'all',
  //   classId: 'all',
  //   sectionId: 'all',
  // })

  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    designation: 'all',
    employmentType: 'all',
    classId: 'all',
    sectionId: 'all',
    currentClass: undefined,
    currentSection: undefined,
    session: 'all',
    stream: 'all',
    subjectId: 'all',
    isClassTeacher: 'all',
    gender: 'all',
    dob: '',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.map((c) => c.key))
  const { currentSession } = useContext(SessionContext)
  const sessionId = currentSession?._id

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  /* ================= FETCH TEACHERS ================= */
  useEffect(() => {
    if (loading) return
    if (!sessionId) return
    setLoading(true)

    const query = new URLSearchParams({
      search: searchTerm,
      // session: sessionId,
      status: filters.status !== 'all' ? filters.status : '',
      department: filters.department !== 'all' ? filters.department : '',
      designation: filters.designation !== 'all' ? filters.designation : '',
      employmentType: filters.employmentType !== 'all' ? filters.employmentType : '',
      classId: filters.classId !== 'all' ? filters.classId : '',
      sectionId: filters.sectionId !== 'all' ? filters.sectionId : '',
      page,
      limit,
      sortBy: 'recent',
    }).toString()

    getRequest(`teachers?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.teachers || [])
        setTotal(responseData?.totalTeachers || 0)
      })
      .catch(() => toast.error('Failed to fetch teachers'))
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, filters, updateStatus])

  /* ================= EXPORT DATA ================= */
  // const exportData = data.map((item, index) => {
  //   const row = { 'Sr. No.': (page - 1) * limit + index + 1 }
  //   ALL_COLUMNS.forEach((col) => {
  //     row[col.label] = item[col.key] || '-'
  //   })
  //   return row
  // })

  const visibleData = data.map((item, index) => ({
    'Sr. No.': (page - 1) * limit + index + 1,

    // Only include columns that are visible in the table
    ...ALL_COLUMNS.reduce((acc, col) => {
      if (visibleColumns.includes(col.key)) {
        switch (col.key) {
          case 'teacherName': // Combine first, middle, last
            acc[col.label] = [item?.firstName, item?.middleName, item?.lastName]
              .filter(Boolean)
              .join(' ')
            break
          case 'phone':
            acc[col.label] = item?.phone || item?.mobile || '-'
            break
          case 'department':
            acc[col.label] = item?.department?.name || item?.department || '-'
            break
          case 'dob':
            acc[col.label] = formatDateToDDMMYYYY(item[col.key])
            break
          case 'status':
            acc[col.label] = item.status || '-'
            break
          default:
            acc[col.label] = item[col.key] || '-'
        }
      }
      return acc
    }, {}),
  }))

  return (
    <div className="min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap size={28} className="text-red-500" />
              Teacher List
            </h1>
            <p className="text-sm text-gray-500">All teachers record</p>
          </div>

          <ExportButton data={visibleData} fileName="Teacher List.xlsx" sheetName="Teachers" />
        </div>
      </div>

      {/* ================= FILTER ================= */}
      <TeacherFilters
        filters={filters}
        setFilters={setFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setPage={setPage}
        applyFilters={() => setPage(1)}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        allColumns={ALL_COLUMNS}
      />

      {/* ================= TABLE ================= */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
        {loading ? (
          // Loader while data is loading
          <div className="flex flex-col justify-center items-center h-48">
            <Loader /> Loading Teacher's Data
          </div>
        ) : (
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: COLUMN_WIDTHS.sr }} />

              {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                <col key={col.key} style={{ width: COLUMN_WIDTHS[col.key] || '150px' }} />
              ))}

              <col style={{ width: COLUMN_WIDTHS.action }} />
            </colgroup>
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 text-center">Sr. No.</th>
                {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                  <th key={col.key} className="px-3 py-2 text-center">
                    {col.label}
                  </th>
                ))}
                <th
                  className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center"
                  style={{ minWidth: 120 }}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={ALL_COLUMNS.length + 2} className="text-center py-6 text-gray-500">
                    No Records Found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">
                      {(page - 1) * limit + index + 1}
                    </td>

                    {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                      <td
                        key={col.key}
                        className={`border px-3 py-2 text-center ${
                          col.key === 'name' || col.key === 'teacherName'
                            ? 'cursor-pointer hover:text-blue-800'
                            : ''
                        }`}
                        onClick={() => {
                          if (col.key === 'name' || col.key === 'teacherName') {
                            navigate(`/teacher/register/${item._id}`)
                          }
                        }}
                      >
                        {(() => {
                          switch (col.key) {
                            case 'name':
                            case 'teacherName':
                              return [item?.firstName, item?.middleName, item?.lastName]
                                .filter(Boolean)
                                .join(' ')
                            case 'phone':
                              return item?.phone || item?.mobile || '-'
                            case 'department':
                              return item?.department?.name || item?.department || '-'
                            case 'status':
                              return (
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    item.status === 'Active'
                                      ? 'bg-green-100 text-green-700'
                                      : item.status === 'On Leave'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : item.status === 'Resigned'
                                          ? 'bg-red-100 text-red-700'
                                          : item.status === 'Retired'
                                            ? 'bg-gray-200 text-gray-700'
                                            : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              )
                            case 'dob':
                              return formatDateToDDMMYYYY(item[col.key])
                            default:
                              return item[col.key] || '-'
                          }
                        })()}
                      </td>
                    ))}

                    {/* ACTION */}
                    <td
                      className="sticky right-0 z-10 bg-white px-3 py-2 text-center"
                      style={{ minWidth: 120 }}
                    >
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/teacher/register/${item._id}`)}
                          className="text-green-600 hover:bg-green-600 hover:text-white p-2 rounded-full"
                        >
                          <Eye size={16} />
                        </button>

                        {/* <button
                          onClick={() => {
                            setSelectedItem(item)
                            setIsModalOpen(true)
                          }}
                          className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-full"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination */}
      {!loading && data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-end">
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              pageSizeOptions={['5', '10', '20', '50']}
              onChange={setPage}
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
  )
}

export default AdminTeachersList
