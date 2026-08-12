/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useContext } from 'react'
import { Modal, Input, Radio, Select, Form } from 'antd'
import { Users, User, GraduationCap } from 'lucide-react'
import { fileUpload, getRequest, postRequest, putRequest } from '../../../../Helpers/index'
import toast from 'react-hot-toast'
import { AppContext } from '../../../../Context/AppContext'
import { SessionContext } from '../../../../Context/Seesion'

const { TextArea } = Input
const { Option } = Select

const TeacherNoticeFormModal = ({ isModalOpen, setIsModalOpen, setUpdateStatus, modalData }) => {
  const { user } = useContext(AppContext)
  const role = user?.user?.role || 'Teacher'
  const { currentSession } = useContext(SessionContext)

  // console.log('sender id', user?.user?._id)
  // console.log('sender role', user?.user?.role)

  /* ===================== MASTER DATA ===================== */
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [admins, setAdmins] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const teacherId = user?.profile?._id
  // console.log('TEACHER PROFILE ID', teacherId)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachment: '',
    recipientType: '',
    recipients: {
      roles: [],
      specificTeachers: [],
      specificStudents: [],
      specificAdmins: [],
      classIds: [],
      sectionIds: [],
    },
  })

  const [errors, setErrors] = useState({})

  const detectRecipientType = (recipients = {}) => {
    if (recipients.classIds?.length) return 'class'
    if (recipients.specificStudents?.length) return 'specificStudents'
    if (recipients.specificTeachers?.length) return 'specificTeachers'
    if (recipients.roles?.includes('Admin')) return 'adminRole'
    return ''
  }

  useEffect(() => {
    if (!modalData) return

    const detectedRecipientType = detectRecipientType(modalData.recipients)

    setFormData({
      title: modalData.title || '',
      description: modalData.description || '',
      attachment: modalData.attachment || '',
      recipientType: detectedRecipientType,
      recipients: {
        roles: modalData.recipients?.roles || [],
        specificTeachers: modalData.recipients?.specificTeachers || [],
        specificStudents: modalData.recipients?.specificStudents || [],
        specificAdmins: modalData.recipients?.specificAdmins || [],
        classIds: modalData.recipients?.classIds || [],
        sectionIds: modalData.recipients?.sectionIds || [],
      },
    })
  }, [modalData])

  /* ===================== FETCH MASTER DATA ===================== */

  useEffect(() => {
    getRequest('classes?isPagination=false').then((res) =>
      setClasses(res.data?.data?.classes || []),
    )

    getRequest('teachers?isPagination=false').then((res) =>
      setTeachers(res.data?.data?.teachers || []),
    )

    getRequest('studentEnrollment?isPagination=false').then((res) =>
      setStudents(res.data?.data?.students || []),
    )

    getRequest('auth/getAllUsers?isPagination=false&role=Admin').then((res) =>
      setAdmins(res.data?.data?.users || []),
    )
  }, [])

  /* ===================== RECIPIENT OPTIONS ===================== */

  const getRecipientOptions = () => {
    switch (role) {
      case 'Teacher':
        return [
          { value: 'allStudents', label: 'All Students', icon: <Users size={16} /> },
          { value: 'allTeachers', label: 'All Teachers', icon: <GraduationCap size={16} /> },
          { value: 'adminRole', label: 'Admin', icon: <Users size={16} /> },
          { value: 'class', label: 'Specific Class / Section', icon: <GraduationCap size={16} /> },
          { value: 'specificStudents', label: 'Specific Students', icon: <User size={16} /> },
          { value: 'specificTeachers', label: 'Specific Teachers', icon: <User size={16} /> },
        ]

      default:
        return []
    }
  }

  /* ===================== HANDLERS ===================== */
  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      attachment: '',
      recipientType: '',
      recipients: {
        roles: [],
        specificTeachers: [],
        specificStudents: [],
        specificAdmins: [],
        classIds: [],
        sectionIds: [],
      },
    })
    setErrors({})
    setIsModalOpen(false)
  }

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  /* ===================== VALIDATION ===================== */
  const validateForm = () => {
    let newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.recipientType) {
      newErrors.recipientType = 'Please select recipient type'
    }

    if (formData.recipientType === 'specificStudents') {
      if (!formData.recipients.specificStudents.length) {
        newErrors.specificStudents = 'Please select at least one student'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ===================== BUILD PAYLOAD ===================== */

  // const buildRecipientsPayload = () => {
  //   switch (formData.recipientType) {
  //     // ✅ Teacher → Class wise students ONLY
  //     case 'class':
  //       return {
  //         classIds: formData.recipients.classIds,
  //         sectionIds: formData.recipients.sectionIds,
  //       }

  //     // ❌ Teacher should NOT send like this
  //     // case 'allStudents':
  //     // case 'specificStudents':

  //     case 'adminRole':
  //       return { roles: ['Admin'] }

  //     case 'specificTeachers':
  //       return { specificTeachers: formData.recipients.specificTeachers }

  //     default:
  //       return {}
  //   }
  // }
  const buildRecipientsPayload = () => {
    switch (formData.recipientType) {
      case 'class':
        return {
          classIds: formData.recipients.classIds,
          sectionIds: formData.recipients.sectionIds,
        }

      case 'adminRole':
        return { roles: ['Admin'] }

      case 'specificTeachers':
        return { specificTeachers: formData.recipients.specificTeachers }

      case 'specificStudents':
        return { specificStudents: formData.recipients.specificStudents }

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
  /* ===================== SUBMIT ===================== */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!currentSession?._id) {
      toast.error('No  session found')
      return
    }
    if (!validateForm()) return
    // console.log('SENDER USER ID =>', user?.user?._id)
    // console.log('NOTICE ID =>', modalData?._id)
    const payload = {
      title: formData.title,
      description: formData.description,
      attachment: formData.attachment,
      sender: {
        id: user?.user?._id,
        role: 'Teacher',
      },
      recipients: buildRecipientsPayload(),
      session: currentSession?._id,
    }

    setLoading(true)

    const apiCall = modalData
      ? putRequest({
        url: `notices/${modalData._id}`,
        cred: payload,
      })
      : postRequest({
        url: 'notices',
        cred: payload,
      })

    apiCall
      .then((res) => {
        toast.success(res?.data?.message || 'Success')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed')
      })
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={modalData ? 'Edit Notice' : 'Create Notice'}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={700}
    >
      <form onSubmit={handleSubmit} noValidate>
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
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    recipients: { ...formData.recipients, classIds: [value] },
                  })
                }
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
              <label className="block font-medium mb-2">Section (Optional)</label>
              <Select
                size="large"
                placeholder="Select Section"
                className="w-full"
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    recipients: { ...formData.recipients, sectionIds: [value] },
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
                  {st.gender === 'male' ? 'S/O' : 'D/O'} {st.fatherName}
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
        {/* SPECIFIC ADMINS */}
        {formData.recipientType === 'specificAdmins' && (
          <div className="mb-4">
            <label className="block font-medium mb-2">Select Admins</label>
            <Select
              mode="multiple"
              size="large"
              placeholder="Select admins"
              className="w-full"
              onChange={(values) =>
                setFormData({
                  ...formData,
                  recipients: { ...formData.recipients, specificAdmins: values },
                })
              }
              status={errors.specificAdmins ? 'error' : ''}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {admins.map((a) => (
                <Option key={a._id} value={a._id}>
                  {a.name || a.email}
                </Option>
              ))}
            </Select>
            {errors.specificAdmins && (
              <div className="text-red-500 text-sm mt-1">{errors.specificAdmins}</div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
            {loading ? 'Sending...' : 'Send Notice'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TeacherNoticeFormModal
