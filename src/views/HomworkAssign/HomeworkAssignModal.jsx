/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { DatePicker, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { fileUpload, getRequest, postRequest, putRequest } from '../../Helpers'
import dayjs from 'dayjs'

const HomeworkAssignModal = ({ isModalOpen, setIsModalOpen, user, setUpdateStatus, editData }) => {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [streams, setStreams] = useState([])
  const [subjects, setSubjects] = useState([])

  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    streamId: '',
    subjectId: '',
    title: '',
    homeworkType: '',
    description: '',
    assignDate: '',
    dueDate: '',
    attachments: [],
  })
  const [uploading, setUploading] = useState(false)

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [allClasses, setAllClasses] = useState([])
  const [allSubjects, setAllSubjects] = useState([]) // ✅ NEW: store all subjects

  const hasStream = user?.profile?.classesAssigned?.some(
    (c) => String(c.classId?._id) === String(formData.classId) && c.stream?._id,
  )
  // ================= FETCH CLASSES =================
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getRequest('classes')
        setAllClasses(res?.data?.data?.classes || [])
      } catch (err) {
        console.log(err)
      }
    }
    fetchClasses()
  }, [])

  // ================= FETCH ALL SUBJECTS ================= ✅ NEW
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await getRequest('subjects') // adjust endpoint if needed
        setAllSubjects(res?.data?.data?.subjects || res?.data?.data || [])
      } catch (err) {
        console.log(err)
      }
    }
    fetchSubjects()
  }, [])


  useEffect(() => {
    if (!allClasses.length) return

    const assigned = user?.profile?.classesAssigned || []

    const uniqueClasses = assigned.map((c) => {
      const fullClass = allClasses.find((cls) => String(cls._id) === String(c.classId?._id))

      return {
        _id: c.classId?._id,
        name: c.classId?.name,
        isSenior: fullClass?.isSenior || false,
      }
    })

    console.log('allClasses =>', allClasses)
    console.log('assigned =>', assigned)
    console.log('uniqueClasses =>', uniqueClasses)

    setClasses(uniqueClasses)
  }, [user, allClasses])
  const selectedClass = classes.find((c) => c._id === formData.classId)

  // ================= LOAD SECTIONS =================
  useEffect(() => {
    const assigned = user?.profile?.classesAssigned || []

    if (!formData.classId) {
      setSections([])
      return
    }

    const unique = assigned
      .filter((c) => String(c.classId?._id) === String(formData.classId))
      .map((c) => ({ _id: c.sectionId?._id, name: c.sectionId?.name }))
      .filter((sec, index, self) => sec._id && index === self.findIndex((s) => s._id === sec._id))

    setSections(unique)
  }, [formData.classId, user])

  // ================= LOAD STREAMS =================
  useEffect(() => {
    const assigned = user?.profile?.classesAssigned || []

    if (!formData.classId) {
      setStreams([])
      return
    }

    const unique = assigned
      .filter((c) => String(c.classId?._id) === String(formData.classId) && c.stream?._id)
      .map((c) => ({ _id: c.stream?._id, name: c.stream?.name }))
      .filter((s, index, self) => s._id && index === self.findIndex((x) => x._id === s._id))

    setStreams(unique)
  }, [formData.classId, user])

  // ================= LOAD SUBJECTS ================= ✅ FIXED

  useEffect(() => {
    const assigned = user?.profile?.classesAssigned || []

    if (!formData.classId || !formData.sectionId) {
      setSubjects([])
      return
    }

    const uniqueSubjects = assigned
      .filter((c) => {
        const isSameClass = String(c.classId?._id) === String(formData.classId)
        const isSameSection = String(c.sectionId?._id) === String(formData.sectionId)

        const streamMatch =
          !c.stream || !formData.streamId || String(c.stream?._id) === String(formData.streamId)

        return isSameClass && isSameSection && streamMatch
      })
      .map((c) => ({
        _id: c.subjectId?._id,
        name: c.subjectId?.name,
      }))
      .filter((sub, index, self) => sub._id && index === self.findIndex((s) => s._id === sub._id))

    console.log('subjects =>', uniqueSubjects)

    setSubjects(uniqueSubjects)

    // ✅ FIX: edit mode me subject force add karo
    if (editData?.subjectId) {
      const exists = uniqueSubjects.find(
        (s) => String(s._id) === String(editData.subjectId?._id || editData.subjectId),
      )

      if (!exists) {
        uniqueSubjects.push({
          _id: editData.subjectId?._id || editData.subjectId,
          name: editData.subjectId?.name || 'Selected Subject',
        })
      }
    }
  }, [formData.classId, formData.sectionId, formData.streamId, user, editData])

  console.log('EDIT DATA =>', editData)

  // ================= EDIT PREFILL =================
  // useEffect(() => {
  //   if (editData) {
  //     setFormData({
  //       classId: editData.classId?._id || editData.classId || '',
  //       sectionId: editData.sectionId?._id || editData.sectionId || '',
  //       streamId: editData.streamId?._id || editData.streamId || '',
  //       subjectId: editData.subjectId?._id || editData.subjectId || '',
  //       title: editData.title || '',
  //       homeworkType: editData.homeworkType || '',
  //       description: editData.description || '',
  //       assignDate: editData.assignDate?.split('T')[0] || '',
  //       dueDate: editData.dueDate?.split('T')[0] || '',
  //     })
  //   }
  // }, [editData])


  // useEffect(() => {
  //   if (isModalOpen && editData && classes.length) {
  //     setFormData({
  //       classId: editData.classId?._id || editData.classId?.name || '',
  //       sectionId: editData.sectionId?._id || editData.sectionId?.name || '',
  //       streamId: editData.streamId?._id || editData.streamId?.name || '',
  //       subjectId: editData.subjectId?._id || editData.subjectId?.name || '',
  //       title: editData.title || '',
  //       homeworkType: editData.homeworkType || '',
  //       description: editData.description || '',
  //       assignDate: editData.assignDate?.split('T')[0] || '',
  //       dueDate: editData.dueDate?.split('T')[0] || '',
  //     })
  //   }
  // }, [isModalOpen, editData, classes])
useEffect(() => {

  if (isModalOpen && editData) {

    setFormData({

      classId:
        editData.classId?._id || '',

      sectionId:
        editData.sectionId?._id || '',

      streamId:
        editData.streamId?._id || '',

      subjectId:
        editData.subjectId?._id || '',

      title:
        editData.title || '',

      homeworkType:
        editData.homeworkType || '',

      description:
        editData.description || '',

      assignDate:
        editData.assignDate?.split('T')[0] || '',

      dueDate:
        editData.dueDate?.split('T')[0] || '',

      attachments:
        editData.attachments || [],

    })

  }

}, [isModalOpen, editData])
  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      let updated = { ...prev, [name]: value }
      if (name === 'classId') {
        updated.sectionId = ''
        updated.streamId = ''
        updated.subjectId = ''
      }
      if (name === 'sectionId') {
        updated.subjectId = ''
      }
      return updated
    })

    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // ================= VALIDATION =================
  const validateForm = () => {
    let newErrors = {}
    if (!formData.classId) newErrors.classId = 'Class required'
    if (!formData.sectionId) newErrors.sectionId = 'Section required'
    if (!formData.subjectId) newErrors.subjectId = 'Subject required'
    if (!formData.title.trim()) newErrors.title = 'Title required'
    if (!formData.homeworkType.trim()) newErrors.homeworkType = 'Type required'
    if (!formData.assignDate) newErrors.assignDate = 'From date required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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


  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      // ✅ API payload mapping
      const payload = {
        classId: formData.classId,
        sectionId: formData.sectionId,
        streamId: formData.streamId || null, // optional
        subjectId: formData.subjectId, // ✅ FIX
        title: formData.title,
        description: formData.description,
        homeworkType: formData.homeworkType, // ✅ FIX
        assignDate: formData.assignDate, // ✅ FIX
        dueDate: formData.dueDate, // ✅ FIX
        attachments: formData.attachments || [],

      }

      if (editData) {
        console.log('UPDATE ID =>', editData._id) // ✅ check here

        await putRequest({
          url: `homework/${editData._id}`,
          cred: payload,
        })
        toast.success('Homework Updated')
      } else {
        await postRequest({
          url: `homework`,
          cred: payload,
        })
        toast.success('Homework Assigned')
      }

      setUpdateStatus((prev) => !prev)
      handleCancel()
    } catch (err) {
      console.log(err)
      toast.error(err?.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  // ================= CLOSE =================
  const handleCancel = () => {
    setFormData({
      classId: '',
      sectionId: '',
      streamId: '',
      subjectId: '',
      title: '',
      homeworkType: '',
      description: '',
      assignDate: '',
      dueDate: '',
      attachments: [],
    })
    setErrors({})
    setIsModalOpen(false)
  }

  return (
    <Modal
      title={editData ? 'Edit Homework' : 'Assign Homework'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CLASS */}
          <div>
            <label>
              Class<span className="text-danger">*</span>
            </label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              className="form-control mt-1"
            >
              <option value="">Select</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.classId && <p className="text-red-500 text-xs">{errors.classId}</p>}
          </div>

          {/* SECTION */}
          <div>
            <label>
              Section<span className="text-danger">*</span>
            </label>
            <select
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              className="form-control mt-1"
            >
              <option value="">Select</option>
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.sectionId && <p className="text-red-500 text-xs">{errors.sectionId}</p>}
          </div>

          {/* STREAM - only for senior classes */}
          {/* {selectedClass?.isSenior && (
            <div>
              <label>Stream</label>
              <select
                name="streamId"
                value={formData.streamId}
                onChange={handleChange}
                className="form-control mt-1"
              >
                <option value="">Select</option>
                {streams.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )} */}
          {hasStream && (
            <div>
              <label>Stream</label>
              <select
                name="streamId"
                value={formData.streamId}
                onChange={handleChange}
                className="form-control mt-1"
              >
                <option value="">Select</option>
                {streams.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* SUBJECT ✅ FIXED */}
          <div>
            <label>
              Subject<span className="text-danger">*</span>
            </label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              className="form-control mt-1"
            >
              <option value="">Select</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
            {errors.subjectId && <p className="text-red-500 text-xs">{errors.subjectId}</p>}
          </div>

          {/* TITLE */}
          <div>
            <label>
              Home Work Title<span className="text-danger">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control mt-1"
              placeholder="Enter homework title"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
          </div>

          {/* TYPE */}
          <div>
            <label>
              Type<span className="text-danger">*</span>
            </label>
            <select
              name="homeworkType"
              value={formData.homeworkType}
              onChange={handleChange}
              className="form-control mt-1"
            >
              <option value="">Select</option>
              <option value="HOMEWORK">HOMEWORK</option>
              <option value="ASSIGNMENT">ASSIGNMENT</option>
              <option value="PROJECT">PROJECT</option>
            </select>
            {errors.homeworkType && <p className="text-red-500 text-xs">{errors.homeworkType}</p>}
          </div>

          {/* FROM DATE */}
          <div>
            <label>
              From Date<span className="text-danger">*</span>
            </label>
            {/* <input
              type="date"
              name="assignDate"
              value={formData.assignDate}
              onChange={handleChange}
              className="form-control mt-1"
            /> */}
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
            {errors.assignDate && <p className="text-red-500 text-xs">{errors.assignDate}</p>}
          </div>

          {/* DUE DATE */}
          <div>
            <label>
              Due Date<span className="text-danger">*</span>
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
            {errors.dueDate && <p className="text-red-500 text-xs">{errors.dueDate}</p>}
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
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control mt-1"
            placeholder="Enter homwork description"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-white rounded bg-[#0c3b73]">
            {loading ? 'Saving...' : editData ? 'Update' : 'Assign'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default HomeworkAssignModal
