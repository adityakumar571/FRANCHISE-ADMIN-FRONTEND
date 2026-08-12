/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest, getRequest } from '../../../Helpers'


const StreamModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  currentSession,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    classId: '',
    isActive: true,
    session: currentSession?._id || '',
  })

  const [classList, setClassList] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* 🔹 Load class list */
  useEffect(() => {
    if (!currentSession?._id) return

    getRequest(`classes?session=${currentSession._id}&isPagination=false&isSenior=true`) // 🔹 session filter
      .then((res) => {
        setClassList(res?.data?.data?.classes || [])
      })
      .catch(() => toast.error('Failed to load classes'))
  }, [currentSession])

  /* 🔹 Set form data in edit mode */
  useEffect(() => {
    if (!modalData) return

    const selectedClassId =
      modalData.classId?._id || modalData.classId || modalData.class?._id || ''

    setFormData({
      name: modalData.name || '',
      classId: selectedClassId,
      isActive: modalData.isActive ?? true,
      session: currentSession?._id || '',
    })
  }, [modalData])

  /* 🔹 Close modal */
  const handleCancel = () => {
    setFormData({ name: '', classId: '', isActive: true, session: currentSession?._id || '' })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  /* 🔹 Input change */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
      session: currentSession?._id || '',
    })
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* 🔹 Validation */
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.classId) newErrors.classId = 'Class is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* 🔹 Create */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    postRequest({
      url: 'streams', // or sections
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Created successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  /* 🔹 Update */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `streams/${modalData?._id}`, // or sections/:id
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Updated successfully')
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
      title={modalData ? 'Edit Stream' : 'Add Stream'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        {/* Class */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Class<span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.classId ? 'is-invalid' : ''}`}
            name="classId"
            value={formData.classId}
            onChange={handleChange}
          >
            <option value="">Select Class</option>
            {classList.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId && <div className="invalid-feedback">{errors.classId}</div>}
        </div>

        {/* Name */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Stream Name<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Stream Name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Active */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
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

export default StreamModal
