/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Select, Empty, Pagination } from 'antd'
import { getRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'
import Loader from '../../../components/Loading/Loader'
import ExportButton from '../../ExportExcelButton'

const { Option } = Select

const M_SHORT = { APRIL:'Apr',MAY:'May',JUNE:'Jun',JULY:'Jul',AUGUST:'Aug',SEPTEMBER:'Sep',OCTOBER:'Oct',NOVEMBER:'Nov',DECEMBER:'Dec',JANUARY:'Jan',FEBRUARY:'Feb',MARCH:'Mar' }

const StatusDot = ({ status }) => {
  const map = {
    PAID:     'bg-blue-500',
    DUE:      'bg-red-500',
    EXEMPT:   'bg-orange-400',
    INACTIVE: 'bg-gray-300',
  }
  return (
    <span title={status} className={`inline-block w-2.5 h-2.5 rounded-full ${map[status] || 'bg-gray-300'}`} />
  )
}

const TransportFeeCollection = () => {
  const { currentSession } = useContext(SessionContext)

  const [data, setData]         = useState([])
  const [summary, setSummary]   = useState({})
  const [loading, setLoading]   = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [page, setPage]         = useState(1)
  const [limit, setLimit]       = useState(10)
  const [total, setTotal]       = useState(0)
  const [expanded, setExpanded] = useState(null)

  const [routes,  setRoutes]  = useState([])
  const [stops,   setStops]   = useState([])
  const [classes, setClasses] = useState([])

  const [draftFilters,   setDraftFilters]   = useState({ routeId: null, stopId: null, classId: null })
  const [appliedFilters, setAppliedFilters] = useState({ routeId: null, stopId: null, classId: null })

  useEffect(() => {
    getRequest('transport?isPagination=false').then((r) => setRoutes(r?.data?.data?.routes || []))
  }, [])

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((r) => setClasses(r?.data?.data?.classes || []))
  }, [currentSession])

  useEffect(() => {
    if (!draftFilters.routeId) { setStops([]); return }
    getRequest(`transport/stops?routeId=${draftFilters.routeId}&isPagination=false`)
      .then((r) => setStops(r?.data?.data?.stops || []))
  }, [draftFilters.routeId])

  const fetchReport = (filters, pageNo = 1, pageSize = 10) => {
    if (!currentSession?._id) return
    setLoading(true)
    const params = { sessionId: currentSession._id, page: pageNo, limit: pageSize }
    if (filters.routeId) params.routeId = filters.routeId
    if (filters.stopId)  params.stopId  = filters.stopId
    if (filters.classId) params.classId = filters.classId
    const q = new URLSearchParams(params).toString()
    getRequest(`transport/report/fee-collection?${q}`)
      .then((r) => {
        setData(r?.data?.data?.list || [])
        setSummary(r?.data?.data?.summary || {})
        setTotal(r?.data?.data?.pagination?.totalRows || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (currentSession?._id) fetchReport(appliedFilters, page, limit)
  }, [appliedFilters, currentSession])

  const handleApply = () => { setIsApplied(true); setPage(1); setAppliedFilters({ ...draftFilters }) }
  const handleClear = () => {
    const reset = { routeId: null, stopId: null, classId: null }
    setIsApplied(false); setDraftFilters(reset); setAppliedFilters(reset); setPage(1)
  }

  return (
    <div className="min-h-screen">

      {/* HEADER */}
      <div className="bg-white border border-blue-100 rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="text-[#e24028]" /> Transport Fee Collection
            </h1>
            <p className="text-sm text-gray-500">Per-student transport billing vs collection</p>
          </div>
          <ExportButton
            data={data.map((s, i) => ({
              'Sr. No.': i + 1,
              'Student ID': s.studentId || '-',
              'Student Name': s.studentName,
              'Father Name': s.fatherName || '-',
              'Phone': s.phone || '-',
              'Class': s.className || '-',
              'Route': s.routeName || '-',
              'Stop': s.stopName || '-',
              'Monthly Amt': s.monthlyAmount,
              'Total Billed': s.totalBilled,
              'Total Paid': s.totalPaid,
              'Balance': s.balance,
              'Status': s.status,
            }))}
            fileName="TransportFeeCollection.xlsx"
            sheetName="Fee Collection"
          />
        </div>
      </div>

      {/* SUMMARY ROW */}
      {summary.totalStudents > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {[
            { label: 'Total Students',   val: summary.totalStudents,    color: 'text-blue-600'  },
            { label: 'Total Billed',     val: `₹${(summary.grandTotalBilled||0).toLocaleString('en-IN')}`,  color: 'text-purple-600' },
            { label: 'Collected',        val: `₹${(summary.grandTotalPaid||0).toLocaleString('en-IN')}`,   color: 'text-green-600'  },
            { label: 'Outstanding',      val: `₹${(summary.grandBalance||0).toLocaleString('en-IN')}`,     color: 'text-red-600'    },
            { label: 'Clear',            val: summary.clearStudents,    color: 'text-cyan-600'  },
            { label: 'Pending',          val: summary.pendingStudents,  color: 'text-orange-600'},
          ].map((c) => (
            <div key={c.label} className="bg-white border border-blue-100 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white rounded-lg border border-blue-100 p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Route</label>
            <Select allowClear placeholder="Select Route" value={draftFilters.routeId} className="w-[180px]"
              onChange={(v) => setDraftFilters((p) => ({ ...p, routeId: v||null, stopId: null }))}>
              {routes.map((r) => <Option key={r._id} value={r._id}>{r.routeName}</Option>)}
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Stop</label>
            <Select allowClear placeholder="Select Stop" value={draftFilters.stopId} className="w-[160px]"
              disabled={!stops.length}
              onChange={(v) => setDraftFilters((p) => ({ ...p, stopId: v||null }))}>
              {stops.map((s) => <Option key={s._id} value={s._id}>{s.stopName}</Option>)}
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Class</label>
            <Select allowClear placeholder="Select Class" value={draftFilters.classId} className="w-[160px]"
              onChange={(v) => setDraftFilters((p) => ({ ...p, classId: v||null }))}>
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs opacity-0 mb-1">x</label>
            <button disabled={loading} onClick={handleApply} className="px-4 py-1.5 rounded-md text-sm font-semibold text-white bg-[#0c3b73] hover:bg-blue-900 disabled:opacity-60">Apply</button>
          </div>
          {isApplied && (
            <div className="flex flex-col">
              <label className="text-xs opacity-0 mb-1">x</label>
              <button onClick={handleClear} className="px-4 py-1.5 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">Clear</button>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader /> Loading...
          </div>
        )}
        <table className="min-w-max border-collapse w-full table-fixed">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 60 }}>Sr. No.</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 160 }}>Student Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 160 }}>Father Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 130 }}>Phone</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Class</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 160 }}>Route / Stop</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Monthly Amt</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Total Billed</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 110 }}>Total Paid</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 110 }}>Balance</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Status</th>
              <th className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 90 }}>Months</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-6">
                  <Empty description="No Records Found" />
                </td>
              </tr>
            ) : data.map((item, index) => (
              <React.Fragment key={item._id}>
                <tr className="border-t hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ minWidth: 60 }}>{(page-1)*limit+index+1}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white font-semibold truncate" style={{ minWidth: 160 }} title={item.studentName}>{item.studentName}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white truncate" style={{ minWidth: 160 }} title={item.fatherName}>{item.fatherName || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 130 }}>{item.phone || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>{item.className || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 160 }}>
                    <div className="text-[#0c3b73] font-medium">{item.routeName || '-'}</div>
                    <div className="text-xs text-gray-400">{item.stopName || ''}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-center bg-white font-semibold" style={{ minWidth: 120 }}>₹{item.monthlyAmount}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white font-semibold" style={{ minWidth: 120 }}>₹{item.totalBilled}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white font-semibold text-green-600" style={{ minWidth: 110 }}>₹{item.totalPaid}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white font-semibold text-red-600" style={{ minWidth: 110 }}>₹{item.balance}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.status === 'CLEAR' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="sticky right-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ minWidth: 90 }}>
                    <button onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                      className="text-xs text-[#0c3b73] hover:underline font-medium">
                      {expanded === item._id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
                {expanded === item._id && (
                  <tr className="bg-blue-50/30">
                    <td colSpan="12" className="px-6 py-3">
                      <div className="flex flex-wrap gap-2">
                        {(item.monthBreakdown || []).map((m) => (
                          <div key={m.month} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs shadow-sm">
                            <StatusDot status={m.status} />
                            <span className="font-medium">{M_SHORT[m.month]}</span>
                            {m.amount > 0 && <span className="text-gray-400">₹{m.amount}</span>}
                            {m.status === 'EXEMPT' && <span className="text-orange-500">Exempt</span>}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Pagination
          current={page} pageSize={limit} total={total}
          pageSizeOptions={['5','10','20','50','100']} showSizeChanger
          onChange={(p, s) => { setPage(p); setLimit(s); fetchReport(appliedFilters, p, s) }}
          onShowSizeChange={(_, s) => { setLimit(s); setPage(1); fetchReport(appliedFilters, 1, s) }}
        />
      </div>
    </div>
  )
}

export default TransportFeeCollection
