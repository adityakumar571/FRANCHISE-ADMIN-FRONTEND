/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../Helpers'

const SessionMasterModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
}) => {
  const [formData, setFormData] = useState({
    sessionName: '',
    isCurrent: false,
    isActive: true,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* 🔹 Edit Prefill */
  useEffect(() => {
    if (modalData) {
      setFormData({
        sessionName: modalData.sessionName || '',
        isCurrent: modalData.isCurrent ?? false,
        isActive: modalData.isActive ?? true,
      })
    }
  }, [modalData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* 🔹 Validation */
  const validateForm = () => {
    const err = {}
    if (!formData.sessionName.trim()) {
      err.sessionName = 'Session name is required'
    }
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const getPayload = () => ({
    sessionName: formData.sessionName.trim(),
    isCurrent: formData.isCurrent,
    isActive: formData.isActive,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    postRequest({ url: 'sessions', cred: getPayload() })
      .then((res) => {
        toast.success(res?.message || 'Session added successfully')
        setUpdateStatus((p) => !p)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }

  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `sessions/${modalData?._id}`,
      cred: getPayload(),
    })
      .then((res) => {
        toast.success(res?.message || 'Session updated successfully')
        setUpdateStatus((p) => !p)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }

  const handleCancel = () => {
    setFormData({
      sessionName: '',
      isCurrent: false,
      isActive: true,
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  return (
    <Modal
      title={modalData ? 'Edit Session' : 'Add Session'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      destroyOnClose
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        {/* Session Name */}
        <div className="mb-3">
          <label className="fw-bold">
            Session Name <span className="text-danger">*</span>
          </label>
          <input
            className={`form-control ${errors.sessionName ? 'is-invalid' : ''}`}
            name="sessionName"
            value={formData.sessionName}
            onChange={handleChange}
            placeholder="e.g. 2023-2024"
          />
          {errors.sessionName && <div className="invalid-feedback">{errors.sessionName}</div>}
        </div>

        {/* Current */}
        <div className="form-check mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            name="isCurrent"
            checked={formData.isCurrent}
            onChange={handleChange}
            id="isCurrent"
          />
          <label className="form-check-label" htmlFor="isCurrent">
            Current Session
          </label>
        </div>

        {/* Active */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            id="isActive"
          />
          <label className="form-check-label" htmlFor="isActive">
            Active
          </label>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="btn"
            style={{ backgroundColor: '#0c3b73', color: '#fff' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : modalData ? 'Update Session' : 'Save Session'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default SessionMasterModal
