/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useContext } from 'react'
import { Modal, Input, Radio, Select } from 'antd'
import { Users, User, GraduationCap } from 'lucide-react'
import { fileUpload, getRequest, postRequest, putRequest } from '../../../../Helpers'
import toast from 'react-hot-toast'
import { AppContext } from '../../../../Context/AppContext'
import { SessionContext } from '../../../../Context/Seesion'

const { TextArea } = Input
const { Option } = Select

const AdminNoticeModal = ({ isModalOpen, setIsModalOpen, setUpdateStatus, modalData }) => {
  const { user } = useContext(AppContext)
  const adminId = user?._id
  const role = user?.role
  const { currentSession } = useContext(SessionContext)

  /* ================= MASTER DATA ================= */
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [sections, setSections] = useState([])
  const [uploading, setUploading] = useState(false)

  const [selectedClassId, setSelectedClassId] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachment: '',
    recipientType: '',
    recipients: {
      specificStudents: [],
      specificTeachers: [],
      classIds: [],
      sectionIds: [],
    },
  })

  const [errors, setErrors] = useState({})

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!selectedClassId) {
      setSections([])
      return
    }

    getRequest(`sections?isPagination=false&classId=${selectedClassId}`)
      .then((res) => {
        setSections(res.data?.data?.sections || [])
      })
      .catch(() => {
        setSections([])
      })
  }, [selectedClassId])

  useEffect(() => {
    if (!adminId || !currentSession?._id) return

    getRequest('studentEnrollment?isPagination=false').then((res) =>
      setStudents(res.data?.data?.students || []),
    )

    getRequest('teachers?isPagination=false').then((res) =>
      setTeachers(res.data?.data?.teachers || []),
    )

    getRequest(
      `classes?isPagination=false&session=${currentSession._id}`
    ).then((res) =>
      setClasses(res.data?.data?.classes || []),
    )
  }, [adminId, currentSession])

  /* ================= HANDLERS ================= */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  useEffect(() => {
    if (!modalData) return

    setFormData({
      title: modalData.title || '',
      description: modalData.description || '',
      attachment: modalData.attachment || '',

      recipientType: detectRecipientType(modalData.recipients),
      recipients: {
        specificStudents: modalData.recipients?.specificStudents || [],
        specificTeachers: modalData.recipients?.specificTeachers || [],
        classIds: modalData.recipients?.classIds || [],
        sectionIds: modalData.recipients?.sectionIds || [],
      },
    })

    if (modalData.recipients?.classIds?.length) {
      setSelectedClassId(modalData.recipients.classIds[0])
    }
  }, [modalData])

  const detectRecipientType = (recipients = {}) => {
    if (recipients.roles?.includes('Student') && recipients.roles?.includes('Teacher'))
      return 'studentsAndTeachers'

    if (recipients.roles?.includes('Student')) return 'allStudents'
    if (recipients.roles?.includes('Teacher')) return 'allTeachers'
    if (recipients.specificStudents?.length) return 'specificStudents'
    if (recipients.specificTeachers?.length) return 'specificTeachers'
    if (recipients.classIds?.length) return 'class'

    return ''
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      attachment: '',
      recipientType: '',
      recipients: {
        specificStudents: [],
        specificTeachers: [],
        classIds: [],
        sectionIds: [],
      },
    })
    setErrors({})
    setIsModalOpen(false)
  }

  /* ===================== RECIPIENT OPTIONS ===================== */
  const getRecipientOptions = () => {
    if (!role) return []

    switch (role) {
      case 'Admin':
        return [
          { value: 'allStudents', label: 'All Students', icon: <Users size={16} /> },
          { value: 'allTeachers', label: 'All Teachers', icon: <GraduationCap size={16} /> },
          {
            value: 'studentsAndTeachers',
            label: ' All Students & Teachers',
            icon: <Users size={16} />,
          },
          { value: 'class', label: 'Specific Class / Section', icon: <GraduationCap size={16} /> },
          { value: 'specificStudents', label: 'Specific Students', icon: <User size={16} /> },
          { value: 'specificTeachers', label: 'Specific Teachers', icon: <User size={16} /> },
        ]

      default:
        return []
    }
  }

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Title required'
    if (!formData.description.trim()) newErrors.description = 'Description required'
    if (!formData.recipientType) newErrors.recipientType = 'Select recipient type'

    if (
      formData.recipientType === 'specificStudents' &&
      !formData.recipients.specificStudents.length
    ) {
      newErrors.specificStudents = 'Select at least one student'
    }

    if (
      formData.recipientType === 'specificTeachers' &&
      !formData.recipients.specificTeachers.length
    ) {
      newErrors.specificTeachers = 'Select at least one teacher'
    }

    if (formData.recipientType === 'class' && !formData.recipients.classIds.length) {
      newErrors.classIds = 'Select class'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ================= PAYLOAD ================= */
  const buildRecipientsPayload = () => {
    switch (formData.recipientType) {
      case 'allStudents':
        return { roles: ['Student'] }

      case 'allTeachers':
        return { roles: ['Teacher'] }

      case 'studentsAndTeachers':
        return { roles: ['Student', 'Teacher'] }

      case 'class':
        return { classIds: formData.recipients.classIds }

      case 'specificStudents':
        return { specificStudents: formData.recipients.specificStudents }

      case 'specificTeachers':
        return { specificTeachers: formData.recipients.specificTeachers }

      default:
        return {}
    }
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
        id: adminId,
        role: 'Admin',
      },
      recipients: buildRecipientsPayload(),
      session: currentSession?._id,
    }

    setLoading(true)

    const apiCall = isEditMode
      ? putRequest({ url: `notices/${modalData._id}`, cred: payload }) // 👈 EDIT
      : postRequest({ url: `notices`, cred: payload })

    apiCall
      .then(() => {
        toast.success(isEditMode ? 'Notice updated' : 'Notice created')
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
      width={700}
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
            className="w-full"
          >
            <div className="space-y-2">
              {getRecipientOptions().map((opt) => (
                <Radio key={opt.value} value={opt.value} className="flex items-center">
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    {opt.label}
                  </span>
                </Radio>
              ))}
            </div>
          </Radio.Group>
          {errors.recipientType && (
            <div className="text-red-500 text-sm mt-1">{errors.recipientType}</div>
          )}
        </div>

        {/* CLASS / SECTION */}
        {formData.recipientType === 'class' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block font-medium mb-2">Class</label>
              <Select
                size="large"
                placeholder="Select Class"
                className="w-full"
                onChange={(value) => {
                  setSelectedClassId(value)

                  setFormData({
                    ...formData,
                    recipients: {
                      ...formData.recipients,
                      classIds: [value],
                      sectionIds: [], // reset section
                    },
                  })
                }}
                status={errors.classIds ? 'error' : ''}
              >
                {classes.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
              {errors.classIds && (
                <div className="text-red-500 text-sm mt-1">{errors.classIds}</div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-2">Section</label>
              <Select
                size="large"
                placeholder="Select Section"
                className="w-full"
                disabled={!sections.length}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    recipients: {
                      ...formData.recipients,
                      sectionIds: [value],
                    },
                  })
                }
              >
                {sections.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* SPECIFIC STUDENTS */}
        {formData.recipientType === 'specificStudents' && (
          <div className="mb-4">
            <label className="block font-medium mb-2">Select Students</label>
            <Select
              mode="multiple"
              size="large"
              placeholder="Select students"
              className="w-full"
              onChange={(values) =>
                setFormData({
                  ...formData,
                  recipients: { ...formData.recipients, specificStudents: values },
                })
              }
              status={errors.specificStudents ? 'error' : ''}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {students.map((st) => (
                <Option key={st._id} value={st._id}>
                  ({st.studentId}){' '}
                  {[st.firstName, st.middleName, st.lastName].filter(Boolean).join(' ')}{' '}
                  {st.gender.toLowerCase() === 'male' ? 'S/O' : 'D/O'} {st.fatherName}
                </Option>
              ))}
            </Select>
            {errors.specificStudents && (
              <div className="text-red-500 text-sm mt-1">{errors.specificStudents}</div>
            )}
          </div>
        )}

        {/* SPECIFIC TEACHERS */}
        {formData.recipientType === 'specificTeachers' && (
          <div className="mb-4">
            <label className="block font-medium mb-2">Select Teachers</label>
            <Select
              mode="multiple"
              size="large"
              placeholder="Select teachers"
              className="w-full"
              onChange={(values) =>
                setFormData({
                  ...formData,
                  recipients: { ...formData.recipients, specificTeachers: values },
                })
              }
              status={errors.specificTeachers ? 'error' : ''}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {teachers.map((t) => (
                <Option key={t._id} value={t._id}>
                  ({t.employeeId}) -{' '}
                  {[t.firstName, t.middleName, t.lastName].filter(Boolean).join(' ')}
                </Option>
              ))}
            </Select>
            {errors.specificTeachers && (
              <div className="text-red-500 text-sm mt-1">{errors.specificTeachers}</div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 ">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
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
                : 'Send Notice'}{' '}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminNoticeModal
