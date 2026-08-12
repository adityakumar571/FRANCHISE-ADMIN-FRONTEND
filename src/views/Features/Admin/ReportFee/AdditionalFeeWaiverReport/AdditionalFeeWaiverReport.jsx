/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter, Printer } from 'lucide-react'
import { Select, Button, Empty, Pagination } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import { AppContext } from '../../../../../Context/AppContext'
import Loader from '../../../../../components/Loading/Loader'
import ExportButton from '../../../../ExportExcelButton'

const { Option } = Select

const AdditionalFeeWaiverReport = () => {
  const { currentSession } = useContext(SessionContext)
  const { tenantDetails }  = useContext(AppContext)

  /* ── table state ── */
  const [data,    setData]    = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page,    setPage]    = useState(1)
  const [limit,   setLimit]   = useState(10)
  const [total,   setTotal]   = useState(0)

  /* ── filter options ── */
  const [classes,  setClasses]  = useState([])
  const [sections, setSections] = useState([])
  const [feeHeads, setFeeHeads] = useState([])
  const [isApplied, setIsApplied] = useState(false)

  /* ── draft / applied filters ── */
  const [draft, setDraft] = useState({
    classId: null, sectionId: null, feeName: null,
  })
  const [applied, setApplied] = useState({
    sessionId: null, classId: null, sectionId: null, feeName: null,
  })

  /* ── session ready ── */
  useEffect(() => {
    if (!currentSession?._id) return
    const base = { sessionId: currentSession._id, classId: null, sectionId: null, feeName: null }
    setApplied(base)
  }, [currentSession])

  /* ── load classes ── */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => setClasses([]))
  }, [currentSession])

  /* ── load fee heads ── */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`additional-fees?sessionId=${currentSession._id}&isPagination=false`)
      .then((res) => {
        const list = res?.data?.data?.list || []
        const unique = [...new Map(list.map((f) => [f.feeName, f])).values()]
        setFeeHeads(unique)
      })
      .catch(() => setFeeHeads([]))
  }, [currentSession])

  /* ── load sections on class change ── */
  useEffect(() => {
    if (!draft.classId) { setSections([]); return }
    getRequest(`sections?isPagination=false&classId=${draft.classId}`)
      .then((res) => setSections(res?.data?.data?.sections || res?.data?.data || []))
      .catch(() => setSections([]))
  }, [draft.classId])

  /* ── fetch report ── */
  const fetchReport = (filters, pageNo = 1, pageSize = 10) => {
    if (!filters?.sessionId) return
    setLoading(true)
    const params = {
      sessionId: filters.sessionId,
      page: pageNo,
      limit: pageSize,
      ...(filters.classId   && { classId:   filters.classId   }),
      ...(filters.sectionId && { sectionId: filters.sectionId }),
      ...(filters.feeName   && { feeName:   filters.feeName   }),
    }
    getRequest(`additional-fees/waiver?${new URLSearchParams(params)}`)
      .then((res) => {
        const d = res?.data?.data
        const list = d?.list || []
        setData(list)
        setTotal(d?.pagination?.totalRows || 0)

        // compute summary from list
        const totalFee     = list.reduce((s, r) => s + Number(r.amount      || 0), 0)
        const totalWaived  = list.reduce((s, r) => s + Number(r.waivedAmount || 0), 0)
        const fullCount    = list.filter((r) => Number(r.waivedAmount) >= Number(r.amount)).length
        const partialCount = list.filter((r) => Number(r.waivedAmount) > 0 && Number(r.waivedAmount) < Number(r.amount)).length
        setSummary({ totalRecords: d?.pagination?.totalRows || list.length, totalFee, totalWaived, fullCount, partialCount })
      })
      .catch(() => { setData([]); setTotal(0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (applied.sessionId) fetchReport(applied, 1, limit)
  }, [applied])

  /* ── handlers ── */
  const handleApply = () => {
    setIsApplied(true)
    setPage(1)
    const newFilters = { sessionId: currentSession?._id || null, ...draft }
    setApplied(newFilters)
    fetchReport(newFilters, 1, limit)
  }

  const handleClear = () => {
    const reset = { sessionId: currentSession?._id || null, classId: null, sectionId: null, feeName: null }
    setIsApplied(false)
    setDraft({ classId: null, sectionId: null, feeName: null })
    setSections([])
    setPage(1)
    setApplied(reset)
    fetchReport(reset, 1, limit)
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-'
  const fmtAmt  = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`

  /* ── export data ── */
  const exportData = data.map((item, i) => ({
    'Sr. No.':      (page - 1) * limit + i + 1,
    'Student':      item.studentName  || '-',
    'Father':       item.fatherName   || '-',
    'Class':        item.className    || '-',
    'Section':      item.sectionName  || '-',
    'Fee Name':     item.feeName      || '-',
    'Period':       item.period       || '-',
    'Fee Amount':   Number(item.amount       || 0),
    'Waived Amt':   Number(item.waivedAmount || 0),
    'Waiver Type':  Number(item.waivedAmount) >= Number(item.amount) ? 'Full' : 'Partial',
    'Reason':       item.waiverReason || '-',
    'Date':         fmtDate(item.createdAt),
  }))

  /* ── print handler ── */
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=1100,height=800')
    const rows = data.map((item, i) => `
      <tr>
        <td>${(page - 1) * limit + i + 1}</td>
        <td>${item.studentName || '-'}</td>
        <td>${item.fatherName  || '-'}</td>
        <td>${item.className   || '-'}${item.sectionName ? ' - ' + item.sectionName : ''}</td>
        <td>${item.feeName     || '-'}</td>
        <td>${item.period      || '-'}</td>
        <td>₹${item.amount      || 0}</td>
        <td style="color:#7c3aed;font-weight:600;">₹${item.waivedAmount || 0}</td>
        <td>
          <span style="background:${Number(item.waivedAmount) >= Number(item.amount) ? '#dcfce7' : '#fef3c7'};
            color:${Number(item.waivedAmount) >= Number(item.amount) ? '#166534' : '#92400e'};
            padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">
            ${Number(item.waivedAmount) >= Number(item.amount) ? 'Full' : 'Partial'}
          </span>
        </td>
        <td style="color:#6b7280;font-style:italic;">${item.waiverReason || '-'}</td>
        <td>${fmtDate(item.createdAt)}</td>
      </tr>`).join('')

    win.document.write(`
<html><head><meta charset="UTF-8"/><title>Additional Fee Waiver Report</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  body  { font-family: Arial, sans-serif; font-size: 12px; }
  .hdr  { text-align: center; margin-bottom: 14px; }
  .hdr h2 { margin: 0; font-size: 18px; }
  .hdr p  { margin: 2px 0; color: #555; font-size: 12px; }
  .title  { text-align: center; font-weight: bold; font-size: 14px; letter-spacing: 1px; margin-bottom: 12px; }
  .summary { display: flex; gap: 24px; margin-bottom: 12px; background: #f3f4f6; padding: 8px 14px; border-radius: 6px; font-size: 12px; }
  table   { width: 100%; border-collapse: collapse; }
  th      { background: #e5e7eb; padding: 6px 8px; font-size: 11px; text-align: center; border: 1px solid #d1d5db; }
  td      { padding: 5px 8px; border: 1px solid #e5e7eb; text-align: center; }
  tr:nth-child(even) { background: #f9fafb; }
</style>
</head><body>
<div class="hdr">
  ${tenantDetails?.logo ? `<img src="${tenantDetails.logo}" style="height:50px;object-fit:contain;display:block;margin:0 auto 6px;"/>` : ''}
  <h2>${tenantDetails?.schoolName || 'SCHOOL NAME'}</h2>
  <p>${tenantDetails?.schoolAddress || ''}</p>
</div>
<div class="title">ADDITIONAL FEE WAIVER REPORT</div>
${summary ? `
<div class="summary">
  <span>Total Records: <strong>${summary.totalRecords}</strong></span>
  <span>Total Fee: <strong>${fmtAmt(summary.totalFee)}</strong></span>
  <span>Total Waived: <strong style="color:#7c3aed">${fmtAmt(summary.totalWaived)}</strong></span>
  <span>Full Waivers: <strong style="color:#166534">${summary.fullCount}</strong></span>
  <span>Partial Waivers: <strong style="color:#92400e">${summary.partialCount}</strong></span>
</div>` : ''}
<table>
  <thead><tr>
    <th>Sr.</th><th>Student</th><th>Father</th><th>Class</th>
    <th>Fee Name</th><th>Period</th><th>Fee Amt</th><th>Waived</th>
    <th>Type</th><th>Reason</th><th>Date</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<script>window.onload = function(){ window.print() }</script>
</body></html>`)
    win.document.close()
  }

  return (
    <div className="min-h-screen">

      {/* ── HEADER ── */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="text-red-500" /> Additional Fee Waiver Report
            </h1>
            <p className="text-sm text-gray-500">Session-wise additional fee waivers granted to students</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              disabled={!data.length || loading}
              className="flex items-center gap-1 border"
            >
              <Printer size={14} /> Print
            </Button>
            <ExportButton
              data={exportData}
              fileName="AdditionalFeeWaiverReport.xlsx"
              sheetName="Additional Fee Waiver"
            />
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">

          {/* CLASS */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Class</label>
            <Select
              allowClear
              placeholder="Select Class"
              value={draft.classId}
              className="w-[160px]"
              onChange={(v) => setDraft((p) => ({ ...p, classId: v || null, sectionId: null }))}
            >
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>

          {/* SECTION */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Section</label>
            <Select
              allowClear
              placeholder={draft.classId ? 'Select Section' : 'Select Class first'}
              value={draft.sectionId}
              className="w-[160px]"
              disabled={!sections.length}
              onChange={(v) => setDraft((p) => ({ ...p, sectionId: v || null }))}
            >
              {sections.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
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
            <Button
              loading={loading}
              disabled={loading}
              className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>

          {/* CLEAR */}
          {isApplied && (
            <div className="flex flex-col">
              <label className="text-xs opacity-0 mb-1">x</label>
              <Button className="border" onClick={handleClear}>Clear</Button>
            </div>
          )}
        </div>
      </div>

      {/* ── SUMMARY STRIP ── */}
      {summary && (
        <div className="bg-white border rounded-lg px-4 py-3 mb-4 flex flex-wrap gap-6 text-sm">
          <span className="text-gray-500">
            Total Records: <strong className="text-gray-800">{summary.totalRecords}</strong>
          </span>
          <span className="text-gray-500">
            Total Fee: <strong className="text-gray-800">{fmtAmt(summary.totalFee)}</strong>
          </span>
          <span className="text-gray-500">
            Total Waived: <strong className="text-purple-700">{fmtAmt(summary.totalWaived)}</strong>
          </span>
          <span className="text-gray-500">
            Full Waivers: <strong className="text-green-700">{summary.fullCount}</strong>
          </span>
          <span className="text-gray-500">
            Partial Waivers: <strong className="text-orange-600">{summary.partialCount}</strong>
          </span>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center">
            <Loader />
          </div>
        )}

        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="w-14 py-2 text-center text-sm">Sr. No.</th>
              <th className="px-4 py-2 text-left   text-sm">Student</th>
              <th className="px-4 py-2 text-left   text-sm">Father</th>
              <th className="px-4 py-2 text-left   text-sm">Class</th>
              <th className="px-4 py-2 text-left   text-sm">Fee Name</th>
              <th className="px-4 py-2 text-left   text-sm">Period</th>
              <th className="px-4 py-2 text-center text-sm">Fee Amount</th>
              <th className="px-4 py-2 text-center text-sm">Waived</th>
              <th className="px-4 py-2 text-center text-sm">Type</th>
              <th className="px-4 py-2 text-left   text-sm">Reason</th>
              <th className="px-4 py-2 text-center text-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center py-10">
                  <Empty description="No Waiver Records Found" />
                </td>
              </tr>
            ) : (
              data.map((item, i) => {
                const isFull = Number(item.waivedAmount) >= Number(item.amount)
                return (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="text-center py-2 w-14 text-sm text-gray-500">
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">{item.studentName || '-'}</td>
                    <td className="px-4 py-2 text-sm">{item.fatherName   || '-'}</td>
                    <td className="px-4 py-2 text-sm">
                      {item.className || '-'}{item.sectionName ? ` - ${item.sectionName}` : ''}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">{item.feeName  || '-'}</td>
                    <td className="px-4 py-2 text-sm">{item.period || '-'}</td>
                    <td className="px-4 py-2 text-center text-sm font-medium">
                      {fmtAmt(item.amount)}
                    </td>
                    <td className="px-4 py-2 text-center text-sm font-semibold text-purple-700">
                      {fmtAmt(item.waivedAmount)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isFull
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {isFull ? 'Full' : 'Partial'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 italic">
                      {item.waiverReason || '-'}
                    </td>
                    <td className="px-4 py-2 text-center text-sm text-gray-500">
                      {fmtDate(item.createdAt)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {!loading && total > 0 && (
          <div className="p-4 flex justify-end">
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              pageSizeOptions={['5', '10', '20', '50', '100']}
              showSizeChanger
              onChange={(p, s) => { setPage(p); setLimit(s); fetchReport(applied, p, s) }}
              onShowSizeChange={(_, s) => { setLimit(s); setPage(1); fetchReport(applied, 1, s) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AdditionalFeeWaiverReport
