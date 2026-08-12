import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest, getRequest } from '../../../Helpers'

const SectionMasterModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  currentSession,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    classes: '',
    isActive: true,
    session: currentSession?._id || '',
  })

  const [classList, setClassList] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* 🔹 Load class list on mount */
  useEffect(() => {
    if (!currentSession?._id) return

    getRequest(`classes?session=${currentSession._id}&isPagination=false`) // 🔹 session filter
      .then((res) => {
        setClassList(res?.data?.data?.classes || [])
      })
      .catch(() => toast.error('Failed to load classes'))
  }, [currentSession])

  /* 🔹 Set form data for edit modal safely */
  useEffect(() => {
    if (!modalData || classList.length === 0) return

    const selectedClassId = modalData.classes?._id || modalData.class?._id || ''

    setFormData({
      name: modalData.name || '',
      classes: selectedClassId,
      isActive: modalData.isActive ?? true,
      session: currentSession?._id || '',
    })
  }, [modalData, classList])

  /* 🔹 Close modal */
  const handleCancel = () => {
    setFormData({ name: '', classes: '', isActive: true, session: currentSession?._id || '' })
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

  /* 🔹 Form validation */
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Section name is required'
    if (!formData.classes) newErrors.classes = 'Class is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* 🔹 Add Section */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    postRequest({
      url: 'sections',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Section added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  /* 🔹 Edit Section */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `sections/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Section updated successfully')
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
      title={modalData ? 'Edit Section' : 'Add Section'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        {/* Class Select */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Class<span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.classes ? 'is-invalid' : ''}`}
            name="classes"
            value={formData.classes}
            onChange={handleChange}
          >
            <option value="">Select Class</option>
            {classList.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classes && <div className="invalid-feedback">{errors.classes}</div>}
        </div>

        {/* Section Name */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Section Name<span className="text-danger">*</span>
          </label>
          <select
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
          >
            <option value="">Select Section</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Active Checkbox */}
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
            {loading ? 'Saving...' : 'Save Section'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default SectionMasterModal
