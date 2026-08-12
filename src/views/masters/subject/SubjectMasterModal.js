/* eslint-disable prettier/prettier */
import { Modal } from 'antd'
import React, { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest, getRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'

const SubjectMasterModal = ({
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
    streamId: '',
    isActive: true,
    session: currentSession?._id || '',
  })

  const [classList, setClassList] = useState([])
  const [streamList, setStreamList] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* ================= SELECTED CLASS (SAFE) ================= */
  const selectedClass =
    classList.find((cls) => cls._id === formData.classes) || modalData?.classes || null

  /* ================= STREAM REQUIRED FLAG ================= */
  const isStreamRequired = selectedClass?.isSenior || false

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => {
        setClassList(res?.data?.data?.classes || [])
      })
      .catch(() => toast.error('Failed to load classes'))
  }, [currentSession])

  /* ================= LOAD STREAMS (CLASS CHANGE / ADD MODE) ================= */
  useEffect(() => {
    if (!isStreamRequired || !formData.classes) {
      setStreamList([])
      return
    }

    getRequest(`streams?classId=${formData.classes}&isPagination=false`)
      .then((res) => {
        setStreamList(res?.data?.data?.streams || [])
      })
      .catch(() => toast.error('Failed to load streams'))
  }, [formData.classes, isStreamRequired])

  /* ================= EDIT MODE PREFILL ================= */
  // console.log('modalData', modalData)
  /* ================= EDIT MODE PREFILL ================= */
  useEffect(() => {
    if (!modalData) return

    const classId = modalData?.class?._id || ''
    const streamId = modalData?.stream?._id || ''

    setFormData({
      name: modalData?.name || '',
      classes: classId, // 🔥 must be _id
      streamId: streamId, // 🔥 must be _id
      isActive: modalData?.isActive ?? true,
    })

    // agar class 9–12 hai to stream list load karo
    if (modalData?.class?.name && ['9th', '10th', '11th', '12th'].includes(modalData.class.name)) {
      getRequest(`streams?classId=${classId}&isPagination=false`)
        .then((res) => {
          setStreamList(res?.data?.data?.streams || [])
        })
        .catch(() => toast.error('Failed to load streams'))
    }
  }, [modalData])

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'classes' && { streamId: '' }),
    }))

    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Subject name is required'
    if (!formData.classes) newErrors.classes = 'Class is required'
    if (isStreamRequired && !formData.streamId) {
      newErrors.streamId = 'Stream is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ================= PAYLOAD ================= */
  const buildPayload = () => {
    const payload = {
      name: formData.name,
      classes: formData.classes,
      isActive: formData.isActive,
      session: currentSession?._id,
    }

    if (isStreamRequired && formData.streamId) {
      payload.streamId = formData.streamId
    }

    return payload
  }

  /* ================= ADD ================= */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    postRequest({
      url: 'subjects',
      cred: buildPayload(),
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Subject added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }

  /* ================= EDIT ================= */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `subjects/${modalData?._id}`,
      cred: buildPayload(),
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Subject updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }

  /* ================= CLOSE ================= */
  const handleCancel = () => {
    setFormData({
      name: '',
      classes: '',
      streamId: '',
      isActive: true,
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  return (
    <Modal
      title={modalData ? 'Edit Subject' : 'Add Subject'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit}>
        {/* CLASS */}
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

        {/* STREAM (ALWAYS VISIBLE) */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Stream
            {isStreamRequired && <span className="text-danger">*</span>}
          </label>
          <select
            className={`form-select ${errors.streamId ? 'is-invalid' : ''}`}
            name="streamId"
            value={formData.streamId}
            onChange={handleChange}
            disabled={!isStreamRequired}
          >
            <option value="">Select Stream</option>
            {streamList.map((stream) => (
              <option key={stream._id} value={stream._id}>
                {stream.name}
              </option>
            ))}
          </select>
          {errors.streamId && <div className="invalid-feedback">{errors.streamId}</div>}
        </div>

        {/* SUBJECT NAME */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Subject Name<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Subject Name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* ACTIVE */}
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

        {/* BUTTONS */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border rounded"
            style={{ backgroundColor: '#0c3b73', color: '#fff' }}
          >
            {loading ? 'Saving...' : 'Save Subject'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default SubjectMasterModal
