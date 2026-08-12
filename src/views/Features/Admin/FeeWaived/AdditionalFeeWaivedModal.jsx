/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal, Select } from 'antd'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getRequest, postRequest } from '../../../../Helpers'

const { Option } = Select

const AdditionalFeeWaivedModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  currentSession,
}) => {
  const isEditMode = !!modalData

  /* ── dropdown data ── */
  const [classes,        setClasses]        = useState([])
  const [sections,       setSections]       = useState([])
  const [students,       setStudents]       = useState([])
  const [additionalFees, setAdditionalFees] = useState([])
  const [feesLoading,    setFeesLoading]    = useState(false)

  /* ── ui state ── */
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  /* ── form state — keep classId & studentId separate for clear dependency tracking ── */
  const [selectedClassId,   setSelectedClassId]   = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedFeeId,     setSelectedFeeId]     = useState('')
  const [waivedAmount,      setWaivedAmount]       = useState('')
  const [waiverReason,      setWaiverReason]       = useState('')

  /* ── EDIT mode ── */
  const [editReason, setEditReason] = useState(modalData?.waiverReason || '')

  /* ── reset & close ── */
  const handleCancel = () => {
    setSelectedClassId('');   setSelectedSectionId(''); setSelectedStudentId('')
    setSelectedFeeId('');     setWaivedAmount('');       setWaiverReason('')
    setSections([]);          setStudents([]);           setAdditionalFees([])
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
    if (!selectedClassId) { setSections([]); return }
    getRequest(`sections?isPagination=false&classId=${selectedClassId}`)
      .then((res) => setSections(res?.data?.data?.sections || res?.data?.data || []))
      .catch(() => toast.error('Failed to load sections'))
  }, [selectedClassId])

  /* ── load students when class/section changes ── */
  useEffect(() => {
    if (!selectedClassId || !currentSession?._id) { setStudents([]); return }
    let url = `studentEnrollment?isPagination=false&session=${currentSession._id}&currentClass=${selectedClassId}`
    if (selectedSectionId) url += `&currentSection=${selectedSectionId}`
    getRequest(url)
      .then((res) => setStudents(res?.data?.data?.students || []))
      .catch(() => toast.error('Failed to load students'))
  }, [selectedClassId, selectedSectionId, currentSession])

  /* ── load pending fees — depends on BOTH studentId AND classId ── */
  useEffect(() => {
    if (!selectedStudentId || !currentSession?._id) {
      setAdditionalFees([])
      setSelectedFeeId('')
      setWaivedAmount('')
      return
    }

    setSelectedFeeId('')
    setWaivedAmount('')
    setFeesLoading(true)

    const session = currentSession._id

    // Use selectedClassId directly — no stale closure issue since it's in dependency array
    getRequest(
      `additional-fees/pending-for-student?sessionId=${session}&studentId=${selectedStudentId}&classId=${selectedClassId}`
    )
      .then((res) => {
        const list = res?.data?.data?.list || []
        setAdditionalFees(list)
        if (list.length === 0) {
          toast('No pending additional fees found for this student', { icon: 'ℹ️' })
        }
      })
      .catch(() => {
        // fallback: load all class-level additional fees (no waiver filter)
        getRequest(
          `additional-fees?sessionId=${session}${selectedClassId ? `&classId=${selectedClassId}` : ''}&isPagination=false`
        )
          .then((res2) => {
            const list2 = res2?.data?.data?.list || []
            setAdditionalFees(list2)
            if (list2.length === 0) {
              toast('No additional fees configured for this student', { icon: 'ℹ️' })
            }
          })
          .catch(() => toast.error('Failed to load additional fees'))
      })
      .finally(() => setFeesLoading(false))

  }, [selectedStudentId, selectedClassId, currentSession]) // ← both IDs in deps, no stale closure

  /* ── derived: selected fee object ── */
  const selectedFee = additionalFees.find((f) => String(f._id) === String(selectedFeeId))
  const waivedAmtNum = waivedAmount !== '' ? parseFloat(waivedAmount) : undefined
  const isPartialPreview =
    selectedFee && waivedAmtNum !== undefined &&
    !isNaN(waivedAmtNum) && waivedAmtNum < Number(selectedFee.amount)
  const remainingAfterWaiver =
    selectedFee && waivedAmtNum !== undefined && !isNaN(waivedAmtNum)
      ? Math.max(0, Number(selectedFee.amount) - waivedAmtNum)
      : 0

  /* ── validate ── */
  const validateForm = () => {
    const errs = {}
    if (!selectedClassId)  errs.classId         = 'Class is required'
    if (!selectedStudentId) errs.studentId       = 'Student is required'
    if (!selectedFeeId)    errs.additionalFeeId  = 'Select a fee head to waive'

    if (waivedAmount !== '') {
      const amt = parseFloat(waivedAmount)
      if (isNaN(amt) || amt <= 0) {
        errs.waivedAmount = 'Enter a valid amount greater than 0'
      } else if (selectedFee && amt > Number(selectedFee.amount)) {
        errs.waivedAmount = `Cannot exceed ₹${selectedFee.amount}`
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ── submit ADD ── */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    const waivedAmtFinal = waivedAmount !== '' ? parseFloat(waivedAmount) : undefined

    postRequest({
      url: 'additional-fees/waiver',
      cred: {
        sessionId:       currentSession._id,
        studentId:       selectedStudentId,
        additionalFeeId: selectedFeeId,
        waiverReason:    waiverReason || null,
        ...(waivedAmtFinal !== undefined && { waivedAmount: waivedAmtFinal }),
      },
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Fee waived successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }

  /* ── submit EDIT (reason only) ── */
  const handleEditSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    postRequest({
      url: `additional-fees/waiver/${modalData._id}/reason`,
      cred: { waiverReason: editReason || null },
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
      title={isEditMode ? 'Edit Waiver Reason' : 'Waive Additional Fee'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      destroyOnHidden
      width={520}
    >

      {/* ==================== EDIT MODE ==================== */}
      {isEditMode ? (
        <form onSubmit={handleEditSubmit} noValidate>
          <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700 space-y-1">
            <div><span className="font-medium">Student:</span> {modalData.studentName}</div>
            <div>
              <span className="font-medium">Class:</span> {modalData.className}
              {modalData.sectionName ? ` - ${modalData.sectionName}` : ''}
            </div>
            <div><span className="font-medium">Fee Head:</span> {modalData.feeName}</div>
            <div><span className="font-medium">Period:</span> {modalData.period}</div>
            <div><span className="font-medium">Amount:</span> ₹{modalData.amount}</div>
            <div><span className="font-medium">Waived:</span> ₹{modalData.waivedAmount}</div>
          </div>

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
              value={selectedClassId || undefined}
              onChange={(v) => {
                setSelectedClassId(v || '')
                setSelectedSectionId('')
                setSelectedStudentId('')
                setSelectedFeeId('')
                setWaivedAmount('')
                setSections([])
                setStudents([])
                setAdditionalFees([])
                setErrors({})
              }}
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
              Section <span className="text-gray-400 fw-normal">(optional)</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder={!selectedClassId ? 'Select class first' : 'Select Section (optional)'}
              value={selectedSectionId || undefined}
              onChange={(v) => {
                setSelectedSectionId(v || '')
                setSelectedStudentId('')
                setSelectedFeeId('')
                setWaivedAmount('')
                setStudents([])
                setAdditionalFees([])
              }}
              disabled={!selectedClassId}
              allowClear
              onClear={() => {
                setSelectedSectionId('')
                setSelectedStudentId('')
                setSelectedFeeId('')
                setWaivedAmount('')
                setStudents([])
                setAdditionalFees([])
              }}
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
              placeholder={!selectedClassId ? 'Select class first' : 'Select Student'}
              value={selectedStudentId || undefined}
              showSearch
              optionFilterProp="children"
              onChange={(v) => {
                setSelectedStudentId(v || '')
                setSelectedFeeId('')
                setWaivedAmount('')
                setAdditionalFees([])
                setErrors((p) => ({ ...p, studentId: '' }))
              }}
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
              disabled={!selectedClassId}
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

          {/* FEE HEAD */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Fee Head <span className="text-danger">*</span>
            </label>
            <Select
              style={{ width: '100%' }}
              loading={feesLoading}
              placeholder={
                !selectedStudentId        ? 'Select student first'
                : feesLoading             ? 'Loading fees...'
                : additionalFees.length === 0 ? 'No pending additional fees'
                : 'Select fee to waive'
              }
              value={selectedFeeId || undefined}
              onChange={(v) => {
                setSelectedFeeId(v || '')
                setWaivedAmount('')   // blank = full waiver
                setErrors((p) => ({ ...p, additionalFeeId: '' }))
              }}
              disabled={!selectedStudentId || feesLoading || additionalFees.length === 0}
            >
              {additionalFees.map((f) => (
                <Option key={String(f._id)} value={String(f._id)}>
                  {f.feeName} — ₹{f.amount} &nbsp;({f.period})
                </Option>
              ))}
            </Select>
            {errors.additionalFeeId && (
              <div className="text-danger small mt-1">{errors.additionalFeeId}</div>
            )}
          </div>

          {/* SELECTED FEE PREVIEW */}
          {selectedFee && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700 space-y-1">
              <div><span className="font-medium">Fee Head:</span> {selectedFee.feeName}</div>
              <div><span className="font-medium">Period:</span> {selectedFee.period}</div>
              <div><span className="font-medium">Total Amount:</span> ₹{selectedFee.amount}</div>
              {isPartialPreview && (
                <div className="text-orange-600 font-medium">
                  Remaining after waiver: ₹{remainingAfterWaiver.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* WAIVER AMOUNT */}
          {selectedFee && (
            <div className="mb-3">
              <label className="form-label fw-bold">
                Waiver Amount{' '}
                <span className="text-gray-400 fw-normal text-xs">
                  (leave blank = full waiver of ₹{selectedFee.amount})
                </span>
              </label>
              <input
                type="number"
                className="form-control"
                min="1"
                max={selectedFee.amount}
                step="0.01"
                value={waivedAmount}
                onChange={(e) => {
                  setWaivedAmount(e.target.value)
                  setErrors((p) => ({ ...p, waivedAmount: '' }))
                }}
                placeholder={`Blank = full waiver | Max ₹${selectedFee.amount}`}
              />
              {errors.waivedAmount && (
                <div className="text-danger small mt-1">{errors.waivedAmount}</div>
              )}
            </div>
          )}

          {/* WAIVER REASON */}
          <div className="mb-4">
            <label className="form-label fw-bold">
              Waiver Reason{' '}
              <span className="text-gray-400 fw-normal">(optional)</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={waiverReason}
              onChange={(e) => setWaiverReason(e.target.value)}
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
              disabled={loading || !selectedFeeId}
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

export default AdditionalFeeWaivedModal
