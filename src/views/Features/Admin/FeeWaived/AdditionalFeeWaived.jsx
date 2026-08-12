/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Edit, Trash2, Plus, AlertTriangle, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { Empty, Pagination, Select } from 'antd'
import Loader from '../../../../components/Loading/Loader'
import { SessionContext } from '../../../../Context/Seesion'
import AdditionalFeeWaivedModal from './AdditionalFeeWaivedModal'
import { getRequest, postRequest } from '../../../../Helpers'

const { Option } = Select

/**
 * AdditionalFeeWaived
 *
 * Yahan admin kisi bhi student ki additional fee (Diary Fee, Admission Fee,
 * Examination Fee, etc.) head-wise maaf kar sakta hai.
 *
 * API flow:
 *   GET  additional-fees/waiver?sessionId=...&classId=...&studentId=...
 *   POST additional-fees/waiver         { studentId, additionalFeeId, waivedAmount, waiverReason }
 *   POST additional-fees/waiver/unwaive { waiverId }
 */
const AdditionalFeeWaived = () => {
  const { currentSession } = useContext(SessionContext)

  /* ── table state ── */
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  /* ── modal state ── */
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  /* ── filter data ── */
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [students, setStudents] = useState([])
  const [feeHeads, setFeeHeads] = useState([])

  /* ── draft filters ── */
  const [draft, setDraft] = useState({
    classId: null,
    sectionId: null,
    studentId: null,
    feeName: null,
  })

  /* ── applied filters ── */
  const [applied, setApplied] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
    studentId: null,
    feeName: null,
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

  /* ── load fee heads ── */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`additional-fees?sessionId=${currentSession._id}&isPagination=false`)
      .then((res) => {
        const list = res?.data?.data?.list || []
        // unique fee names
        const unique = [...new Map(list.map((f) => [f.feeName, f])).values()]
        setFeeHeads(unique)
      })
      .catch(() => toast.error('Failed to load fee heads'))
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
    setStudents([])
    setDraft((p) => ({ ...p, sectionId: null, studentId: null }))
  }, [draft.classId])

  /* ── load students when class / section changes ── */
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
      page,
      limit,
      ...(applied.classId   && { classId:   applied.classId   }),
      ...(applied.sectionId && { sectionId: applied.sectionId }),
      ...(applied.studentId && { studentId: applied.studentId }),
      ...(applied.feeName   && { feeName:   applied.feeName   }),
    }

    const query = new URLSearchParams(params).toString()

    getRequest(`additional-fees/waiver?${query}`)
      .then((res) => {
        const response = res?.data?.data
        setData(response?.list || [])
        setTotal(response?.pagination?.totalRows || 0)
      })
      .catch(() => {
        setData([])
        setTotal(0)
        toast.error('Failed to fetch waiver records')
      })
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
      feeName:   draft.feeName,
    })
  }

  const handleClear = () => {
    setIsApplied(false)
    setDraft({ classId: null, sectionId: null, studentId: null, feeName: null })
    setSections([])
    setStudents([])
    setPage(1)
    setApplied({
      sessionId: currentSession?._id || null,
      classId:   null,
      sectionId: null,
      studentId: null,
      feeName:   null,
    })
  }

  /* ── unwaive ── */
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    setLoading(true)
    postRequest({ url: 'additional-fees/waiver/unwaive', cred: { waiverId: selectedItem._id } })
      .then((res) => {
        toast.success(res?.data?.message || 'Waiver reversed successfully')
        setShowDeleteModal(false)
        setSelectedItem(null)
        setUpdateStatus((prev) => !prev)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to reverse waiver'))
      .finally(() => setLoading(false))
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
              <strong>{selectedItem?.studentName}</strong> —{' '}
              <strong>{selectedItem?.feeName}</strong>?
              The fee will become due again.
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
            <Edit className="text-[#e24028]" size={22} />
            Additional Fee Waived
          </h1>
          <p className="text-sm text-gray-500">
            Waive additional fees head-wise — Diary Fee, Admission Fee, Examination Fee, etc.
          </p>
        </div>
        <button
          className="bg-[#0c3b73] hover:bg-blue-900 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
          onClick={handleAddNew}
        >
          <Plus size={16} /> Add Waiver
        </button>
      </div>

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

          {/* FEE NAME */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Fee Name</label>
            <Select
              allowClear
              showSearch
              placeholder="Select Fee Head"
              value={draft.feeName}
              className="w-[200px]"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(v) => setDraft((p) => ({ ...p, feeName: v ?? null }))}
            >
              {feeHeads.map((f) => (
                <Option key={f._id} value={f.feeName}>{f.feeName}</Option>
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
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 130 }}>Class</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 160 }}>Fee Name (Head)</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 110 }}>Period</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 110 }}>Fee Amount</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 100 }}>Waived</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 100 }}>Status</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 150 }}>Reason</th>
                <th className="px-3 py-2 text-sm text-center" style={{ minWidth: 110 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-10">
                    <Empty description="No waiver records found. Click 'Add Waiver' to waive a fee." />
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-center bg-white">{(page - 1) * limit + index + 1}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white">{item.studentName || '-'}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white">{item.fatherName || '-'}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white">
                      {item.className || '-'}{item.sectionName ? ` - ${item.sectionName}` : ''}
                    </td>
                    <td className="px-3 py-2 text-sm text-center bg-white font-medium">{item.feeName || '-'}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white">{item.period || '-'}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white font-medium">₹{item.amount ?? '-'}</td>
                    <td className="px-3 py-2 text-sm text-center bg-white font-medium text-[#0c3b73]">
                      ₹{item.waivedAmount ?? 0}
                    </td>
                    <td className="px-3 py-2 text-sm text-center bg-white">
                      {Number(item.waivedAmount) >= Number(item.amount) ? (
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
        <AdditionalFeeWaivedModal
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

export default AdditionalFeeWaived
