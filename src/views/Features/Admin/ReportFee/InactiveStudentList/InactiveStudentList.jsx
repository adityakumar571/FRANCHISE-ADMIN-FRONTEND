/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { Users, Filter } from 'lucide-react'
import { Select, Button, Empty, Pagination } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'

const { Option } = Select

const InactiveStudentList = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [isApplied, setIsApplied] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [draftFilters, setDraftFilters] = useState({ sessionId: null, classId: null })
  const [appliedFilters, setAppliedFilters] = useState({ sessionId: null, classId: null })

  useEffect(() => { if (!currentSession?._id) return; setDraftFilters({ sessionId: currentSession._id, classId: null }); setAppliedFilters({ sessionId: currentSession._id, classId: null }) }, [currentSession])
  useEffect(() => { if (!currentSession?._id) return; getRequest(`classes?isPagination=false&session=${currentSession._id}`).then((r) => setClasses(r?.data?.data?.classes || [])).catch(() => setClasses([])) }, [currentSession])

  const fetchReport = async (filters, pageNo = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const params = { sessionId: filters.sessionId, classId: filters.classId, page: pageNo, limit: pageSize }
      Object.keys(params).forEach((k) => params[k] == null && delete params[k])
      const res = await getRequest(`reports/inactive-student-list?${new URLSearchParams(params)}`)
      setData(res?.data?.data?.list || []); setTotal(res?.data?.data?.pagination?.totalRows || 0)
      setPage(res?.data?.data?.pagination?.currentPage || pageNo)
      setLimit(res?.data?.data?.pagination?.perPage || pageSize)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { if (appliedFilters.sessionId) fetchReport(appliedFilters, page, limit) }, [appliedFilters])
  const handleApply = () => { setIsApplied(true); setPage(1); setAppliedFilters({ ...draftFilters }) }
  const handleClear = () => { const r = { sessionId: currentSession?._id || null, classId: null }; setIsApplied(false); setDraftFilters(r); setAppliedFilters(r); setPage(1) }

  return (
    <div className="min-h-screen">
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <h1 className="text-lg font-semibold flex items-center gap-2"><Users className="text-gray-500" /> In-Active Student List</h1>
        <p className="text-sm text-gray-500">List of all inactive / TC students</p>
      </div>
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3"><Filter className="w-5 h-5 text-orange-500" /><h3 className="text-lg font-semibold">Filters</h3></div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col"><label className="font-medium text-gray-600 mb-1">Class</label><Select allowClear placeholder="Select Class" value={draftFilters.classId} className="w-[200px]" onChange={(v) => setDraftFilters((p) => ({ ...p, classId: v }))}>{classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}</Select></div>
          <Button loading={loading} disabled={loading} className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white" onClick={handleApply}>Apply</Button>
          {isApplied && <Button onClick={handleClear}>Clear</Button>}
        </div>
      </div>
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center"><Loader /></div>}
        <table className="min-w-full border">
          <thead className="bg-gray-200"><tr><th className="w-16 py-2 text-center">Sr.</th><th className="px-4 py-2 text-center">Student ID</th><th className="px-4 py-2 text-center">Student Name</th><th className="px-4 py-2 text-center">Father Name</th><th className="px-4 py-2 text-center">Phone</th><th className="px-4 py-2 text-center">Class</th><th className="px-4 py-2 text-center">Section</th><th className="px-4 py-2 text-center">Inactive Date</th><th className="px-4 py-2 text-center">Reason</th></tr></thead>
          <tbody>
            {!loading && data.length === 0 ? <tr><td colSpan="9" className="text-center py-6"><Empty description="No Records Found" /></td></tr>
              : data.map((item, i) => (
                <tr key={item._id || i} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2">{(page - 1) * limit + i + 1}</td>
                  <td className="text-center">{item.studentId}</td>
                  <td className="text-center font-semibold">{item.studentName}</td>
                  <td className="text-center">{item.fatherName}</td>
                  <td className="text-center">{item.phone}</td>
                  <td className="text-center">{item.className}</td>
                  <td className="text-center">{item.sectionName || '-'}</td>
                  <td className="text-center">{item.inactiveDate || '-'}</td>
                  <td className="text-center">{item.reason || '-'}</td>
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
export default InactiveStudentList
