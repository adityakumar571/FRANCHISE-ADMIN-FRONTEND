/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest } from '../../../../Helpers'
import { useContext } from 'react'
import { SessionContext } from '../../../../Context/Seesion.js'

const ExamListsModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
}) => {
  const { currentSession } = useContext(SessionContext)

  const [formData, setFormData] = useState({
    examMasterId: '',
    classId: '',
    streamId: '',
    sessionId: currentSession?._id,
    fromDate: '',
    toDate: '',
    remarks: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [streams, setStreams] = useState([])
  const [exams, setExams] = useState([])
  const [classes, setClasses] = useState([])

  // subjects fetched from API when class/stream chosen
  const [subjectList, setSubjectList] = useState([])
  // per-subject maxMarks & passingMarks entered by user
  const [subjectMarks, setSubjectMarks] = useState([]) // [{subjectId, name, maxMarks, passingMarks}]

  /* ─── fetch exams ─── */
  useEffect(() => {
    getRequest(`exams?isPagination=false`).then((res) => {
      setExams(res?.data?.data?.exams || [])
    })
  }, [])

  /* ─── fetch classes ─── */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagiantion=false&limit=100&session=${currentSession?._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => toast.error('Failed to fetch classes'))
  }, [currentSession?._id])

  /* ─── streams when class changes ─── */
  useEffect(() => {
    if (!formData.classId || !classes.length) return
    const selectedClass = classes.find((c) => c._id === formData.classId)
    if (selectedClass?.isSenior) {
      getRequest(`streams?classId=${formData.classId}`)
        .then((res) => setStreams(res?.data?.data?.streams || []))
        .catch(() => toast.error('Failed to fetch streams'))
    } else {
      setStreams([])
      setFormData((prev) => ({ ...prev, streamId: '' }))
    }
  }, [formData.classId, classes])

  /* ─── fetch subjects when class / stream ready ─── */
  useEffect(() => {
    const senior = isSeniorClass()
    // for senior class wait until stream is selected
    if (!formData.classId || (senior && !formData.streamId)) {
      setSubjectList([])
      setSubjectMarks([])
      return
    }
    const url = senior
      ? `subjects?classId=${formData.classId}&streamId=${formData.streamId}&isPagination=false`
      : `subjects?classId=${formData.classId}&isPagination=false`

    getRequest(url)
      .then((res) => {
        const subs = res?.data?.data?.subjects || []
        setSubjectList(subs)
        // initialise subjectMarks only if NOT edit mode
        // (edit mode prefill happens in the modalData effect below)
        if (!modalData) {
          setSubjectMarks(
            subs.map((s) => ({ subjectId: s._id, name: s.name, maxMarks: '', passingMarks: '' })),
          )
        }
      })
      .catch(() => toast.error('Failed to fetch subjects'))
  }, [formData.classId, formData.streamId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── prefill for edit ─── */
  useEffect(() => {
    if (!modalData || !classes.length) return

    const classId = modalData.class?._id
    const selectedClass = classes.find((c) => c._id === classId)

    const fillForm = (streamsData = []) => {
      setStreams(streamsData)
      setFormData({
        sessionId: modalData.sessionId || currentSession?._id,
        examMasterId: modalData.examMaster?._id || '',
        classId: classId || '',
        streamId: modalData.stream?._id || '',
        fromDate: modalData.fromDate?.slice(0, 10) || '',
        toDate: modalData.toDate?.slice(0, 10) || '',
        remarks: modalData.remarks || '',
      })
      // prefill subject marks from saved data
      if (Array.isArray(modalData.subjects) && modalData.subjects.length) {
        setSubjectMarks(
          modalData.subjects.map((s) => ({
            subjectId: s.subjectId?._id || s.subjectId,
            name: s.subjectId?.name || s.name || '',
            maxMarks: String(s.maxMarks ?? ''),
            passingMarks: String(s.passingMarks ?? ''),
          })),
        )
      }
    }

    if (selectedClass?.isSenior) {
      getRequest(`streams?classId=${classId}`)
        .then((res) => fillForm(res?.data?.data?.streams || []))
        .catch(() => toast.error('Failed to fetch streams'))
    } else {
      fillForm([])
    }
  }, [modalData, classes]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSeniorClass = () => {
    const cls = classes.find((c) => c._id === formData.classId)
    return cls?.isSenior === true
  }

  const handleCancel = () => {
    setFormData({ examMasterId: '', classId: '', streamId: '', fromDate: '', toDate: '', remarks: '' })
    setSubjectMarks([])
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    // reset subjects when class changes
    if (name === 'classId') {
      setSubjectMarks([])
      setFormData((prev) => ({ ...prev, classId: value, streamId: '', examMasterId: '' }))
    } else if (name === 'streamId') {
      setSubjectMarks([])
      setFormData((prev) => ({ ...prev, streamId: value }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubjectMarkChange = (index, field, value) => {
    setSubjectMarks((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    setErrors((prev) => ({ ...prev, [`sub_${index}_${field}`]: '' }))
  }

  const validateForm = () => {
    const err = {}
    if (!formData.examMasterId) err.examMasterId = 'Exam is required'
    if (!formData.classId) err.classId = 'Class is required'
    if (!formData.fromDate) err.fromDate = 'From date required'
    if (!formData.toDate) err.toDate = 'To date required'
    if (isSeniorClass() && !formData.streamId) err.streamId = 'Stream is required'

    subjectMarks.forEach((s, i) => {
      if (s.maxMarks === '' || s.maxMarks === undefined)
        err[`sub_${i}_maxMarks`] = 'Total marks required'
      if (s.passingMarks === '' || s.passingMarks === undefined)
        err[`sub_${i}_passingMarks`] = 'Passing marks required'
    })

    setErrors(err)
    return Object.keys(err).length === 0
  }

  /* ─── submit ─── */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    if (!currentSession?._id) { toast.error('Active session not found'); return }
    setLoading(true)

    const payload = {
      ...formData,
      sessionId: currentSession._id,
      subjects: subjectMarks.map((s) => ({
        subjectId: s.subjectId,
        maxMarks: Number(s.maxMarks),
        passingMarks: Number(s.passingMarks),
      })),
    }
    if (!isSeniorClass()) delete payload.streamId

    const apiCall = modalData
      ? putRequest({ url: `examsList/${modalData._id}`, cred: payload })
      : postRequest({ url: 'examsList', cred: payload })

    apiCall
      .then((res) => {
        toast.success(res?.data?.message || 'Saved successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }

  /* ─── UI ─── */
  return (
    <Modal
      title={modalData ? 'Edit Exam Schedule' : 'Add Exam Schedule'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={640}
    >
      <form onSubmit={handleSubmit}>

        {/* Exam */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Exam<span className="text-danger">*</span>
          </label>
          <select
            name="examMasterId"
            className={`form-select ${errors.examMasterId ? 'is-invalid' : ''}`}
            value={formData.examMasterId}
            onChange={handleChange}
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e._id} value={e._id}>{e.examName}</option>
            ))}
          </select>
          {errors.examMasterId && <div className="invalid-feedback">{errors.examMasterId}</div>}
        </div>

        {/* Class */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Class<span className="text-danger">*</span>
          </label>
          <select
            name="classId"
            className={`form-select ${errors.classId ? 'is-invalid' : ''}`}
            value={formData.classId}
            onChange={handleChange}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          {errors.classId && <div className="invalid-feedback">{errors.classId}</div>}
        </div>

        {/* Stream (senior only) */}
        {isSeniorClass() && (
          <div className="mb-3">
            <label className="form-label fw-bold">Stream<span className="text-danger">*</span></label>
            <select
              name="streamId"
              className={`form-select ${errors.streamId ? 'is-invalid' : ''}`}
              value={formData.streamId}
              onChange={handleChange}
            >
              <option value="">Select Stream</option>
              {streams.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            {errors.streamId && <div className="invalid-feedback">{errors.streamId}</div>}
          </div>
        )}

        {/* Dates */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">From Date<span className="text-danger">*</span></label>
            <input
              type="date" name="fromDate"
              className={`form-control ${errors.fromDate ? 'is-invalid' : ''}`}
              value={formData.fromDate} onChange={handleChange}
            />
            {errors.fromDate && <div className="invalid-feedback">{errors.fromDate}</div>}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">To Date<span className="text-danger">*</span></label>
            <input
              type="date" name="toDate"
              className={`form-control ${errors.toDate ? 'is-invalid' : ''}`}
              value={formData.toDate} onChange={handleChange}
            />
            {errors.toDate && <div className="invalid-feedback">{errors.toDate}</div>}
          </div>
        </div>

        {/* ── Subject-wise Total & Passing Marks ── */}
        {subjectMarks.length > 0 && (
          <div className="mb-3">
            <label className="form-label fw-bold mb-2">
              Subject-wise Marks Configuration
            </label>
            {/* header row */}
            <div className="row mb-1 px-1">
              <div className="col-5">
                <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>Subject</span>
              </div>
              <div className="col-3">
                <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>
                  Total Marks <span className="text-danger">*</span>
                </span>
              </div>
              <div className="col-4">
                <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>
                  Passing Marks <span className="text-danger">*</span>
                </span>
              </div>
            </div>

            {subjectMarks.map((sub, index) => (
              <div className="row mb-2 align-items-start" key={sub.subjectId}>
                <div className="col-5 d-flex align-items-center" style={{ minHeight: 38 }}>
                  <span className="fw-medium text-sm">{sub.name}</span>
                </div>
                <div className="col-3">
                  <input
                    type="number" min="0"
                    className={`form-control form-control-sm ${errors[`sub_${index}_maxMarks`] ? 'is-invalid' : ''}`}
                    placeholder="e.g. 100"
                    value={sub.maxMarks}
                    onChange={(e) => handleSubjectMarkChange(index, 'maxMarks', e.target.value)}
                  />
                  {errors[`sub_${index}_maxMarks`] && (
                    <div className="invalid-feedback" style={{ fontSize: 11 }}>
                      {errors[`sub_${index}_maxMarks`]}
                    </div>
                  )}
                </div>
                <div className="col-4">
                  <input
                    type="number" min="0"
                    className={`form-control form-control-sm ${errors[`sub_${index}_passingMarks`] ? 'is-invalid' : ''}`}
                    placeholder="e.g. 33"
                    value={sub.passingMarks}
                    onChange={(e) => handleSubjectMarkChange(index, 'passingMarks', e.target.value)}
                  />
                  {errors[`sub_${index}_passingMarks`] && (
                    <div className="invalid-feedback" style={{ fontSize: 11 }}>
                      {errors[`sub_${index}_passingMarks`]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* info when no subjects loaded yet */}
        {formData.classId && subjectMarks.length === 0 && (
          <div className="alert alert-info py-2 mb-3" style={{ fontSize: 13 }}>
            {isSeniorClass() && !formData.streamId
              ? 'Please select a stream to configure subject marks.'
              : 'No subjects found for this class. Add subjects first, then configure marks here.'}
          </div>
        )}

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="px-4 py-2 border rounded" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: '#0c3b73' }}
          >
            {loading ? 'Saving...' : modalData ? 'Update' : 'Save'}
          </button>
        </div>

      </form>
    </Modal>
  )
}

export default ExamListsModal
