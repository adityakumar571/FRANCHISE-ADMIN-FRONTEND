import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Eye, Filter, TrendingUp, BookOpen, Briefcase } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import AppTable, { Td } from '../../../components/AppTable'

const DEFAULT_FILTERS = { department: '', staffType: '', isActive: '' }

/* ─── small summary card ─── */
const SCard = ({ label, value, cls, icon: Icon, iconCls }) => (
  <div className={`${cls} rounded-lg p-4 flex items-center gap-3`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconCls}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
)

const HRReports = () => {
  const navigate = useNavigate()
  const [tab, setTab]           = useState('staff')
  const [staff, setStaff]       = useState([])
  const [departments, setDepts] = useState([])
  const [loading, setLoading]   = useState(false)

  const [draftDept, setDraftDept]     = useState('')
  const [draftType, setDraftType]     = useState('')
  const [draftStatus, setDraftStatus] = useState('')
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean)

  useEffect(() => {
    getRequest('hr/departments?limit=200')
      .then((r) => setDepts(r?.data?.data?.departments || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams({ limit: 500 })
    if (appliedFilters.department) q.set('department', appliedFilters.department)
    if (appliedFilters.staffType)  q.set('staffType',  appliedFilters.staffType)
    if (appliedFilters.isActive)   q.set('isActive',   appliedFilters.isActive)
    getRequest(`hr/staff?${q.toString()}`)
      .then((r) => setStaff(r?.data?.data?.staff || []))
      .catch(() => toast.error('Failed to load staff'))
      .finally(() => setLoading(false))
  }, [appliedFilters])

  const handleApply = () =>
    setAppliedFilters({ department: draftDept, staffType: draftType, isActive: draftStatus })

  const handleClear = () => {
    setDraftDept(''); setDraftType(''); setDraftStatus('')
    setAppliedFilters(DEFAULT_FILTERS)
  }

  const teaching    = staff.filter((s) => s.staffType === 'Teaching')
  const nonTeaching = staff.filter((s) => s.staffType === 'Non-Teaching')
  const active      = staff.filter((s) => s.isActive)
  const inactive    = staff.filter((s) => !s.isActive)

  const deptMap = {}
  staff.forEach((s) => {
    const d = s.department?.name || 'Unassigned'
    if (!deptMap[d]) deptMap[d] = []
    deptMap[d].push(s)
  })

  const COLUMNS = [
    { key: 'sr',          label: 'Sr',          align: 'center', width: 50 },
    { key: 'employee',    label: 'Employee',     align: 'left',   width: 200 },
    { key: 'department',  label: 'Department',   align: 'left',   width: 140 },
    { key: 'designation', label: 'Designation',  align: 'left',   width: 140 },
    { key: 'type',        label: 'Type',         align: 'center', width: 115 },
    { key: 'employment',  label: 'Employment',   align: 'center', width: 115 },
    { key: 'joined',      label: 'Joined',       align: 'center', width: 100 },
    { key: 'status',      label: 'Status',       align: 'center', width: 90  },
    { key: 'action',      label: 'Action',       align: 'center', width: 70, sticky: 'right' },
  ]

  const renderRow = (s, idx) => (
    <>
      <Td align="center">{idx + 1}</Td>
      <Td>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0c3b73] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {s.employeeName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{s.employeeName}</p>
            <p className="text-xs text-gray-400 font-mono">{s.employeeCode || '—'}</p>
          </div>
        </div>
      </Td>
      <Td>{s.department?.name || '—'}</Td>
      <Td>{s.designation?.name || '—'}</Td>
      <Td align="center">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          s.staffType === 'Teaching'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {s.staffType}
        </span>
      </Td>
      <Td align="center">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {s.employmentType || '—'}
        </span>
      </Td>
      <Td align="center" className="text-gray-600">
        {s.dateOfJoining?.slice(0, 10) || '—'}
      </Td>
      <Td align="center">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {s.isActive ? 'Active' : 'Inactive'}
        </span>
      </Td>
      <Td align="center" sticky="right">
        <button
          onClick={() => navigate(`/hr/staff/${s._id}`)}
          title="View Profile"
          className="text-[#0c3b73] hover:bg-[#0c3b73] hover:text-white p-2 rounded transition"
        >
          <Eye size={15} />
        </button>
      </Td>
    </>
  )

  const tabs = [
    { key: 'staff',       label: `All Staff (${staff.length})` },
    { key: 'teaching',    label: `Teaching (${teaching.length})` },
    { key: 'nonteaching', label: `Non-Teaching (${nonTeaching.length})` },
    { key: 'department',  label: 'Dept-Wise' },
    { key: 'status',      label: 'Active / Inactive' },
  ]

  const getTabData = () => {
    if (tab === 'teaching')    return teaching
    if (tab === 'nonteaching') return nonTeaching
    return staff
  }

  /* ── Section header for grouped tables ── */
  const SectionLabel = ({ text, count, colorCls }) => (
    <div className={`px-4 py-2.5 flex items-center justify-between border-b ${colorCls || 'bg-gray-50'}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">{text}</span>
      <span className="bg-white border rounded-full px-2 py-0.5 text-xs font-bold text-gray-700">{count}</span>
    </div>
  )

  return (
    <div className="min-h-screen space-y-4">
      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Users className="text-[#e24028] w-5 h-5" /> HR Reports
          </h1>
          <p className="text-xs text-gray-500">Staff reports by category, department and status</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SCard label="Total Staff"   value={staff.length}       cls="bg-white border"                          icon={Users}     iconCls="bg-gray-100 text-gray-600" />
        <SCard label="Teaching"      value={teaching.length}    cls="bg-blue-50 border border-blue-200"        icon={BookOpen}  iconCls="bg-blue-100 text-blue-600" />
        <SCard label="Non-Teaching"  value={nonTeaching.length} cls="bg-orange-50 border border-orange-200"    icon={Briefcase} iconCls="bg-orange-100 text-orange-600" />
        <SCard label="Active"        value={active.length}      cls="bg-green-50 border border-green-200"      icon={TrendingUp} iconCls="bg-green-100 text-green-600" />
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-3 flex flex-wrap gap-3 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Department</label>
          <select value={draftDept} onChange={(e) => setDraftDept(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Staff Type</label>
          <select value={draftType} onChange={(e) => setDraftType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Types</option>
            <option value="Teaching">Teaching</option>
            <option value="Non-Teaching">Non-Teaching</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Status</label>
          <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="flex gap-2 self-end">
          <button onClick={handleApply}
            className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
            <Filter size={14} /> Apply
          </button>
          {hasActiveFilters && (
            <button onClick={handleClear} className="px-4 py-2 border border-gray-300 rounded text-sm text-red-500 hover:bg-red-50">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* TABS + TABLE */}
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

        {/* Content */}
        {tab === 'status' ? (
          <>
            <SectionLabel text={`Active Staff`} count={active.length} colorCls="bg-green-50" />
            <AppTable
              columns={COLUMNS} data={active} loading={loading}
              emptyText="No active staff" rowKey={(s) => s._id}
            >
              {renderRow}
            </AppTable>
            <SectionLabel text={`Inactive Staff`} count={inactive.length} colorCls="bg-red-50" />
            <AppTable
              columns={COLUMNS} data={inactive} loading={loading}
              emptyText="No inactive staff" rowKey={(s) => s._id}
            >
              {renderRow}
            </AppTable>
          </>
        ) : tab === 'department' ? (
          Object.keys(deptMap).length === 0
            ? <div className="py-12 text-center text-gray-400 text-sm">No records found</div>
            : Object.entries(deptMap).sort(([a], [b]) => a.localeCompare(b)).map(([deptName, deptStaff]) => (
              <div key={deptName} className="border-b last:border-0">
                <div className="px-4 py-2.5 bg-[#EEF2F7] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0c3b73] uppercase tracking-wide">{deptName}</span>
                  <span className="bg-[#0c3b73] text-white rounded-full px-2.5 py-0.5 text-xs font-bold">{deptStaff.length}</span>
                </div>
                <AppTable
                  columns={COLUMNS} data={deptStaff} loading={loading}
                  emptyText="No records" rowKey={(s) => s._id}
                >
                  {renderRow}
                </AppTable>
              </div>
            ))
        ) : (
          <AppTable
            columns={COLUMNS} data={getTabData()} loading={loading}
            emptyText="No records found" rowKey={(s) => s._id}
          >
            {renderRow}
          </AppTable>
        )}
      </div>
    </div>
  )
}

export default HRReports
