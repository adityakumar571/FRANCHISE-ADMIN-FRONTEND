/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext } from 'react'
import { Layers, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import StreamModal from './StreamModal'
import StreamsFilters from './StreamsFilters'
import AppTable, { Td } from '../../../components/AppTable'
import { SessionContext } from '../../../Context/Seesion'

const StreamsMaster = () => {
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
  const [classId, setClassId] = useState('')
  const { currentSession } = useContext(SessionContext)

  /* ── Fetch ── */
  useEffect(() => {
    if (!currentSession?._id || !classId) { setData([]); setTotal(0); return }
    setLoading(true)
    const query = new URLSearchParams({ search: searchTerm, page, limit, classId, session: currentSession._id }).toString()
    getRequest(`streams?${query}`)
      .then((res) => {
        const d = res?.data?.data
        setData(d?.streams || [])
        setTotal(d?.totalStreams || 0)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to fetch streams'))
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, classId, currentSession, updateStatus])

  const handleApplyFilter = (selectedClassId) => { setClassId(selectedClassId); setPage(1) }
  const handleResetFilter = () => { setClassId(''); setSearchTerm(''); setPage(1) }

  /* ── Delete ── */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    deleteRequest(`streams/${selectedItem._id}`)
      .then((res) => { toast.success(res?.data?.message || 'Stream deleted'); setUpdateStatus((p) => !p); setShowDeleteModal(false); setSelectedItem(null) })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
  }

  /* ── Toggle ── */
  const handleToggle = (id) => {
    if (isToggling) return
    const selected = data.find((item) => item._id === id)
    if (!selected) return
    const newStatus = !selected.isActive
    setIsToggling(true)
    putRequest({ url: `streams/${id}`, cred: { isActive: newStatus } })
      .then(() => { toast.success(`Stream ${newStatus ? 'Activated' : 'Deactivated'}`); setData((prev) => prev.map((item) => item._id === id ? { ...item, isActive: newStatus } : item)) })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setIsToggling(false))
  }

  return (
    <div className="min-h-screen">
      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete <b>{selectedItem?.name}</b>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button onClick={confirmDelete} disabled={loading} className={`px-5 py-2 text-white ${loading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'}`}>
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Layers className="text-[#e24028] w-5 h-5" />
              Streams Master
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage classes streams and their status</p>
          </div>
          <button onClick={() => { setSelectedItem(null); setIsModalOpen(true) }} className="bg-[#0c3b73] hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus size={16} /> Add Stream
          </button>
        </div>
      </div>

      {/* Filters */}
      <StreamsFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} onApply={handleApplyFilter} onReset={handleResetFilter} />

      {/* Table */}
      <AppTable
        columns={[
          { key: 'sr',     label: 'Sr. No.', align: 'center', width: 80 },
          { key: 'class',  label: 'Class',   align: 'center', width: 140 },
          { key: 'stream', label: 'Stream',  align: 'left',   width: 180 },
          { key: 'status', label: 'Status',  align: 'center', width: 100 },
          { key: 'action', label: 'Action',  align: 'center', width: 120, sticky: 'right' },
        ]}
        data={!classId ? [] : data}
        loading={loading}
        emptyText={!classId ? 'Please select a class and click Apply' : 'No records found'}
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
            <Td>{item.name}</Td>
            <Td align="center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={item.isActive} disabled={isToggling} onChange={() => handleToggle(item._id)} />
                <div className="w-9 h-5 bg-red-500 peer-checked:bg-green-500 rounded-full" />
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4" />
              </label>
            </Td>
            <Td align="center" sticky="right">
              <div className="flex justify-center gap-2">
                <button onClick={() => { setSelectedItem(item); setIsModalOpen(true) }} className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded"><Edit size={16} /></button>
                <button onClick={() => { setSelectedItem(item); setShowDeleteModal(true) }} className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded"><Trash2 size={16} /></button>
              </div>
            </Td>
          </>
        )}
      </AppTable>

      {/* Modal */}
      {isModalOpen && (
        <StreamModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} modalData={selectedItem} setModalData={setSelectedItem} setUpdateStatus={setUpdateStatus} currentSession={currentSession} />
      )}
    </div>
  )
}

export default StreamsMaster
