/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { BarChart3, Filter } from 'lucide-react'
import { Select, Empty, Tabs, Pagination } from 'antd'
import { getRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'
import Loader from '../../../components/Loading/Loader'
import ExportButton from '../../ExportExcelButton'

const MONTHS = ['APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER','JANUARY','FEBRUARY','MARCH']
const M_SHORT = { APRIL:'Apr',MAY:'May',JUNE:'Jun',JULY:'Jul',AUGUST:'Aug',SEPTEMBER:'Sep',OCTOBER:'Oct',NOVEMBER:'Nov',DECEMBER:'Dec',JANUARY:'Jan',FEBRUARY:'Feb',MARCH:'Mar' }

/* ════════════════════════════════════════
   TAB 1 — Route-wise Collection
════════════════════════════════════════ */
const RouteWiseTab = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData]     = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentSession?._id) return
    setLoading(true)
    getRequest(`transport/report/route-wise?sessionId=${currentSession._id}`)
      .then((r) => { setData(r?.data?.data?.list || []); setSummary(r?.data?.data?.summary || {}) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentSession])

  return (
    <div>
      {/* Summary */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Routes',  val: summary.totalRoutes,   color: 'text-blue-600'   },
            { label: 'Total Billed',  val: `₹${(summary.grandBilled||0).toLocaleString('en-IN')}`,  color: 'text-purple-600' },
            { label: 'Collected',     val: `₹${(summary.grandPaid||0).toLocaleString('en-IN')}`,    color: 'text-green-600'  },
            { label: 'Outstanding',   val: `₹${(summary.grandBalance||0).toLocaleString('en-IN')}`, color: 'text-red-600'    },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-blue-100 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.val}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end mb-3">
        <ExportButton
          data={data.map((r, i) => ({
            'Sr.': i+1, 'Route': r.routeName, 'Code': r.routeCode,
            'Students': r.totalStudents, 'Billed': r.totalBilled,
            'Collected': r.totalPaid, 'Balance': r.balance,
            'Collection %': r.collectionPct + '%',
          }))}
          fileName="RouteWiseCollection.xlsx" sheetName="Route Wise"
        />
      </div>
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[200px]">
        {loading && <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center"><Loader /> Loading...</div>}
        <table className="min-w-max border-collapse w-full table-fixed">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 60 }}>Sr. No.</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 180 }}>Route Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Route Code</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Students</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 130 }}>Total Billed</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Collected</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Balance</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Collection %</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-6"><Empty /></td></tr>
            ) : data.map((r, i) => (
              <tr key={r.routeId} className="border-t hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ minWidth: 60 }}>{i+1}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold text-[#0c3b73]" style={{ minWidth: 180 }}>{r.routeName}</td>
                <td className="px-3 py-2 text-sm text-center bg-white text-gray-500" style={{ minWidth: 120 }}>{r.routeCode || '-'}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold" style={{ minWidth: 100 }}>{r.totalStudents}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold" style={{ minWidth: 130 }}>₹{r.totalBilled.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold text-green-600" style={{ minWidth: 120 }}>₹{r.totalPaid.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold text-red-600" style={{ minWidth: 120 }}>₹{r.balance.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 120 }}>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.collectionPct >= 80 ? 'bg-green-100 text-green-700' : r.collectionPct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                    {r.collectionPct}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB 2 — Month-wise Fee Status
════════════════════════════════════════ */
const MonthWiseTab = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData]     = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentSession?._id) return
    setLoading(true)
    getRequest(`transport/report/month-wise?sessionId=${currentSession._id}`)
      .then((r) => { setData(r?.data?.data?.list || []); setSummary(r?.data?.data?.summary || {}) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentSession])

  return (
    <div>
      {data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Students',  val: summary.totalStudents,  color: 'text-blue-600'   },
            { label: 'Grand Billed',    val: `₹${(summary.grandBilled||0).toLocaleString('en-IN')}`, color: 'text-purple-600' },
            { label: 'Grand Collected', val: `₹${(summary.grandPaid||0).toLocaleString('en-IN')}`,   color: 'text-green-600'  },
            { label: 'Grand Balance',   val: `₹${(summary.grandBalance||0).toLocaleString('en-IN')}`, color: 'text-red-600'   },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-blue-100 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.val}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end mb-3">
        <ExportButton
          data={(data||[]).map((m) => ({
            'Month': m.month, 'Active': m.activeStudents, 'Exempt': m.exemptStudents,
            'Paid Count': m.paidCount, 'Due Count': m.dueCount,
            'Billed': m.totalBilled, 'Paid': m.totalPaid, 'Balance': m.balance,
            'Collection %': m.collectionPct + '%',
          }))}
          fileName="MonthWiseFeeStatus.xlsx" sheetName="Month Wise"
        />
      </div>
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[200px]">
        {loading && <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center"><Loader /> Loading...</div>}
        <table className="min-w-max border-collapse w-full table-fixed">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 140 }}>Month</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 140 }}>Active Students</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Exempt</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 110 }}>Paid Count</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 110 }}>Due Count</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 130 }}>Total Billed</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Collected</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Balance</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Collection %</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr><td colSpan="9" className="text-center py-6"><Empty /></td></tr>
            ) : data.map((m) => (
              <tr key={m.month} className={`border-t hover:bg-gray-50 ${m.exemptStudents > 0 && m.activeStudents === 0 ? 'bg-orange-50/30' : ''}`}>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold" style={{ minWidth: 140 }}>{m.month}</td>
                <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 140 }}>{m.activeStudents}</td>
                <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>
                  {m.exemptStudents > 0 ? <span className="text-orange-600 font-semibold">{m.exemptStudents} 🏖</span> : '-'}
                </td>
                <td className="px-3 py-2 text-sm text-center bg-white text-green-600 font-semibold" style={{ minWidth: 110 }}>{m.paidCount}</td>
                <td className="px-3 py-2 text-sm text-center bg-white text-red-500 font-semibold" style={{ minWidth: 110 }}>{m.dueCount}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold" style={{ minWidth: 130 }}>₹{m.totalBilled.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold text-green-600" style={{ minWidth: 120 }}>₹{m.totalPaid.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold text-red-600" style={{ minWidth: 120 }}>₹{m.balance.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 120 }}>
                  {m.totalBilled === 0
                    ? <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-600 font-semibold">Vacation</span>
                    : <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.collectionPct >= 80 ? 'bg-green-100 text-green-700' : m.collectionPct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                        {m.collectionPct}%
                      </span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB 3 — Exempt Months Audit
════════════════════════════════════════ */
const ExemptAuditTab = () => {
  const { currentSession } = useContext(SessionContext)
  const [data, setData]       = useState([])
  const [monthCount, setMonthCount] = useState({})
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(false)
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const limit = 20

  const fetch = (pg) => {
    if (!currentSession?._id) return
    setLoading(true)
    getRequest(`transport/report/exempt-summary?sessionId=${currentSession._id}&page=${pg}&limit=${limit}`)
      .then((r) => {
        setData(r?.data?.data?.list || [])
        setMonthCount(r?.data?.data?.monthExemptCount || {})
        setSummary(r?.data?.data?.summary || {})
        setTotal(r?.data?.data?.pagination?.totalRows || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (currentSession?._id) fetch(page) }, [currentSession, page])

  return (
    <div>
      {/* Month count row */}
      <div className="bg-gray-50 border rounded-lg p-3 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Exempt count per month:</p>
        <div className="flex flex-wrap gap-2">
          {MONTHS.map((m) => {
            const cnt = monthCount[m] || 0
            return (
              <div key={m} className={`px-3 py-1 rounded border text-xs font-semibold ${cnt > 0 ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-white border-gray-200 text-gray-400'}`}>
                {M_SHORT[m]}: {cnt}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-orange-600">{summary.totalExemptStudents || 0}</span> students have exempt months
        </p>
        <ExportButton
          data={data.map((s, i) => ({
            'Sr.': i+1, 'Student': s.studentName, 'Class': s.className,
            'Route': s.routeName, 'Exempt Months': (s.exemptMonths||[]).join(', '),
          }))}
          fileName="ExemptMonthsAudit.xlsx" sheetName="Exempt Audit"
        />
      </div>

      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[200px]">
        {loading && <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center"><Loader /> Loading...</div>}
        <table className="min-w-max border-collapse w-full table-fixed">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 60 }}>Sr. No.</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 160 }}>Student Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 160 }}>Father Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 130 }}>Phone</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Class</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 150 }}>Route</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Monthly Amt</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 200 }}>Exempt Months</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 110 }}>Set On</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr><td colSpan="9" className="text-center py-6"><Empty description="No exempt months set" /></td></tr>
            ) : data.map((s, i) => (
              <tr key={s._id} className="border-t hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ minWidth: 60 }}>{(page-1)*limit+i+1}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold truncate" style={{ minWidth: 160 }} title={s.studentName}>{s.studentName}</td>
                <td className="px-3 py-2 text-sm text-center bg-white truncate" style={{ minWidth: 160 }} title={s.fatherName}>{s.fatherName || '-'}</td>
                <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 130 }}>{s.phone || '-'}</td>
                <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>{s.className || '-'}</td>
                <td className="px-3 py-2 text-sm text-center bg-white text-[#0c3b73] font-medium" style={{ minWidth: 150 }}>{s.routeName || '-'}</td>
                <td className="px-3 py-2 text-sm text-center bg-white font-semibold" style={{ minWidth: 120 }}>₹{s.monthlyAmount}</td>
                <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 200 }}>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {(s.exemptMonths || []).map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-semibold">{m}</span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-sm text-center bg-white text-xs text-gray-500" style={{ minWidth: 110 }}>
                  {s.lastHistoryEntry ? new Date(s.lastHistoryEntry.date).toLocaleDateString('en-IN') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && total > limit && (
          <div className="mt-4 pb-4 flex justify-end px-4">
            <Pagination
              current={page} pageSize={limit} total={total}
              onChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
const TransportAnalytics = () => {
  const tabItems = [
    { key: '1', label: 'Route-wise Collection', children: <RouteWiseTab /> },
    { key: '2', label: 'Month-wise Status',     children: <MonthWiseTab /> },
    { key: '3', label: 'Exempt Months Audit',   children: <ExemptAuditTab /> },
  ]

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white border border-blue-100 rounded-lg px-4 py-3 mb-4">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="text-[#e24028]" /> Transport Analytics
        </h1>
        <p className="text-sm text-gray-500">Route-wise collection · Month-wise fee status · Exempt months audit</p>
      </div>

      <div className="bg-white border border-blue-100 rounded-lg p-4">
        <Tabs items={tabItems} defaultActiveKey="1" />
      </div>
    </div>
  )
}

export default TransportAnalytics
