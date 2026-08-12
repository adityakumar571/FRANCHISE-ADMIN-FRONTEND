/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useContext } from 'react'
import { Plus, Search, Trash2, Calendar, User, X, Users, Clock, Edit } from 'lucide-react'
import { AppContext } from '../../Context/AppContext'
import toast from 'react-hot-toast'
import { Pagination } from 'antd'
import TeacherNoticeFormModal from '../features/Teacher/Communication/TeacherNoticeFormModal'
import { getRequest, deleteRequest, patchRequest } from '../../Helpers'
import AdminNoticeFormModal from '../Features/Admin/Notice/AdminNoticeFormModal'
import SuperAdminNoticeFormModal from '../Features/SuperAdmin/Notice/SuperAdminNoticeFormModal'
import NoticeFilter from './NoticeFilter'
import { canEditOrDeleteNotice, getEditTimeRemaining } from './noticePermissions/noticePermissions'
import { useNoticeActions } from './noticePermissions/useNoticeActions'
import StudentNoticeFormModal from '../Features/Student/Communication/StudentNoticeFormModal'
import Loader from '../../components/Loading/Loader'
import { SessionContext } from '../../Context/Seesion'
import jsPDF from 'jspdf'

const CommunicationUI = () => {
  const { user } = useContext(AppContext)
  const { currentSession } = useContext(SessionContext)
  const role = user?.role
  const userId = user?._id
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [notices, setNotices] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [editingNotice, setEditingNotice] = useState(null)
  const { deleteNotice } = useNoticeActions({
    setUpdateStatus,
    setLoading,
  })

  const getTodayDate = () => new Date().toISOString().split('T')[0]

  const [filters, setFilters] = useState({
    search: '',
    fromDate: getTodayDate(),
    toDate: getTodayDate(),
    sortBy: 'recent',
    page: 1,
    limit: 10,
    // session: currentSession?._id || '',
  })

  const [total, setTotal] = useState(0)
  // useEffect(() => {
  //   if (currentSession?._id) {
  //     setFilters((prev) => ({
  //       ...prev,
  //       session: currentSession._id,
  //       page: 1,
  //     }))
  //   }
  // }, [currentSession])

  /* ===================== FETCH NOTICES ===================== */
  const fetchNotices = () => {
    setLoading(true)
    const query = new URLSearchParams({
      search: filters.search,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page,
      limit: filters.limit,
      session: currentSession?._id,
    }).toString()
    getRequest(`notices?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        const fetchedNotices = responseData?.notices || []
        setNotices(fetchedNotices)
        setTotal(responseData?.totalNotices || 0)

        // Unread notices ko mark-as-read karo
        const unreadIds = fetchedNotices
          .filter((n) => !n.isRead)
          .map((n) => n._id)
        if (unreadIds.length > 0) {
          patchRequest({ url: 'notices/mark-read', cred: { noticeIds: unreadIds } }).catch(
            () => { },
          )
        }
      })
      .catch(() => {
        toast.error('Failed to fetch notices')
      })
      .finally(() => setLoading(false))
  }

  const getNoticeModalByRole = () => {
    switch (role) {
      case 'Teacher':
        return TeacherNoticeFormModal
      case 'Student':
        return StudentNoticeFormModal
      case 'Admin':
        return AdminNoticeFormModal
      case 'SuperAdmin':
        return SuperAdminNoticeFormModal
      default:
        return null
    }
  }

  const NoticeModalComponent = getNoticeModalByRole()

  useEffect(() => {
    if (!currentSession?._id) return
    fetchNotices()
  }, [filters, currentSession, updateStatus])

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRecipients = (recipients) => {
    const parts = []

    if (recipients.roles && recipients.roles.length > 0) {
      parts.push(recipients.roles.join(', '))
    }

    if (recipients.specificTeachers && recipients.specificTeachers.length > 0) {
      parts.push(`${recipients.specificTeachers.length} Teacher(s)`)
    }

    if (recipients.specificStudents && recipients.specificStudents.length > 0) {
      parts.push(`${recipients.specificStudents.length} Student(s)`)
    }

    if (recipients.specificAdmins && recipients.specificAdmins.length > 0) {
      parts.push(`${recipients.specificAdmins.length} Admin(s)`)
    }

    if (recipients.classIds && recipients.classIds.length > 0) {
      parts.push(`${recipients.classIds.length} Class(es)`)
    }

    if (recipients.sectionIds && recipients.sectionIds.length > 0) {
      parts.push(`${recipients.sectionIds.length} Section(s)`)
    }

    return parts.length > 0 ? parts.join(', ') : 'All Users'
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      fromDate: '',
      toDate: '',
      sortBy: 'recent',
      page: 1,
      limit: 10,
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const noticeDate = new Date(date)
    noticeDate.setHours(0, 0, 0, 0)

    if (noticeDate.getTime() === today.getTime()) {
      return 'Today'
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }
  const filteredNotices = notices.filter((notice) => {
    if (activeTab === 'all') return true
    if (activeTab === 'sent') return notice.senderUser._id === userId
    if (activeTab === 'received') return notice.senderUser._id !== userId
    return true
  })

  const handleEdit = (notice) => {
    setEditingNotice(notice)
    setSelectedItem(notice)
    setIsModalOpen(true)
  }

  const handleDownloadPDF = (notice) => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text('NOTICE', 105, 20, null, null, 'center')

    // Divider
    doc.setLineWidth(0.5)
    doc.line(20, 25, 190, 25)

    // Content
    doc.setFontSize(12)

    doc.text(`Title: ${notice.title}`, 20, 40)
    doc.text(`By: ${notice.senderUser?.name} (${notice.senderUser?.role})`, 20, 50)
    doc.text(`Date: ${formatDate(notice.createdAt)} | ${formatTime(notice.createdAt)}`, 20, 60)

    doc.text('Description:', 20, 75)

    // Multi-line description
    const splitDesc = doc.splitTextToSize(notice.description, 170)
    doc.text(splitDesc, 20, 85)

    doc.text(`Recipients: ${getRecipients(notice.recipients)}`, 20, 120)

    // Footer
    doc.setFontSize(10)
    doc.text('Generated by Notice System', 105, 280, null, null, 'center')

    // Save
    doc.save(`${notice.title}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="  px-4 py-3 bg-white rounded-lg border border-blue-100 mb-6 ">
        <div className=" mx-auto ">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                <div className=" text-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                Notice Board
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Stay updated with all announcements and communications
              </p>
            </div>
            {['Admin', 'Teacher', 'Student', 'SuperAdmin'].includes(role) && (
              <button
                onClick={() => {
                  setSelectedItem(null)
                  setIsModalOpen(true)
                }}
                className="bg-[#0c3b73] hover:from-blue-700 hover:to-blue-800 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Create Notice</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" mx-auto">
        {/* NOTICE FILTER HERE */}
        <NoticeFilter
          initialFilters={filters}
          onApply={(data) => {
            setFilters((prev) => ({
              ...prev,
              ...data,
              page: 1,
            }))
          }}
        />

        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-2 text-sm font-semibold transition-all ${activeTab === 'all'
                  ? 'text-[#042954] border-b-2 border-[#042954] bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              All Notices
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">
                {notices.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 px-6 py-2 text-sm font-semibold transition-all ${activeTab === 'sent'
                  ? 'text-[#042954] border-b-2 border-[#042954] bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Sent
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">
                {notices.filter((n) => n.senderUser?._id === userId).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 px-6 py-2 text-sm font-semibold transition-all ${activeTab === 'received'
                  ? 'text-[#042954] border-b-2 border-[#042954] bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Received
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">
                {notices.filter((n) => n.senderUser?._id !== userId).length}
              </span>
            </button>
          </div>
        </div>

        {/* Notices Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <Loader />
              <p className="text-gray-600 mt-4 text-sm font-medium">Loading notices...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <div className="text-gray-300 mb-4">
                <Search size={64} className="mx-auto" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">No notices found</h3>
              <p className="text-gray-600 text-sm">
                {activeTab === 'sent'
                  ? "You haven't sent any notices yet"
                  : activeTab === 'received'
                    ? 'No notices received'
                    : 'Try adjusting your search or date filters'}
              </p>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const canModify = canEditOrDeleteNotice({
                notice,
                user,
                activeTab,
              })

              const timeRemaining = getEditTimeRemaining(notice.createdAt)

              return (
                <div
                  key={notice._id}
                  className={`relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border overflow-hidden group ${!notice.isRead ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                    }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#042954] flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {getInitials(notice.senderUser?.name)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        {/* <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {notice.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <User size={14} />
                                <span className="font-medium">{notice.senderUser?.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {notice.senderUser?.role}
                                </span>
                              </div>
                            </div>
                          </div> */}

                        {/* Date - Right Side */}
                        {/* <div className="text-right flex-shrink-0">
                            <div className="text-xs sm:text-sm font-semibold text-gray-900">
                              {formatDate(notice.createdAt)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatTime(notice.createdAt)}
                            </div>
                          </div>
                        </div> */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            {!notice.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                              {notice.title}
                            </h3>
                          </div>

                          {/* <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <User size={14} />
                              <span className="font-medium">{notice.senderUser?.name}</span>
                            </div>

                            <span className="px-2 py-0.5 bg-blue-100 text-[#042954] rounded-full text-xs font-medium">
                              {notice.senderUser?.role}
                            </span>

                            <span className="text-gray-500">
                              {formatDate(notice.createdAt)} • {formatTime(notice.createdAt)}
                            </span>
                          </div> */}

                          <div className="flex w-full items-center justify-between text-xs sm:text-sm text-gray-600">
                            {/* LEFT SIDE */}
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <User size={14} />
                                <span className="font-medium">{notice.senderUser?.name}</span>
                              </div>

                              <span className="px-2 py-0.5 bg-blue-100 text-[#042954] rounded-full text-xs font-medium">
                                {notice.senderUser?.role}
                              </span>
                            </div>

                            {/* RIGHT SIDE (DATE + TIME) */}
                            {/* <span className="text-gray-500 whitespace-nowrap">
                              {formatDate(notice.createdAt)} • {formatTime(notice.createdAt)}
                            </span> */}

                            <div className="flex flex-col items-end gap-1">
                              {/* DOWNLOAD BUTTON */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadPDF(notice)
                                }}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200 transition"
                              >
                                Download
                              </button>

                              {/* DATE */}
                              <span className="text-gray-500 whitespace-nowrap">
                                {formatDate(notice.createdAt)} • {formatTime(notice.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                          {notice.description}
                        </p>

                        {/* Recipients & Timer */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Users size={14} />
                              <span className="font-medium">Received By:</span>
                            </div>
                            <span className="text-gray-700">
                              {getRecipients(notice.recipients)}
                            </span>
                          </div>

                          {canModify && timeRemaining && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              <Clock size={12} />
                              <span className="font-medium">{timeRemaining}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {canModify && (
                        <div
                          className="
      absolute 
      top-3 right-3 
      z-20
      flex gap-1
      opacity-100 sm:opacity-0
      sm:group-hover:opacity-100
      transition-opacity
    "
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(notice)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Notice"
                          >
                            <Edit size={18} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (window.confirm('Are you sure you want to delete this notice?')) {
                                deleteNotice(notice._id)
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Border Accent */}
                  <div className="h-1 bg-[#042954]"></div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {total > filters.limit && (
          <div className="flex justify-end mt-8">
            <Pagination
              current={filters.page}
              pageSize={filters.limit}
              total={total}
              showSizeChanger={false}
              showLessItems
              onChange={(page) => {
                setFilters({ ...filters, page })
              }}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && NoticeModalComponent && (
        <NoticeModalComponent
          user={user}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
        />
      )}
    </div>
  )
}

export default CommunicationUI
