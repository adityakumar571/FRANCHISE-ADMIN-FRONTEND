/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Button, Empty, Pagination, DatePicker } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import dayjs from 'dayjs'

const RegistrationFeeClassWise = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [draftFilters, setDraftFilters] = useState({ sessionId: null, fromDate: null, toDate: null })
  const [appliedFilters, setAppliedFilters] = useState({ sessionId: null, fromDate: null, toDate: null })

  useEffect(() => { if (!currentSession?._id) return; const b = { sessionId: currentSession._id, fromDate: null, toDate: null }; setDraftFilters(b); setAppliedFilters(b) }, [currentSession])

  const fetchReport = async (filters, pageNo = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const params = { sessionId: filters.sessionId, fromDate: filters.fromDate, toDate: filters.toDate, page: pageNo, limit: pageSize }
      Object.keys(params).forEach((k) => params[k] == null && delete params[k])
      const res = await getRequest(`reports/registration-fee-classwise?${new URLSearchParams(params)}`)
      setData(res?.data?.data?.list || []); setTotal(res?.data?.data?.pagination?.totalRows || 0)
      setPage(res?.data?.data?.pagination?.currentPage || pageNo)
      setLimit(res?.data?.data?.pagination?.perPage || pageSize)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { if (appliedFilters.sessionId) fetchReport(appliedFilters, page, limit) }, [appliedFilters])
  const handleApply = () => { setIsApplied(true); setPage(1); setAppliedFilters({ ...draftFilters, fromDate: draftFilters.fromDate ? dayjs(draftFilters.fromDate).format('YYYY-MM-DD') : null, toDate: draftFilters.toDate ? dayjs(draftFilters.toDate).format('YYYY-MM-DD') : null }) }
  const handleClear = () => { const r = { sessionId: currentSession?._id || null, fromDate: null, toDate: null }; setIsApplied(false); setDraftFilters(r); setAppliedFilters(r); setPage(1) }

  return (
    <div className="min-h-screen">
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <h1 className="text-lg font-semibold flex items-center gap-2"><IndianRupee className="text-red-500" /> Registration Fee Statement (Class Wise)</h1>
        <p className="text-sm text-gray-500">Class-wise registration fee collection summary</p>
      </div>
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3"><Filter className="w-5 h-5 text-orange-500" /><h3 className="text-lg font-semibold">Filters</h3></div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col"><label className="font-medium text-gray-600 mb-1">From Date</label><DatePicker value={draftFilters.fromDate} onChange={(d) => setDraftFilters((p) => ({ ...p, fromDate: d }))} /></div>
          <div className="flex flex-col"><label className="font-medium text-gray-600 mb-1">To Date</label><DatePicker value={draftFilters.toDate} onChange={(d) => setDraftFilters((p) => ({ ...p, toDate: d }))} /></div>
          <Button loading={loading} disabled={loading} className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white" onClick={handleApply}>Apply</Button>
          {isApplied && <Button onClick={handleClear}>Clear</Button>}
        </div>
      </div>
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center"><Loader /></div>}
        <table className="min-w-full border">
          <thead className="bg-gray-200"><tr><th className="w-16 py-2 text-center">Sr.</th><th className="px-4 py-2 text-center">Class</th><th className="px-4 py-2 text-center">Total Students</th><th className="px-4 py-2 text-center">Reg. Fee</th><th className="px-4 py-2 text-center">Collected</th><th className="px-4 py-2 text-center">Balance</th></tr></thead>
          <tbody>
            {!loading && data.length === 0 ? <tr><td colSpan="6" className="text-center py-6"><Empty description="No Records Found" /></td></tr>
              : data.map((item, i) => (
                <tr key={item._id || i} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2">{(page - 1) * limit + i + 1}</td>
                  <td className="text-center font-semibold">{item.className}</td>
                  <td className="text-center">{item.totalStudents}</td>
                  <td className="text-center font-semibold">₹{item.registrationFee}</td>
                  <td className="text-center text-green-600 font-semibold">₹{item.collected}</td>
                  <td className="text-center text-red-600 font-semibold">₹{item.balance}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && total > 0 && <div className="p-4 flex justify-end"><Pagination current={page} pageSize={limit} total={total} pageSizeOptions={['5','10','20','50']} showSizeChanger
          onChange={(p, s) => { setPage(p); setLimit(s); fetchReport(appliedFilters, p, s) }}
          onShowSizeChange={(_, s) => { setLimit(s); setPage(1); fetchReport(appliedFilters, 1, s) }} /></div>}
      </div>
    </div>
  )
}
export default RegistrationFeeClassWise
