/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Select, Button, Empty, Pagination, DatePicker, Input } from 'antd'
import dayjs from 'dayjs'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import ExportButton from '../../../../ExportExcelButton'

const { Option } = Select

const LateFeeWaiverReport = () => {
  const { currentSession } = useContext(SessionContext)

  const [data,    setData]    = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page,    setPage]    = useState(1)
  const [limit,   setLimit]   = useState(10)
  const [total,   setTotal]   = useState(0)

  const [classes,  setClasses]  = useState([])
  const [sections, setSections] = useState([])
  const [streams,  setStreams]  = useState([])
  const [isApplied, setIsApplied] = useState(false)

  const [draftFilters, setDraftFilters] = useState({
    sessionId: null, classId: null, sectionId: null, streamId: null, fromDate: null, toDate: null, studentSearch: null,
  })
  const [appliedFilters, setAppliedFilters] = useState({
    sessionId: null, classId: null, sectionId: null, streamId: null, fromDate: null, toDate: null, studentSearch: null,
  })

  /* ── session ready ── */
  useEffect(() => {
    if (!currentSession?._id) return
    const base = { sessionId: currentSession._id, classId: null, sectionId: null, streamId: null, fromDate: null, toDate: null, studentSearch: null }
    setDraftFilters(base)
    setAppliedFilters(base)
  }, [currentSession])

  /* ── classes ── */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => setClasses([]))
  }, [currentSession])

  /* ── sections ── */
  useEffect(() => {
    if (!draftFilters.classId || !currentSession?._id) {
      setSections([])
      setDraftFilters((p) => ({ ...p, sectionId: null }))
      return
    }
    getRequest(`sections?classId=${draftFilters.classId}&session=${currentSession._id}&isPagination=false`)
      .then((res) => setSections(res?.data?.data?.sections || res?.data?.data || []))
      .catch(() => setSections([]))
  }, [draftFilters.classId, currentSession])

  /* ── streams — only when senior class selected ── */
  useEffect(() => {
    const cls = classes.find((c) => c._id === draftFilters.classId)
    if (!cls?.isSenior || !draftFilters.classId) {
      setStreams([])
      setDraftFilters((p) => ({ ...p, streamId: null }))
      return
    }
    getRequest(`streams?isPagination=false&classId=${draftFilters.classId}`)
      .then((res) => setStreams(res?.data?.data?.streams || res?.data?.data || []))
      .catch(() => setStreams([]))
  }, [draftFilters.classId, classes])

  /* ── fetch ── */
  const fetchReport = async (filters, pageNo = 1, pageSize = 10) => {
    if (!filters?.sessionId) return
    try {
      setLoading(true)
      const params = { sessionId: filters.sessionId, page: pageNo, limit: pageSize }
      if (filters.classId)      params.classId      = filters.classId
      if (filters.sectionId)    params.sectionId    = filters.sectionId
      if (filters.streamId)     params.streamId     = filters.streamId
      if (filters.studentSearch) params.studentSearch = filters.studentSearch
      if (filters.fromDate)     params.fromDate     = dayjs(filters.fromDate).format('YYYY-MM-DD')
      if (filters.toDate)       params.toDate       = dayjs(filters.toDate).format('YYYY-MM-DD')
      const res = await getRequest(`late-fee/late-fee-waiver-report?${new URLSearchParams(params)}`)
      setData(res?.data?.data?.list || [])
      setSummary(res?.data?.data?.summary || null)
      setTotal(res?.data?.data?.pagination?.totalRows || 0)
      setPage(res?.data?.data?.pagination?.currentPage || pageNo)
      setLimit(res?.data?.data?.pagination?.perPage || pageSize)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appliedFilters.sessionId) fetchReport(appliedFilters, 1, limit)
  }, [appliedFilters])

  const handleApply = () => {
    setIsApplied(true)
    setPage(1)
    const newFilters = { ...draftFilters, sessionId: currentSession?._id || draftFilters.sessionId }
    setAppliedFilters(newFilters)
    fetchReport(newFilters, 1, limit)
  }

  const handleClear = () => {
    const reset = { sessionId: currentSession?._id || null, classId: null, sectionId: null, streamId: null, fromDate: null, toDate: null, studentSearch: null }
    setIsApplied(false)
    setSections([])
    setDraftFilters(reset)
    setAppliedFilters(reset)
    setPage(1)
    fetchReport(reset, 1, limit)
  }

  const fmtAmt  = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-'

  /* ── senior class check ── */
  const selectedClass  = classes.find((c) => c._id === draftFilters.classId)
  const isSeniorClass  = selectedClass?.isSenior || false

  /* ── export data ── */
  const exportData = data.map((item, i) => ({
    'Sr. No.':      (page - 1) * limit + i + 1,
    'Student':      item.studentName || '-',
    'Student ID':   item.studentCode || '-',
    'Father':       item.fatherName  || '-',
    'Class':        item.className   || '-',
    'Section':      item.sectionName || '-',
    'Stream':       item.streamName  || '-',
    'Period':       item.period      || '-',
    'Type':         item.referenceType || '-',
    'Late Fee (₹)': Number(item.amount       || 0),
    'Waived (₹)':   Number(item.waivedAmount || 0),
    'Remaining (₹)':Number(item.remainingDue || 0),
    'Waiver Type':  item.waiverType  || '-',
    'Reason':       item.waiverReason || '-',
    'Waived On':    fmtDate(item.waivedAt),
  }))

  return (
    <div className="min-h-screen">

      {/* ── HEADER ── */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="text-red-500" /> Late Fee Waiver Report
            </h1>
            <p className="text-sm text-gray-500">Yearly late fee waiver summary with filters</p>
          </div>
          <ExportButton data={exportData} fileName="LateFeeWaiverReport.xlsx" sheetName="Late Fee Waiver" />
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
            <label className="text font-medium text-gray-600 mb-1">Class</label>
            <Select
              allowClear
              placeholder="Select Class"
              value={draftFilters.classId}
              className="w-[160px]"
              onChange={(v) => {
                const cls = classes.find((c) => c._id === v)
                setDraftFilters((p) => ({
                  ...p,
                  classId:   v || null,
                  sectionId: null,
                  streamId:  cls?.isSenior ? p.streamId : null,
                }))
              }}
            >
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>

          {/* SECTION */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Section</label>
            <Select
              allowClear
              placeholder={draftFilters.classId ? 'Select Section' : 'Select Class first'}
              value={draftFilters.sectionId}
              className="w-[160px]"
              disabled={!sections.length}
              onChange={(v) => setDraftFilters((p) => ({ ...p, sectionId: v || null }))}
            >
              {sections.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
            </Select>
          </div>

          {/* STREAM — only for senior class */}
          {isSeniorClass && (
            <div className="flex flex-col">
              <label className="text font-medium text-gray-600 mb-1">Stream</label>
              <Select
                allowClear
                placeholder="Select Stream"
                value={draftFilters.streamId}
                className="w-[160px]"
                onChange={(v) => setDraftFilters((p) => ({ ...p, streamId: v || null }))}
              >
                {streams.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
              </Select>
            </div>
          )}

          {/* DATE FROM */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">From Date</label>
            <DatePicker
              format="DD-MM-YYYY"
              value={draftFilters.fromDate ? dayjs(draftFilters.fromDate) : null}
              onChange={(d) => setDraftFilters((p) => ({ ...p, fromDate: d || null }))}
              placeholder="From Date"
              className="w-[150px]"
            />
          </div>

          {/* DATE TO */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">To Date</label>
            <DatePicker
              format="DD-MM-YYYY"
              value={draftFilters.toDate ? dayjs(draftFilters.toDate) : null}
              onChange={(d) => setDraftFilters((p) => ({ ...p, toDate: d || null }))}
              placeholder="To Date"
              className="w-[150px]"
            />
          </div>

          {/* STUDENT SEARCH */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Student (ID / Name)</label>
            <Input
              allowClear
              placeholder="Search student..."
              value={draftFilters.studentSearch || ''}
              className="w-[180px]"
              onChange={(e) => setDraftFilters((p) => ({ ...p, studentSearch: e.target.value || null }))}
            />
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
            Total Late Fee: <strong className="text-gray-800">{fmtAmt(summary.totalLateFeeAmount)}</strong>
          </span>
          <span className="text-gray-500">
            Total Waived: <strong className="text-purple-700">{fmtAmt(summary.totalWaivedAmount)}</strong>
          </span>
          <span className="text-gray-500">
            Full Waivers: <strong className="text-green-700">{summary.fullWaiverCount}</strong>
          </span>
          <span className="text-gray-500">
            Partial Waivers: <strong className="text-orange-600">{summary.partialWaiverCount}</strong>
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
              <th className="px-4 py-2 text-left text-sm">Student</th>
              <th className="px-4 py-2 text-left text-sm">Father</th>
              <th className="px-4 py-2 text-left text-sm">Class</th>
              <th className="px-4 py-2 text-left text-sm">Stream</th>
              <th className="px-4 py-2 text-left text-sm">Period</th>
              <th className="px-4 py-2 text-left text-sm">Type</th>
              <th className="px-4 py-2 text-center text-sm">Late Fee</th>
              <th className="px-4 py-2 text-center text-sm">Waived Amt</th>
              <th className="px-4 py-2 text-center text-sm">Remaining</th>
              <th className="px-4 py-2 text-center text-sm">Waiver Type</th>
              <th className="px-4 py-2 text-left text-sm">Reason</th>
              <th className="px-4 py-2 text-left text-sm">Waived On</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="13" className="text-center py-10">
                  <Empty description="No Records Found" />
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2 w-14 text-sm text-gray-500">
                    {(page - 1) * limit + i + 1}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {item.studentName || '-'}
                    {item.studentCode && (
                      <span className="ml-1 text-xs text-gray-400">({item.studentCode})</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">{item.fatherName || '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    {item.className || '-'}{item.sectionName ? ` - ${item.sectionName}` : ''}
                  </td>
                  <td className="px-4 py-2 text-sm">{item.streamName || '-'}</td>
                  <td className="px-4 py-2 text-sm">{item.period || '-'}</td>
                  <td className="px-4 py-2 text-sm">{item.referenceType || '-'}</td>
                  <td className="px-4 py-2 text-center text-sm font-medium">
                    {fmtAmt(item.amount)}
                  </td>
                  <td className="px-4 py-2 text-center text-sm font-semibold text-purple-700">
                    {fmtAmt(item.waivedAmount)}
                  </td>
                  <td className="px-4 py-2 text-center text-sm font-semibold text-red-600">
                    {fmtAmt(item.remainingDue)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {item.waiverType === 'Full' ? (
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        Full
                      </span>
                    ) : (
                      <span className="bg-violet-100 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        Partial
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 italic">{item.waiverReason || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{fmtDate(item.waivedAt)}</td>
                </tr>
              ))
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
              onChange={(p, s) => { setPage(p); setLimit(s); fetchReport(appliedFilters, p, s) }}
              onShowSizeChange={(_, s) => { setLimit(s); setPage(1); fetchReport(appliedFilters, 1, s) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default LateFeeWaiverReport
