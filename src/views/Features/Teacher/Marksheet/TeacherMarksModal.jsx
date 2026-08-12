/* eslint-disable prettier/prettier */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getRequest, postRequest } from '../../../../Helpers'
import { useApp } from '../../../../Context/AppContext'

const TeacherMarksModal = ({
  isModalOpen,
  setIsModalOpen,
  setUpdateStatus,
  modalData,
  setModalData,
  data,
  prefillStudent,
}) => {
  const { user } = useApp()

  /*CLASS TEACHER ASSIGNMENT */
  const classTeacher = user?.profile?.classesAssigned?.find((c) => c.isClassTeacher)

  const [formData, setFormData] = useState({
    examListId: '',
    studentId: data?.studentDetails?.studentId,
    classId: data?.studentDetails?.classId,
    sectionId: data?.studentDetails?.sectionId,
    streamId: data?.studentDetails?.streamId,
    subjects: [],
  })

  const [examList, setExamList] = useState([])
  const [studentList, setStudentList] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const [streamList, setStreamList] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const selectedClass = classTeacher?.classId

  const isStreamRequired = !!classTeacher?.stream

  const getLiveSubjectResult = (marksObtained, maxMarks) => {
    if (!marksObtained || !maxMarks) return null

    const percentage = (Number(marksObtained) / Number(maxMarks)) * 100
    return percentage >= 33 ? 'PASS' : 'FAIL'
  }

  /* 🔹 PREFILL CLASS + SECTION (LOCKED) */
  useEffect(() => {
    if (!classTeacher) return

    setFormData((prev) => ({
      ...prev,
      classId: classTeacher?.classId?._id || '',
      sectionId: classTeacher?.sectionId?._id || '',
      streamId: classTeacher?.stream?._id || '',
    }))
  }, [classTeacher])

  /* 🔹 LOAD EXAMS */
  useEffect(() => {
    if (!formData?.classId) return

    getRequest(`examsList?classId=${formData?.classId}&isActive=true&isPagination=false`).then(
      (res) => {
        setExamList(res?.data?.data?.examLists || [])
      },
    )
  }, [formData?.classId])

  /* 🔹 LOAD STUDENTS (ONLY ASSIGNED CLASS + SECTION) */
  useEffect(() => {
    if (!formData?.classId || !formData?.sectionId) return

    getRequest(
      `studentEnrollment?currentClass=${formData?.classId}&currentSection=${formData?.sectionId}&isPagination=false`,
    ).then((res) => {
      setStudentList(res?.data?.data?.students || [])
    })
  }, [formData.classId, formData.sectionId])

  /* 🔹 LOAD STREAMS (9–12) */
  useEffect(() => {
    if (!isStreamRequired) {
      setStreamList([])
      setFormData((p) => ({ ...p, streamId: '' }))
      return
    }

    getRequest(`streams?classId=${formData?.classId}&isPagination=false`).then((res) => {
      setStreamList(res?.data?.data?.streams || [])
    })
  }, [isStreamRequired, formData?.classId])

  /* 🔹 LOAD SUBJECTS */
  useEffect(() => {
    if (!formData?.classId) return
    if (isStreamRequired && !formData?.streamId) return

    const url = isStreamRequired
      ? `subjects?classId=${formData?.classId}&streamId=${formData?.streamId}&isPagination=false`
      : `subjects?classId=${formData?.classId}&isPagination=false`

    getRequest(url).then((res) => {
      const subs = res?.data?.data?.subjects || []
      setSubjectList(subs)

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
  }, [formData?.classId, formData?.streamId, isStreamRequired])

  /* 🔹 VALIDATION */
  const validate = () => {
    const e = {}
    if (!formData?.examListId) e.examListId = 'Exam required'
    if (!formData?.studentId) e.studentId = 'Student required'
    if (isStreamRequired && !formData?.streamId) e.streamId = 'Stream required'

    formData.subjects.forEach((s, i) => {
      if (!s?.marksObtained) e[`m_${i}`] = 'Marks required'
      if (!s?.maxMarks) e[`mm_${i}`] = 'Max marks required'

      // 🔹  ADD Obtained > Max
      if (s?.marksObtained && s?.maxMarks && +s.marksObtained > +s.maxMarks) {
        e[`m_${i}`] = 'Obtained cannot exceed max'
      }
    })

    setErrors(e)
    return Object.keys(e).length === 0
  }

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

  /* 🔹 SUBMIT */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    const payload = {
      examListId: formData?.examListId,
      studentId: formData?.studentId,
      classId: formData?.classId,
      sectionId: formData?.sectionId,
      subjects: formData?.subjects?.map((s) => ({
        subjectId: s?.subjectId,
        marksObtained: Number(s?.marksObtained),
        maxMarks: Number(s?.maxMarks),
      })),
    }

    if (isStreamRequired) payload.streamId = formData?.streamId

    postRequest({ url: 'marks', cred: payload })
      .then((res) => {
        toast.success(res?.data?.message || 'Marks added')
        setUpdateStatus((p) => !p)
        handleClose()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Error saving marks'))
      .finally(() => setLoading(false))
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setErrors({})
    setFormData({
      examListId: '',
      studentId: '',
      classId: '',
      sectionId: '',
      streamId: '',
      subjects: [],
    })
  }

  return (
    <Modal title="Add Marks" open={isModalOpen} footer={null} onCancel={handleClose} width={800}>
      <form onSubmit={handleSubmit}>
        {/* CLASS + SECTION (LOCKED UI) */}
        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label">
              Class<span className="text-danger">*</span>
            </label>
            <input className="form-control" disabled value={classTeacher?.classId?.name || ''} />
          </div>

          <div className="col-6">
            <label className="form-label">
              Section<span className="text-danger">*</span>
            </label>
            <input className="form-control" disabled value={classTeacher?.sectionId?.name || ''} />
          </div>
        </div>

        {/* EXAM */}
        <div className="mb-3">
          <label className="form-label">
            Exam<span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.examListId ? 'is-invalid' : ''}`}
            value={formData.examListId}
            onChange={(e) => setFormData({ ...formData, examListId: e.target.value })}
          >
            <option value="">Select Exam</option>
            {examList.map((e) => (
              <option key={e._id} value={e._id}>
                {e.examMaster?.examName}
              </option>
            ))}
            {errors.examListId && <div className="invalid-feedback">{errors.examListId}</div>}
          </select>
        </div>

        {/* STUDENT */}
        <div className="mb-3">
          <label className="form-label">
            Student<span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.studentId ? 'is-invalid' : ''}`}
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          >
            <option value="">Select Student</option>
            {studentList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
          {errors.studentId && <div className="invalid-feedback">{errors.studentId}</div>}
        </div>

        {/* STREAM */}
        {isStreamRequired && (
          <div className="mb-3">
            <label className="form-label">Stream *</label>
            <select
              className={`form-select ${errors.streamId ? 'is-invalid' : ''}`}
              value={formData.streamId}
              onChange={(e) => setFormData({ ...formData, streamId: e.target.value })}
            >
              <option value="">Select Stream</option>
              {streamList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.streamId && <div className="invalid-feedback">{errors.streamId}</div>}
          </div>
        )}

        {/* SUBJECT MARKS */}
        {formData.subjects.length > 0 && (
          <div className="mb-3">
            <label className="form-label fw-bold">Subject Marks</label>

            {formData.subjects.map((sub, index) => {
              const subjectName =
                subjectList.find((s) => s._id === sub.subjectId)?.name ||
                sub.subjectName ||
                'Subject'

              const liveResult =
                sub.subjectResult || getLiveSubjectResult(sub.marksObtained, sub.maxMarks)

              return (
                <div className="row mb-2 align-items-center" key={sub.subjectId || index}>
                  {/* Subject Name */}
                  <div className="col-3">
                    <span className="fw-medium">{sub.subjectName || subjectName}</span>
                  </div>

                  {/* Obtained Marks */}
                  <div className="col-3">
                    <input
                      className={`form-control ${errors[`m_${index}`] ? 'is-invalid' : ''}`}
                      type="number"
                      min="0"
                      placeholder="Obtained Marks"
                      value={sub.marksObtained}
                      onChange={(e) => handleSubjectChange(index, 'marksObtained', e.target.value)}
                    />
                    {errors[`m_${index}`] && (
                      <div className="invalid-feedback">{errors[`m_${index}`]}</div>
                    )}
                  </div>

                  {/* Max Marks */}
                  <div className="col-3">
                    <input
                      className={`form-control ${errors[`mm_${index}`] ? 'is-invalid' : ''}`}
                      type="number"
                      min="0"
                      placeholder="Total Marks"
                      value={sub.maxMarks}
                      // onChange={(e) => {
                      //   const subjects = [...formData.subjects]
                      //   subjects[index].maxMarks = e.target.value
                      //   setFormData({ ...formData, subjects })
                      // }}

                      onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)}
                    />
                    {errors[`mm_${index}`] && (
                      <div className="invalid-feedback">{errors[`mm_${index}`]}</div>
                    )}
                  </div>

                  {/* Live Result */}
                  <div className="col-3">
                    {liveResult && (
                      <span
                        className={`badge px-3 py-2 ${
                          liveResult === 'PASS' ? 'bg-success' : 'bg-danger'
                        }`}
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
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Marks'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TeacherMarksModal
