/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Plus, Edit, AlertTriangle, Trash2 } from 'lucide-react'
import { deleteRequest, getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty } from 'antd'
import FeelateModal from './FeelateModal'
import Loader from '../../../components/Loading/Loader'
import { SessionContext } from '../../../Context/Seesion'

const FeeLate = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!currentSession?._id) return
    setLoading(true)
    getRequest(`late-fee/late-fee-setting?sessionId=${currentSession._id}`)
      .then((res) => {
        setData(res?.data?.data || [])
      })
      .catch(() => toast.error('Failed to fetch late fee setting'))
      .finally(() => setLoading(false))
  }, [currentSession, updateStatus])

  /* ================= STATUS TOGGLE ================= */

  const handleToggle = (item) => {
    const newStatus = !item.isActive

    putRequest({
      url: `late-fee/late-fee-setting/${item._id}`,
      cred: { isActive: newStatus },
    })
      .then(() => {
        toast.success(`Late Fee ${newStatus ? 'Activated' : 'Deactivated'}`)

        setData((prev) =>
          prev.map((row) => (row._id === item._id ? { ...row, isActive: newStatus } : row)),
        )
      })
      .catch(() => toast.error('Failed to update status'))
  }

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    deleteRequest(`late-fee/late-fee-setting/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Late Feedeleted')
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
        setSelectedItem(null)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Delete failed'))
      .finally(() => setLoading(false))
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

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold">Late Fee Setting</h2>
          <p className="text-sm text-gray-500">Manage late fee rules for fee collection</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0c3b73] text-white px-3 md:px-4 py-2 rounded flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus size={16} />
          Add Setting
        </button>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded  overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">
            <Loader />
          </div>
        ) : !data ? (
          <div className="p-6 text-center">
            <Empty description="No Late Fee Setting Found" />
          </div>
        ) : (
          <table className="w-full min-w-[700px] text-xs md:text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-1 text-center w-15">Sr. No.</th>
                <th className="px-3 text-center py-2">Grace Days</th>
                <th className="px-3 text-center py-2">Fine Type</th>
                <th className="px-3 text-center py-2">Fine Amount</th>
                <th className="px-3 text-center py-2">Max Fine</th>
                <th className="px-3 text-center py-2">Status</th>
                <th className="px-3 text-center py-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr key={item._id}>
                  <td className="border text-center py-1 w-15">{index + 1}</td>
                  <td className="border text-center px-3 py-2">{item.graceDays} Days</td>

                  <td className="border text-center  px-3 py-2">{item.fineType}</td>

                  <td className="border text-center px-3 py-2">₹{item.fineAmount}</td>

                  <td className="border text-center px-3 py-2">₹{item.maxFine}</td>

                  <td className="border  px-3 py-2 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.isActive}
                        onChange={() => handleToggle(item)}
                      />

                      <div className="w-9 h-5 bg-red-500 peer-checked:bg-green-500 rounded-full" />

                      <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4" />
                    </label>
                  </td>

                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() => {
                        setModalData(item)
                        setIsModalOpen(true)
                      }}
                      className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}

      {isModalOpen && (
        <FeelateModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={modalData}
          setUpdateStatus={setUpdateStatus}
          currentSession={currentSession}
        />
      )}
    </div>
  )
}

export default FeeLate
