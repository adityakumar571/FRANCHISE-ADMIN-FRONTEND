/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Select, Button, Empty, Pagination } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import ExportButton from '../../../../ExportExcelButton'

const { Option } = Select

const OutstandingFees = () => {
  const { currentSession } = useContext(SessionContext)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [isApplied, setIsApplied] = useState(false)

  const [draftFilters, setDraftFilters] = useState({ sessionId: null, classId: null, sectionId: null })
  const [appliedFilters, setAppliedFilters] = useState({ sessionId: null, classId: null, sectionId: null })

  useEffect(() => {
    if (!currentSession?._id) return
    const base = { sessionId: currentSession._id, classId: null, sectionId: null }
    setDraftFilters(base); setAppliedFilters(base)
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

  const fetchReport = async (filters, pageNo = page, pageSize = limit) => {
    try {
      setLoading(true)
      const params = { sessionId: filters.sessionId, classId: filters.classId, sectionId: filters.sectionId, page: pageNo, limit: pageSize }
      Object.keys(params).forEach((k) => params[k] == null && delete params[k])
      const res = await getRequest(`reports/fee-outstanding?${new URLSearchParams(params)}`)
      setData(res?.data?.data?.list || [])
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
    if (!appliedFilters.sessionId) return
    fetchReport(appliedFilters, page, limit)
  }, [appliedFilters])

  const handleApply = () => { setIsApplied(true); setPage(1); setAppliedFilters({ ...draftFilters }) }
  const handleClear = () => {
    const reset = { sessionId: currentSession?._id || null, classId: null, sectionId: null }
    setIsApplied(false); setSections([]); setDraftFilters(reset); setAppliedFilters(reset); setPage(1)
  }

  return (
    <div className="min-h-screen text-sm text-gray-700">
      {/* HEADER */}
      <div className="mb-4 px-4 py-2 bg-white rounded-lg border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <IndianRupee className="text-red-500" /> Outstanding Fee Report (Class Wise)
          </h1>
          <p className="text-sm text-gray-500">Class-wise outstanding fee summary</p>
        </div>
        <ExportButton data={data} fileName="OutstandingFees.xlsx" sheetName="Outstanding Fees" />
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Class</label>
            <Select allowClear placeholder="Select Class" value={draftFilters.classId} className="w-[200px]"
              onChange={(v) => setDraftFilters((p) => ({ ...p, classId: v || null, sectionId: null }))}>
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Section</label>
            <Select allowClear placeholder={draftFilters.classId ? 'Select Section' : 'Select Class first'} value={draftFilters.sectionId} className="w-[160px]" disabled={!sections.length}
              onChange={(v) => setDraftFilters((p) => ({ ...p, sectionId: v || null }))}>
              {sections.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs opacity-0 mb-1">Action</label>
            <Button loading={loading} disabled={loading}
              className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white"
              onClick={handleApply}>Apply</Button>
          </div>
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
          <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center">
            <Loader />
          </div>
        )}
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="w-16 py-2 text-center">Sr. No.</th>
              <th className="px-4 py-2 text-center">Class</th>
              <th className="px-4 py-2 text-center">Total Students</th>
              <th className="px-4 py-2 text-center">Total Fee</th>
              <th className="px-4 py-2 text-center">Total Paid</th>
              <th className="px-4 py-2 text-center">Outstanding Balance</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-6"><Empty description="No Records Found" /></td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.className + index} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2">{(page - 1) * limit + index + 1}</td>
                  <td className="text-center font-semibold">{item.className}</td>
                  <td className="text-center">{item.studentCount}</td>
                  <td className="text-center font-semibold">₹{item.totalFee}</td>
                  <td className="text-center text-green-600 font-semibold">₹{item.totalPaid}</td>
                  <td className="text-center text-red-600 font-semibold">₹{item.balanceAmount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && total > 0 && (
          <div className="p-4 flex justify-end">
            <Pagination current={page} pageSize={limit} total={total}
              pageSizeOptions={['5', '10', '20', '50', '100']} showSizeChanger
              onChange={(p, s) => { setPage(p); setLimit(s); fetchReport(appliedFilters, p, s) }}
              onShowSizeChange={(_, s) => { setLimit(s); setPage(1); fetchReport(appliedFilters, 1, s) }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default OutstandingFees
