/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Select, Button, Empty, Pagination, DatePicker, Radio } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import ExportButton from '../../../../ExportExcelButton'
import dayjs from 'dayjs'

const { Option } = Select

const RegistrationFeeStatement = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [isApplied, setIsApplied] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  const [draftFilters, setDraftFilters] = useState({
    sessionId: null, classId: null, fromDate: null, toDate: null, enrollmentStatus: 'all',
  })
  const [appliedFilters, setAppliedFilters] = useState({
    sessionId: null, classId: null, fromDate: null, toDate: null, enrollmentStatus: 'all',
  })

  useEffect(() => {
    if (!currentSession?._id) return
    const base = { sessionId: currentSession._id, classId: null, fromDate: null, toDate: null, enrollmentStatus: 'all' }
    setDraftFilters(base)
    setAppliedFilters(base)
  }, [currentSession])

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || [])).catch(() => setClasses([]))
  }, [currentSession])

  const fetchReport = async (filters, pageNo = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const params = {
        sessionId: filters.sessionId,
        classId: filters.classId,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        enrollmentStatus: filters.enrollmentStatus !== 'all' ? filters.enrollmentStatus : null,
        page: pageNo,
        limit: pageSize,
      }
      Object.keys(params).forEach((k) => params[k] == null && delete params[k])
      const res = await getRequest(`reports/registration-fee-statement?${new URLSearchParams(params)}`)
      setData(res?.data?.data?.list || [])
      setTotal(res?.data?.data?.pagination?.totalRows || 0)
      setPage(res?.data?.data?.pagination?.currentPage || pageNo)
      setLimit(res?.data?.data?.pagination?.perPage || pageSize)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (appliedFilters.sessionId) fetchReport(appliedFilters, page, limit) }, [appliedFilters])

  const handleApply = () => {
    setIsApplied(true)
    setPage(1)
    setAppliedFilters({
      ...draftFilters,
      fromDate: draftFilters.fromDate ? dayjs(draftFilters.fromDate).format('YYYY-MM-DD') : null,
      toDate: draftFilters.toDate ? dayjs(draftFilters.toDate).format('YYYY-MM-DD') : null,
    })
  }

  const handleClear = () => {
    const reset = { sessionId: currentSession?._id || null, classId: null, fromDate: null, toDate: null, enrollmentStatus: 'all' }
    setIsApplied(false); setDraftFilters(reset); setAppliedFilters(reset); setPage(1)
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="text-red-500" /> Registration Fee Statement
            </h1>
            <p className="text-sm text-gray-500">Registration fee collection statement</p>
          </div>
          <ExportButton data={data} fileName="RegistrationFeeStatement.xlsx" sheetName="Registration Fee" />
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">

          {/* CLASS */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Class</label>
            <Select allowClear placeholder="Select Class" value={draftFilters.classId} className="w-[180px]"
              onChange={(v) => setDraftFilters((p) => ({ ...p, classId: v || null }))}>
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>

          {/* FROM DATE */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">From Date</label>
            <DatePicker value={draftFilters.fromDate} onChange={(d) => setDraftFilters((p) => ({ ...p, fromDate: d }))} />
          </div>

          {/* TO DATE */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">To Date</label>
            <DatePicker value={draftFilters.toDate} onChange={(d) => setDraftFilters((p) => ({ ...p, toDate: d }))} />
          </div>

          {/* ENROLLMENT STATUS */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Record Type</label>
            <Radio.Group
              value={draftFilters.enrollmentStatus}
              onChange={(e) => setDraftFilters((p) => ({ ...p, enrollmentStatus: e.target.value }))}
            >
              <Radio value="all">All Record</Radio>
              <Radio value="enrolled">Student Enrolled</Radio>
              <Radio value="non-enrolled">Non-Enrolled</Radio>
            </Radio.Group>
          </div>

          {/* APPLY */}
          <div className="flex flex-col">
            <label className="text-xs opacity-0 mb-1">Action</label>
            <Button loading={loading} disabled={loading}
              className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white"
              onClick={handleApply}>Apply</Button>
          </div>

          {/* CLEAR */}
          {isApplied && (
            <div className="flex flex-col">
              <label className="text-xs opacity-0 mb-1">Action</label>
              <Button className="border" onClick={handleClear}>Clear</Button>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center"><Loader /></div>
        )}
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="w-16 py-2 text-center">Sr.</th>
              <th className="px-4 py-2 text-center">Student ID</th>
              <th className="px-4 py-2 text-center">Registration No</th>
              <th className="px-4 py-2 text-center">Student Name</th>
              <th className="px-4 py-2 text-center">Father Name</th>
              <th className="px-4 py-2 text-center">Phone</th>
              <th className="px-4 py-2 text-center">Class</th>
              <th className="px-4 py-2 text-center">Section</th>
              <th className="px-4 py-2 text-center">Reg. Date</th>
              <th className="px-4 py-2 text-center">Reg. Fee</th>
              <th className="px-4 py-2 text-center">Payment Mode</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr><td colSpan="12" className="text-center py-6"><Empty description="No Records Found" /></td></tr>
            ) : (
              data.map((item, i) => (
                <tr key={item._id || i} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2">{(page - 1) * limit + i + 1}</td>
                  <td className="text-center">{item.studentId || '-'}</td>
                  <td className="text-center">{item.registrationNo || '-'}</td>
                  <td className="text-center font-semibold">{item.studentName}</td>
                  <td className="text-center">{item.fatherName}</td>
                  <td className="text-center">{item.phone}</td>
                  <td className="text-center">{item.className}</td>
                  <td className="text-center">{item.sectionName || '-'}</td>
                  <td className="text-center">{item.registrationDate || '-'}</td>
                  <td className="text-center font-semibold">₹{item.registrationFee || '-'}</td>
                  <td className="text-center">{item.paymentMode || '-'}</td>
                  <td className="text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.isEnrolled === 'Enrolled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.isEnrolled}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && total > 0 && (
          <div className="p-4 flex justify-end">
            <Pagination current={page} pageSize={limit} total={total}
              pageSizeOptions={['5', '10', '20', '50']} showSizeChanger
              onChange={(p, s) => { setPage(p); setLimit(s); fetchReport(appliedFilters, p, s) }}
              onShowSizeChange={(_, s) => { setLimit(s); setPage(1); fetchReport(appliedFilters, 1, s) }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default RegistrationFeeStatement
