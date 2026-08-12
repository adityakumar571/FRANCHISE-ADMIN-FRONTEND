/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Edit, Trash2, Plus, AlertTriangle, Filter, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Empty, Pagination, Select, Modal, Input } from 'antd'
import Loader from '../../../../components/Loading/Loader'
import { SessionContext } from '../../../../Context/Seesion'
import LateFeeWaviedModal from './LateFeeWaviedModal'
import { postRequest, getRequest } from '../../../../Helpers'

const { Option } = Select

const INSTALLMENT_PERIODS = {
  MONTHLY: [
    'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER',
    'OCTOBER', 'NOVEMBER', 'DECEMBER', 'JANUARY', 'FEBRUARY', 'MARCH',
  ],
  QUARTERLY: ['APR-JUN', 'JUL-SEP', 'OCT-DEC', 'JAN-MAR'],
  CUSTOM_10: [
    'APRIL', 'MAY-JUNE', 'JULY', 'AUGUST', 'SEPTEMBER',
    'OCTOBER', 'NOVEMBER', 'DECEMBER', 'JANUARY', 'FEB-MARCH',
  ],
}

const LateFeeWavied = () => {
  const { currentSession } = useContext(SessionContext)

  /* ── table state ── */
  const [data, setData]               = useState([])
  const [loading, setLoading]         = useState(false)
  const [page, setPage]               = useState(1)
  const [limit, setLimit]             = useState(10)
  const [total, setTotal]             = useState(0)

  /* ── modal state ── */
  const [isModalOpen, setIsModalOpen]     = useState(false)
  const [updateStatus, setUpdateStatus]   = useState(false)
  const [modalData, setModalData]         = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem]   = useState(null)

  /* ── bulk waive state ── */
  const [showBulkModal, setShowBulkModal]   = useState(false)
  const [bulkLoading, setBulkLoading]       = useState(false)
  const [bulkSections, setBulkSections]     = useState([])
  const [bulkForm, setBulkForm] = useState({
    classId:      null,
    sectionId:    null,
    period:       null,
    waiverReason: '',
    waivedAmount: '',
  })
  const [bulkPreview, setBulkPreview]       = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  /* ── installment type (for period list) ── */
  const [activeInstallmentType, setActiveInstallmentType] = useState(null)

  useEffect(() => {
    getRequest('installment-type/active?isActive=true')
      .then((res) => {
        const types = res?.data?.data || []
        if (types.length > 0) setActiveInstallmentType(types[0])
      })
      .catch(() => {})
  }, [])

  const getPeriodsByInstallment = () => {
    if (!activeInstallmentType) return []
    const typeName = activeInstallmentType.name?.toUpperCase()
    return INSTALLMENT_PERIODS[typeName] || []
  }

  /* ── filter data ── */
  const [classes, setClasses]     = useState([])
  const [sections, setSections]   = useState([])
  const [students, setStudents]   = useState([])

  /* ── draft filters (not yet applied) ── */
  const [draft, setDraft] = useState({
    classId:   null,
    sectionId: null,
    studentId: null,
    period:    null,
  })

  /* ── applied filters (trigger fetch) ── */
  const [applied, setApplied] = useState({
    sessionId: null,
    classId:   null,
    sectionId: null,
    studentId: null,
    period:    null,
  })

  const [isApplied, setIsApplied] = useState(false)

  /* ── set sessionId when session loads ── */
  useEffect(() => {
    if (!currentSession?._id) return
    setApplied((p) => ({ ...p, sessionId: currentSession._id }))
  }, [currentSession])

  /* ── load classes ── */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => toast.error('Failed to load classes'))
  }, [currentSession])

  /* ── load sections when class changes ── */
  useEffect(() => {
    if (!draft.classId) {
      setSections([])
      setStudents([])
      setDraft((p) => ({ ...p, sectionId: null, studentId: null }))
      return
    }
    getRequest(`sections?isPagination=false&classId=${draft.classId}`)
      .then((res) => setSections(res?.data?.data?.sections || res?.data?.data || []))
      .catch(() => toast.error('Failed to load sections'))
    // reset downstream
    setStudents([])
    setDraft((p) => ({ ...p, sectionId: null, studentId: null }))
  }, [draft.classId])

  /* ── load students when class or section changes ── */
  useEffect(() => {
    if (!currentSession?._id || !draft.classId) return

    let url = `studentEnrollment?isPagination=false&session=${currentSession._id}&currentClass=${draft.classId}`
    if (draft.sectionId) url += `&currentSection=${draft.sectionId}`

    getRequest(url)
      .then((res) => setStudents(res?.data?.data?.students || []))
      .catch(() => toast.error('Failed to load students'))

    setDraft((p) => ({ ...p, studentId: null }))
  }, [draft.classId, draft.sectionId, currentSession])

  /* ── fetch waived records ── */
  useEffect(() => {
    if (!applied.sessionId) return

    setLoading(true)

    const params = {
      sessionId: applied.sessionId,
      isWaived:  true,
      ...(applied.classId   && { classId:   applied.classId   }),
      ...(applied.sectionId && { sectionId: applied.sectionId }),
      ...(applied.studentId && { studentId: applied.studentId }),
      ...(applied.period    && { period:    applied.period    }),
      page,
      limit,
    }

    const query = new URLSearchParams(params).toString()

    getRequest(`late-fee/late-fee?${query}`)
      .then((res) => {
        const response = res?.data?.data
        setData(response?.list || [])
        setTotal(response?.pagination?.totalRows || 0)
      })
      .catch(() => toast.error('Failed to fetch records'))
      .finally(() => setLoading(false))
  }, [applied, page, limit, updateStatus])

  /* ── filter handlers ── */
  const handleApply = () => {
    setIsApplied(true)
    setPage(1)
    setApplied({
      sessionId: currentSession?._id || null,
      classId:   draft.classId,
      sectionId: draft.sectionId,
      studentId: draft.studentId,
      period:    draft.period,
    })
  }

  const handleClear = () => {
    setIsApplied(false)
    setDraft({ classId: null, sectionId: null, studentId: null, period: null })
    setSections([])
    setStudents([])
    setPage(1)
    setApplied({
      sessionId: currentSession?._id || null,
      classId:   null,
      sectionId: null,
      studentId: null,
      period:    null,
    })
  }

  /* ── unwaive ── */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    postRequest({ url: 'late-fee/late-fee-unwaive', cred: { lateFeeId: selectedItem._id } })
      .then((res) => {
        toast.success(res?.data?.message || 'Waiver reversed successfully')
        setShowDeleteModal(false)
        setSelectedItem(null)
        setUpdateStatus((prev) => !prev)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to reverse waiver'))
      .finally(() => setLoading(false))
  }

  /* ── bulk waive helpers ── */
  const openBulkModal = () => {
    setBulkForm({ classId: null, sectionId: null, period: null, waiverReason: '', waivedAmount: '' })
    setBulkPreview(null)
    setBulkSections([])
    setShowBulkModal(true)
  }

  const closeBulkModal = () => {
    setShowBulkModal(false)
    setBulkForm({ classId: null, sectionId: null, period: null, waiverReason: '', waivedAmount: '' })
    setBulkPreview(null)
  }

  // Load sections when bulk class changes
  useEffect(() => {
    if (!bulkForm.classId) { setBulkSections([]); setBulkForm((p) => ({ ...p, sectionId: null })); return }
    getRequest(`sections?isPagination=false&classId=${bulkForm.classId}`)
      .then((res) => setBulkSections(res?.data?.data?.sections || res?.data?.data || []))
      .catch(() => {})
  }, [bulkForm.classId])

  // Load preview count when class/section/period changes
  useEffect(() => {
    if (!currentSession?._id || !bulkForm.classId) { setBulkPreview(null); return }
    setPreviewLoading(true)
    const params = {
      sessionId: currentSession._id,
      classId:   bulkForm.classId,
      isWaived:  false,
      isPaid:    false,   // exclude already-paid records from preview
      limit:     1000,
      ...(bulkForm.sectionId && { sectionId: bulkForm.sectionId }),
      ...(bulkForm.period    && { period:    bulkForm.period    }),
    }
    getRequest(`late-fee/late-fee?${new URLSearchParams(params)}`)
      .then((res) => {
        const list = res?.data?.data?.list || []
        // frontend side bhi filter: exclude records where paidAmount >= amount
        const waivable = list.filter((l) => Number(l.paidAmount || 0) < Number(l.amount || 0))
        const total    = waivable.length
        const totalAmt = waivable.reduce((s, i) => s + Math.max(0, Number(i.amount || 0) - Number(i.paidAmount || 0)), 0)
        const maxAmount = waivable.length > 0 ? Math.max(...waivable.map((l) => Number(l.amount || 0))) : 0
        setBulkPreview({ count: total, totalAmount: totalAmt, maxAmount, ids: waivable.map((l) => l._id) })
      })
      .catch(() => setBulkPreview(null))
      .finally(() => setPreviewLoading(false))
  }, [bulkForm.classId, bulkForm.sectionId, bulkForm.period, currentSession])

  const handleBulkWaive = () => {
    if (!bulkForm.classId) { toast.error('Please select a class'); return }
    if (!bulkPreview?.count) { toast.error('No pending late fees found for selected filters'); return }

    // Validate waivedAmount if entered
    const rawAmt = String(bulkForm.waivedAmount ?? '').trim()
    if (rawAmt !== '') {
      const amt = parseFloat(rawAmt)
      if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid waiver amount greater than 0'); return }
      if (bulkPreview.maxAmount && amt > bulkPreview.maxAmount) {
        toast.error(`Waiver amount cannot exceed ₹${bulkPreview.maxAmount} (max late fee amount)`); return
      }
    }

    setBulkLoading(true)
    const waivedAmtNum = rawAmt !== '' ? parseFloat(rawAmt) : undefined
    postRequest({
      url: 'late-fee/late-fee-waive-bulk',
      cred: {
        sessionId:    currentSession._id,
        classId:      bulkForm.classId,
        ...(bulkForm.sectionId  && { sectionId:    bulkForm.sectionId }),
        ...(bulkForm.period     && { period:        bulkForm.period    }),
        ...(waivedAmtNum !== undefined && { waivedAmount: waivedAmtNum }),
        waiverReason: bulkForm.waiverReason || null,
      },
    })
      .then((res) => {
        const modified = res?.data?.data?.modified || 0
        const skipped  = res?.data?.data?.skipped  || 0
        const msg = res?.data?.message || `${modified} late fees waived successfully`
        toast.success(skipped > 0 ? `${msg} (${skipped} skipped — already paid)` : msg)
        setUpdateStatus((prev) => !prev)
        closeBulkModal()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Bulk waive failed'))
      .finally(() => setBulkLoading(false))
  }

  const handleEdit   = (item) => { setModalData(item); setIsModalOpen(true) }
  const handleAddNew = ()     => { setModalData(null);  setIsModalOpen(true) }

  return (
    <div className="min-h-screen">

      {/* ── UNWAIVE CONFIRM ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded shadow-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Reverse Waiver</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reverse the waiver for{' '}
              <strong>{selectedItem?.studentName}</strong>? The late fee will become due again.
            </p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 border rounded" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className={`px-5 py-2 text-white rounded ${loading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {loading ? 'Reversing...' : 'Reverse Waiver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="px-4 py-3 bg-white rounded-lg border border-blue-100 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Users className="text-[#e24028]" size={22} />
            Late Fee Waived
          </h1>
          <p className="text-sm text-gray-500">Manage waived late fee records</p>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-[#0c3b73] hover:bg-blue-900 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
            onClick={openBulkModal}
          >
            <Users size={16} /> Bulk Waive Class
          </button>
          <button
            className="bg-[#0c3b73] hover:bg-blue-900 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
            onClick={handleAddNew}
          >
            <Plus size={16} /> Add Record
          </button>
        </div>
      </div>

      {/* ── BULK WAIVE MODAL ── */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: '#0c3b73' }} />
            <span>Bulk Waive — Class Late Fees</span>
          </div>
        }
        open={showBulkModal}
        onCancel={closeBulkModal}
        footer={null}
        width={520}
      >
        <div className="space-y-4 py-2">

          {/* CLASS */}
          <div>
            <label className="form-label fw-bold">Class <span className="text-danger">*</span></label>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Class"
              value={bulkForm.classId || undefined}
              onChange={(v) => setBulkForm((p) => ({ ...p, classId: v || null, sectionId: null }))}
              allowClear
            >
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>

          {/* SECTION */}
          <div>
            <label className="form-label fw-bold">
              Section <span className="text-gray-400 fw-normal text-sm">(optional — leave blank for all sections)</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder={!bulkForm.classId ? 'Select class first' : 'All sections (optional)'}
              value={bulkForm.sectionId || undefined}
              onChange={(v) => setBulkForm((p) => ({ ...p, sectionId: v || null }))}
              disabled={!bulkForm.classId}
              allowClear
            >
              {bulkSections.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
            </Select>
          </div>

          {/* PERIOD */}
          <div>
            <label className="form-label fw-bold">
              Period <span className="text-gray-400 fw-normal text-sm">(optional — leave blank for all periods)</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="All periods (optional)"
              value={bulkForm.period || undefined}
              onChange={(v) => setBulkForm((p) => ({ ...p, period: v || null }))}
              allowClear
            >
              {getPeriodsByInstallment().map((p) => <Option key={p} value={p}>{p}</Option>)}
            </Select>
          </div>

          {/* WAIVER AMOUNT PER STUDENT */}
          <div>
            <label className="form-label fw-bold">
              Waiver Amount <span className="text-gray-400 fw-normal text-sm">(per student — leave blank for full waiver)</span>
            </label>
            <Input
              type="number"
              min={1}
              step={0.01}
              value={bulkForm.waivedAmount}
              onChange={(e) => setBulkForm((p) => ({ ...p, waivedAmount: e.target.value }))}
              placeholder={
                bulkPreview?.maxAmount
                  ? `e.g. 50 — max ₹${bulkPreview.maxAmount} per record`
                  : 'e.g. 50 — blank = full waiver'
              }
              suffix={
                bulkPreview?.maxAmount
                  ? <span className="text-xs text-gray-400">max ₹{bulkPreview.maxAmount}</span>
                  : null
              }
            />
            {/* live hint */}
            {bulkForm.waivedAmount && !isNaN(parseFloat(bulkForm.waivedAmount)) && parseFloat(bulkForm.waivedAmount) > 0 && bulkPreview?.count > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Total waived = ₹{bulkForm.waivedAmount} × {bulkPreview.count} records
                {' '}= <strong>₹{(parseFloat(bulkForm.waivedAmount) * bulkPreview.count).toLocaleString('en-IN')}</strong>
              </p>
            )}
          </div>

          {/* WAIVER REASON */}
          <div>
            <label className="form-label fw-bold">
              Waiver Reason <span className="text-gray-400 fw-normal text-sm">(optional)</span>
            </label>
            <Input
              value={bulkForm.waiverReason}
              onChange={(e) => setBulkForm((p) => ({ ...p, waiverReason: e.target.value }))}
              placeholder="e.g. Annual concession, exam fee waiver..."
            />
          </div>

          {/* PREVIEW */}
          <div className="rounded-lg border p-3 bg-gray-50 text-sm">
            {previewLoading ? (
              <p className="text-gray-500 text-center">Loading preview...</p>
            ) : bulkPreview ? (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Waivable records (unpaid):</span>
                  <span className="font-semibold text-gray-800">{bulkPreview.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total amount to waive:</span>
                  <span className="font-semibold" style={{ color: '#0c3b73' }}>
                    ₹{Number(bulkPreview.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                {bulkPreview.count === 0 && (
                  <p className="text-red-500 text-xs mt-1">No waivable late fees found. All records may already be paid or waived.</p>
                )}
                <p className="text-xs text-gray-400 mt-1 border-t pt-1">
                  Already-paid records are automatically excluded from this count.
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-center">Select a class to see preview</p>
            )}
          </div>

          {/* CONFIRM WARNING */}
          {bulkPreview?.count > 0 && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              <AlertTriangle size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-blue-700">
                {bulkForm.waivedAmount && !isNaN(parseFloat(bulkForm.waivedAmount)) && parseFloat(bulkForm.waivedAmount) > 0 ? (
                  <>
                    This will partially waive <strong>₹{bulkForm.waivedAmount}</strong> from each of{' '}
                    <strong>{bulkPreview.count}</strong> unpaid records
                    {' '}(total ₹{(parseFloat(bulkForm.waivedAmount) * bulkPreview.count).toLocaleString('en-IN')} waived).
                  </>
                ) : (
                  <>
                    This will <strong>fully waive</strong> <strong>{bulkPreview.count}</strong> unpaid late fee records
                    totalling <strong>₹{Number(bulkPreview.totalAmount).toLocaleString('en-IN')}</strong>.
                  </>
                )}
                {' '}Already-paid records are excluded and will not be affected.
              </p>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-1">
            <Button onClick={closeBulkModal}>Cancel</Button>
            <Button
              loading={bulkLoading}
              disabled={bulkLoading || !bulkPreview?.count}
              className="text-white border-0"
              style={{ backgroundColor: '#0c3b73' }}
              onClick={handleBulkWaive}
            >
              {bulkLoading ? 'Waiving...' : `Waive ${bulkPreview?.count || 0} Records`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── FILTERS ── */}
      <div className="bg-white rounded-lg border border-blue-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>

        <div className="flex flex-wrap gap-4 items-end">

          {/* CLASS */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Class</label>
            <Select
              allowClear
              placeholder="Select Class"
              value={draft.classId}
              className="w-[180px]"
              onChange={(v) => setDraft((p) => ({ ...p, classId: v ?? null }))}
            >
              {classes.map((c) => (
                <Option key={c._id} value={c._id}>{c.name}</Option>
              ))}
            </Select>
          </div>

          {/* SECTION */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Section</label>
            <Select
              allowClear
              placeholder="Select Section"
              value={draft.sectionId}
              className="w-[160px]"
              disabled={!draft.classId}
              onChange={(v) => setDraft((p) => ({ ...p, sectionId: v ?? null, studentId: null }))}
            >
              {sections.map((s) => (
                <Option key={s._id} value={s._id}>{s.name}</Option>
              ))}
            </Select>
          </div>

          {/* STUDENT */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Student</label>
            <Select
              allowClear
              showSearch
              placeholder="Select Student"
              value={draft.studentId}
              className="w-[220px]"
              disabled={!draft.classId}
              onChange={(v) => setDraft((p) => ({ ...p, studentId: v ?? null }))}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {students.map((s) => (
                <Option key={s._id} value={s._id}>
                  {`${s.firstName || ''} ${s.lastName || ''}`.trim()}
                </Option>
              ))}
            </Select>
          </div>

          {/* PERIOD */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Period</label>
            <Select
              allowClear
              placeholder="Select Period"
              value={draft.period}
              className="w-[160px]"
              onChange={(v) => setDraft((p) => ({ ...p, period: v ?? null }))}
            >
              {getPeriodsByInstallment().map((p) => (
                <Option key={p} value={p}>{p}</Option>
              ))}
            </Select>
          </div>

          {/* APPLY */}
          <div className="flex flex-col">
            <label className="text-xs opacity-0 mb-1">x</label>
            <button
              disabled={loading}
              onClick={handleApply}
              className="px-4 py-1.5 rounded-md text-sm font-semibold text-white bg-[#0c3b73] hover:bg-blue-900 disabled:opacity-60"
            >
              Apply
            </button>
          </div>

          {/* CLEAR */}
          {isApplied && (
            <div className="flex flex-col">
              <label className="text-xs opacity-0 mb-1">x</label>
              <button
                onClick={handleClear}
                className="px-4 py-1.5 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="overflow-x-auto border border-blue-100 rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <Loader />
          </div>
        ) : (
          <table className="border-collapse w-full min-w-max">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 70 }}>Sr No</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 150 }}>Student</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 140 }}>Father</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Class</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Phone</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>Type</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 110 }}>Period</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 100 }}>Late Fee</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 100 }}>Waived</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 100 }}>Status</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 160 }}>Waiver Reason</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 110 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-10">
                    <Empty />
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-center bg-white">{(page - 1) * limit + index + 1}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white">{item.studentName}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white">{item.fatherName || '-'}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white">
                      {item.className || '-'}{item.sectionName ? ` - ${item.sectionName}` : ''}
                    </td>
                    <td className="px-3 py-2 text-sm text-center bg-white">{item.phone || '-'}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white">{item.referenceType}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white">{item.period}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white font-medium">₹{item.amount ?? '-'}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white font-medium text-[#0c3b73]">
                      ₹{item.waivedAmount ?? 0}
                    </td>
                    <td className="px-3 py-2 text-sm text-center bg-white">
                      {(item.isWaived || Number(item.waivedAmount) >= Number(item.amount)) ? (
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">Full</span>
                      ) : (
                        <span className="bg-[#0c3b73]/10 text-[#0c3b73] text-xs font-medium px-2 py-1 rounded-full">Partial</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-center bg-white text-gray-500 text-xs">
                      {item.waiverReason || '-'}
                    </td>
                    <td className="px-3 py-2 text-center bg-white">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                          title="Edit waiver reason"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedItem(item); setShowDeleteModal(true) }}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
                          title="Reverse waiver"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ── PAGINATION ── */}
        {!loading && (
          <div className="mt-4 pb-4 flex justify-end px-4">
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              onChange={(p) => setPage(p)}
              showSizeChanger
              pageSizeOptions={['5', '10', '20', '50']}
              onShowSizeChange={(_, size) => { setLimit(size); setPage(1) }}
            />
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <LateFeeWaviedModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalData={modalData}
          setModalData={setModalData}
          setUpdateStatus={setUpdateStatus}
          currentSession={currentSession}
        />
      )}
    </div>
  )
}

export default LateFeeWavied
