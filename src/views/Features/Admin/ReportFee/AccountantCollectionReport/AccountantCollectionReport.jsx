/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter, ReceiptText } from 'lucide-react'
import { Select, Button, Empty, Pagination, DatePicker, Tag } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import dayjs from 'dayjs'

const { Option } = Select

const STATUS_COLOR = {
  SUCCESS: 'green',
  CANCELLED: 'red',
  PENDING: 'orange',
}

const AccountantCollectionReport = () => {
  const { currentSession } = useContext(SessionContext)

  /* ----------- filters ----------- */
  const [admins, setAdmins] = useState([])
  const [draftFilters, setDraftFilters] = useState({
    clerkId: null,
    fromDate: null,
    toDate: null,
    paymentStatus: null,
  })
  const [appliedFilters, setAppliedFilters] = useState(null)
  const [isApplied, setIsApplied] = useState(false)

  /* ----------- data ----------- */
  const [data, setData] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  /* ----------- load accountants ----------- */
  useEffect(() => {
    getRequest('admins?isPagination=false&role=Accountant')
      .then((res) => setAdmins(res?.data?.data?.data || []))
      .catch(() => setAdmins([]))
  }, [])

  /* ----------- fetch report ----------- */
  const fetchReport = async (filters, pageNo = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const params = {
        page: pageNo,
        limit: pageSize,
        ...(filters.clerkId && { clerkId: filters.clerkId }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.fromDate && { fromDate: dayjs(filters.fromDate).format('YYYY-MM-DD') }),
        ...(filters.toDate && { toDate: dayjs(filters.toDate).format('YYYY-MM-DD') }),
      }

      const res = await getRequest(`reports/accountant-collection?${new URLSearchParams(params)}`)
      const resData = res?.data?.data

      setData(resData?.list || [])
      setSummary(resData?.summary || null)
      setTotal(resData?.pagination?.totalRows || 0)
      setPage(resData?.pagination?.currentPage || pageNo)
      setLimit(resData?.pagination?.perPage || pageSize)
    } catch (err) {
      console.error(err)
      setData([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appliedFilters) fetchReport(appliedFilters, page, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters])

  const handleApply = () => {
    setIsApplied(true)
    setPage(1)
    setAppliedFilters({ ...draftFilters })
  }

  const handleClear = () => {
    const reset = { clerkId: null, fromDate: null, toDate: null, paymentStatus: null }
    setDraftFilters(reset)
    setAppliedFilters(null)
    setIsApplied(false)
    setData([])
    setSummary(null)
    setPage(1)
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <ReceiptText className="text-[#0c3b73]" />
          Accountant Collection Report
        </h1>
        <p className="text-sm text-gray-500">View fee collection history by accountant / clerk</p>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Accountant */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-600 mb-1">Accountant / Clerk</label>
            <Select
              allowClear
              placeholder="Select Accountant"
              value={draftFilters.clerkId}
              className="w-[220px]"
              onChange={(v) => setDraftFilters((p) => ({ ...p, clerkId: v || null }))}
            >
              {admins.map((a) => (
                <Option key={a._id} value={a._id}>
                  {a.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-600 mb-1">Payment Status</label>
            <Select
              allowClear
              placeholder="All Status"
              value={draftFilters.paymentStatus}
              className="w-[160px]"
              onChange={(v) => setDraftFilters((p) => ({ ...p, paymentStatus: v || null }))}
            >
              <Option value="SUCCESS">Success</Option>
              <Option value="CANCELLED">Cancelled</Option>
              <Option value="PENDING">Pending</Option>
            </Select>
          </div>

          {/* From Date */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-600 mb-1">From Date</label>
            <DatePicker
              value={draftFilters.fromDate}
              onChange={(d) => setDraftFilters((p) => ({ ...p, fromDate: d }))}
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-600 mb-1">To Date</label>
            <DatePicker
              value={draftFilters.toDate}
              onChange={(d) => setDraftFilters((p) => ({ ...p, toDate: d }))}
            />
          </div>

          <Button
            loading={loading}
            className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white"
            onClick={handleApply}
          >
            Apply
          </Button>

          {isApplied && (
            <Button onClick={handleClear}>Clear</Button>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {isApplied && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
            <IndianRupee className="text-green-500 w-8 h-8" />
            <div>
              <div className="text-xs text-gray-500">Total Collection</div>
              <div className="text-xl font-bold text-green-600">₹{summary.totalCollection || 0}</div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
            <ReceiptText className="text-blue-500 w-8 h-8" />
            <div>
              <div className="text-xs text-gray-500">Total Receipts</div>
              <div className="text-xl font-bold text-blue-600">{summary.totalReceipts || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center">
            <Loader />
          </div>
        )}

        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-14 py-2.5 text-center border-b">Sr.</th>
              <th className="px-4 py-2.5 text-center border-b">Receipt No</th>
              <th className="px-4 py-2.5 text-left border-b">Student Name</th>
              <th className="px-4 py-2.5 text-center border-b">Class / Sec</th>
              <th className="px-4 py-2.5 text-center border-b">Amount</th>
              <th className="px-4 py-2.5 text-center border-b">Mode</th>
              <th className="px-4 py-2.5 text-center border-b">Status</th>
              <th className="px-4 py-2.5 text-center border-b">Date</th>
              <th className="px-4 py-2.5 text-left border-b">Remarks</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10">
                  <Empty
                    description={
                      isApplied ? 'No Records Found' : 'Apply filters to view collection report'
                    }
                  />
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr
                  key={item._id || i}
                  className={`border-b hover:bg-blue-50/30 ${
                    item.paymentStatus === 'CANCELLED' ? 'opacity-60' : ''
                  }`}
                >
                  <td className="text-center py-2">{(page - 1) * limit + i + 1}</td>
                  <td className="text-center font-mono text-xs">{item.receiptNo || '-'}</td>
                  <td className="px-4 font-medium text-gray-800">{item.studentName || '-'}</td>
                  <td className="text-center">
                    {item.className || '-'}
                    {item.sectionName ? ` / ${item.sectionName}` : ''}
                  </td>
                  <td className={`text-center font-semibold ${item.paymentStatus === 'SUCCESS' ? 'text-green-600' : 'text-gray-400'}`}>
                    ₹{item.amountPaid}
                  </td>
                  <td className="text-center">{item.paymentMode || '-'}</td>
                  <td className="text-center">
                    <Tag color={STATUS_COLOR[item.paymentStatus] || 'default'}>
                      {item.paymentStatus}
                    </Tag>
                  </td>
                  <td className="text-center text-gray-500">
                    {item.createdAt
                      ? dayjs(item.createdAt).format('DD/MM/YYYY hh:mm A')
                      : '-'}
                  </td>
                  <td className="px-4 text-xs text-gray-500 max-w-[160px] truncate" title={item.remarks}>
                    {item.remarks || '-'}
                  </td>
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
              pageSizeOptions={['10', '20', '50', '100']}
              showSizeChanger
              onChange={(p, s) => {
                setPage(p)
                setLimit(s)
                fetchReport(appliedFilters, p, s)
              }}
              onShowSizeChange={(_, s) => {
                setLimit(s)
                setPage(1)
                fetchReport(appliedFilters, 1, s)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountantCollectionReport
