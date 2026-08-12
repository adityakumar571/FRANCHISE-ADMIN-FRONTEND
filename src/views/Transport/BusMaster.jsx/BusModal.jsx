/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../Helpers'

const BusModal = ({ isModalOpen, setIsModalOpen, modalData, setModalData, setUpdateStatus }) => {
  const [formData, setFormData] = useState({
    busNumber: '',
    capacity: '',
    driverName: '',
    driverPhone: '',
    isActive: true,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* EDIT MODE */
  useEffect(() => {
    if (!modalData) return

    setFormData({
      busNumber: modalData.busNumber || '',
      capacity: modalData.capacity || '',
      driverName: modalData.driverName || '',
      driverPhone: modalData.driverPhone || '',
      isActive: modalData.isActive ?? true,
    })
  }, [modalData])

  /* CLOSE */
  const handleCancel = () => {
    setFormData({
      busNumber: '',
      capacity: '',
      driverName: '',
      driverPhone: '',
      isActive: true,
    })
    setModalData(null)
    setIsModalOpen(false)
    setErrors({})
  }

  /* CHANGE */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Phone limit 10 digits
    if (name === 'driverPhone' && value.length > 10) return

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })

    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* VALIDATION */
  const validate = () => {
    const err = {}

    if (!formData.busNumber) err.busNumber = 'Bus number required'
    if (!formData.capacity) err.capacity = 'Capacity required'
    else if (formData.capacity <= 0) err.capacity = 'Invalid capacity'

    if (!formData.driverName) err.driverName = 'Driver name required'

    if (!formData.driverPhone) err.driverPhone = 'Phone required'
    else if (!/^[0-9]{10}$/.test(formData.driverPhone))
      err.driverPhone = 'Enter valid 10 digit number'

    setErrors(err)
    return Object.keys(err).length === 0
  }

  /* CREATE */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    postRequest({
      url: 'transport/buses',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Bus created')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Error'))
      .finally(() => setLoading(false))
  }

  /* UPDATE */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    putRequest({
      url: `transport/buses/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Bus updated')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Update failed'))
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={modalData ? 'Edit Bus' : 'Add Bus'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit}>
        <div className="row">
          {/* Bus Number */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Bus Number<span className="text-danger">*</span>
            </label>
            <input
              name="busNumber"
              value={formData.busNumber}
              onChange={handleChange}
              className={`form-control ${errors.busNumber ? 'is-invalid' : ''}`}
              placeholder="UP70 AB 1234"
            />
            {errors.busNumber && <div className="invalid-feedback">{errors.busNumber}</div>}
          </div>

          {/* Capacity */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Capacity<span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
              placeholder="Enter Capacity"
            />
            {errors.capacity && <div className="invalid-feedback">{errors.capacity}</div>}
          </div>

          {/* Driver Name */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Driver Name<span className="text-danger">*</span>
            </label>
            <input
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              className={`form-control ${errors.driverName ? 'is-invalid' : ''}`}
              placeholder="Enter Driver Name"
            />
            {errors.driverName && <div className="invalid-feedback">{errors.driverName}</div>}
          </div>

          {/* Driver Phone */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Driver Phone<span className="text-danger">*</span>
            </label>
            <input
              type="number"
              name="driverPhone"
              value={formData.driverPhone}
              onChange={handleChange}
              className={`form-control ${errors.driverPhone ? 'is-invalid' : ''}`}
              placeholder="Enter Phone"
            />
            {errors.driverPhone && <div className="invalid-feedback">{errors.driverPhone}</div>}
          </div>

          {/* Active */}
          <div className="col-12">
            <div className="form-check">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="form-check-input"
              />
              <label className="form-check-label fw-bold">Active</label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-3">
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

export default BusModal
