import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../Helpers'

const ClassMasterModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  currentSession,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    isSenior: false,
    isActive: true,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /*  Edit case me data set karo */
  useEffect(() => {
    if (modalData) {
      setFormData({
        name: modalData.name || '',
        isSenior: modalData.isSenior ?? false,
        isActive: modalData.isActive ?? true,
      })
    }
  }, [modalData])

  /*  Close modal */
  const handleCancel = () => {
    setFormData({ name: '', isActive: true })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  /*  Input change */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })

    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /*  Validation */
  const validateForm = () => {
    let newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Class name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /*  Add Class */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    postRequest({
      url: 'classes',
      cred: {
        ...formData,
        session: currentSession?._id, // ✅ auto session
      },
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Class added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  /*  Edit Class */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `classes/${modalData?._id}`,
      cred: {
        ...formData,
        session: currentSession?._id,
      },
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Class updated successfully')
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
      title={modalData ? 'Edit Class' : 'Add Class'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        {/* Class Name */}
        <div className="mb-3">
          <label className="form-label fw-bold" htmlFor="class">
            Class Name<span className="text-danger">*</span>
          </label>
          <input
            id="class"
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Class Name"
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
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="isSenior"
            name="isSenior"
            checked={formData.isSenior}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="isSenior">
            Senior Class
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
            {loading ? 'Saving...' : 'Save Class'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ClassMasterModal
