/* eslint-disable react/display-name */
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useContext,
  useRef,
} from 'react'
import { Upload, Modal, Button } from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { getRequest } from '../../Helpers'
import { SessionContext } from '../../Context/Seesion'

const SchoolInformation = forwardRef(({ modalData, onChange, basicData }, ref) => {
  const [errors, setErrors] = useState({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState([])
  const [tcList, setTcList] = useState([])
  const [classes, setClasses] = useState([])
  const [allStreams, setAllStreams] = useState([])
  const [sections, setSections] = useState([])
  const { currentSession } = useContext(SessionContext)

  const getValidDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  }

  const [formData, setFormData] = useState({
    previousSchool: '',
    studentType: '',
    medium: '',
    currentClass: '',
    admissionClass: '',
    currentSection: '',
    stream: '',
    house: '',
    admissionDate: '',
    status: 'Studying',
    remark: '',
    tcSubmit: false,
    lastPassedExam: '',
    previousMedium: '',
    previousStream: '',
  })

  useEffect(() => {
    if (!basicData) return

    setFormData((prev) => ({
      ...prev,
      currentClass: basicData.currentClass || '',
    }))
  }, [basicData])

  /* ✅ CHECK IF CLASS IS SENIOR (9-12) */
  // const isSeniorClass = (classId) => {
  //   if (!classId || !classes.length) return false
  //   const cls = classes.find((c) => String(c._id) === String(classId))
  //   if (!cls) return false
  //   const label = cls.className || cls.name || ''
  //   const classNumber = Number(label.match(/\d+/)?.[0])
  //   return classNumber >= 9 && classNumber <= 12
  // }

  // const isSenior = isSeniorClass(formData.currentClass)
  // const isSeniorAdmission = isSeniorClass(formData.admissionClass)

  // Get the selected class objects
  const currentClassObj = classes.find((c) => String(c._id) === String(formData.currentClass))
  const admissionClassObj = classes.find((c) => String(c._id) === String(formData.admissionClass))

  // Use their isSenior flag
  const isSenior = currentClassObj?.isSenior || false
  const isSeniorAdmission = admissionClassObj?.isSenior || false

  useEffect(() => {
    if (!currentSession?._id) return
    const fetchClasses = async () => {
      try {
        const res = await getRequest(`classes?isPagination=false&session=${currentSession._id}`)
        setClasses(res?.data?.data?.classes || [])
      } catch (err) {
        console.error('Class fetch error', err)
        setClasses([])
      }
    }
    fetchClasses()
  }, [currentSession?._id])

  useEffect(() => {
    if (!modalData) return
  }, [modalData])

  /* ================= RECEIVE currentClass FROM BASIC TAB ================= */
  useEffect(() => {
    if (!basicData?.currentClass) return

    setFormData((prev) => {
      // Only set if not already set
      if (prev.currentClass) return prev

      return {
        ...prev,
        currentClass: basicData.currentClass,
        // admissionClass: prev.admissionClass || basicData.currentClass,
      }
    })
  }, [basicData?.currentClass])

  /* ================= FETCH STREAMS ================= */
  /* ================= FETCH STREAMS (FIXED) ================= */
  // useEffect(() => {
  //   // 🔥 ADD MODE → fetch only for senior

  //   if (!modalData && !isSenior && !isSeniorAdmission) return

  //   const fetchStreams = async () => {
  //     try {
  //       const res = await getRequest('streams')
  //       setAllStreams(res?.data?.data?.streams || [])
  //     } catch (err) {
  //       console.error('Stream fetch error', err)
  //       setAllStreams([])
  //     }
  //   }

  //   fetchStreams()
  // }, [modalData, isSenior, isSeniorAdmission])

  /* ================= FILTERED STREAMS ================= */
  // const admissionStreams = allStreams.filter(
  //   (s) => String(s.classId) === String(formData.admissionClass),
  // )

  // const currentStreams = allStreams.filter(
  //   (s) => String(s.classId) === String(formData.currentClass),
  // )
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!formData.currentClass && !formData.admissionClass) return

    // 🔥 React Strict Mode double call fix
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchStreams = async () => {
      try {
        let streamsData = []

        if (isSenior && formData.currentClass) {
          const res = await getRequest(
            `streams?classId=${formData.currentClass}&isPagination=false`,
          )
          streamsData.push(...(res?.data?.data?.streams || []))
        }

        if (
          isSeniorAdmission &&
          formData.admissionClass &&
          formData.admissionClass !== formData.currentClass
        ) {
          const res = await getRequest(
            `streams?classId=${formData.admissionClass}&isPagination=false`,
          )
          streamsData.push(...(res?.data?.data?.streams || []))
        }

        const uniqueStreams = Array.from(new Map(streamsData.map((s) => [s._id, s])).values())

        setAllStreams(uniqueStreams)
      } catch (err) {
        console.error(err)
        setAllStreams([])
      }
    }

    fetchStreams()
  }, [formData.currentClass, formData.admissionClass])

  useEffect(() => {
    hasFetched.current = false
  }, [formData.currentClass, formData.admissionClass])

  const currentStreams = allStreams.filter(
    (s) => String(s.classId) === String(formData.currentClass),
  )

  const admissionStreams = allStreams.filter(
    (s) => String(s.classId) === String(formData.admissionClass),
  )

  /* ================= FETCH SECTIONS ================= */
  useEffect(() => {
    if (!formData.currentClass) {
      setSections([])
      return
    }

    const fetchSections = async () => {
      try {
        const res = await getRequest(
          `sections?page=1&isPagination=false&classId=${formData.currentClass}`,
        )
        setSections(res?.data?.data?.sections || [])
      } catch (err) {
        console.error('Section fetch error:', err)
        setSections([])
      }
    }
    fetchSections()
  }, [formData.currentClass])

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'currentClass' && value !== prev.currentClass
        ? { currentSection: '', stream: '' }
        : {}),
      ...(name === 'admissionClass' && value !== prev.admissionClass ? { previousStream: '' } : {}),
    }))
  }

  const handleTcChange = ({ fileList }) => {
    setTcList(fileList)
  }

  /* ================= EDIT PREFILL ================= */

  // ✅ STREAM AUTO-FILL (AFTER OPTIONS LOAD)
  useEffect(() => {
    if (!modalData?.stream) return
    if (!currentStreams.length) return

    setFormData((prev) => {
      if (prev.stream) return prev // already set, don't override

      return {
        ...prev,
        stream: modalData.stream?._id || modalData.stream,
      }
    })
  }, [modalData?.stream, currentStreams])

  useEffect(() => {
    if (!modalData?.previousStream) return
    if (!admissionStreams.length) return

    setFormData((prev) => {
      if (prev.previousStream) return prev

      return {
        ...prev,
        previousStream: modalData.previousStream?._id || modalData.previousStream,
      }
    })
  }, [modalData?.previousStream, admissionStreams])

  useEffect(() => {
    if (!modalData || !classes.length) return

    const currentClassId = modalData.currentClass?._id || modalData.currentClass || ''

    setFormData((prev) => ({
      ...prev,
      previousSchool: modalData.schoolName || '',
      previousMedium: modalData.previousMedium || '',
      admissionClass:
        typeof modalData.admissionClass === 'object'
          ? modalData.admissionClass?._id
          : modalData.admissionClass || '',

      currentClass: currentClassId,
      currentSection: modalData.currentSection?._id || modalData.currentSection || '',
      medium: modalData.medium || '',
      studentType: modalData.studentType || '',
      admissionDate: getValidDate(modalData.admissionDate),
      status: modalData.status || 'Studying',
      remark: modalData.remark || '',
      tcSubmit: modalData.tcSubmit || false,
    }))
  }, [modalData, classes])

  console.log('modalData.admissionClass', modalData?.admissionClass)
  console.log('classes', classes)

  useEffect(() => {
    // console.log('🟢 formData.stream', formData.stream)
    // console.log('🟢 currentStreams', currentStreams)
  }, [formData.stream, currentStreams])

  /* ================= PROPAGATE TO PARENT ================= */
  useEffect(() => {
    onChange?.(formData)
  }, [formData, onChange])

  /* ================= SUBMIT ================= */
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      const payload = {
        schoolName: formData.previousSchool,
        previousMedium: formData.previousMedium,
        previousStream: formData.previousStream,
        admissionClass: formData.admissionClass,
        currentClass: formData.currentClass,
        currentSection: formData.currentSection,
        medium: formData.medium,
        stream: formData.stream,
        studentType: formData.studentType,
        admissionDate: formData.admissionDate,
        status: formData.status,
        remark: formData.remark,
        tcSubmit: formData.tcSubmit,
      }

      // Remove empty fields
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '' || payload[key] == null) {
          delete payload[key]
        }
      })

      return {
        valid: true,
        data: payload,
      }
    },
  }))

  /* ================= UI ================= */
  return (
    <form className="container mt-3">
      {/* PREVIOUS SCHOOL DETAILS */}
      <div className="card mb-3">
        <div className="card-header !bg-[#0c3b73] text-white">Previous School Details</div>

        <div className="card-body row g-3">
          <div className="col-md-3">
            <label className="form-label">Previous School Name</label>
            <input
              className="form-control form-control-sm"
              name="previousSchool"
              value={formData.previousSchool}
              onChange={handleChange}
              placeholder="Enter Previous School Name"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Previous Class</label>
            <select
              className="form-select form-select-sm"
              name="admissionClass"
              value={formData.admissionClass}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className || c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Previous Medium</label>
            <select
              className="form-select form-select-sm"
              name="previousMedium"
              value={formData.previousMedium}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          {isSeniorAdmission && (
            <div className="col-md-3">
              <label className="form-label">Previous Stream</label>
              <select
                className="form-select form-select-sm"
                name="previousStream"
                value={formData.previousStream}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {admissionStreams.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ADMISSION DETAILS (CURRENT) */}
      <div className="card mb-3">
        <div className="card-header !bg-[#0c3b73] text-white">Admission Details</div>

        <div className="card-body row g-3">
          <div className="col-md-3">
            <label className="form-label">Current Class</label>
            <select
              className="form-select form-select-sm"
              name="currentClass"
              value={formData.currentClass}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className || c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Section</label>
            <select
              className="form-select form-select-sm"
              name="currentSection"
              value={formData.currentSection}
              onChange={handleChange}
              disabled={!formData.currentClass}
            >
              <option value="">Select</option>
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Medium</label>
            <select
              className="form-select form-select-sm"
              name="medium"
              value={formData.medium}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          {isSenior && (
            <div className="col-md-3">
              <label className="form-label">Stream</label>
              <select
                className="form-select form-select-sm"
                name="stream"
                value={formData.stream}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {currentStreams.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* STATUS (ONLY IN EDIT MODE) */}
      {modalData && (
        <div className="card mb-3">
          <div className="card-header !bg-[#0c3b73] text-white">Status</div>
          <div className="card-body d-flex gap-4">
            {['Studying', 'Passed', 'Inactive'].map((s) => (
              <label key={s} className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="status"
                  value={s}
                  checked={formData.status === s}
                  onChange={handleChange}
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TC UPLOAD */}
      {formData.tcSubmit && (
        <Upload fileList={tcList} onChange={handleTcChange} beforeUpload={() => false}>
          <Button icon={<UploadOutlined />}>Upload TC</Button>
        </Upload>
      )}

    </form>
  )
})

export default SchoolInformation
