/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../Helpers'

const RouteModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus, // ✅ important change
}) => {
  const [formData, setFormData] = useState({
    routeName: '',
    routeCode: '',
    startLocation: '',
    endLocation: '',
    isActive: true,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* 🔹 Edit Mode Data Fill */
  useEffect(() => {
    if (!modalData) return

    setFormData({
      routeName: modalData.routeName || '',
      routeCode: modalData.routeCode || '',
      startLocation: modalData.startLocation || '',
      endLocation: modalData.endLocation || '',
      isActive: modalData.isActive ?? true,
    })
  }, [modalData])

  /* 🔹 Close Modal */
  const handleCancel = () => {
    setFormData({
      routeName: '',
      routeCode: '',
      startLocation: '',
      endLocation: '',
      isActive: true,
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  /* 🔹 Input Change */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* 🔹 Validation */
  const validateForm = () => {
    const newErrors = {}

    if (!formData.routeName.trim()) newErrors.routeName = 'Route name is required'
    if (!formData.routeCode.trim()) newErrors.routeCode = 'Route code is required'
    if (!formData.startLocation.trim()) newErrors.startLocation = 'Start location required'
    if (!formData.endLocation.trim()) newErrors.endLocation = 'End location required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* 🔹 CREATE */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    postRequest({
      url: 'transport',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Route created')
        setUpdateStatus((prev) => !prev) // 🔥 refresh list
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  /* 🔹 UPDATE */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    putRequest({
      url: `transport/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Route updated')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={modalData ? 'Edit Route' : 'Add Route'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit}>

        <div className="row">

          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Route Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.routeName ? 'is-invalid' : ''}`}
              name="routeName"
              value={formData.routeName}
              onChange={handleChange}
              placeholder="Enter Route Name *"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Route Code <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.routeCode ? 'is-invalid' : ''}`}
              name="routeCode"
              value={formData.routeCode}
              onChange={handleChange}
              placeholder="Enter Route Code *"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Start Location <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.startLocation ? 'is-invalid' : ''}`}
              name="startLocation"
              value={formData.startLocation}
              onChange={handleChange}
              placeholder="Enter Start Location *"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              End Location <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.endLocation ? 'is-invalid' : ''}`}
              name="endLocation"
              value={formData.endLocation}
              onChange={handleChange}
              placeholder="Enter End Location *"
            />
          </div>

        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <label className="form-check-label">Active</label>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border rounded"
            style={{ backgroundColor: '#0c3b73', color: '#fff' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

      </form>
    </Modal>
  )
}

export default RouteModal
