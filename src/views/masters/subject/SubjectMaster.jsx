/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext  } from 'react'
import { Users, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import SubjectMasterModal from './SubjectMasterModal'
import SubjectFilter from './SubjectFilter'
import AppTable, { Td } from '../../../components/AppTable'
import { SessionContext } from '../../../Context/Seesion'

const SubjectMaster = () => {
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
  const [selectedClassId, setSelectedClassId] = useState('')
  const [appliedClassId, setAppliedClassId] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [selectedStreamId, setSelectedStreamId] = useState('')
  const { currentSession } = useContext(SessionContext)

  /*======= Subject API===== */
  useEffect(() => {
    if (!appliedClassId || !currentSession?._id) return

    setLoading(true)

    const query = new URLSearchParams({
      classId: appliedClassId,
      ...(selectedStreamId && { streamId: selectedStreamId }),
      isActive: true,
      search: searchTerm,
      session: currentSession._id,
      page,
      limit,
    }).toString()

    getRequest(`subjects?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.subjects || [])
        setTotal(responseData?.totalSubjects || 0)
      })
      .catch(() => toast.error('Failed to fetch subjects'))
      .finally(() => {
        setLoading(false)
        setIsApplying(false) // ✅ NOW loader will stop correctly
      })
  }, [page, limit, searchTerm, updateStatus, selectedStreamId,currentSession,appliedClassId])

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    deleteRequest(`subjects/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Class deleted')
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
  }

  /* ================= STATUS TOGGLE ================= */
  const handleToggle = (id) => {
    if (isToggling) return
    const selected = data.find((item) => item._id === id)
    if (!selected) return
    setIsToggling(true)
    const newStatus = !selected.isActive
    putRequest({
      url: `subjects/${id}`,
      cred: { isActive: newStatus },
    })
      .then(() => {
        toast.success(`Subject ${newStatus ? 'Activated' : 'Deactivated'}`)

        // ✅ Update UI instantly
        setData((prev) =>
          prev.map((item) => (item._id === id ? { ...item, isActive: newStatus } : item)),
        )
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setIsToggling(false))
  }
  const handleApplyFilter = () => {
    setIsApplying(true)
    setAppliedClassId(selectedClassId)
    setPage(1)
  }

  return (
    <div className="min-h-screen">
      {/* ================= DELETE MODAL ================= */}
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

      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT CONTENT */}
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="text-[#e24028] w-5 h-5 sm:w-6 sm:h-6" />
              Subject Master
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage Subject used across the franchise system
            </p>
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] hover:bg-[#1b5498] text-white 
                 px-3 py-2 sm:px-4 sm:py-2 
                 rounded flex items-center justify-center gap-2
                 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={16} className="sm:w-4 sm:h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* FILTER CARD */}
      <SubjectFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedClassId={selectedClassId}
        setSelectedClassId={setSelectedClassId}
        selectedStreamId={selectedStreamId}
        setSelectedStreamId={setSelectedStreamId}
        onApply={handleApplyFilter}
        isApplying={isApplying}
        setPage={setPage}
      />

      {/* ================= TABLE ================= */}
      <AppTable
        columns={[
          { key: 'sr', label: 'Sr. No.', align: 'center', width: 80 },
          { key: 'class', label: 'Class', align: 'center', width: 120 },
          { key: 'stream', label: 'Stream', align: 'center', width: 140 },
          { key: 'subject', label: 'Subject Name', align: 'left', width: 180 },
          { key: 'status', label: 'Status', align: 'center', width: 100 },
          { key: 'action', label: 'Action', align: 'center', width: 120, sticky: 'right' },
        ]}
        data={!appliedClassId ? [] : data}
        loading={loading}
        emptyText={!appliedClassId ? 'Please select a class to view subjects' : 'No records found'}
        page={page}
        limit={limit}
        total={total}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => { setLimit(size); setPage(1) }}
        rowKey={(item) => item._id}
      >
        {(item, index) => (
          <>
            <Td align="center">{(page - 1) * limit + index + 1}</Td>
            <Td align="center">{item?.class?.name}</Td>
            <Td align="center">{item?.stream?.name || '—'}</Td>
            <Td>{item.name}</Td>
            {/* STATUS */}
            <Td align="center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={item.isActive}
                  disabled={isToggling}
                  onChange={() => handleToggle(item._id)}
                />
                <div className="w-9 h-5 bg-red-500 peer-checked:bg-green-500 rounded-full" />
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4" />
              </label>
            </Td>
            {/* ACTION */}
            <Td align="center" sticky="right">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => { setSelectedItem(item); setIsModalOpen(true) }}
                  className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => { setSelectedItem(item); setShowDeleteModal(true) }}
                  className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Td>
          </>
        )}
      </AppTable>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <SubjectMasterModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={selectedItem}
          setModalData={setSelectedItem}
          setUpdateStatus={setUpdateStatus}
          selectedClassId={selectedClassId}
          currentSession={currentSession}
        />
      )}
    </div>
  )
}

export default SubjectMaster
