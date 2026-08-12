/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest, getRequest } from '../../../Helpers'

const StationModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  selectedRoute,
}) => {
  const [formData, setFormData] = useState({
    routeId: '',
    stopName: '',
    pickupTime: '',
    dropTime: '',
    feeHomeToSchool: '',
    feeSchoolToHome: '',
    feeBoth: '',
  })

  const [routes, setRoutes] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* 🔹 Time Format */
  const formatTimeForInput = (time) => {
    if (!time) return ''
    const [t, modifier] = time.split(' ')
    let [hours, minutes] = t.split(':')

    if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12
    if (modifier === 'AM' && hours === '12') hours = '00'

    return `${hours.toString().padStart(2, '0')}:${minutes}`
  }

  const formatTimeForAPI = (time) => {
    if (!time) return ''
    let [hours, minutes] = time.split(':')
    const h = parseInt(hours)

    const suffix = h >= 12 ? 'PM' : 'AM'
    const formattedHour = h % 12 === 0 ? 12 : h % 12

    return `${formattedHour.toString().padStart(2, '0')}:${minutes} ${suffix}`
  }

  /* 🔹 Load Routes */
  useEffect(() => {
    getRequest('transport')
      .then((res) => {
        const responseData = res?.data?.data
        setRoutes(responseData?.routes || [])
      })
      .catch(() => toast.error('Failed to load routes'))
  }, [])

  /* 🔹 Edit Mode */
  useEffect(() => {
    if (!modalData) {
      setFormData((prev) => ({
        ...prev,
        routeId: selectedRoute || '',
      }))
      return
    }

    setFormData({
      routeId: modalData.routeId?._id || modalData.routeId || '',
      stopName: modalData.stopName || '',
      pickupTime: formatTimeForInput(modalData.pickupTime),
      dropTime: formatTimeForInput(modalData.dropTime),
      feeHomeToSchool: modalData.feeHomeToSchool ?? '',
      feeSchoolToHome: modalData.feeSchoolToHome ?? '',
      feeBoth: modalData.feeBoth ?? modalData.feeAmount ?? '',
    })
  }, [modalData, selectedRoute])

  /* 🔹 Close */
  const handleCancel = () => {
    setFormData({
      routeId: '',
      stopName: '',
      pickupTime: '',
      dropTime: '',
      feeHomeToSchool: '',
      feeSchoolToHome: '',
      feeBoth: '',
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  /* 🔹 Change */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* 🔹 Validation */
  const validateForm = () => {
    const newErrors = {}

    if (!formData.routeId) newErrors.routeId = 'Route is required'
    if (!formData.stopName) newErrors.stopName = 'Stop name is required'
    if (!formData.feeBoth && !formData.feeHomeToSchool && !formData.feeSchoolToHome)
      newErrors.feeBoth = 'At least one fee is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* 🔹 CREATE */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    const payload = {
      ...formData,
      pickupTime: formatTimeForAPI(formData.pickupTime),
      dropTime: formatTimeForAPI(formData.dropTime),
    }

    postRequest({
      url: 'transport/stops',
      cred: payload,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Stop created')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Error'))
      .finally(() => setLoading(false))
  }

  /* 🔹 UPDATE */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    const payload = {
      ...formData,
      pickupTime: formatTimeForAPI(formData.pickupTime),
      dropTime: formatTimeForAPI(formData.dropTime),
    }

    putRequest({
      url: `transport/stops/${modalData?._id}`,
      cred: payload,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Stop updated')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Update failed'))
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={modalData ? 'Edit Stop' : 'Add Stop'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        <div className="row">
          {/* Route */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Route<span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.routeId ? 'is-invalid' : ''}`}
              name="routeId"
              value={formData.routeId}
              onChange={handleChange}
            >
              <option value="">Select Route</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.routeName}
                </option>
              ))}
            </select>
            {errors.routeId && <div className="invalid-feedback">{errors.routeId}</div>}
          </div>

          {/* Stop Name */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Stop Name<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.stopName ? 'is-invalid' : ''}`}
              name="stopName"
              value={formData.stopName}
              onChange={handleChange}
              placeholder="Enter Stop Name"
            />
            {errors.stopName && <div className="invalid-feedback">{errors.stopName}</div>}
          </div>

          {/* Pickup */}
          {/* <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Pickup Time<span className="text-danger">*</span>
            </label>
            <input
              type="time"
              className={`form-control ${errors.pickupTime ? 'is-invalid' : ''}`}
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
            />
            {errors.pickupTime && <div className="invalid-feedback">{errors.pickupTime}</div>}
          </div> */}

          {/* Drop */}
          {/* <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Drop Time<span className="text-danger">*</span>
            </label>
            <input
              type="time"
              className={`form-control ${errors.dropTime ? 'is-invalid' : ''}`}
              name="dropTime"
              value={formData.dropTime}
              onChange={handleChange}
            />
            {errors.dropTime && <div className="invalid-feedback">{errors.dropTime}</div>}
          </div> */}

          {/* Fee - Home to School */}
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">
              Home → School Fee
            </label>
            <input
              type="number"
              min="0"
              className="form-control"
              name="feeHomeToSchool"
              value={formData.feeHomeToSchool}
              onChange={handleChange}
              placeholder="One-way fee"
            />
          </div>

          {/* Fee - School to Home */}
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">
              School → Home Fee
            </label>
            <input
              type="number"
              min="0"
              className="form-control"
              name="feeSchoolToHome"
              value={formData.feeSchoolToHome}
              onChange={handleChange}
              placeholder="One-way fee"
            />
          </div>

          {/* Fee - Both */}
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">
              Both Ways Fee<span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="0"
              className={`form-control ${errors.feeBoth ? 'is-invalid' : ''}`}
              name="feeBoth"
              value={formData.feeBoth}
              onChange={handleChange}
              placeholder="Both ways fee"
            />
            {errors.feeBoth && <div className="invalid-feedback">{errors.feeBoth}</div>}
          </div>
        </div>

        {/* Buttons */}
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

export default StationModal
