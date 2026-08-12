/* eslint-disable prettier/prettier */
/**
 * AssignFreeTrial.jsx
 *
 * SuperAdmin page to assign a free trial package to any school (tenant).
 *
 * Route: /assign-free-trial  (roles: ['SuperAdmin'])
 *
 * Features:
 *  - List all schools with search + pagination
 *  - Show current subscription status badge per school
 *  - "Assign Trial" button opens a modal
 *  - Modal lets admin pick a free trial package and optionally force-override
 *  - After assign → success toast + row refreshes
 */

import React, { useEffect, useState, useCallback } from 'react'
import {
  Search, Zap, RefreshCw, Filter, Building2,
  CheckCircle, AlertTriangle, Clock, Gift,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Pagination, Input, Select } from 'antd'
import { getRequest, postRequest } from '../../../../Helpers'
import Loader from '../../../../components/Loading/Loader'

const { Option } = Select

/* ── Status badge config ────────────────────────────────────────── */
const STATUS_CFG = {
  ACTIVE:    { label: 'Active',    bg: '#dcfce7', color: '#16a34a' },
  TRIAL:     { label: 'Trial',     bg: '#dbeafe', color: '#2563eb' },
  EXPIRED:   { label: 'Expired',   bg: '#fee2e2', color: '#dc2626' },
  CANCELLED: { label: 'Cancelled', bg: '#ffedd5', color: '#ea580c' },
  PENDING:   { label: 'Pending',   bg: '#fef9c3', color: '#ca8a04' },
  NONE:      { label: 'No Plan',   bg: '#f3f4f6', color: '#6b7280' },
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.NONE
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: 20, background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ASSIGN MODAL
═══════════════════════════════════════════════════════════════ */
const AssignModal = ({ school, packages, onClose, onSuccess }) => {
  const [selectedPkg, setSelectedPkg]   = useState(null)
  const [force, setForce]               = useState(false)
  const [loading, setLoading]           = useState(false)

  const handleAssign = async () => {
    if (!selectedPkg) {
      toast.error('Please select a trial package')
      return
    }
    setLoading(true)
    try {
      await postRequest({
        url:  `free-trial-packages/${selectedPkg}/assign/${school._id}`,
        cred: { force },
      })
      toast.success(`Trial assigned to "${school.schoolName}" successfully`)
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to assign trial'
      // If eligibleOnce blocked, suggest force
      if (msg.toLowerCase().includes('already used') || msg.toLowerCase().includes('force')) {
        toast.error(msg + '\n\nEnable "Force Override" to bypass.')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const chosen = packages.find((p) => p._id === selectedPkg)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
        padding: '28px 28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Gift size={20} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Assign Free Trial</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
              School: <b>{school.schoolName}</b>
            </div>
          </div>
        </div>

        {/* Package Select */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            Select Trial Package *
          </label>
          <Select
            placeholder="Choose a free trial package..."
            style={{ width: '100%' }}
            value={selectedPkg}
            onChange={(v) => setSelectedPkg(v)}
            size="large"
          >
            {packages.map((pkg) => (
              <Option key={pkg._id} value={pkg._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{pkg.name}</span>
                  <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8 }}>
                    {pkg.durationDays}d · {pkg.studentLimit} students
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {/* Selected package preview */}
        {chosen && (
          <div style={{
            background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10,
            padding: '12px 14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 6 }}>
              📦 {chosen.name}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{chosen.durationDays} Days</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Limit</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{chosen.studentLimit?.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eligible Once</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: chosen.eligibleOnce ? '#dc2626' : '#16a34a' }}>
                  {chosen.eligibleOnce ? 'Yes (once only)' : 'No (multiple allowed)'}
                </div>
              </div>
            </div>
            {chosen.features?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Features</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {chosen.features.map((f, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20,
                      background: '#e0f2fe', color: '#0369a1', fontWeight: 500,
                    }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Force Override Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 10, marginBottom: 20,
          background: force ? '#fff7ed' : '#f8f9fb',
          border: `1px solid ${force ? '#fed7aa' : '#e5e7eb'}`,
          cursor: 'pointer',
        }} onClick={() => setForce((v) => !v)}>
          <div style={{
            width: 36, height: 20, borderRadius: 20, position: 'relative',
            background: force ? '#ea580c' : '#d1d5db', transition: 'background 0.2s', flexShrink: 0,
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 2, left: force ? 18 : 2,
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: force ? '#c2410c' : '#374151' }}>
              Force Override
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
              Enable this if school already used this package (bypasses eligibleOnce check)
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedPkg}
            style={{
              padding: '9px 22px', borderRadius: 8, border: 'none',
              background: loading || !selectedPkg ? '#93c5fd' : '#2563eb',
              color: '#fff', cursor: loading || !selectedPkg ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {loading ? <><RefreshCw size={13} className="animate-spin" /> Assigning...</> : <><Zap size={13} /> Assign Trial</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const AssignFreeTrial = () => {
  /* ── Schools list state ── */
  const [schools, setSchools]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [page, setPage]             = useState(1)
  const [limit]                     = useState(10)
  const [total, setTotal]           = useState(0)

  /* ── Packages (for modal) ── */
  const [packages, setPackages]     = useState([])

  /* ── Modal state ── */
  const [modalSchool, setModalSchool] = useState(null)

  /* ──────────────────────────────────────────────────
     Fetch schools (tenants)
  ────────────────────────────────────────────────── */
  const fetchSchools = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
      }).toString()
      const res = await getRequest(`schools?${query}`)
      const data = res?.data?.data
      // getAllTenants returns { tenants: [...], total }
      // Each tenant already has planStatus from aggregation pipeline
      const list  = data?.tenants || data?.data || data || []
      const count = data?.total   || (Array.isArray(data) ? data.length : 0)
      setSchools(Array.isArray(list) ? list : [])
      setTotal(count)
    } catch (err) {
      console.error('[AssignFreeTrial] fetchSchools:', err)
      setSchools([])
    } finally {
      setLoading(false)
    }
  }, [page, limit, search])

  /* ──────────────────────────────────────────────────
     Fetch active free-trial packages (for modal select)
  ────────────────────────────────────────────────── */
  const fetchPackages = async () => {
    try {
      const res = await getRequest('free-trial-packages?isActive=true&isPagination=false')
      setPackages(res?.data?.data?.packages || [])
    } catch (err) {
      console.error('[AssignFreeTrial] fetchPackages:', err)
    }
  }

  useEffect(() => { fetchSchools() }, [fetchSchools])
  useEffect(() => { fetchPackages() }, [])

  /* ──────────────────────────────────────────────────
     Handlers
  ────────────────────────────────────────────────── */
  const applySearch = () => {
    setPage(1)
    setSearch(draftSearch)
  }

  const clearSearch = () => {
    setDraftSearch('')
    setSearch('')
    setPage(1)
  }

  const handleAssignSuccess = () => {
    // Refresh the schools list to get updated planStatus
    fetchSchools()
  }

  /* ──────────────────────────────────────────────────
     Render
  ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen">
      {/* ── Modal ── */}
      {modalSchool && (
        <AssignModal
          school={modalSchool}
          packages={packages}
          onClose={() => setModalSchool(null)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {/* ── Page Header ── */}
      <div className="bg-white p-4 rounded border mb-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="text-blue-600" size={20} />
              Assign Free Trial to Schools
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Select any school and assign a free trial package manually
            </p>
          </div>
          <button
            onClick={fetchSchools}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Packages warning ── */}
      {packages.length === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          background: '#fffbeb', border: '1px solid #fde68a',
        }}>
          <AlertTriangle size={16} color="#ca8a04" />
          <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>
            No active free trial packages found. Please create one first from the Free Trial Packages section.
          </span>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white p-4 rounded border mb-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
          <Filter size={15} className="text-orange-500" />
          Search Schools
        </h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-full sm:w-[280px]">
            <label className="block text-xs font-medium mb-1 text-gray-500">School Name</label>
            <Input
              placeholder="Search by school name..."
              prefix={<Search size={14} className="text-gray-400" />}
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onPressEnter={applySearch}
            />
          </div>
          <button
            onClick={applySearch}
            className="h-8 px-5 rounded bg-[#0c3b73] text-white hover:bg-[#0a2f5c] transition text-sm"
          >
            Apply
          </button>
          {search && (
            <button
              onClick={clearSearch}
              className="h-8 px-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { icon: Building2, label: 'Total Schools', value: total, color: '#185FA5' },
          { icon: Zap,       label: 'Trial Packages', value: packages.length, color: '#2563eb' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', borderRadius: 10,
            background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: `${color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={15} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded border overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-10 text-center">
            <Loader />
            <p className="mt-2 text-gray-500">Loading schools...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-3 text-center w-12">Sr.</th>
                <th className="px-3 py-3 text-left">School Name</th>
                <th className="px-3 py-3 text-left">Subdomain</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center">Subscription</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400 italic">
                    No schools found
                  </td>
                </tr>
              ) : (
                schools.map((school, idx) => (
                  <tr key={school._id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Sr. No. */}
                    <td className="px-3 py-2 text-center text-gray-500">
                      {(page - 1) * limit + idx + 1}
                    </td>

                    {/* School Name */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, background: '#EAF2FF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Building2 size={13} color="#185FA5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{school.schoolName || '—'}</div>
                          {school.schoolEmail && (
                            <div className="text-xs text-gray-400">{school.schoolEmail}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Subdomain */}
                    <td className="px-3 py-2 text-gray-600 text-xs font-mono">
                      {school.subdomain || '—'}
                    </td>

                    {/* Active / Inactive */}
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        school.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {school.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Subscription Status */}
                    <td className="px-3 py-2 text-center">
                      <StatusBadge status={school.planStatus || 'NONE'} />
                    </td>

                    {/* Assign Button */}
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => setModalSchool(school)}
                        disabled={!school.isActive || packages.length === 0}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '6px 14px', borderRadius: 8, border: 'none',
                          background: !school.isActive || packages.length === 0 ? '#e5e7eb' : '#2563eb',
                          color: !school.isActive || packages.length === 0 ? '#9ca3af' : '#fff',
                          cursor: !school.isActive || packages.length === 0 ? 'not-allowed' : 'pointer',
                          fontWeight: 700, fontSize: 12,
                        }}
                        title={
                          !school.isActive
                            ? 'School is inactive'
                            : packages.length === 0
                            ? 'No packages available'
                            : 'Assign free trial'
                        }
                      >
                        <Zap size={11} />
                        Assign Trial
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && schools.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50">
            <div className="text-xs text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} schools
            </div>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              onChange={(p) => setPage(p)}
              size="small"
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignFreeTrial
