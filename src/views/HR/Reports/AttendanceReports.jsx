import React, { useEffect, useState } from 'react'
import { CalendarCheck, Filter, Search } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty } from 'antd'
import Loader from '../../../components/Loading/Loader'
import AppTable, { Td } from '../../../components/AppTable'

const curMon = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const today  = () => new Date().toISOString().slice(0, 10)

const ATT_META = {
  Present:        { code: 'P',  cls: 'bg-green-100 text-green-700',   bar: 'bg-green-500' },
  Absent:         { code: 'A',  cls: 'bg-red-100 text-red-700',       bar: 'bg-red-500' },
  'Half Day':     { code: 'H',  cls: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' },
  'Paid Leave':   { code: 'PL', cls: 'bg-blue-100 text-blue-700',     bar: 'bg-blue-400' },
  'Unpaid Leave': { code: 'UL', cls: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400' },
  Holiday:        { code: 'HO', cls: 'bg-purple-100 text-purple-700', bar: 'bg-purple-400' },
  'Weekly Off':   { code: 'WO', cls: 'bg-gray-100 text-gray-500',     bar: 'bg-gray-300' },
}

const StatusBadge = ({ status }) => {
  const meta = ATT_META[status]
  return meta
    ? <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${meta.cls}`}>{status}</span>
    : <span className="text-gray-400 text-xs">—</span>
}

const TableWrap = ({ children }) => (
  <div className="overflow-x-auto rounded border border-gray-200">
    <table className="min-w-max w-full border-collapse text-sm">{children}</table>
  </div>
)
const TH = ({ children, align = 'left', sticky }) => (
  <th className={[
    'px-4 py-2.5 text-sm font-semibold whitespace-nowrap bg-[#EEF2F7] text-gray-700 select-none',
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left',
    sticky === 'left' ? 'sticky left-0 z-20 bg-[#EEF2F7]' : '',
  ].join(' ')}>{children}</th>
)
const TD = ({ children, align = 'left', sticky, className = '' }) => (
  <td className={[
    'px-4 py-2.5 text-sm text-gray-700 whitespace-nowrap',
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left',
    sticky === 'left' ? 'sticky left-0 z-10 bg-white' : '',
    className,
  ].join(' ')}>{children}</td>
)

const AttendanceReports = () => {
  const [tab, setTab]               = useState('daily')
  const [date, setDate]             = useState(today())
  const [month, setMonth]           = useState(curMon())
  const [departments, setDepts]     = useState([])
  const [staff, setStaff]           = useState([])
  const [filterDept, setFilterDept] = useState('')
  const [filterStaff, setFilterStaff] = useState('')
  const [dailyData, setDailyData]   = useState(null)
  const [monthlyData, setMonthlyData] = useState(null)
  const [staffAtt, setStaffAtt]     = useState(null)
  const [loading, setLoading]       = useState(false)
  const [leaveData, setLeaveData]   = useState([])

  useEffect(() => {
    getRequest('hr/departments?limit=200').then((r) => setDepts(r?.data?.data?.departments || [])).catch(() => {})
    getRequest('hr/staff?limit=300').then((r) => setStaff(r?.data?.data?.staff || [])).catch(() => {})
  }, [])

  const loadDaily = () => {
    setLoading(true)
    getRequest(`hr/attendance/by-date?date=${date}`)
      .then((r) => setDailyData(r?.data?.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  const loadMonthly = () => {
    setLoading(true)
    const q = new URLSearchParams({ month })
    if (filterDept) q.set('department', filterDept)
    getRequest(`hr/attendance/register?${q.toString()}`)
      .then((r) => setMonthlyData(r?.data?.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  const loadStaffAtt = () => {
    if (!filterStaff) return toast.error('Select a staff member')
    setLoading(true)
    getRequest(`hr/attendance/staff?staffId=${filterStaff}&month=${month}`)
      .then((r) => setStaffAtt(r?.data?.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  const loadLeaves = () => {
    setLoading(true)
    const q = new URLSearchParams({ month, limit: 200 })
    if (filterStaff) q.set('staffId', filterStaff)
    getRequest(`hr/leaves?${q.toString()}`)
      .then((r) => setLeaveData(r?.data?.data?.leaves || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  const daysInMonth = () => {
    const [yr, mo] = month.split('-').map(Number)
    return new Date(yr, mo, 0).getDate()
  }

  const tabs = [
    { key: 'daily',    label: 'Daily Attendance' },
    { key: 'monthly',  label: 'Monthly Register' },
    { key: 'employee', label: 'Employee Attendance' },
    { key: 'absent',   label: 'Absent Staff' },
    { key: 'leave',    label: 'Leave Report' },
  ]

  const FilterBar = ({ children }) => (
    <div className="flex flex-wrap gap-3 items-end pb-1">{children}</div>
  )
  const FilterField = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      {children}
    </div>
  )
  const inputCls = 'border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200'
  const LoadBtn  = ({ onClick, loading: l }) => (
    <button onClick={onClick} disabled={l}
      className="bg-[#0c3b73] hover:bg-blue-800 text-white px-5 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-60">
      {l ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Loading...</> : <><Search size={14} />Load</>}
    </button>
  )

  return (
    <div className="min-h-screen space-y-4">
      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border">
        <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <CalendarCheck className="text-[#e24028] w-5 h-5" /> Attendance Reports
        </h1>
        <p className="text-xs text-gray-500">Daily, monthly and employee-wise attendance analysis</p>
      </div>

      {/* TABS + CONTENT */}
      <div className="bg-white border rounded overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b overflow-x-auto bg-gray-50">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                tab === t.key
                  ? 'border-[#0c3b73] text-[#0c3b73] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">

          {/* ══ DAILY ══ */}
          {tab === 'daily' && (
            <>
              <FilterBar>
                <FilterField label="Date">
                  <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                </FilterField>
                <LoadBtn onClick={loadDaily} loading={loading} />
              </FilterBar>

              {loading ? (
                <div className="py-10 flex flex-col items-center"><Loader /><p className="text-sm text-gray-400 mt-2">Loading...</p></div>
              ) : !dailyData ? (
                <div className="py-10 text-center text-gray-400 text-sm">Select a date and click Load</div>
              ) : dailyData.records?.length === 0 ? (
                <Empty description="No attendance records for this date" />
              ) : (
                <>
                  {/* Status summary chips */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ATT_META).map(([status, { code, cls }]) => {
                      const cnt = dailyData.records.filter((r) => r.status === status).length
                      return cnt > 0 ? (
                        <span key={status} className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{code}: {cnt}</span>
                      ) : null
                    })}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 ml-auto">
                      Total: {dailyData.records.length}
                    </span>
                  </div>
                  <AppTable
                    columns={[
                      { key: 'sr',     label: 'Sr',         align: 'center', width: 50 },
                      { key: 'emp',    label: 'Employee',   align: 'left',   width: 200 },
                      { key: 'dept',   label: 'Department', align: 'left',   width: 150 },
                      { key: 'status', label: 'Status',     align: 'center', width: 130 },
                      { key: 'rem',    label: 'Remarks',    align: 'left',   width: 180 },
                    ]}
                    data={dailyData.records}
                    loading={false}
                    emptyText="No records"
                    rowKey={(r, i) => r._id || i}
                  >
                    {(r, i) => (
                      <>
                        <Td align="center">{i + 1}</Td>
                        <Td>
                          <p className="font-semibold text-gray-800">{r.staff?.employeeName || '—'}</p>
                          <p className="text-xs text-gray-400 font-mono">{r.staff?.employeeCode}</p>
                        </Td>
                        <Td>{r.staff?.department?.name || '—'}</Td>
                        <Td align="center"><StatusBadge status={r.status} /></Td>
                        <Td className="text-gray-500">{r.remarks || '—'}</Td>
                      </>
                    )}
                  </AppTable>
                </>
              )}
            </>
          )}

          {/* ══ MONTHLY REGISTER ══ */}
          {tab === 'monthly' && (
            <>
              <FilterBar>
                <FilterField label="Month">
                  <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} />
                </FilterField>
                <FilterField label="Department">
                  <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className={inputCls}>
                    <option value="">All Departments</option>
                    {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </FilterField>
                <LoadBtn onClick={loadMonthly} loading={loading} />
              </FilterBar>

              {loading ? (
                <div className="py-10 flex flex-col items-center"><Loader /><p className="text-sm text-gray-400 mt-2">Loading register...</p></div>
              ) : !monthlyData ? (
                <div className="py-10 text-center text-gray-400 text-sm">Select month and click Load Register</div>
              ) : (() => {
                const rows = Array.isArray(monthlyData) ? monthlyData : (monthlyData?.staff || [])
                const days = daysInMonth()
                if (rows.length === 0) return <Empty description="No records for this month" />
                return (
                  <div className="overflow-x-auto rounded border border-gray-200">
                    <table className="text-xs min-w-max w-full border-collapse">
                      <thead className="bg-[#EEF2F7] text-gray-700">
                        <tr>
                          <TH align="center" sticky="left">Sr</TH>
                          <th className="sticky left-10 bg-[#EEF2F7] px-4 py-2.5 font-semibold text-left whitespace-nowrap min-w-[160px] z-20">Employee</th>
                          {Array.from({ length: days }, (_, i) => (
                            <TH key={i} align="center">{i + 1}</TH>
                          ))}
                          <TH align="center">P</TH>
                          <TH align="center">A</TH>
                          <TH align="center">H</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => {
                          // Backend returns attendance as { "1": "Present", "2": "Absent", ... }
                          // JSON parse turns numeric keys into strings — always use String key
                          const attMap = row.attendance || {}
                          const summary = row.summary
                            ? { P: row.summary.present || 0, A: row.summary.absent || 0, H: row.summary.halfDay || 0 }
                            : (() => {
                                let P = 0, A = 0, H = 0
                                Object.values(attMap).forEach((s) => {
                                  if (s === 'Present') P++
                                  else if (s === 'Absent') A++
                                  else if (s === 'Half Day') H++
                                })
                                return { P, A, H }
                              })()
                          // Backend sends flat fields: row.employeeName, row.employeeCode (not row.staff.*)
                          const name = row.employeeName || row.staff?.employeeName || '—'
                          const code = row.employeeCode || row.staff?.employeeCode || ''
                          return (
                            <tr key={idx} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
                              <TD align="center" sticky="left" className="text-gray-400">{idx + 1}</TD>
                              <td className="sticky left-10 bg-white px-4 py-2.5 whitespace-nowrap z-10 border-r border-gray-100">
                                <p className="font-semibold text-gray-800 text-xs">{name}</p>
                                <p className="text-gray-400 text-xs font-mono">{code}</p>
                              </td>
                              {Array.from({ length: days }, (_, i) => {
                                // Use String(i+1) — JSON numeric keys are always strings after parse
                                const status = attMap[String(i + 1)] ?? attMap[i + 1]
                                const meta   = ATT_META[status]
                                return (
                                  <td key={i} className="px-1 py-2.5 text-center">
                                    {meta
                                      ? <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${meta.cls}`}>{meta.code}</span>
                                      : <span className="text-gray-200">·</span>}
                                  </td>
                                )
                              })}
                              <td className="px-3 py-2.5 text-center font-bold text-green-600">{summary.P}</td>
                              <td className="px-3 py-2.5 text-center font-bold text-red-500">{summary.A}</td>
                              <td className="px-3 py-2.5 text-center font-bold text-yellow-600">{summary.H}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </>
          )}

          {/* ══ EMPLOYEE ATTENDANCE ══ */}
          {tab === 'employee' && (
            <>
              <FilterBar>
                <FilterField label="Staff Member">
                  <select value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)} className={`${inputCls} w-56`}>
                    <option value="">— Select Staff —</option>
                    {staff.map((s) => <option key={s._id} value={s._id}>{s.employeeName} ({s.employeeCode || '—'})</option>)}
                  </select>
                </FilterField>
                <FilterField label="Month">
                  <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} />
                </FilterField>
                <LoadBtn onClick={loadStaffAtt} loading={loading} />
              </FilterBar>

              {loading ? (
                <div className="py-10 flex flex-col items-center"><Loader /><p className="text-sm text-gray-400 mt-2">Loading...</p></div>
              ) : !staffAtt ? (
                <div className="py-10 text-center text-gray-400 text-sm">Select staff and month, then click Load</div>
              ) : (
                <>
                  {/* Summary strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      ['Present',      staffAtt.summary?.present,      'bg-green-50 border-green-200 text-green-700'],
                      ['Absent',       staffAtt.summary?.absent,       'bg-red-50 border-red-200 text-red-600'],
                      ['Paid Leave',   staffAtt.summary?.paidLeave,    'bg-blue-50 border-blue-200 text-blue-600'],
                      ['Unpaid Leave', staffAtt.summary?.unpaidLeave,  'bg-orange-50 border-orange-200 text-orange-600'],
                    ].map(([l, v, c]) => (
                      <div key={l} className={`border rounded-lg p-3 text-center ${c}`}>
                        <p className="text-2xl font-bold">{v ?? 0}</p>
                        <p className="text-xs mt-0.5">{l}</p>
                      </div>
                    ))}
                  </div>
                  <AppTable
                    columns={[
                      { key: 'sr',     label: 'Sr',     align: 'center', width: 50 },
                      { key: 'date',   label: 'Date',   align: 'center', width: 120 },
                      { key: 'day',    label: 'Day',    align: 'center', width: 80 },
                      { key: 'status', label: 'Status', align: 'center', width: 140 },
                      { key: 'rem',    label: 'Remarks',align: 'left',   width: 200 },
                    ]}
                    data={staffAtt.records || []}
                    loading={false}
                    emptyText="No attendance records"
                    rowKey={(r, i) => r._id || i}
                  >
                    {(r, i) => (
                      <>
                        <Td align="center">{i + 1}</Td>
                        <Td align="center">{r.date?.slice(0, 10) || '—'}</Td>
                        <Td align="center" className="text-gray-500">
                          {r.date ? new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short' }) : '—'}
                        </Td>
                        <Td align="center"><StatusBadge status={r.status} /></Td>
                        <Td className="text-gray-500">{r.remarks || '—'}</Td>
                      </>
                    )}
                  </AppTable>
                </>
              )}
            </>
          )}

          {/* ══ ABSENT STAFF ══ */}
          {tab === 'absent' && (
            <>
              <FilterBar>
                <FilterField label="Date">
                  <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                </FilterField>
                <LoadBtn onClick={loadDaily} loading={loading} />
              </FilterBar>

              {loading ? (
                <div className="py-10 flex flex-col items-center"><Loader /><p className="text-sm text-gray-400 mt-2">Loading...</p></div>
              ) : !dailyData ? (
                <div className="py-10 text-center text-gray-400 text-sm">Select a date and click Load</div>
              ) : (() => {
                const absentList = dailyData.records?.filter((r) => r.status === 'Absent') || []
                return absentList.length === 0
                  ? <Empty description={`No absent staff on ${date}`} />
                  : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Absent: {absentList.length}
                        </span>
                        <span className="text-xs text-gray-400">on {date}</span>
                      </div>
                      <AppTable
                        columns={[
                          { key: 'sr',   label: 'Sr',         align: 'center', width: 50 },
                          { key: 'emp',  label: 'Employee',   align: 'left',   width: 200 },
                          { key: 'dept', label: 'Department', align: 'left',   width: 150 },
                          { key: 'desig',label: 'Designation',align: 'left',   width: 140 },
                          { key: 'rem',  label: 'Remarks',    align: 'left',   width: 180 },
                        ]}
                        data={absentList}
                        loading={false}
                        emptyText="No absent staff"
                        rowKey={(r, i) => r._id || i}
                      >
                        {(r, i) => (
                          <>
                            <Td align="center">{i + 1}</Td>
                            <Td>
                              <p className="font-semibold text-gray-800">{r.staff?.employeeName || '—'}</p>
                              <p className="text-xs text-gray-400 font-mono">{r.staff?.employeeCode}</p>
                            </Td>
                            <Td>{r.staff?.department?.name || '—'}</Td>
                            <Td>{r.staff?.designation?.name || '—'}</Td>
                            <Td className="text-gray-500">{r.remarks || '—'}</Td>
                          </>
                        )}
                      </AppTable>
                    </>
                  )
              })()}
            </>
          )}

          {/* ══ LEAVE REPORT ══ */}
          {tab === 'leave' && (
            <>
              <FilterBar>
                <FilterField label="Month">
                  <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} />
                </FilterField>
                <FilterField label="Staff (optional)">
                  <select value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)} className={`${inputCls} w-48`}>
                    <option value="">All Staff</option>
                    {staff.map((s) => <option key={s._id} value={s._id}>{s.employeeName}</option>)}
                  </select>
                </FilterField>
                <LoadBtn onClick={loadLeaves} loading={loading} />
              </FilterBar>

              {loading ? (
                <div className="py-10 flex flex-col items-center"><Loader /><p className="text-sm text-gray-400 mt-2">Loading...</p></div>
              ) : leaveData.length === 0 ? (
                <Empty description="No leave records. Click Load to fetch." />
              ) : (
                <>
                  {/* Quick summary */}
                  <div className="flex flex-wrap gap-2 mb-1">
                    {['Approved','Pending','Rejected'].map((s) => {
                      const cnt = leaveData.filter((l) => l.status === s).length
                      const cls = s === 'Approved' ? 'bg-green-100 text-green-700'
                                : s === 'Rejected' ? 'bg-red-100 text-red-600'
                                : 'bg-yellow-100 text-yellow-700'
                      return cnt > 0 ? (
                        <span key={s} className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{s}: {cnt}</span>
                      ) : null
                    })}
                  </div>
                  <AppTable
                    columns={[
                      { key: 'sr',    label: 'Sr',         align: 'center', width: 50 },
                      { key: 'emp',   label: 'Employee',   align: 'left',   width: 190 },
                      { key: 'type',  label: 'Leave Type', align: 'left',   width: 130 },
                      { key: 'from',  label: 'From',       align: 'center', width: 110 },
                      { key: 'to',    label: 'To',         align: 'center', width: 110 },
                      { key: 'days',  label: 'Days',       align: 'center', width: 70 },
                      { key: 'status',label: 'Status',     align: 'center', width: 110 },
                      { key: 'rem',   label: 'Reason',     align: 'left',   width: 180 },
                    ]}
                    data={leaveData}
                    loading={false}
                    emptyText="No leave records"
                    rowKey={(l, i) => l._id || i}
                  >
                    {(l, i) => (
                      <>
                        <Td align="center">{i + 1}</Td>
                        <Td>
                          <p className="font-semibold text-gray-800">{l.staff?.employeeName || '—'}</p>
                          <p className="text-xs text-gray-400 font-mono">{l.staff?.employeeCode}</p>
                        </Td>
                        <Td>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{l.leaveType}</span>
                        </Td>
                        <Td align="center">{l.fromDate?.slice(0, 10) || '—'}</Td>
                        <Td align="center">{l.toDate?.slice(0, 10) || '—'}</Td>
                        <Td align="center">
                          <span className="font-bold text-gray-700">{l.totalDays ?? '—'}</span>
                        </Td>
                        <Td align="center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            l.status === 'Approved' ? 'bg-green-100 text-green-700'
                          : l.status === 'Rejected' ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}>{l.status}</span>
                        </Td>
                        <Td className="text-gray-500">{l.reason || '—'}</Td>
                      </>
                    )}
                  </AppTable>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default AttendanceReports
