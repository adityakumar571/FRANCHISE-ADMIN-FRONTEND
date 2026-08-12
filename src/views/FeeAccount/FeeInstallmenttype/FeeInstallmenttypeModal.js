/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../Helpers'

const FeeInstallmenttypeModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
}) => {
  const [formData, setFormData] = useState({
    type: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* 🔹 Edit Prefill */
  useEffect(() => {
  if (modalData?._id) {
    setFormData({
      type: modalData.name?.toUpperCase() || '',
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
    if (!formData.type.trim()) {
      err.type = 'Type is required'
    }
    setErrors(err)
    return Object.keys(err).length === 0
  }

 const getPayload = () => ({
  type: formData.type.trim().toUpperCase(),
})


  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    postRequest({ url: `installment-type/activate`, cred: getPayload() })
      .then((res) => {
        toast.success(res?.message || 'Type added successfully')
        setUpdateStatus((p) => !p)
        handleCancel()
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || 'Something went wrong')
      )
      .finally(() => setLoading(false))
  }

  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `installment-type/${modalData?._id}`,
      cred: getPayload(),
    })
      .then((res) => {
        toast.success(res?.message || 'Type updated successfully')
        setUpdateStatus((p) => !p)
        handleCancel()
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || 'Something went wrong')
      )
      .finally(() => setLoading(false))
  }

  const handleCancel = () => {
    setFormData({
      type: '',
      status: true,
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  return (
    <Modal
      title={modalData ? 'Edit Installment Type' : 'Add Installment Type'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      destroyOnClose
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>

        {/* Type */}
       <div className="mb-3">
  <label className="fw-bold">
    Type <span className="text-danger">*</span>
  </label>

  <select
    className={`form-control ${errors.type ? 'is-invalid' : ''}`}
    name="type"
    value={formData.type}
    onChange={handleChange}
  >
    <option value="">Select Type</option>
    <option value="MONTHLY">MONTHLY</option>
    <option value="QUARTERLY">QUARTERLY</option>
    <option value="CUSTOM_10">CUSTOM_10</option>
  </select>

  {errors.type && (
    <div className="invalid-feedback">{errors.type}</div>
  )}
</div>


        {/* Status */}
        {/* <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="status"
            checked={formData.status}
            onChange={handleChange}
            id="status"
          />
          <label className="form-check-label" htmlFor="status">
            Active
          </label>
        </div> */}

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
            {loading ? 'Saving...' : modalData ? 'Update' : 'Save'}
          </button>
        </div>

      </form>
    </Modal>
  )
}

export default FeeInstallmenttypeModal
