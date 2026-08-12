/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useContext } from 'react'
import { Modal, Input, Radio, Select } from 'antd'
import { Users, User } from 'lucide-react'
import { fileUpload, getRequest, postRequest, putRequest } from '../../../../Helpers'
import toast from 'react-hot-toast'
import { AppContext } from '../../../../Context/AppContext'
import { SessionContext } from '../../../../Context/Seesion'

const { TextArea } = Input
const { Option } = Select

const NoticeSuperAdminModal = ({ isModalOpen, setIsModalOpen, setUpdateStatus, modalData }) => {
  const { user } = useContext(AppContext)
const superAdminId = user?._id || user?.user?._id
  const { currentSession } = useContext(SessionContext)
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachment: '',
    recipientType: '',
    recipients: {
      specificAdmins: [],
    },
  })

  const [errors, setErrors] = useState({})

  /* ================= FETCH ADMINS ================= */
  useEffect(() => {
    if (!superAdminId) return

    getRequest('auth/getAllUsers?isPagination=false&role=Admin').then((res) =>
      setAdmins(res.data?.data?.users || []),
    )
  }, [superAdminId])

  /* ================= HANDLERS ================= */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      attachment: '',
      recipientType: '',
      recipients: { specificAdmins: [] },
    })
    setErrors({})
    setIsModalOpen(false)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Only images (jpg, jpeg, png) and PDF files are allowed!')
      e.target.value = ''
      return
    }

    const formDataFile = new FormData()
    formDataFile.append('file', file)

    setUploading(true)

    fileUpload({ url: 'upload/uploadImage', cred: formDataFile })
      .then((res) => {
        const uploadedFileUrl = res?.data?.data?.imageUrl
        if (uploadedFileUrl) {
          setFormData((prev) => ({
            ...prev,
            attachment: uploadedFileUrl,
          }))
        }
      })
      .catch((err) => {
        console.error('File upload failed', err)
      })
      .finally(() => {
        setUploading(false)
      })
  }

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Title required'
    if (!formData.description.trim()) newErrors.description = 'Description required'
    if (!formData.recipientType) newErrors.recipientType = 'Select recipient type'

    if (formData.recipientType === 'specificAdmins' && !formData.recipients.specificAdmins.length) {
      newErrors.specificAdmins = 'Select at least one admin'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ================= PAYLOAD ================= */
  const buildRecipientsPayload = () => {
    switch (formData.recipientType) {
      case 'allAdmins':
        return { roles: ['Admin'] }

      case 'specificAdmins':
        return { specificAdmins: formData.recipients.specificAdmins }

      default:
        return {}
    }
  }

  const detectRecipientType = (recipients = {}) => {
    if (recipients.roles?.includes('Admin')) return 'allAdmins'
    if (recipients.specificAdmins?.length) return 'specificAdmins'
    return ''
  }
  useEffect(() => {
    if (!modalData) return

    setFormData({
      title: modalData.title || '',
      description: modalData.description || '',
      attachment: modalData.attachment || '',

      recipientType: detectRecipientType(modalData.recipients),
      recipients: {
        specificAdmins: modalData.recipients?.specificAdmins || [],
      },
    })
  }, [modalData])

  /* ================= SUBMIT ================= */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!currentSession?._id) {
      toast.error('No  session found')
      return
    }

    if (!validateForm()) return

    const payload = {
      title: formData.title,
      description: formData.description,
      attachment: formData.attachment,

      sender: {
        id: superAdminId,
        role: 'SuperAdmin',
      },
      recipients: buildRecipientsPayload(),
      session: currentSession?._id,
    }

    setLoading(true)

    const apiCall = isEditMode
      ? putRequest({ url: `notices/${modalData._id}`, cred: payload }) // 👈 EDIT
      : postRequest({ url: 'notices', cred: payload }) // 👈 CREATE

    apiCall
      .then(() => {
        toast.success(isEditMode ? 'Notice updated' : 'Notice sent')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to send notice'))
      .finally(() => setLoading(false))
  }

  /* ================= UI ================= */
  const isEditMode = Boolean(modalData?._id)

  return (
    <Modal
      title={isEditMode ? 'Edit Notice' : 'Create Notice'}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Title<span className="text-red-500">*</span>
          </label>
          <Input
            size="large"
            placeholder="Enter notice title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            status={errors.title ? 'error' : ''}
          />
          {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Description<span className="text-red-500">*</span>
          </label>
          <TextArea
            rows={4}
            placeholder="Enter notice description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            status={errors.description ? 'error' : ''}
          />
          {errors.description && (
            <div className="text-red-500 text-sm mt-1">{errors.description}</div>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Attachment (Image/PDF)
          </label>

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="w-full border rounded p-2"
          />

          {uploading && (
            <p className="text-blue-500 text-sm mt-2">
              Uploading...
            </p>
          )}

          {formData.attachment && (
            <div className="mt-4">
              {/* IMAGE PREVIEW */}
              {formData.attachment.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                <img
                  src={formData.attachment}
                  alt="attachment-preview"
                  className="w-40 h-40 object-cover rounded border"
                />
              ) : (
                /* PDF PREVIEW */
                <a
                  href={formData.attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  View Uploaded PDF
                </a>
              )}
            </div>
          )}
        </div>

        {/* Recipient Type */}
        <div className="mb-4">
          <label className="block font-semibold mb-3">
            Send To<span className="text-red-500">*</span>
          </label>
          <Radio.Group
            value={formData.recipientType}
            onChange={(e) => handleChange('recipientType', e.target.value)}
          >
            <div className="space-y-2">
              <Radio value="allAdmins">
                <span className="flex items-center gap-2">
                  <Users size={16} /> All Admins
                </span>
              </Radio>
              <Radio value="specificAdmins">
                <span className="flex items-center gap-2">
                  <User size={16} /> Specific Admins
                </span>
              </Radio>
            </div>
          </Radio.Group>
          {errors.recipientType && <p className="text-red-500 text-sm">{errors.recipientType}</p>}
        </div>

        {/* SPECIFIC ADMINS */}
        {formData.recipientType === 'specificAdmins' && (
          <div className="mb-4">
            <label className="block font-medium mb-2">Select Admins</label>
            <Select
              mode="multiple"
              size="large"
              className="w-full"
              placeholder="Select admins"
              onChange={(values) =>
                setFormData({
                  ...formData,
                  recipients: { specificAdmins: values },
                })
              }
              status={errors.specificAdmins ? 'error' : ''}
            >
              {admins.map((a) => (
                <Option key={a._id} value={a._id}>
                  {a.name}
                </Option>
              ))}
            </Select>
            {errors.specificAdmins && (
              <p className="text-red-500 text-sm">{errors.specificAdmins}</p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 ">
          <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border rounded"
            style={{ backgroundColor: '#0c3b73', color: '#fff' }}
          >
            {loading
              ? isEditMode
                ? 'Updating...'
                : 'Sending...'
              : isEditMode
                ? 'Update Notice'
                : 'Send Notice'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default NoticeSuperAdminModal
