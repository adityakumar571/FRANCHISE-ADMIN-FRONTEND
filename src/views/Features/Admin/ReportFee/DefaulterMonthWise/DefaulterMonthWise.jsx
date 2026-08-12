/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Select, Button, Empty, Pagination } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'

const { Option } = Select
const MONTHS = ['APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER','JANUARY','FEBRUARY','MARCH']

const MONTH_SHORT = {
  APRIL: 'APR', MAY: 'MAY', JUNE: 'JUN', JULY: 'JUL',
  AUGUST: 'AUG', SEPTEMBER: 'SEP', OCTOBER: 'OCT',
  NOVEMBER: 'NOV', DECEMBER: 'DEC', JANUARY: 'JAN',
  FEBRUARY: 'FEB', MARCH: 'MAR',
}

const DefaulterMonthWise = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [isApplied, setIsApplied] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [draftFilters, setDraftFilters] = useState({ sessionId: null, classId: null, sectionId: null, month: null })
  const [appliedFilters, setAppliedFilters] = useState({ sessionId: null, classId: null, sectionId: null, month: null })

  useEffect(() => {
    if (!currentSession?._id) return
    setDraftFilters({ sessionId: currentSession._id, classId: null, sectionId: null, month: null })
    setAppliedFilters({ sessionId: currentSession._id, classId: null, sectionId: null, month: null })
  }, [currentSession])

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || [])).catch(() => setClasses([]))
  }, [currentSession])

  useEffect(() => {
    if (!draftFilters.classId) { setSections([]); setDraftFilters((p) => ({ ...p, sectionId: null })); return }
    getRequest(`sections?classId=${draftFilters.classId}&session=${currentSession?._id}&isPagination=false`)
      .then((res) => setSections(res?.data?.data?.sections || [])).catch(() => setSections([]))
  }, [draftFilters.classId])

  const fetchReport = async (filters, pageNo = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const params = { sessionId: filters.sessionId, classId: filters.classId, sectionId: filters.sectionId, month: filters.month, page: pageNo, limit: pageSize }
      Object.keys(params).forEach((k) => params[k] == null && delete params[k])
      const res = await getRequest(`reports/fee-defaulters-monthwise?${new URLSearchParams(params)}`)
      setData(res?.data?.data?.list || [])
      setTotal(res?.data?.data?.pagination?.totalRows || 0)
      setPage(res?.data?.data?.pagination?.currentPage || pageNo)
      setLimit(res?.data?.data?.pagination?.perPage || pageSize)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (appliedFilters.sessionId) fetchReport(appliedFilters, page, limit) }, [appliedFilters])

  const handleApply = () => { setIsApplied(true); setPage(1); setAppliedFilters({ ...draftFilters }) }
  const handleClear = () => {
    const reset = { sessionId: currentSession?._id || null, classId: null, sectionId: null, month: null }
    setIsApplied(false); setSections([]); setDraftFilters(reset); setAppliedFilters(reset); setPage(1)
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <h1 className="text-lg font-semibold flex items-center gap-2"><IndianRupee className="text-red-500" /> Defaulter List Detailed (Month Wise)</h1>
        <p className="text-sm text-gray-500">Month-wise detailed defaulter report</p>
      </div>
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3"><Filter className="w-5 h-5 text-orange-500" /><h3 className="text-lg font-semibold">Filters</h3></div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="font-medium text-gray-600 mb-1">Class</label>
            <Select allowClear placeholder="Select Class" value={draftFilters.classId} className="w-[200px]" onChange={(v) => setDraftFilters((p) => ({ ...p, classId: v, sectionId: null }))}>
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-600 mb-1">Section</label>
            <Select allowClear placeholder={draftFilters.classId ? 'Select Section' : 'Select Class first'} value={draftFilters.sectionId} className="w-[160px]" disabled={!sections.length} onChange={(v) => setDraftFilters((p) => ({ ...p, sectionId: v || null }))}>
              {sections.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-600 mb-1">Month</label>
            <Select allowClear placeholder="Select Month" value={draftFilters.month} className="w-[200px]" onChange={(v) => setDraftFilters((p) => ({ ...p, month: v }))}>
              {MONTHS.map((m) => <Option key={m} value={m}>{m}</Option>)}
            </Select>
          </div>
          <Button loading={loading} disabled={loading} className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white" onClick={handleApply}>Apply</Button>
          {isApplied && <Button onClick={handleClear}>Clear</Button>}
        </div>
      </div>
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center"><Loader /></div>}
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="w-12 py-2 text-center">Sr.</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Student ID</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Student Name</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Father Name</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Class-Section</th>
              <th className="px-4 py-2 text-center">Due Months</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Total Amount</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Paid</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Transport</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Late Fee</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Balance</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Address</th>
              <th className="px-4 py-2 text-center whitespace-nowrap">Contact No</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr><td colSpan="13" className="text-center py-6"><Empty description="No Records Found" /></td></tr>
            ) : data.map((item, i) => (
              <tr key={item.studentId || i} className="border-b hover:bg-gray-50">
                <td className="text-center py-2">{(page - 1) * limit + i + 1}</td>
                <td className="text-center">{item.studentId}</td>
                <td className="text-center font-semibold">{item.studentName}</td>
                <td className="text-center">{item.fatherName || '-'}</td>
                <td className="text-center font-semibold whitespace-nowrap">{item.classSec || `${item.className} - ${item.sectionName}`}</td>
                <td className="text-center">{item.dueMonths || '-'}</td>
                <td className="text-center font-semibold">₹{item.totalFee}</td>
                <td className="text-center font-semibold">₹{item.totalPaid}</td>
                <td className="text-center font-semibold">
                  ₹{Object.values(item.feeHeadsByPeriod || {}).flat().filter(h => h.type === 'TRANSPORT').reduce((s, h) => s + (h.totalAmount || 0), 0)}
                </td>
                <td className="text-center font-semibold">₹{item.lateFee ?? 0}</td>
                <td className="text-center font-semibold">₹{item.totalDue}</td>
                <td className="text-center">{item.address || '-'}</td>
                <td className="text-center">{item.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && total > 0 && (
          <div className="p-4 flex justify-end">
            <Pagination current={page} pageSize={limit} total={total} pageSizeOptions={['5','10','20','50']} showSizeChanger
              onChange={(p, s) => { setPage(p); setLimit(s); fetchReport(appliedFilters, p, s) }}
              onShowSizeChange={(_, s) => { setLimit(s); setPage(1); fetchReport(appliedFilters, 1, s) }} />
          </div>
        )}
      </div>
    </div>
  )
}
export default DefaulterMonthWise
