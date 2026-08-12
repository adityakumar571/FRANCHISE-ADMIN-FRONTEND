/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Select, DatePicker, Button, Empty, Pagination } from 'antd'
import dayjs from 'dayjs'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'

const { Option } = Select

const FeeHeadwise = () => {
  const {
    currentSession,
    sessionsList1 = [],
    loading: sessionLoading = false,
  } = useContext(SessionContext)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [total, setTotal] = useState(0)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [isApplied, setIsApplied] = useState(false)

  const [draftFilters, setDraftFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
    fromDate: null,
    toDate: null,
  })

  const [appliedFilters, setAppliedFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
    fromDate: null,
    toDate: null,
  })

  /* ---------------- SESSION CHANGE ---------------- */

  useEffect(() => {
    if (!currentSession?._id) return

    const base = {
      sessionId: currentSession._id,
      classId: null,
      sectionId: null,
      fromDate: null,
      toDate: null,
    }

    setDraftFilters(base)
    setAppliedFilters(base)
  }, [currentSession])

  /* ---------------- LOAD CLASSES ---------------- */

  useEffect(() => {
    if (!currentSession?._id) return

    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => {
        setClasses(res?.data?.data?.classes || [])
      })
      .catch(() => {
        setClasses([])
      })
  }, [currentSession])

  /* ---------------- LOAD SECTIONS ---------------- */

  useEffect(() => {
    if (!draftFilters.classId) { setSections([]); return }
    getRequest(`sections?classId=${draftFilters.classId}&isPagination=false`)
      .then((res) => setSections(res?.data?.data?.sections || []))
      .catch(() => setSections([]))
  }, [draftFilters.classId])

  /* ---------------- FETCH REPORT ---------------- */

  const fetchReport = async (filters, pageNo = page, pageSize = limit) => {
    try {
      setLoading(true)

      const params = {
        sessionId: filters.sessionId,
        classId: filters.classId,
        sectionId: filters.sectionId,
        fromDate: filters.fromDate ? dayjs(filters.fromDate).format('YYYY-MM-DD') : null,
        toDate: filters.toDate ? dayjs(filters.toDate).format('YYYY-MM-DD') : null,
        page: pageNo,
        limit: pageSize,
      }

      Object.keys(params).forEach((k) => params[k] == null && delete params[k])

      const query = new URLSearchParams(params).toString()

      const res = await getRequest(`reports/fee-head?${query}`)

      const list = res?.data?.data?.list || []
      const pagination = res?.data?.data?.pagination || {}

      setData(list)
      setTotal(pagination?.totalRows || 0)
      setPage(pagination?.currentPage || pageNo)
      setLimit(pagination?.perPage || pageSize)
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

  /* ---------------- HANDLERS ---------------- */

  const handleApply = () => {
    setIsApplied(true)
    setAppliedFilters({ ...draftFilters })
  }
  const handleClear = () => {
    const reset = {
      sessionId: currentSession?._id || null,
      classId: null,
      sectionId: null,
      fromDate: null,
      toDate: null,
    }

    setIsApplied(false)
    setSections([])
    setDraftFilters(reset)
    setAppliedFilters(reset)
  }

  return (
    <div className="min-h-screen text-sm text-gray-700">
      {/* HEADER */}

      <div className="mb-4 px-4 py-2 bg-white rounded-lg border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <IndianRupee className="text-red-500" /> Fee Headwise Reports
          </h1>
          <p className="text-sm text-gray-500">Headwise fee collection report</p>
        </div>
      </div>

      {/* FILTERS */}

      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* SESSION */}
          {/* <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Session</label>
            <Select
              value={draftFilters.sessionId}
              loading={sessionLoading}
              className="w-[220px]"
              placeholder="Session"
            >
              {(sessionsList1 || []).map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.sessionName || s.name}
                </Option>
              ))}
            </Select>
          </div> */}

          {/* CLASS */}
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
                <Option key={c._id} value={c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* SECTION */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Section</label>
            <Select
              allowClear
              placeholder="Select Section"
              value={draftFilters.sectionId}
              className="w-[180px]"
              disabled={!draftFilters.classId}
              onChange={(v) => setDraftFilters((p) => ({ ...p, sectionId: v || null }))}
            >
              {sections.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* FROM DATE */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">From Date</label>
            <DatePicker
              value={draftFilters.fromDate}
              placeholder="From Date"
              onChange={(v) => setDraftFilters((p) => ({ ...p, fromDate: v }))}
            />
          </div>

          {/* TO DATE */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">To Date</label>
            <DatePicker
              value={draftFilters.toDate}
              placeholder="To Date"
              onChange={(v) => setDraftFilters((p) => ({ ...p, toDate: v }))}
            />
          </div>

          {/* APPLY BUTTON */}
          <div className="flex items-end">
            <Button
              loading={loading}
              disabled={loading}
              className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>

          {/* CLEAR BUTTON */}
          {isApplied && (
            <div className="flex items-end">
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
              <th className=" py-2 text-center w-20">Sr. No.</th>
              <th className="px-4 py-2 text-center">Fee Head</th>
              <th className="px-4 py-2 text-center">Class</th>
              <th className="px-4 py-2 text-center">Section</th>
              <th className="px-4 py-2 text-center">Total Collection</th>
              <th className="px-4 py-2 text-center">Transactions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  <Empty description="No Records Found" />{' '}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2 w-20">{(page - 1) * limit + index + 1}</td>

                  <td className="text-center font-semibold">{item.feeHead}</td>
                  <td className="text-center">{item.className}</td>
                  <td className="text-center">{item.sectionName || '-'}</td>
                  <td className="text-center text-green-600 font-semibold">₹{item.totalCollection}</td>
                  <td className="text-center">{item.totalTransactions}</td>
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
              showQuickJumper
              onChange={(newPage, newSize) => { setPage(newPage); setLimit(newSize); fetchReport(appliedFilters, newPage, newSize) }}
              onShowSizeChange={(current, size) => {
                setLimit(size)
                setPage(1)
                fetchReport(appliedFilters, 1, size)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default FeeHeadwise
