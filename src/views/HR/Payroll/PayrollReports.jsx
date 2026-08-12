import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Eye, Filter, TrendingUp, IndianRupee } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import AppTable, { Td } from '../../../components/AppTable'

const fmt    = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const curMon = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }

const STATUS_COLOR = {
  Unpaid:           'bg-yellow-100 text-yellow-700',
  Paid:             'bg-green-100 text-green-700',
  'Partially Paid': 'bg-blue-100 text-blue-700',
  'On Hold':        'bg-red-100 text-red-600',
}

const PIE_COLORS  = ['#16a34a', '#eab308', '#3b82f6', '#ef4444']
const DEPT_COLORS = ['#0c3b73', '#7c3aed', '#0891b2', '#b45309', '#16a34a', '#be123c', '#0e7490', '#15803d']

const DEFAULT_FILTERS = { month: curMon(), department: '', paymentStatus: '' }

const PayrollReports = () => {
  const navigate = useNavigate()
  const [departments, setDepts]     = useState([])
  const [activeReport, setActiveReport] = useState('monthly-register')
  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(false)

  const [draftMonth, setDraftMonth]   = useState(curMon())
  const [draftDept, setDraftDept]     = useState('')
  const [draftStatus, setDraftStatus] = useState('')
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    getRequest('hr/departments?limit=200').then((r) => setDepts(r?.data?.data?.departments || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!appliedFilters.month) return
    setLoading(true)
    const q = new URLSearchParams({ salaryMonth: appliedFilters.month, limit: 500 })
    if (appliedFilters.department)    q.set('department', appliedFilters.department)
    if (appliedFilters.paymentStatus) q.set('paymentStatus', appliedFilters.paymentStatus)
    getRequest(`hr/payroll?${q.toString()}`)
      .then((r) => setData(r?.data?.data?.payrolls || []))
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [appliedFilters])

  const handleApply = () => {
    setAppliedFilters({ month: draftMonth, department: draftDept, paymentStatus: draftStatus })
  }
  const handleClear = () => {
    const def = { month: curMon(), department: '', paymentStatus: '' }
    setDraftMonth(def.month); setDraftDept(''); setDraftStatus('')
    setAppliedFilters(def)
  }

  /* ── computed values ── */
  const paidList   = data.filter((p) => p.paymentStatus === 'Paid')
  const unpaidList = data.filter((p) => p.paymentStatus === 'Unpaid')
  const partialList= data.filter((p) => p.paymentStatus === 'Partially Paid')
  const holdList   = data.filter((p) => p.paymentStatus === 'On Hold')

  const deptMap = {}
  data.forEach((p) => {
    const d = p.staff?.department?.name || 'Unassigned'
    if (!deptMap[d]) deptMap[d] = { dept: d, count: 0, paid: 0, unpaid: 0, total: 0 }
    deptMap[d].count++
    deptMap[d].total += p.netSalary || 0
    if (p.paymentStatus === 'Paid') deptMap[d].paid += p.netSalary || 0
    else                            deptMap[d].unpaid += p.netSalary || 0
  })
  const deptReport  = Object.values(deptMap).sort((a, b) => b.total - a.total)

  const totalNet    = data.reduce((s, p) => s + (p.netSalary || 0), 0)
  const totalPaid   = paidList.reduce((s, p) => s + (p.netSalary || 0), 0)
  const totalUnpaid = unpaidList.reduce((s, p) => s + (p.netSalary || 0), 0)

  const pieData = [
    { name: 'Paid',           value: paidList.length   },
    { name: 'Unpaid',         value: unpaidList.length },
    { name: 'Partially Paid', value: partialList.length},
    { name: 'On Hold',        value: holdList.length   },
  ].filter((d) => d.value > 0)

  /* dept bar chart data */
  const deptBarData = deptReport.slice(0, 10).map((d) => ({
    name:   d.dept.length > 10 ? d.dept.slice(0, 10) + '…' : d.dept,
    fullName: d.dept,
    Paid:   d.paid,
    Unpaid: d.unpaid,
  }))

  const reportTabs = [
    { key: 'overview',          label: 'Overview Charts' },
    { key: 'monthly-register',  label: 'Monthly Register' },
    { key: 'paid-report',       label: 'Paid' },
    { key: 'unpaid-report',     label: 'Unpaid' },
    { key: 'dept-report',       label: 'Dept-Wise' },
  ]

  const STAFF_COLS = [
    { key: 'sr',          label: 'Sr',          align: 'center', width: 50 },
    { key: 'employee',    label: 'Employee',     align: 'left',   width: 180 },
    { key: 'dept',        label: 'Dept',         align: 'left',   width: 120 },
    { key: 'designation', label: 'Designation',  align: 'center', width: 130 },
    { key: 'pa',          label: 'P/A',          align: 'center', width: 80  },
    { key: 'gross',       label: 'Gross',        align: 'right',  width: 100 },
    { key: 'deduction',   label: 'Deduction',    align: 'right',  width: 100 },
    { key: 'net',         label: 'Net',          align: 'right',  width: 100 },
    { key: 'status',      label: 'Status',       align: 'center', width: 110 },
    { key: 'slip',        label: 'Slip',         align: 'center', width: 70, sticky: 'right' },
  ]

  const DEPT_COLS = [
    { key: 'sr',    label: 'Sr',               align: 'center', width: 50  },
    { key: 'dept',  label: 'Department',        align: 'left',   width: 200 },
    { key: 'count', label: 'Staff Count',       align: 'center', width: 120 },
    { key: 'paid',  label: 'Paid (₹)',          align: 'right',  width: 130 },
    { key: 'unpaid',label: 'Unpaid (₹)',        align: 'right',  width: 130 },
    { key: 'total', label: 'Total Net (₹)',     align: 'right',  width: 140 },
  ]

  const renderStaffRow = (p, idx) => (
    <>
      <Td align="center">{idx + 1}</Td>
      <Td>
        <div className="font-medium text-gray-800">{p.staff?.employeeName || '—'}</div>
        <div className="text-xs text-gray-400">{p.staff?.employeeCode}</div>
      </Td>
      <Td>{p.staff?.department?.name || '—'}</Td>
      <Td align="center">{p.staff?.designation?.name || '—'}</Td>
      <Td align="center">
        <span className="text-green-600 font-bold">{p.presentDays}P</span>
        {' / '}
        <span className="text-red-500 font-bold">{p.absentDays}A</span>
      </Td>
      <Td align="right">₹{fmt(p.monthlySalary)}</Td>
      <Td align="right"><span className="text-red-500">₹{fmt(p.totalDeduction)}</span></Td>
      <Td align="right"><span className="font-bold text-[#0c3b73]">₹{fmt(p.netSalary)}</span></Td>
      <Td align="center">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[p.paymentStatus]}`}>{p.paymentStatus}</span>
      </Td>
      <Td align="center" sticky="right">
        <button onClick={() => navigate(`/hr/salary-slip/${p._id}`)}
          className="text-[#0c3b73] hover:bg-blue-600 hover:text-white p-2 rounded transition" title="View Slip">
          <Eye size={15} />
        </button>
      </Td>
    </>
  )

  const renderDeptRow = (d, idx) => (
    <>
      <Td align="center">{idx + 1}</Td>
      <Td><span className="font-medium text-gray-800">{d.dept}</span></Td>
      <Td align="center">{d.count}</Td>
      <Td align="right"><span className="text-green-600 font-semibold">₹{fmt(d.paid)}</span></Td>
      <Td align="right"><span className="text-yellow-600 font-semibold">₹{fmt(d.unpaid)}</span></Td>
      <Td align="right"><span className="font-bold text-[#0c3b73]">₹{fmt(d.total)}</span></Td>
    </>
  )

  return (
    <div className="min-h-screen space-y-4">
      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border">
        <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <BarChart2 className="text-[#e24028] w-5 h-5" /> Payroll Reports
        </h1>
        <p className="text-xs text-gray-500">Monthly payroll summary and reports</p>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-3 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Month</label>
          <input type="month" value={draftMonth} onChange={(e) => setDraftMonth(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Department</label>
          <select value={draftDept} onChange={(e) => setDraftDept(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Status</label>
          <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Status</option>
            {['Unpaid', 'Paid', 'Partially Paid', 'On Hold'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={handleApply} className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
          <Filter size={14} /> Apply
        </button>
        <button onClick={handleClear} className="text-sm text-red-500 hover:underline self-center">Clear</button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Staff</p>
          <p className="text-2xl font-bold text-gray-800">{data.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">₹{fmt(totalNet)}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
          <p className="text-xs text-green-500 mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paidList.length}</p>
          <p className="text-xs text-green-400 mt-0.5">₹{fmt(totalPaid)}</p>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-xs text-yellow-500 mb-1">Unpaid</p>
          <p className="text-2xl font-bold text-yellow-600">{unpaidList.length}</p>
          <p className="text-xs text-yellow-400 mt-0.5">₹{fmt(totalUnpaid)}</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-500 mb-1">Partial / Hold</p>
          <p className="text-2xl font-bold text-blue-600">{partialList.length + holdList.length}</p>
          <p className="text-xs text-blue-400 mt-0.5">
            {partialList.length}P + {holdList.length}H
          </p>
        </div>
      </div>

      {/* REPORT TABS + CONTENT */}
      <div className="bg-white border rounded">
        <div className="flex border-b overflow-x-auto">
          {reportTabs.map((t) => (
            <button key={t.key} onClick={() => setActiveReport(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${activeReport === t.key ? 'border-[#0c3b73] text-[#0c3b73]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW CHARTS ── */}
        {activeReport === 'overview' && (
          <div className="p-4 space-y-6">
            {loading ? (
              <div className="h-60 flex items-center justify-center text-sm text-gray-400 animate-pulse">Loading charts...</div>
            ) : data.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-sm text-gray-400">No payroll data for this month</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pie — Status distribution */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0c3b73]" /> Payment Status Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <RTooltip formatter={(v, n) => [v + ' staff', n]} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar — Dept-wise salary */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-[#0c3b73]" /> Department-wise Salary (₹)
                  </h3>
                  {deptBarData.length === 0 ? (
                    <div className="h-52 flex items-center justify-center text-sm text-gray-400">No department data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={deptBarData} layout="vertical" margin={{ left: 5, right: 20, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                        <RTooltip
                          formatter={(v, n) => [`₹${fmt(v)}`, n]}
                          labelFormatter={(l, payload) => payload?.[0]?.payload?.fullName || l}
                          contentStyle={{ fontSize: 12, borderRadius: 6 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Paid"   fill="#16a34a" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Unpaid" fill="#eab308" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Staff type breakdown */}
                {(() => {
                  const teaching    = data.filter((p) => p.staff?.staffType === 'Teaching')
                  const nonTeaching = data.filter((p) => p.staff?.staffType === 'Non-Teaching')
                  const staffTypeData = [
                    { name: 'Teaching',     count: teaching.length,    amount: teaching.reduce((s, p) => s + (p.netSalary || 0), 0) },
                    { name: 'Non-Teaching', count: nonTeaching.length,  amount: nonTeaching.reduce((s, p) => s + (p.netSalary || 0), 0) },
                  ].filter((d) => d.count > 0)
                  if (staffTypeData.length === 0) return null
                  return (
                    <div className="lg:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Staff Type — Salary Breakdown</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {staffTypeData.map((d, i) => (
                          <div key={d.name} className="border rounded-lg p-4 flex items-center gap-4"
                            style={{ borderLeftWidth: 4, borderLeftColor: DEPT_COLORS[i] }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ background: DEPT_COLORS[i] + '20' }}>
                              <IndianRupee className="w-5 h-5" style={{ color: DEPT_COLORS[i] }} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">{d.name}</p>
                              <p className="text-lg font-bold text-gray-800">{d.count} staff</p>
                              <p className="text-sm font-semibold" style={{ color: DEPT_COLORS[i] }}>₹{fmt(d.amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── TABLE REPORTS ── */}
        {activeReport !== 'overview' && (
          activeReport === 'dept-report' ? (
            <AppTable columns={DEPT_COLS} data={deptReport} loading={loading} emptyText="No data" rowKey={(d) => d.dept}>
              {renderDeptRow}
            </AppTable>
          ) : (
            <AppTable
              columns={STAFF_COLS}
              data={activeReport === 'paid-report' ? paidList : activeReport === 'unpaid-report' ? unpaidList : data}
              loading={loading}
              emptyText="No records found"
              rowKey={(p) => p._id}
            >
              {renderStaffRow}
            </AppTable>
          )
        )}
      </div>
    </div>
  )
}

export default PayrollReports
