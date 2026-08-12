import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Eye, Filter } from 'lucide-react'
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

const DEFAULT_FILTERS = { month: curMon(), search: '', department: '', paymentStatus: '' }

const SalarySlipList = () => {
  const navigate = useNavigate()

  const [departments, setDepts]   = useState([])
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [limit]                   = useState(20)
  const [loading, setLoading]     = useState(false)

  // Draft
  const [draftMonth, setDraftMonth]   = useState(curMon())
  const [draftSearch, setDraftSearch] = useState('')
  const [draftDept, setDraftDept]     = useState('')
  const [draftStatus, setDraftStatus] = useState('')

  // Applied
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    getRequest('hr/departments?limit=200').then((r) => setDepts(r?.data?.data?.departments || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!appliedFilters.month) return
    setLoading(true)
    const q = new URLSearchParams({ salaryMonth: appliedFilters.month, page, limit })
    if (appliedFilters.department)    q.set('department', appliedFilters.department)
    if (appliedFilters.paymentStatus) q.set('paymentStatus', appliedFilters.paymentStatus)
    getRequest(`hr/payroll?${q.toString()}`)
      .then((r) => { setData(r?.data?.data?.payrolls || []); setTotal(r?.data?.data?.total || 0) })
      .catch(() => toast.error('Failed to load payroll records'))
      .finally(() => setLoading(false))
  }, [appliedFilters, page])

  const handleApply = () => {
    setAppliedFilters({ month: draftMonth, search: draftSearch, department: draftDept, paymentStatus: draftStatus })
    setPage(1)
  }

  const handleClear = () => {
    const def = { month: curMon(), search: '', department: '', paymentStatus: '' }
    setDraftMonth(def.month); setDraftSearch(''); setDraftDept(''); setDraftStatus('')
    setAppliedFilters(def)
    setPage(1)
  }

  // Client-side search filter on applied search term
  const filtered = appliedFilters.search.trim()
    ? data.filter((p) =>
        p.staff?.employeeName?.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        p.staff?.employeeCode?.toLowerCase().includes(appliedFilters.search.toLowerCase())
      )
    : data

  return (
    <div className="min-h-screen space-y-4">
      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border">
        <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2"><FileText className="text-[#e24028] w-5 h-5" />Salary Slips</h1>
        <p className="text-xs text-gray-500">Select filters and click Apply to view salary slips</p>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-3 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Month</label>
          <input type="month" value={draftMonth} onChange={(e) => setDraftMonth(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Search Name/Code</label>
          <input type="text" placeholder="Name or code..." value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-200" />
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
        <div className="ml-auto text-sm text-gray-500 self-center">Total: <b>{total}</b></div>
      </div>

      {/* SUMMARY */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',         value: data.length,                                             cls: 'bg-white border' },
            { label: 'Paid',          value: data.filter((p) => p.paymentStatus === 'Paid').length,   cls: 'bg-green-50 border border-green-200' },
            { label: 'Unpaid',        value: data.filter((p) => p.paymentStatus === 'Unpaid').length, cls: 'bg-yellow-50 border border-yellow-200' },
            { label: 'Total Net (₹)', value: `₹${fmt(data.reduce((s, p) => s + (p.netSalary || 0), 0))}`, cls: 'bg-blue-50 border border-blue-200' },
          ].map((c) => (
            <div key={c.label} className={`${c.cls} rounded-lg p-3 text-center`}>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-lg font-bold text-gray-800">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* TABLE */}
      <AppTable
        columns={[
          { key: 'sr', label: 'Sr', align: 'center', width: 50 },
          { key: 'employee', label: 'Employee', align: 'left', width: 200 },
          { key: 'department', label: 'Department', align: 'left', width: 130 },
          { key: 'designation', label: 'Designation', align: 'left', width: 130 },
          { key: 'pa', label: 'P / A', align: 'center', width: 80 },
          { key: 'gross', label: 'Gross (₹)', align: 'right', width: 100 },
          { key: 'deduction', label: 'Deduction (₹)', align: 'right', width: 110 },
          { key: 'net', label: 'Net (₹)', align: 'right', width: 100 },
          { key: 'status', label: 'Status', align: 'center', width: 110 },
          { key: 'slip', label: 'Slip', align: 'center', width: 80, sticky: 'right' },
        ]}
        data={filtered}
        loading={loading}
        emptyText={data.length === 0 ? `No payroll generated for ${appliedFilters.month}` : 'No records match your search'}
        page={page}
        limit={limit}
        total={total}
        onPageChange={(p) => setPage(p)}
        rowKey={(item) => item._id}
      >
        {(p, idx) => (
          <>
            <Td align="center">{(page - 1) * limit + idx + 1}</Td>
            <Td>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0c3b73] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{p.staff?.employeeName?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <p className="font-medium text-gray-800">{p.staff?.employeeName || '—'}</p>
                  <p className="text-xs text-gray-400 font-mono">{p.staff?.employeeCode}</p>
                </div>
              </div>
            </Td>
            <Td>{p.staff?.department?.name || '—'}</Td>
            <Td>{p.staff?.designation?.name || '—'}</Td>
            <Td align="center">
              <span className="text-green-600 font-bold">{p.presentDays ?? 0}P</span>{' / '}<span className="text-red-500 font-bold">{p.absentDays ?? 0}A</span>
            </Td>
            <Td align="right">{fmt((p.monthlySalary || 0) + (p.extraEarning || 0))}</Td>
            <Td align="right"><span className="text-red-500">{fmt(p.totalDeduction || 0)}</span></Td>
            <Td align="right"><span className="font-bold text-[#0c3b73]">{fmt(p.netSalary || 0)}</span></Td>
            <Td align="center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[p.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>{p.paymentStatus}</span>
            </Td>
            <Td align="center" sticky="right">
              <button onClick={() => navigate(`/hr/salary-slip/${p._id}`)} title="View Salary Slip"
                className="bg-[#0c3b73] hover:bg-blue-800 text-white px-3 py-1.5 rounded flex items-center gap-1 mx-auto text-xs">
                <Eye size={13} /> View
              </button>
            </Td>
          </>
        )}
      </AppTable>
    </div>
  )
}

export default SalarySlipList
