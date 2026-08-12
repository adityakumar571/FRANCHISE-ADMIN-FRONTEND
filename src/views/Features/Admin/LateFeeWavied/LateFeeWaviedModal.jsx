/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getRequest, postRequest } from '../../../../Helpers'

const { Option } = Select

/**
 * LateFeeWaviedModal
 *
 * Two modes:
 *  - ADD  (modalData = null)  → Class → Section → Student → Pending Late Fee → Waive
 *  - EDIT (modalData = item)  → update waiverReason on an already-waived record
 */
const LateFeeWaviedModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  currentSession,
}) => {
  const isEditMode = !!modalData

  /* ── dropdown data ── */
  const [classes,  setClasses]  = useState([])
  const [sections, setSections] = useState([])
  const [students, setStudents] = useState([])
  const [lateFees, setLateFees] = useState([])

  /* ── ui state ── */
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  /* ── ADD mode form ── */
  const [formData, setFormData] = useState({
    classId:      '',
    sectionId:    '',
    studentId:    '',
    lateFeeId:    '',
    waiverReason: '',
    waivedAmount: '',
  })

  /* ── EDIT mode ── */
  const [editReason, setEditReason] = useState(modalData?.waiverReason || '')

  /* ── reset & close ── */
  const handleCancel = () => {
    setFormData({ classId: '', sectionId: '', studentId: '', lateFeeId: '', waiverReason: '', waivedAmount: '' })
    setSections([])
    setStudents([])
    setLateFees([])
    setErrors({})
    if (setModalData) setModalData(null)
    setIsModalOpen(false)
  }

  /* ── load classes ── */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => toast.error('Failed to load classes'))
  }, [currentSession])

  /* ── load sections when class changes ── */
  useEffect(() => {
    if (!formData.classId) { setSections([]); return }
    getRequest(`sections?isPagination=false&classId=${formData.classId}`)
      .then((res) => setSections(res?.data?.data?.sections || res?.data?.data || []))
      .catch(() => toast.error('Failed to load sections'))
  }, [formData.classId])

  /* ── load students when class or section changes ── */
  useEffect(() => {
    if (!formData.classId || !currentSession?._id) { setStudents([]); return }
    let url = `studentEnrollment?isPagination=false&session=${currentSession._id}&currentClass=${formData.classId}`
    if (formData.sectionId) url += `&currentSection=${formData.sectionId}`
    getRequest(url)
      .then((res) => setStudents(res?.data?.data?.students || []))
      .catch(() => toast.error('Failed to load students'))
  }, [formData.classId, formData.sectionId, currentSession])

  /* ── load pending late fees when student changes ── */
  useEffect(() => {
    if (!formData.studentId || !currentSession?._id) { setLateFees([]); return }
    setFormData((prev) => ({ ...prev, lateFeeId: '' }))
    getRequest(
      `late-fee/late-fee?sessionId=${currentSession._id}&studentId=${formData.studentId}&isWaived=false&limit=100`,
    )
      .then((res) => {
        const list = res?.data?.data?.list || []
        setLateFees(list)
        if (list.length === 0) toast('No pending late fees for this student', { icon: 'ℹ️' })
      })
      .catch(() => toast.error('Failed to load late fees'))
  }, [formData.studentId])

  /* ── handle field change ── */
  const handleChange = (name, value) => {
    if (name === 'classId') {
      setFormData({ classId: value || '', sectionId: '', studentId: '', lateFeeId: '', waiverReason: formData.waiverReason, waivedAmount: '' })
      setSections([])
      setStudents([])
      setLateFees([])
      setErrors((p) => ({ ...p, classId: '' }))
      return
    }
    if (name === 'sectionId') {
      setFormData((prev) => ({ ...prev, sectionId: value || '', studentId: '', lateFeeId: '' }))
      setStudents([])
      setLateFees([])
      return
    }
    if (name === 'studentId') {
      setFormData((prev) => ({ ...prev, studentId: value || '', lateFeeId: '' }))
      setLateFees([])
      setErrors((p) => ({ ...p, studentId: '' }))
      return
    }
    if (name === 'lateFeeId') {
      const selected = lateFees.find((lf) => lf._id === value)
      setFormData((prev) => ({
        ...prev,
        lateFeeId:    value,
        waivedAmount: selected ? String(selected.amount) : '',
      }))
      setErrors((p) => ({ ...p, lateFeeId: '' }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* ── derived values ── */
  const selectedLateFee    = lateFees.find((lf) => lf._id === formData.lateFeeId)
  const rawAmt             = String(formData.waivedAmount ?? '').trim()
  const waivedAmtNum       = rawAmt !== '' ? parseFloat(rawAmt) : undefined
  const isPartialPreview   = selectedLateFee && waivedAmtNum !== undefined
                               && !isNaN(waivedAmtNum) && waivedAmtNum > 0
                               && waivedAmtNum < Number(selectedLateFee.amount)
  const remainingAfterWaiver = selectedLateFee && waivedAmtNum !== undefined && !isNaN(waivedAmtNum) && waivedAmtNum > 0
    ? Math.max(0, Number(selectedLateFee.amount) - waivedAmtNum)
    : 0

  /* ── validate ── */
  const validateForm = () => {
    const newErrors = {}
    if (!formData.classId)   newErrors.classId   = 'Class is required'
    if (!formData.studentId) newErrors.studentId = 'Student is required'
    if (!formData.lateFeeId) newErrors.lateFeeId = 'Select a late fee to waive'

    const amt = String(formData.waivedAmount ?? '').trim()
    if (amt !== '') {
      const n = parseFloat(amt)
      if (isNaN(n) || n <= 0) {
        newErrors.waivedAmount = 'Enter a valid amount greater than 0'
      } else {
        const fee = lateFees.find((lf) => lf._id === formData.lateFeeId)
        if (fee && n > Number(fee.amount)) {
          newErrors.waivedAmount = `Cannot exceed ₹${fee.amount}`
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ── submit ADD ── */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    const waivedFinal  = rawAmt !== '' ? parseFloat(rawAmt) : undefined
    const isPartial    = selectedLateFee && waivedFinal !== undefined
                           && !isNaN(waivedFinal) && waivedFinal < Number(selectedLateFee.amount)

    postRequest({
      url: 'late-fee/late-fee-waive',
      cred: {
        lateFeeId:    formData.lateFeeId,
        waiverReason: formData.waiverReason || null,
        ...(waivedFinal !== undefined && { waivedAmount: waivedFinal }),
      },
    })
      .then((res) => {
        toast.success(res?.data?.message || (isPartial ? 'Partial waiver applied successfully' : 'Late fee waived successfully'))
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }

  /* ── submit EDIT ── */
  const handleEditSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    postRequest({
      url: 'late-fee/late-fee-waive',
      cred: { lateFeeId: modalData._id, waiverReason: editReason || null },
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Waiver reason updated')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={isEditMode ? 'Edit Waiver Reason' : 'Waive Late Fee'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      destroyOnClose
    >
      {/* ==================== EDIT MODE ==================== */}
      {isEditMode ? (
        <form onSubmit={handleEditSubmit} noValidate>

          {/* Info summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700 space-y-1">
            <div><span className="font-medium">Student:</span> {modalData.studentName}</div>
            <div>
              <span className="font-medium">Class:</span> {modalData.className}
              {modalData.sectionName ? ` - ${modalData.sectionName}` : ''}
            </div>
            <div><span className="font-medium">Period:</span> {modalData.period}</div>
            <div><span className="font-medium">Amount:</span> ₹{modalData.amount}</div>
            <div><span className="font-medium">Waived:</span> ₹{modalData.waivedAmount ?? 0}</div>
          </div>

          {/* Waiver Reason */}
          <div className="mb-4">
            <label className="form-label fw-bold">Waiver Reason</label>
            <input
              type="text"
              className="form-control"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Enter reason (optional)"
            />
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border rounded text-white"
              style={{ backgroundColor: '#0c3b73' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>

      ) : (
        /* ==================== ADD MODE ==================== */
        <form onSubmit={handleSubmit} noValidate>

          {/* CLASS */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Class <span className="text-danger">*</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Class"
              value={formData.classId || undefined}
              onChange={(v) => handleChange('classId', v)}
              allowClear
              onClear={() => handleChange('classId', '')}
            >
              {classes.map((cls) => (
                <Option key={cls._id} value={cls._id}>{cls.name}</Option>
              ))}
            </Select>
            {errors.classId && <div className="text-danger small mt-1">{errors.classId}</div>}
          </div>

          {/* SECTION */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Section <span className="text-muted fw-normal">(optional)</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder={!formData.classId ? 'Select class first' : 'Select Section (optional)'}
              value={formData.sectionId || undefined}
              onChange={(v) => handleChange('sectionId', v)}
              disabled={!formData.classId}
              allowClear
              onClear={() => handleChange('sectionId', '')}
            >
              {sections.map((s) => (
                <Option key={s._id} value={s._id}>{s.name}</Option>
              ))}
            </Select>
          </div>

          {/* STUDENT */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Student <span className="text-danger">*</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder={!formData.classId ? 'Select class first' : 'Select Student'}
              value={formData.studentId || undefined}
              showSearch
              optionFilterProp="children"
              onChange={(v) => handleChange('studentId', v)}
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
              disabled={!formData.classId}
            >
              {students.map((s) => (
                <Option key={s._id} value={s._id}>
                  ({s.studentId}){' '}
                  {[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}{' '}
                  {s.gender?.toLowerCase() === 'male' ? 'S/O' : 'D/O'} {s.fatherName}
                </Option>
              ))}
            </Select>
            {errors.studentId && <div className="text-danger small mt-1">{errors.studentId}</div>}
          </div>

          {/* PENDING LATE FEE */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Pending Late Fee <span className="text-danger">*</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder={
                !formData.studentId     ? 'Select student first'
                : lateFees.length === 0 ? 'No pending late fees'
                : 'Select late fee to waive'
              }
              value={formData.lateFeeId || undefined}
              onChange={(v) => handleChange('lateFeeId', v)}
              disabled={!formData.studentId || lateFees.length === 0}
            >
              {lateFees.map((lf) => (
                <Option key={lf._id} value={lf._id}>
                  {lf.period} — ₹{lf.amount} ({lf.referenceType})
                </Option>
              ))}
            </Select>
            {errors.lateFeeId && <div className="text-danger small mt-1">{errors.lateFeeId}</div>}
          </div>

          {/* SELECTED LATE FEE PREVIEW */}
          {selectedLateFee && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700 space-y-1">
              <div><span className="font-medium">Period:</span> {selectedLateFee.period}</div>
              <div><span className="font-medium">Total Amount:</span> ₹{selectedLateFee.amount}</div>
              <div><span className="font-medium">Type:</span> {selectedLateFee.referenceType}</div>
              {isPartialPreview && (
                <div className="font-medium" style={{ color: '#0c3b73' }}>
                  Remaining after waiver: ₹{remainingAfterWaiver.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* WAIVER AMOUNT */}
          {selectedLateFee && (
            <div className="mb-3">
              <label className="form-label fw-bold">
                Waiver Amount{' '}
                <span className="text-muted fw-normal" style={{ fontSize: '0.8rem' }}>
                  (leave blank = full waiver of ₹{selectedLateFee.amount})
                </span>
              </label>
              <input
                type="number"
                className={`form-control ${errors.waivedAmount ? 'is-invalid' : ''}`}
                min="1"
                max={selectedLateFee.amount}
                step="0.01"
                value={formData.waivedAmount}
                onChange={(e) => handleChange('waivedAmount', e.target.value)}
                placeholder={`Blank = full waiver | Max ₹${selectedLateFee.amount}`}
              />
              {errors.waivedAmount && (
                <div className="invalid-feedback">{errors.waivedAmount}</div>
              )}
            </div>
          )}

          {/* WAIVER REASON */}
          <div className="mb-4">
            <label className="form-label fw-bold">
              Waiver Reason{' '}
              <span className="text-muted fw-normal">(optional)</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.waiverReason}
              onChange={(e) => handleChange('waiverReason', e.target.value)}
              placeholder="e.g. Financial hardship, scholarship, school concession..."
            />
          </div>

          {/* BUTTONS */}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border rounded text-white"
              style={{ backgroundColor: '#0c3b73' }}
              disabled={loading || !formData.lateFeeId}
            >
              {loading
                ? 'Waiving...'
                : isPartialPreview
                  ? 'Partial Waive'
                  : 'Waive Fee'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default LateFeeWaviedModal
