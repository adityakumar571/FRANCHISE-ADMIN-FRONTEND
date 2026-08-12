/* eslint-disable prettier/prettier */
import { Modal } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'

const MarksModal = ({
  isModalOpen,
  modaltitle,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  data,
  prefillStudent, // new prop
}) => {
  const { currentSession } = useContext(SessionContext)

  const edittype = modaltitle == 'edit'

  const [formData, setFormData] = useState(
    edittype
      ? {
          examListId: '',
          sessionId: data?.studentDetails?.currentSession?._id,
          studentId: data?.studentDetails?.studentId,
          classId: data?.studentDetails?.classId,
          sectionId: data?.studentDetails?.sectionId,
          streamId: data?.studentDetails?.streamId,
          subjects: [],
        }
      : {
          sessionId: data?.studentDetails?.currentSession?._id,
          examListId: '',
          studentId: data?.studentDetails?.studentId,
          classId: data?.studentDetails?.classId,
          sectionId: data?.studentDetails?.sectionId,
          streamId: data?.studentDetails?.streamId,
          subjects: [],
        },
  )

  const [examList, setExamList] = useState([])
  const [studentList, setStudentList] = useState([])
  const [classList, setClassList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [streamList, setStreamList] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const getLiveSubjectResult = (marksObtained, maxMarks) => {
    if (!marksObtained || !maxMarks) return null

    const percentage = (Number(marksObtained) / Number(maxMarks)) * 100
    return percentage >= 33 ? 'PASS' : 'FAIL'
  }

  const selectedClassData = classList.find((c) => c._id === formData.classId)

  const isStreamRequired = formData.classId && selectedClassData?.isSenior === true

  /* 🔹 Load classes */
  // useEffect(() => {
  //   getRequest(`classes?isPagination=false`).then((res) => {
  //     setClassList(res?.data?.data?.classes || [])
  //   })
  // }, [])

  useEffect(() => {
    if (!currentSession?._id) return

    getRequest(`classes?session=${currentSession._id}&isPagination=false`).then((res) => {
      setClassList(res?.data?.data?.classes || [])
    })
  }, [currentSession?._id])

  /* 🔹 Load exams based on selected class */
  useEffect(() => {
    if (!formData.classId) {
      setExamList([])
      return
    }
    getRequest(`examsList?classId=${formData.classId}&isActive=true&isPagination=false`).then(
      (res) => {
        setExamList(res?.data?.data?.examLists || [])
      },
    )
  }, [formData.classId])

  /* 🔹 Auto-fill maxMarks from ExamList subjects when exam is selected (ADD mode only) */
  useEffect(() => {
    if (!formData.examListId || modalData || edittype) return

    const selectedExam = examList.find((e) => e._id === formData.examListId)
    if (!selectedExam?.subjects?.length) return

    // Build a map: subjectId → maxMarks from ExamList config
    const examSubjectMap = {}
    selectedExam.subjects.forEach((s) => {
      const id = s.subjectId?._id || s.subjectId
      if (id) examSubjectMap[String(id)] = s.maxMarks
    })

    // Apply maxMarks to existing subjects in formData (subjects already loaded from subjects API)
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => ({
        ...sub,
        maxMarks: examSubjectMap[String(sub.subjectId)] !== undefined
          ? String(examSubjectMap[String(sub.subjectId)])
          : sub.maxMarks,
      })),
    }))
  }, [formData.examListId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* 🔹 Load sections based on selected class */
  useEffect(() => {
    if (!formData.classId) {
      setSectionList([])
      return
    }
    getRequest(`sections?classId=${formData.classId}&isPagination=false`).then((res) => {
      setSectionList(res?.data?.data?.sections || [])
    })
  }, [formData.classId])

  /* 🔹 Load students based on selected class */
  useEffect(() => {
    if (!formData.classId) {
      setStudentList([])
      return
    }
    getRequest(`studentEnrollment?currentClass=${formData.classId}&isPagination=false`).then(
      (res) => {
        setStudentList(res?.data?.data?.students || [])
      },
    )
  }, [formData.classId])

  /* 🔹 Load streams (only for class 9-12) */
  useEffect(() => {
    if (!formData.classId || !isStreamRequired) {
      setStreamList([])
      // setFormData((prev) => ({ ...prev, streamId: '' }))
      return
    }

    getRequest(`streams?classId=${formData.classId}&isPagination=false`).then((res) => {
      setStreamList(res?.data?.data?.streams || [])
    })
  }, [formData.classId, isStreamRequired])

  /* 🔹 Load subjects */
  useEffect(() => {
    if (!formData.classId) {
      setSubjectList([])
      return
    }
    const url =
      isStreamRequired && formData.streamId
        ? `subjects?classId=${formData.classId}&streamId=${formData.streamId}&isPagination=false`
        : `subjects?classId=${formData.classId}&isPagination=false`
    if (isStreamRequired && !formData.streamId) {
      setSubjectList([])
      return
    }
    getRequest(url).then((res) => {
      const subs = res?.data?.data?.subjects || []
      setSubjectList(subs)
      // EDIT MODE → overwrite mat karo
      if (modalData) return

      /* 🔹 ADD MODE ONLY */
      setFormData((prev) => ({
        ...prev,
        subjects: subs.map((s) => ({
          subjectId: s._id,
          subjectName: s.name,
          marksObtained: '',
          maxMarks: '',
        })),
      }))
    })
  }, [formData.classId, formData.streamId, isStreamRequired, modalData])

  /* 🔹 Only prefill on Add mode */
  useEffect(() => {
    if (modalData) return // edit mode → don’t overwrite
    if (!prefillStudent) return
    if (!classList.length) return // wait for classList

    const selectedClass = classList.find((c) => c._id === prefillStudent.classId)

    setSelectedClass(selectedClass)

    setFormData((prev) => ({
      ...prev,
      classId: prefillStudent.classId,
      sectionId: prefillStudent.sectionId,
      streamId: prefillStudent.streamId || '',
      studentId: prefillStudent.studentId,
    }))
  }, [prefillStudent, modalData, classList])

  /* 🔹 Edit mode data set */
  useEffect(() => {
    if (!modalData || !examList.length) return

    const matchedExam = examList.find((e) => e.examMaster?.examName === modalData.exam?.examName)

    if (matchedExam) {
      setFormData((prev) => ({
        ...prev,
        examListId: matchedExam._id,
      }))
    }
  }, [modalData, examList])

  useEffect(() => {
    if (!modalData || !classList.length) return

    const classData = classList.find((c) => c._id === modalData.class?._id)
    if (classData) setSelectedClass(classData)

    setFormData({
      examListId: '',
      studentId: modalData.student?._id || '',
      classId: modalData.class?._id || '',
      sectionId: modalData.section?._id || '',
      streamId: modalData.stream?._id || '',
      subjects: modalData.subjects.map((s) => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        marksObtained: String(s.marksObtained),
        maxMarks: String(s.maxMarks),
      })),
    })
  }, [modalData, classList])

  /* 🔹 Change handler */
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'classId') {
      const classData = classList.find((c) => c._id === value)
      setSelectedClass(classData)

      setFormData({
        ...formData,
        [name]: value,
        examListId: '',
        studentId: '',
        sectionId: '',
        streamId: '',
        subjects: [],
      })
    } else if (name === 'streamId') {
      setFormData({
        ...formData,
        [name]: value,
        subjects: [],
      })
    } else if (name === 'examListId') {
      if (edittype) {
        const selectedExam = data?.exams?.find((exam) => exam.examId === value)
        // console.log('selectedExam', selectedExam)
        setFormData({
          ...formData,
          [name]: value,
          subjects: selectedExam?.subjects,
        })
      } else {
        setFormData({
          ...formData,
          [name]: value,
          // subjects: [],
        })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }

    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* 🔹 Subject marks change */
  const handleSubjectChange = (index, field, value) => {
    const subjects = [...formData.subjects]

    if (field === 'marksObtained') {
      // Agar user maxMarks se zyada type kar de, to maxMarks ke barabar limit
      const max = subjects[index].maxMarks || Infinity
      if (+value > +max) value = max
    }

    subjects[index][field] = value

    setFormData({ ...formData, subjects })

    setErrors((prev) => {
      const updated = { ...prev }

      if (field === 'marksObtained' && value) {
        delete updated[`m_${index}`]
      }

      if (field === 'maxMarks' && value) {
        delete updated[`mm_${index}`]
      }

      return updated
    })
  }
  // PREFILL FORM FOR EDIT
  useEffect(() => {
    if (!modalData) return

    setFormData({
      examListId: modalData.examListId,
      studentId: modalData.studentId,
      classId: modalData.classId,
      sectionId: modalData.sectionId,
      streamId: modalData.streamId || '',
      subjects: modalData.subjects.map((s) => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        marksObtained: s.marksObtained,
        maxMarks: s.maxMarks,
        _id: s._id, // for update
      })),
    })
  }, [modalData])

  useEffect(() => {
    if (!formData.examListId || !modalData) return

    getRequest(`marks?studentId=${formData.studentId}&examListId=${formData.examListId}`)
      .then((res) => {
        const marksData = res?.data?.data?.marks?.[0]
        if (!marksData) return

        const subjects = marksData.subjects.map((s) => ({
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          marksObtained: s.marksObtained,
          maxMarks: s.maxMarks,
        }))

        setFormData((prev) => ({ ...prev, subjects }))
      })
      .catch(console.error)
  }, [formData.examListId, formData.studentId, modalData])

  /* 🔹 Validation */
  const validateForm = () => {
    const newErrors = {}
    if (!formData.examListId) newErrors.examListId = 'Exam required'
    if (!formData.studentId) newErrors.studentId = 'Student required'
    if (!formData.classId) newErrors.classId = 'Class required'
    if (!formData.sectionId) newErrors.sectionId = 'Section required'
    if (isStreamRequired && !formData.streamId) newErrors.streamId = 'Stream required'

    formData.subjects.forEach((sub, index) => {
      if (!sub.marksObtained) {
        newErrors[`subject_${index}_marks`] = 'Marks required'
      }
      if (!sub.maxMarks) {
        newErrors[`subject_${index}_max`] = 'Max marks required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* 🔹 Submit */
  const handleAddMarks = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const payload = {
        studentId: formData.studentId,
        examListId: formData.examListId,
        sessionId: currentSession?._id,
        classId: formData.classId,
        sectionId: formData.sectionId,
        streamId: formData.streamId,
        subjects: formData.subjects.map((s) => ({
          subjectId: s.subjectId,
          marksObtained: Number(s.marksObtained),
          maxMarks: Number(s.maxMarks),
        })),
      }

      const res = await postRequest({ url: 'marks', cred: payload })
      toast.success(res?.data?.message || 'Marks added successfully')
      setUpdateStatus((p) => !p)
      handleClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error adding marks')
    } finally {
      setLoading(false)
    }
  }
  const handleUpdateMarks = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const payload = {
        sessionId: currentSession?._id,
        studentId: formData.studentId,
        examListId: formData.examListId,
        classId: formData.classId,
        sectionId: formData.sectionId,
        streamId: formData.streamId,
        subjects: formData.subjects.map((s) => ({
          subjectId: s.subjectId,
          marksObtained: Number(s.marksObtained),
          maxMarks: Number(s.maxMarks),
        })),
      }

      const res = await putRequest({ url: 'marks/update-student-marks', cred: payload })
      toast.success(res?.data?.message || 'Marks updated successfully')
      setUpdateStatus((p) => !p)
      handleCancel()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error updating marks')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (edittype) {
      handleUpdateMarks() // edit
    } else {
      handleAddMarks() // add
    }
  }

  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   if (!validateForm()) return
  //   setLoading(true)
  //   const payload = {
  //     examListId: formData.examListId,
  //     studentId: formData.studentId,
  //     classId: formData.classId,
  //     sectionId: formData.sectionId,
  //     subjects: formData.subjects.map((s) => ({
  //       subjectId: s.subjectId,
  //       marksObtained: Number(s.marksObtained),
  //       maxMarks: Number(s.maxMarks),
  //     })),
  //   }

  //   if (isStreamRequired && formData.streamId) {
  //     payload.streamId = formData.streamId
  //   }

  //   const request = modalData
  //     ? putRequest({ url: `marks/${modalData._id}`, cred: payload })
  //     : postRequest({ url: 'marks', cred: payload })

  //   request
  //     .then((res) => {
  //       toast.success(res?.data?.message || 'Marks saved successfully')
  //       setUpdateStatus((prev) => !prev)
  //       handleCancel()
  //     })
  //     .catch((err) => {
  //       toast.error(err?.response?.data?.message || 'Error saving marks')
  //     })
  //     .finally(() => setLoading(false))
  // }

  const handleCancel = () => {
    setFormData({
      examListId: '',
      studentId: '',
      classId: '',
      sectionId: '',
      streamId: '',
      subjects: [],
    })
    setSelectedClass(null)
    setModalData(null)
    setIsModalOpen(false)
    setErrors({})
  }
  const handleClose = () => {
    setFormData({
      examListId: '',
      studentId: '',
      classId: '',
      sectionId: '',
      streamId: '',
      subjects: [],
    })
    setSelectedClass(null)
    setModalData(null)
    setIsModalOpen(false)
    setErrors({})
  }

  return (
    <Modal
      title={edittype ? 'Edit Marks' : 'Add Marks'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={800}
    >
      <form onSubmit={handleSubmit}>
        {/* Row 1: Class & Exam */}
        <div className="row mb-3">
          <div className="col-4">
            <label className="form-label">
              Class<span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.classId ? 'is-invalid' : ''}`}
              name="classId"
              value={formData.classId}
              onChange={handleChange}
            >
              <option value="">Select Class</option>
              {classList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.classId && <div className="invalid-feedback">{errors.classId}</div>}
          </div>
          {/* 🔹 Section */}
          <div className="col-4">
            <label className="form-label">
              Section<span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.sectionId ? 'is-invalid' : ''}`}
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              disabled={!formData.classId}
            >
              <option value="">Select Section</option>
              {sectionList.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  {sec.name}
                </option>
              ))}
            </select>
            {errors.sectionId && <div className="invalid-feedback">{errors.sectionId}</div>}
          </div>
          <div className="col-4">
            <label className="form-label">
              Exam<span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.examListId ? 'is-invalid' : ''}`}
              name="examListId"
              value={formData.examListId}
              onChange={handleChange}
              disabled={!formData.classId}
            >
              <option value="">Select Exam</option>
              {examList.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.examMaster?.examName} ({e.examMaster?.category})
                </option>
              ))}
            </select>
            {errors.examListId && <div className="invalid-feedback">{errors.examListId}</div>}
          </div>
        </div>

        {/* Row 2: Student & Stream */}
        <div className="row mb-3">
          <div className={isStreamRequired ? 'col-6' : 'col-12'}>
            <label className="form-label">
              Student<span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.studentId ? 'is-invalid' : ''}`}
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              disabled={!formData.classId}
            >
              <option value="">Select Student</option>
              {studentList.map((s) => {
                const fullName = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')

                const relation = s.gender === 'Male' ? 'S/o' : 'D/o'

                const classSection = `${s.currentClass?.name || '-'} ${s.currentSection?.name || ''}`

                return (
                  <option key={s._id} value={s._id}>
                    {fullName} {relation} {s.fatherName} - {classSection}
                  </option>
                )
              })}
            </select>
            {errors.studentId && <div className="invalid-feedback">{errors.studentId}</div>}
          </div>

          {isStreamRequired && (
            <div className="col-6">
              <label className="form-label">
                Stream<span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.streamId ? 'is-invalid' : ''}`}
                name="streamId"
                value={formData.streamId}
                onChange={handleChange}
                disabled={!formData.classId}
              >
                <option value="">Select Stream</option>
                {streamList.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name}
                  </option>
                ))}
              </select>
              {errors.streamId && <div className="invalid-feedback">{errors.streamId}</div>}
            </div>
          )}
        </div>

        {/* Row 3: Subject Marks Heading */}
        {formData.subjects.length > 0 && (
          <div className="mb-3">
            <label className="form-label fw-bold">Subject Marks</label>

            {/* column headers */}
            <div className="row mb-1 px-1">
              <div className="col-3">
                <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>Subject</span>
              </div>
              <div className="col-3">
                <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>Obtained</span>
              </div>
              <div className="col-3">
                <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>
                  Total{' '}
                  <span style={{ fontSize: 10, color: '#6c757d' }}>(auto)</span>
                </span>
              </div>
              <div className="col-3">
                <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>Result</span>
              </div>
            </div>

            {/* Subjects List */}
            {formData.subjects.map((sub, index) => {
              const subjectName =
                subjectList.find((s) => s._id === sub.subjectId)?.name ||
                sub.subjectName ||
                'Subject'

              // check if maxMarks was pre-filled from ExamList config
              const selectedExam = examList.find((e) => e._id === formData.examListId)
              const examSubjectMap = {}
              if (selectedExam?.subjects?.length) {
                selectedExam.subjects.forEach((s) => {
                  const id = s.subjectId?._id || s.subjectId
                  if (id) examSubjectMap[String(id)] = s.maxMarks
                })
              }
              const isMaxPrefilled =
                examSubjectMap[String(sub.subjectId)] !== undefined && !edittype

              // passing marks from ExamList config (display only)
              const passingFromExam = selectedExam?.subjects?.find(
                (s) => String(s.subjectId?._id || s.subjectId) === String(sub.subjectId),
              )?.passingMarks

              const liveResult =
                sub.subjectResult || getLiveSubjectResult(sub.marksObtained, sub.maxMarks)

              return (
                <div className="row mb-2 align-items-start" key={sub.subjectId}>
                  {/* Subject name */}
                  <div className="col-3 d-flex flex-column justify-content-center" style={{ minHeight: 38 }}>
                    <span className="fw-medium">{sub.subjectName || subjectName}</span>
                    {passingFromExam !== undefined && (
                      <small className="text-muted" style={{ fontSize: 11 }}>
                        Pass: {passingFromExam}
                      </small>
                    )}
                  </div>

                  {/* Obtained marks */}
                  <div className="col-3">
                    <input
                      className={`form-control ${errors[`subject_${index}_marks`] ? 'is-invalid' : ''}`}
                      placeholder="Obtained"
                      type="number"
                      min="0"
                      value={sub.marksObtained}
                      onChange={(e) => handleSubjectChange(index, 'marksObtained', e.target.value)}
                    />
                    {errors[`subject_${index}_marks`] && (
                      <div className="invalid-feedback">{errors[`subject_${index}_marks`]}</div>
                    )}
                  </div>

                  {/* Total marks — read-only when pre-filled from ExamList */}
                  <div className="col-3">
                    <input
                      className={`form-control ${isMaxPrefilled ? 'bg-light' : ''} ${errors[`subject_${index}_max`] ? 'is-invalid' : ''}`}
                      placeholder="Total"
                      type="number"
                      min="0"
                      value={sub.maxMarks}
                      readOnly={isMaxPrefilled}
                      title={isMaxPrefilled ? 'Set in Exam Schedule — edit from Exam Lists page' : ''}
                      onChange={
                        isMaxPrefilled
                          ? undefined
                          : (e) => handleSubjectChange(index, 'maxMarks', e.target.value)
                      }
                    />
                    {isMaxPrefilled && (
                      <small className="text-success" style={{ fontSize: 11 }}>
                        ✓ Auto-filled
                      </small>
                    )}
                    {errors[`subject_${index}_max`] && (
                      <div className="invalid-feedback">{errors[`subject_${index}_max`]}</div>
                    )}
                  </div>

                  {/* Live result badge */}
                  <div className="col-3 d-flex align-items-center">
                    {liveResult && (
                      <span
                        className={`badge px-3 py-2 ${liveResult === 'PASS' ? 'bg-success' : 'bg-danger'}`}
                      >
                        {liveResult}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 border rounded" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: '#0c3b73' }}
          >
            {loading
              ? edittype ? 'Updating...' : 'Saving...'
              : edittype ? 'Update Marks' : 'Save Marks'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default MarksModal
