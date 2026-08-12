/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../Helpers'

const ExamMasterModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  currentSession,
}) => {
  const [formData, setFormData] = useState({
    examName: '',
    category: '',
    isActive: true,
    session: currentSession?._id || '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Prefill form for edit
  useEffect(() => {
    if (!modalData) return
    setFormData({
      examName: modalData.examName || '',
      category: modalData.category || '',
      isActive: modalData.isActive ?? true,
      session: currentSession?._id || '',
    })
  }, [modalData])

  // Close modal
  const handleCancel = () => {
    setFormData({
      examName: '',
      category: '',
      isActive: true,
      session: currentSession?._id || '',
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    if (!formData.examName.trim()) newErrors.examName = 'Exam name is required'
    if (!formData.category) newErrors.category = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit new exam
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const payload = { ...formData, session: currentSession }
    postRequest({
      url: 'exams',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Exam added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  // Edit existing exam
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const payload = { ...formData, session: currentSession }
    putRequest({
      url: `exams/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Exam updated successfully')
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
      title={modalData ? 'Edit Exam' : 'Add Exam'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        {/* Row 1: Exam Name + Category */}
        <div className="row">
          {/* Exam Name */}
          <div className="col-md-12 mb-3">
            <label className="form-label fw-bold">
              Exam Name<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.examName ? 'is-invalid' : ''}`}
              name="examName"
              value={formData.examName}
              onChange={handleChange}
              placeholder="Enter Exam Name"
            />
            {errors.examName && <div className="invalid-feedback">{errors.examName}</div>}
          </div>

          {/* Category */}
          <div className="col-md-12 mb-3">
            <label className="form-label fw-bold">
              Category<span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.category ? 'is-invalid' : ''}`}
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              <option value="EXAM">EXAM</option>
              <option value="TEST">TEST</option>
            </select>
            {errors.category && <div className="invalid-feedback">{errors.category}</div>}
          </div>
        </div>

        {/* Row 2: Active checkbox */}
        <div className="row">
          <div className="col-12 mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label className="form-check-label fw-bold" htmlFor="isActive">
                Active
              </label>
            </div>
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
            {loading ? 'Saving...' : modalData ? 'Update Exam' : 'Save Exam'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ExamMasterModal
