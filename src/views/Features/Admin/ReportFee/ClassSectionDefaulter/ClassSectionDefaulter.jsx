/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Select, Button, Empty, Pagination } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import ExportButton from '../../../../ExportExcelButton'

const { Option } = Select

const ClassSectionDefaulter = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [isApplied, setIsApplied] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [draftFilters, setDraftFilters] = useState({ sessionId: null, classId: null, sectionId: null })
  const [appliedFilters, setAppliedFilters] = useState({ sessionId: null, classId: null, sectionId: null })

  useEffect(() => {
    if (!currentSession?._id) return
    setDraftFilters({ sessionId: currentSession._id, classId: null, sectionId: null })
    setAppliedFilters({ sessionId: currentSession._id, classId: null, sectionId: null })
  }, [currentSession])

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => setClasses([]))
  }, [currentSession])

  // Load sections when class changes
  useEffect(() => {
    if (!draftFilters.classId || !currentSession?._id) {
      setSections([])
      setDraftFilters((p) => ({ ...p, sectionId: null }))
      return
    }
    getRequest(`sections?classId=${draftFilters.classId}&session=${currentSession._id}&isPagination=false`)
      .then((res) => setSections(res?.data?.data?.sections || []))
      .catch(() => setSections([]))
  }, [draftFilters.classId, currentSession])

  const fetchReport = async (filters, pageNo = 1, pageSize = 10) => {
    if (!filters?.sessionId) return
    try {
      setLoading(true)
      const params = { sessionId: filters.sessionId, page: pageNo, limit: pageSize }
      if (filters.classId) params.classId = filters.classId
      if (filters.sectionId) params.sectionId = filters.sectionId
      const res = await getRequest(`reports/class-section-defaulters?${new URLSearchParams(params)}`)
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
    if (appliedFilters.sessionId) fetchReport(appliedFilters, page, limit)
  }, [appliedFilters])

  const handleApply = () => {
    setIsApplied(true)
    setPage(1)
    setAppliedFilters({ ...draftFilters })
  }

  const handleClear = () => {
    const reset = { sessionId: currentSession?._id || null, classId: null, sectionId: null }
    setIsApplied(false)
    setSections([])
    setDraftFilters(reset)
    setAppliedFilters(reset)
    setPage(1)
  }

  const visibleData = data.map((item, i) => ({
    'Sr. No.': item.sNo || (page - 1) * limit + i + 1,
    'Class': item.className || '-',
    'Section': item.sectionName || '-',
    'No. of Defaulters': item.noOfDefaulters ?? 0,
    'Defaulters Amt': item.defaultersAmt ?? 0,
    'Transport': item.transport ?? 0,
    'Late Fine': item.lateFine ?? 0,
    'Grand Total': item.grandTotal ?? 0,
  }))

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="text-red-500" /> Class-Section Wise Defaulter List
            </h1>
            <p className="text-sm text-gray-500">Defaulters grouped by class and section</p>
          </div>
          <ExportButton data={visibleData} fileName="ClassSectionDefaulters.xlsx" sheetName="Class Section Defaulters" />
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Class</label>
            <Select
              allowClear
              placeholder="Select Class"
              value={draftFilters.classId}
              className="w-[200px]"
              onChange={(v) => setDraftFilters((p) => ({ ...p, classId: v || null, sectionId: null }))}
            >
              {classes.map((c) => (
                <Option key={c._id} value={c._id}>{c.name}</Option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Section</label>
            <Select
              allowClear
              placeholder={draftFilters.classId ? 'Select Section' : 'Select Class first'}
              value={draftFilters.sectionId}
              className="w-[180px]"
              disabled={!sections.length}
              onChange={(v) => setDraftFilters((p) => ({ ...p, sectionId: v || null }))}
            >
              {sections.map((s) => (
                <Option key={s._id} value={s._id}>{s.name}</Option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs opacity-0 mb-1">Action</label>
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
              <label className="text-xs opacity-0 mb-1">Action</label>
              <Button className="border" onClick={handleClear}>
                Clear
              </Button>
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
              <th className="px-4 py-2 text-center">Section</th>
              <th className="px-4 py-2 text-center">No. of Defaulters</th>
              <th className="px-4 py-2 text-center">Defaulters Amt</th>
              <th className="px-4 py-2 text-center">Transport</th>
              <th className="px-4 py-2 text-center">Late Fine</th>
              <th className="px-4 py-2 text-center">Grand Total</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6">
                  <Empty description="No Records Found" />
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={`${item.className}-${item.sectionName}-${i}`} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2 w-16">{item.sNo || (page - 1) * limit + i + 1}</td>
                  <td className="text-center">{item.className}</td>
                  <td className="text-center">{item.sectionName || '-'}</td>
                  <td className="text-center font-semibold">{item.noOfDefaulters}</td>
                  <td className="text-center font-semibold">₹{item.defaultersAmt}</td>
                  <td className="text-center">₹{item.transport}</td>
                  <td className="text-center">₹{item.lateFine}</td>
                  <td className="text-center text-red-600 font-semibold">₹{item.grandTotal}</td>
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

export default ClassSectionDefaulter
