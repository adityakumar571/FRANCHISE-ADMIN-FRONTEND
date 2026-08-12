import React, { useContext, useEffect, useState } from 'react'
import { User, Edit, Trash2, Plus, AlertTriangle, Loader2, View, Eye } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import { Pagination } from 'antd'
import TeacherModal from './TeacherModal/TeacherModal'
import TeacherFilters from './TeacherFilters'
import { useNavigate } from 'react-router-dom'
import { SessionContext } from '../../Context/Seesion'
import Loader from '../../components/Loading/Loader'

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
  // { key: 'salary', label: 'Salary' },
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
  // salary: '120px',
  status: '110px',
  action: '120px',
}

const TeacherRegister = () => {
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
  const navigate = useNavigate()
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
      status: appliedFilters.status !== 'all' ? appliedFilters.status : '',
      department: appliedFilters.department !== 'all' ? appliedFilters.department : '',
      designation: appliedFilters.designation !== 'all' ? appliedFilters.designation : '',
      employmentType: appliedFilters.employmentType !== 'all' ? appliedFilters.employmentType : '',
      classId: appliedFilters.classId !== 'all' ? appliedFilters.classId : '',
      sectionId: appliedFilters.sectionId !== 'all' ? appliedFilters.sectionId : '',
      dob: appliedFilters.dob,

      page,
      limit,
    }).toString()

    getRequest(`teachers?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.teachers || [])
        setTotal(responseData?.totalTeachers || 0)
      })
      .catch(() => toast.error('Failed to fetch teachers'))
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, appliedFilters, updateStatus])

  const applyFilters = () => {
    setAppliedFilters(filters)
    setPage(1)
  }

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)

    deleteRequest(`teachers/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Teacher deleted')
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <b>{selectedItem?.name}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className={`px-5 py-2 text-white ${
                  loading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <User className="text-[#e24028]" />
              Teacher Master
            </h1>
            <p className="text-sm text-gray-500">Manage teachers and their status</p>
          </div>

          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] hover:bg-blue-800 text-sm text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Add Teacher
          </button>
        </div>
      </div>

      <TeacherFilters
        filters={filters}
        setFilters={setFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setPage={setPage}
        applyFilters={applyFilters}
        setAppliedFilters={setAppliedFilters}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        allColumns={ALL_COLUMNS}
      />

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

                        <button
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
                        </button>
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

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <TeacherModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setUpdateStatus={setUpdateStatus}
        />
      )}
    </div>
  )
}

export default TeacherRegister
