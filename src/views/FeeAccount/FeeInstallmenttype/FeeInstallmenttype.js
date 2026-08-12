/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Users, Edit, Trash2, Plus, AlertTriangle, Eye } from 'lucide-react'
import { deleteRequest, getRequest, postRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Modal } from 'antd'
import Loader from '../../../components/Loading/Loader'
import FeeInstallmenttypeModal from './FeeInstallmenttypeModal'

const INSTALLMENT_PERIODS = {
  MONTHLY: [
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
    'JANUARY',
    'FEBRUARY',
    'MARCH',
  ],
  QUARTERLY: ['APR-JUN', 'JUL-SEP', 'OCT-DEC', 'JAN-MAR'],
  CUSTOM_10: [
    'APRIL',
    'MAY-JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
    'JANUARY',
    'FEB-MARCH',
  ],
}
const FeeInstallmenttype = () => {
  const [data, setData] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const getPeriodsByType = (typeName) => {
    if (!typeName) return []
    return INSTALLMENT_PERIODS[typeName.toUpperCase()] || []
  }

  /* ================= FETCH ALL INSTALLMENT TYPES ================= */
  useEffect(() => {
    setLoading(true)

    getRequest(`installment-type/active`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData || [])
      })
      .catch(() => toast.error('Failed to fetch installment type'))
      .finally(() => setLoading(false))
  }, [updateStatus])

  /* ================= DELETE ================= */
  const confirmDelete = () => {
    if (!selectedItem?._id) return

    setLoading(true)
    deleteRequest(`installment-types/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Installment Type deleted')
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

      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Users className="text-[#e24028] w-5 h-5" />
              Installment Type Master
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                postRequest({ url: 'installment-type/seed', cred: {} })
                  .then(() => {
                    toast.success('Installment types synced successfully')
                    setUpdateStatus((prev) => !prev)
                  })
                  .catch(() => toast.error('Sync failed'))
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded flex items-center gap-2 text-sm"
            >
              Sync Types
            </button>
            <button
              onClick={() => {
                setSelectedItem(null)
                setIsModalOpen(true)
              }}
              className="bg-[#0c3b73] hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={16} /> Add Installment
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">
            <Loader />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 text-center">Sr.No.</th>
                <th className="px-3 py-2">Installment Type</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6">
                    <Empty />
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id}>
                    <td className="border px-3 py-2 text-center">{index + 1}</td>

                    <td className="border px-3 py-2">{item.name}</td>
                    {/* <td className="border px-3 py-2">
                      {item.isActive}
                    </td> */}

                    <td className="border px-3 py-2 text-center">
                      <label className="relative inline-flex cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.isActive}
                          onChange={() =>
                            putRequest({
                              url: `installment-type/${item._id}`,
                              cred: { isActive: !item.isActive },
                            })
                              .then((res) => {
                                toast.success(res?.data?.message || 'Status updated successfully')
                                setUpdateStatus((prev) => !prev)
                              })
                              .catch(() => toast.error('Failed to update status'))
                          }
                        />
                        <div className="w-9 h-5 bg-red-300 peer-checked:bg-green-500 rounded-full" />
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-4 transition" />
                      </label>
                    </td>

                    <td className="border px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setIsModalOpen(true)
                          }}
                          className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setViewItem(item)
                            setIsViewModalOpen(true)
                          }}
                          className="text-green-600 hover:bg-green-600 hover:text-white p-2 rounded"
                        >
                          {' '}
                          <Eye size={16} />
                        </button>

                        {/* <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded"
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
      <Modal
        title={`${viewItem?.name} - Periods`}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        centered
      >
        <div className="grid grid-cols-2 gap-2">
          {getPeriodsByType(viewItem?.name).length === 0 ? (
            <p>No periods found</p>
          ) : (
            getPeriodsByType(viewItem?.name).map((p, i) => (
              <div key={i} className="border px-3 py-1 rounded text-center bg-gray-100">
                {p}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <FeeInstallmenttypeModal
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

export default FeeInstallmenttype
