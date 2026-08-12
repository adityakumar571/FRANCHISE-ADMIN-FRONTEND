/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Button, Empty, Pagination, DatePicker } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import dayjs from 'dayjs'
import ExportButton from '../../../../ExportExcelButton'

const ClassWiseFee = () => {
  const { currentSession } = useContext(SessionContext)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  const [isApplied, setIsApplied] = useState(false)

  /* ================= FILTER STATE ================= */

  const [draftFilters, setDraftFilters] = useState({
    sessionId: null,
    fromDate: null,
    toDate: null,
  })

  const [appliedFilters, setAppliedFilters] = useState({
    sessionId: null,
    fromDate: null,
    toDate: null,
  })

  /* ---------------- SESSION SET ---------------- */

  useEffect(() => {
    if (!currentSession?._id) return

    const base = {
      sessionId: currentSession._id,
      fromDate: null,
      toDate: null,
    }

    setDraftFilters(base)
    setAppliedFilters(base)
  }, [currentSession])

  /* ---------------- FETCH REPORT ---------------- */

  const fetchReport = async (filters, pageNo = page, pageSize = limit) => {
    try {
      setLoading(true)

      const params = {
        sessionId: filters.sessionId,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        page: pageNo,
        limit: pageSize,
      }

      Object.keys(params).forEach((k) => params[k] == null && delete params[k])

      const query = new URLSearchParams(params).toString()

      const res = await getRequest(`reports/class-fee-register?${query}`)

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
    setPage(1)

    setAppliedFilters({
      ...draftFilters,
      fromDate: draftFilters.fromDate ? dayjs(draftFilters.fromDate).format('YYYY-MM-DD') : null,
      toDate: draftFilters.toDate ? dayjs(draftFilters.toDate).format('YYYY-MM-DD') : null,
    })
  }

  const handleClear = () => {
    const reset = {
      sessionId: currentSession?._id || null,
      fromDate: null,
      toDate: null,
    }

    setIsApplied(false)
    setDraftFilters(reset)
    setAppliedFilters(reset)
    setPage(1)
  }

  const visibleData = data.map((item, index) => ({
    'Sr. No.': (page - 1) * limit + index + 1,

    'Class': item.className || '-',

    'Students': item.totalStudents ?? 0,

    'Total Fee': `₹${item.totalFee ?? 0}`,

    'Collected': `₹${item.totalCollected ?? 0}`,

    'Balance': `₹${item.balance ?? 0}`,

    'Current Due': `₹${item.currentDue ?? 0}`,
  }))

  return (
    <div className="min-h-screen ">
      {/* HEADER */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="text-red-500" /> Class Wise Fee Report
            </h1>
            <p className="text-sm text-gray-500">Class-wise fee summary report</p>
          </div>
          <ExportButton
            data={visibleData}
            fileName="Class Wise Collect Fee.xlsx"
            sheetName="Class Wise Collect Fee"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* FROM DATE */}
          <div>
            <label className="block mb-1">From Date</label>
            <DatePicker
              value={draftFilters.fromDate}
              onChange={(date) => setDraftFilters((p) => ({ ...p, fromDate: date }))}
            />
          </div>

          {/* TO DATE */}
          <div>
            <label className="block mb-1">To Date</label>
            <DatePicker
              value={draftFilters.toDate}
              onChange={(date) => setDraftFilters((p) => ({ ...p, toDate: date }))}
            />
          </div>

          {/* APPLY */}
          <Button
            loading={loading}
            disabled={loading}
            className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white"
            onClick={handleApply}
          >
            Apply
          </Button>

          {/* CLEAR */}
          {isApplied && <Button onClick={handleClear}>Clear</Button>}
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
              <th className="w-20 py-2 text-center">Sr. No.</th>

              {/* ✅ SAME padding as defaulters */}
              <th className="px-4 py-2 text-center">Class</th>
              <th className="px-4 py-2 text-center">Students</th>
              <th className="px-4 py-2 text-center">Total Fee</th>
              <th className="px-4 py-2 text-center">Collected</th>
              <th className="px-4 py-2 text-center">Balance</th>
              <th className="px-4 py-2 text-center">Current Due</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                {/* ✅ correct colspan */}
                <td colSpan="7" className="text-center py-6">
                  <Empty description="No Records Found" />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2 w-20">{(page - 1) * limit + index + 1}</td>

                  <td className="text-center font-semibold">{item.className}</td>

                  <td className="text-center">{item.totalStudents}</td>

                  <td className="text-center font-semibold">₹{item.totalFee}</td>

                  <td className="text-center text-green-600 font-semibold">
                    ₹{item.totalCollected}
                  </td>

                  <td className="text-center text-red-600 font-semibold">₹{item.balance}</td>

                  <td className="text-center text-orange-500 font-semibold">₹{item.currentDue}</td>
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

export default ClassWiseFee
