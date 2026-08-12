import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../Helpers'

const DocumentsMasterModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  currentSession,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    isActive: true,
    session: currentSession?._id || '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* 🔹 Edit case me data set karo */
  useEffect(() => {
    if (modalData) {
      setFormData({
        name: modalData.name || '',
        category: modalData.category || '',
        isActive: modalData.isActive ?? true,
        session: currentSession?._id || '',
      })
    }
  }, [modalData])

  /* 🔹 Close modal */
  const handleCancel = () => {
    setFormData({ name: '', category: '', isActive: true, session: currentSession?._id || '' })
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
    })

    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* 🔹 Validation */
  const validateForm = () => {
    let newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Document name is required'

    if (!formData.category.trim()) newErrors.category = 'Category is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* 🔹 Add Document */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    postRequest({
      url: 'documents',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Document added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  /* 🔹 Edit Document */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `documents/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Document updated successfully')
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
      title={modalData ? 'Edit Document' : 'Add Document'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        {/* Document Name */}
        <div className="mb-3">
          <label className="form-label fw-bold" htmlFor="documentName">
            Document Name<span className="text-danger">*</span>
          </label>
          <input
            id="documentName"
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Document Name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="form-label fw-bold" htmlFor="category">
            Category<span className="text-danger">*</span>
          </label>
          <select
            id="category"
            className={`form-select ${errors.category ? 'is-invalid' : ''}`}
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
          </select>
          {errors.category && <div className="invalid-feedback">{errors.category}</div>}
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
            {loading ? 'Saving...' : 'Save Document'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default DocumentsMasterModal
