/* eslint-disable prettier/prettier */
import { Modal } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'

const TeacherAssignedModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    teacherId: '',
    session: '',
    classId: '',
    stream: '',
    sectionId: '',
    subjectId: '',
    isClassTeacher: false,
  })

  const [teachers, setTeachers] = useState([])
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [streams, setStreams] = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [showStream, setShowStream] = useState(false)
  const { currentSession, sessionsList1 } = useContext(SessionContext)
  useEffect(() => {
    if (currentSession?._id) {
      setFormData((prev) => ({
        ...prev,
        session: currentSession._id,
      }))
    }
  }, [currentSession])

  /* ================= LOAD INITIAL DATA ================= */
  useEffect(() => {
    getRequest('teachers?isPagination=false').then((res) =>
      setTeachers(res?.data?.data?.teachers || []),
    )
  }, [])

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession._id}&isPagination=false`).then((res) =>
      setClasses(res?.data?.data?.classes || []),
    )
  }, [currentSession])

  /* ================= CLASS CHANGE ================= */
  useEffect(() => {
    if (!formData.classId) return

    // sections
    getRequest(`sections?classId=${formData.classId}&isPagination=false`).then((res) =>
      setSections(res?.data?.data?.sections || []),
    )

    const selectedClass = classes.find((c) => c._id === formData.classId)
    const classNum = parseInt(selectedClass?.name)

    if (selectedClass?.isSenior) {
      setShowStream(true)

      getRequest(`streams?classId=${formData.classId}&isPagination=false`).then((res) =>
        setStreams(res?.data?.data?.streams || []),
      )
    } else {
      setShowStream(false)
      setStreams([])
      setFormData((prev) => ({ ...prev, stream: '' }))
    }
  }, [formData.classId, classes])

  /* ================= STREAM / SUBJECT ================= */
  useEffect(() => {
    if (!formData.classId) return

    let url = `subjects?classId=${formData.classId}&isPagination=false`
    if (formData.stream) {
      url += `&streamId=${formData.stream}`
    }

    getRequest(url).then((res) => setSubjects(res?.data?.data?.subjects || []))
  }, [formData.classId, formData.stream])
  // console.log(modalData)
  useEffect(() => {
    if (modalData) {
      setFormData((prev) => ({
        ...prev,
        session: modalData.session,
        classId: modalData.classId?._id || '',
        stream: modalData.stream || '',
        sectionId: modalData.sectionId?._id || '',
        subjectId: modalData.subjectId?._id || '',
        isClassTeacher: modalData.isClassTeacher || false,
      }))
    }
  }, [modalData])

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleCancel = () => {
    setFormData({
      teacherId: '',
      session: '',
      classId: '',
      stream: '',
      sectionId: '',
      subjectId: '',
      isClassTeacher: false,
    })
    setIsModalOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    setLoading(true)
    postRequest({
      url: `teachers/${formData.teacherId}/assign-class`,
      cred: {
        session: formData.session,
        stream: formData.stream || '',
        classId: formData.classId,
        sectionId: formData.sectionId,
        subjectId: formData.subjectId,
        isClassTeacher: formData.isClassTeacher,
      },
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Assigned successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setLoading(true)

    putRequest({
      url: `teachers/assigned-class/${modalData._id}`,
      cred: {
        teacherId: modalData.teacherId?._id || modalData.teacherId || '',
        session: formData.session,
        stream: formData.stream || null,
        classId: formData.classId,
        sectionId: formData.sectionId,
        subjectId: formData.subjectId,
        isClassTeacher: formData.isClassTeacher,
      },
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={modalData ? 'Edit Assigned Class' : 'Assign Class Teacher'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit}>
        {/* Session */}
        <select
          className="form-select mb-3"
          name="session"
          value={formData.session}
          onChange={handleChange}
          disabled
        >
          <option value="">Select Session</option>

          {sessionsList1.map((s) => (
            <option key={s._id} value={s._id}>
              {s.sessionName}
            </option>
          ))}
        </select>

        {/* Teacher */}
        <select
          className="form-select mb-3"
          name="teacherId"
          //   value={formData.teacherId}
          onChange={handleChange}
        >
          <option value="">Select Teacher</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>

        {/* Class */}
        <select
          className="form-select mb-3"
          name="classId"
          onChange={handleChange}
          value={formData.classId}
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Stream (Only 9–12) */}
        {showStream && (
          <select
            className="form-select mb-3"
            name="stream"
            value={formData.stream}
            onChange={handleChange}
          >
            <option value="">Select Stream</option>
            {streams.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        {/* Section */}
        <select
          className="form-select mb-3"
          name="sectionId"
          value={formData.sectionId}
          onChange={handleChange}
        >
          <option value="">Select Section</option>
          {sections.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Subject */}
        <select
          className="form-select mb-3"
          name="subjectId"
          value={formData.subjectId}
          onChange={handleChange}
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Class Teacher */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="isClassTeacher"
            checked={formData.isClassTeacher}
            onChange={handleChange}
          />
          <label className="form-check-label">Is Class Teacher</label>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (modalData ? 'Updating...' : 'Saving...') : modalData ? 'Update' : 'Assign'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TeacherAssignedModal
