/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { DatePicker, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { fileUpload, getRequest, postRequest, putRequest, } from '../../Helpers'
import { useContext } from 'react'
import { SessionContext } from '../../Context/Seesion'
import { CCol } from '@coreui/react'
import dayjs from 'dayjs'
const AdminHomeworkAssignModal = ({ isModalOpen, setIsModalOpen, setUpdateStatus, editData }) => {
  const { currentSession } = useContext(SessionContext)

  const [allClasses, setAllClasses] = useState([])
  const [sections, setSections] = useState([])
  const [streams, setStreams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    streamId: '',
    subjectId: '',
    title: '',
    homeworkType: '',
    description: '',
    assignDate: '',
    attachments: [],
    dueDate: '',
  })
  const [uploading, setUploading] = useState(false)

  /* ── Fetch all classes ── */
  useEffect(() => {
    getRequest('classes?isPagination=false')
      .then(res => setAllClasses(res?.data?.data?.classes || []))
      .catch(console.error)
  }, [])

  /* ── Fetch sections when class changes ── */
  useEffect(() => {
    if (!formData.classId) { setSections([]); setStreams([]); return }
    getRequest(`sections?classId=${formData.classId}&isPagination=false`)
      .then(res => setSections(res?.data?.data?.sections || []))
      .catch(console.error)
    getRequest(`streams?classId=${formData.classId}&isPagination=false`)
      .then(res => setStreams(res?.data?.data?.streams || []))
      .catch(console.error)
  }, [formData.classId])

  /* ── Fetch subjects when class changes ── */
  useEffect(() => {
    if (!formData.classId) { setSubjects([]); return }
    const url = formData.streamId
      ? `subjects?classId=${formData.classId}&streamId=${formData.streamId}&isPagination=false`
      : `subjects?classId=${formData.classId}&isPagination=false`
    getRequest(url)
      .then(res => setSubjects(res?.data?.data?.subjects || []))
      .catch(console.error)
  }, [formData.classId, formData.streamId])

  /* ── Prefill on edit ── */
  useEffect(() => {
    if (isModalOpen && editData) {
      setFormData({
        classId: editData.classId?._id || editData.classId || '',
        sectionId: editData.sectionId?._id || editData.sectionId || '',
        streamId: editData.streamId?._id || editData.streamId || '',
        subjectId: editData.subjectId?._id || editData.subjectId || '',
        title: editData.title || '',
        homeworkType: editData.homeworkType || editData.type || '',
        description: editData.description || '',
        assignDate: editData.assignDate?.split?.('T')[0] || editData.fromDate || '',
        dueDate: editData.dueDate?.split?.('T')[0] || editData.toDate || '',
        attachments: editData.attachments || [],
      })
    } else if (isModalOpen && !editData) {
      resetForm()
    }
  }, [isModalOpen, editData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'classId') { updated.sectionId = ''; updated.streamId = ''; updated.subjectId = '' }
      if (name === 'sectionId') { updated.subjectId = '' }
      if (name === 'streamId') { updated.subjectId = '' }
      return updated
    })
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!formData.classId) e.classId = 'Class is required'
    if (!formData.sectionId) e.sectionId = 'Section is required'
    if (!formData.subjectId) e.subjectId = 'Subject is required'
    if (!formData.title.trim()) e.title = 'Title is required'
    if (!formData.homeworkType) e.homeworkType = 'Type is required'
    if (!formData.assignDate) e.assignDate = 'Assign date is required'
    if (!formData.dueDate) e.dueDate = 'Due date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }


  const handleFileUpload = (e) => {

    const file = e.target.files[0]

    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ]

    if (!allowedTypes.includes(file.type)) {

      toast.error(
        'Only JPG, JPEG, PNG and PDF files are allowed!'
      )

      e.target.value = ''

      return
    }

    const formDataFile = new FormData()

    formDataFile.append('file', file)

    setUploading(true)

    fileUpload({
      url: 'upload/uploadImage',
      cred: formDataFile,
    })

      .then((res) => {

        const uploadedFileUrl =
          res?.data?.data?.imageUrl

        if (uploadedFileUrl) {

          setFormData((prev) => ({

            ...prev,

            attachments: [
              ...prev.attachments,
              uploadedFileUrl
            ],

          }))

          toast.success("File uploaded successfully")
        }
      })

      .catch((err) => {

        console.log("Upload Error:", err)

        toast.error("File upload failed")
      })

      .finally(() => {

        setUploading(false)
      })
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        sessionId: currentSession?._id,
        classId: formData.classId,
        sectionId: formData.sectionId,
        streamId: formData.streamId || null,
        subjectId: formData.subjectId,
        title: formData.title,
        description: formData.description,
        homeworkType: formData.homeworkType,
        assignDate: formData.assignDate,
        dueDate: formData.dueDate,
        attachments: formData.attachments || [],

      }

      if (editData?._id) {
        await putRequest({ url: `homework/${editData._id}`, cred: payload })
        toast.success('Homework updated successfully')
      } else {
        await postRequest({ url: 'homework', cred: payload })
        toast.success('Homework assigned successfully')
      }

      setUpdateStatus(prev => !prev)
      handleClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ classId: '', sectionId: '', streamId: '', subjectId: '', title: '', homeworkType: '', description: '', assignDate: '', dueDate: '', attachments: [], })
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    setIsModalOpen(false)
  }

  const inputCls = (field) =>
    `form-control mt-1 ${errors[field] ? 'border-red-400' : ''}`

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-800">
            {editData ? 'Edit Homework' : 'Assign Homework'}
          </span>
          {/* {currentSession?.sessionName && (
            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
              {currentSession.sessionName}
            </span>
          )} */}
        </div>
      }
      open={isModalOpen}
      footer={null}
      onCancel={handleClose}
      width={640}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* CLASS */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Class <span className="text-red-500">*</span>
            </label>
            <select name="classId" value={formData.classId} onChange={handleChange} className={inputCls('classId')}>
              <option value="">Select Class</option>
              {allClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.classId && <p className="text-red-500 text-xs mt-0.5">{errors.classId}</p>}
          </div>

          {/* SECTION */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Section <span className="text-red-500">*</span>
            </label>
            <select name="sectionId" value={formData.sectionId} onChange={handleChange} className={inputCls('sectionId')} disabled={!formData.classId}>
              <option value="">Select Section</option>
              {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            {errors.sectionId && <p className="text-red-500 text-xs mt-0.5">{errors.sectionId}</p>}
          </div>

          {/* STREAM (optional) */}
          {streams.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700">Stream</label>
              <select name="streamId" value={formData.streamId} onChange={handleChange} className="form-control mt-1">
                <option value="">Select Stream (optional)</option>
                {streams.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* SUBJECT */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <select name="subjectId" value={formData.subjectId} onChange={handleChange} className={inputCls('subjectId')} disabled={!formData.classId}>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            {errors.subjectId && <p className="text-red-500 text-xs mt-0.5">{errors.subjectId}</p>}
          </div>

          {/* TITLE */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={inputCls('title')}
              placeholder="Enter homework title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-0.5">{errors.title}</p>}
          </div>

          {/* TYPE */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Type <span className="text-red-500">*</span>
            </label>
            <select name="homeworkType" value={formData.homeworkType} onChange={handleChange} className={inputCls('homeworkType')}>
              <option value="">Select Type</option>
              <option value="HOMEWORK">Homework</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="PROJECT">Project</option>
            </select>
            {errors.homeworkType && <p className="text-red-500 text-xs mt-0.5">{errors.homeworkType}</p>}
          </div>

          {/* ASSIGN DATE */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Assign Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              format="DD-MM-YYYY"
              value={
                formData.assignDate
                  ? dayjs(formData.assignDate)
                  : null
              }
              onChange={(date, dateString) => {
                setFormData(prev => ({
                  ...prev,
                  assignDate: dayjs(date).format("YYYY-MM-DD")
                }))
              }}
              className="form-control mt-1"
            />
            {errors.assignDate && <p className="text-red-500 text-xs mt-0.5">{errors.assignDate}</p>}
          </div>

          {/* DUE DATE */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Due Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              format="DD-MM-YYYY"
              value={
                formData.dueDate
                  ? dayjs(formData.dueDate)
                  : null
              }
              onChange={(date) => {
                setFormData((prev) => ({
                  ...prev,
                  dueDate: date
                    ? dayjs(date).format("YYYY-MM-DD")
                    : "",
                }))
              }}
              className="form-control mt-1"
            />
            {errors.dueDate && <p className="text-red-500 text-xs mt-0.5">{errors.dueDate}</p>}
          </div>

          <div>

            <label className="text-sm font-medium text-slate-700 block mb-2">
              Upload Attachment
            </label>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="form-control"
            />

            {
              uploading && (
                <p className="text-blue-600 text-sm mt-2">
                  Uploading...
                </p>
              )
            }

            {/* PREVIEW */}

            {
              formData.attachments?.length > 0 && (

                <div className="flex flex-wrap gap-3 mt-4">

                  {
                    formData.attachments.map((file, index) => {

                      const isImage = file.match(
                        /\.(jpg|jpeg|png|gif|webp)$/i
                      )

                      return (

                        <div
                          key={index}
                          className="relative"
                        >

                          {
                            isImage ? (

                              <img
                                src={file}
                                alt="preview"
                                className="
                        w-24
                        h-24
                        object-cover
                        rounded-lg
                        border
                      "
                              />

                            ) : (

                              <a
                                href={file}
                                target="_blank"
                                rel="noreferrer"
                                className="
                        w-24
                        h-24
                        rounded-lg
                        border
                        flex
                        items-center
                        justify-center
                        bg-red-50
                        text-red-600
                        text-xs
                        font-medium
                      "
                              >

                                PDF FILE

                              </a>

                            )
                          }

                          {/* REMOVE */}

                          <button
                            type="button"
                            onClick={() => {

                              setFormData(prev => ({

                                ...prev,

                                attachments:
                                  prev.attachments.filter(
                                    (_, i) => i !== index
                                  )

                              }))
                            }}
                            className="
                    absolute
                    -top-2
                    -right-2
                    w-6
                    h-6
                    rounded-full
                    bg-red-500
                    text-white
                    text-xs
                  "
                          >

                            ✕

                          </button>

                        </div>

                      )
                    })
                  }

                </div>

              )
            }

          </div>

        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="form-control mt-1"
            placeholder="Enter homework description (optional)"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={handleClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-white rounded bg-[#0c3b73] hover:bg-[#092c56] disabled:opacity-60 transition-colors"
          >
            {loading ? 'Saving...' : editData ? 'Update' : 'Assign Homework'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminHomeworkAssignModal
