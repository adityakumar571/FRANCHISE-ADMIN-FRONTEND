/* eslint-disable prettier/prettier */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../Helpers'

const CategoryMasterModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* Edit case me data set karo */
  useEffect(() => {
    if (modalData) {
      setFormData({
        name: modalData.name || '',
        description: modalData.description || '',
      })
    }
  }, [modalData])

  /* Close modal */
  const handleCancel = () => {
    setFormData({ name: '', description: '' })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  /* Input change */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* Validation */
  const validateForm = () => {
    let newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Category name is required'
    // if (!formData.description.trim()) newErrors.description = 'Description is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* Add Category */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    postRequest({
      url: 'categoryMaster/create',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Category created successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  /* Edit Category */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    putRequest({
      url: `categoryMaster/update/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Category updated successfully')
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
      title={modalData ? 'Edit Category' : 'Add Category'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        {/* Category Name */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Category Name<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Category Name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Description
            {/* <span className="text-danger">*</span> */}
          </label>
          <textarea
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter Description"
            rows={3}
          />
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
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
            {loading ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CategoryMasterModal
