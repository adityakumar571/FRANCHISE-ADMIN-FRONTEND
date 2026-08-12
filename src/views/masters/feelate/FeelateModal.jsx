/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import { Modal, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../Helpers'

const { Option } = Select

const FeelateModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setUpdateStatus,
  currentSession,
}) => {
  const [formData, setFormData] = useState({
    graceDays: '',
    fineType: 'PER_DAY',
    fineAmount: '',
    maxFine: '',
    isActive: true,
  })

  const [loading, setLoading] = useState(false)

  /* ================= EDIT DATA SET ================= */

  useEffect(() => {
    if (modalData && modalData._id) {
      setFormData({
        graceDays: modalData.graceDays || '',
        fineType: modalData.fineType || 'PER_DAY',
        fineAmount: modalData.fineAmount || '',
        maxFine: modalData.maxFine || '',
        isActive: modalData.isActive ?? true,
      })
    }
  }, [modalData])

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...formData,
      sessionId: currentSession?._id,
    }

    const request = modalData
      ? putRequest({
          url: `late-fee/late-fee-setting/${modalData._id}`,
          cred: payload,
        })
      : postRequest({
          url: `late-fee/late-fee-setting`,
          cred: payload,
        })

    request
      .then((res) => {
        toast.success(res?.data?.message || 'Saved successfully')
        setUpdateStatus((prev) => !prev)
        setIsModalOpen(false)
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  return (
    <Modal title="Late Fee Setting" open={isModalOpen} footer={null} onCancel={handleCancel}>
      <form onSubmit={handleSubmit}>
        {/* Grace Days */}
        <div className="mb-3">
          <label className="fw-bold">Grace Days</label>
          <input
            type="number"
            name="graceDays"
            value={formData.graceDays}
            min="0"
            placeholder="Enter grace days (e.g. 3)"
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* Fine Type */}
        <div className="mb-3">
          <label className="fw-bold">Fine Type</label>

          <Select
            value={formData.fineType}
            onChange={(value) => setFormData((prev) => ({ ...prev, fineType: value }))}
            style={{ width: '100%' }}
            placeholder="Select fine type"
          >
            <Option value="">Select Type</Option>
            <Option value="PER_DAY">Per Day</Option>
            <Option value="FIXED">Fixed</Option>
          </Select>
        </div>

        {/* Fine Amount */}
        <div className="mb-3">
          <label className="fw-bold">Fine Amount</label>
          <input
            type="number"
            name="fineAmount"
            value={formData.fineAmount}
            min="0"
            placeholder="Enter fine amount (e.g. 10)"
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* Max Fine */}

        <div className="mb-3">
          <label className="fw-bold">Max Fine</label>

          <input
            type="number"
            name="maxFine"
            value={formData.maxFine}
            min="0"
            placeholder="Enter maximum fine (e.g. 500)"
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* BUTTON */}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border rounded text-white"
            style={{ background: '#0c3b73' }}
          >
            {loading ? 'Saving...' : 'Save Setting'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default FeelateModal
