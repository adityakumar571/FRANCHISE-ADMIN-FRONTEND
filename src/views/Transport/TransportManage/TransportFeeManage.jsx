/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Settings2, Filter } from 'lucide-react'
import { Select, Pagination, Empty } from 'antd'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Loader from '../../../components/Loading/Loader'
import { SessionContext } from '../../../Context/Seesion'
import TransportManageModal from './TransportManageModal'

const { Option } = Select

const TransportFeeManage = () => {
  const { currentSession } = useContext(SessionContext)

  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [limit, setLimit]     = useState(10)
  const [loading, setLoading] = useState(false)
  const [isApplied, setIsApplied] = useState(false)

  const [routes,  setRoutes]  = useState([])
  const [stops,   setStops]   = useState([])
  const [classes, setClasses] = useState([])
  const [buses,   setBuses]   = useState([])

  const emptyFilters = { routeId: null, stopId: null, classId: null, transportType: null, busId: null }
  const [draft,   setDraft]   = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)

  const [manageModal, setManageModal] = useState({ open: false, studentId: '', studentName: '' })

  useEffect(() => {
    getRequest('transport?isPagination=false').then((r) => setRoutes(r?.data?.data?.routes || []))
    getRequest('transport/buses?isPagination=false').then((r) => setBuses(r?.data?.data?.buses || []))
  }, [])

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((r) => setClasses(r?.data?.data?.classes || []))
  }, [currentSession])

  useEffect(() => {
    if (!draft.routeId) { setStops([]); return }
    getRequest(`transport/stops?routeId=${draft.routeId}&isPagination=false`)
      .then((r) => setStops(r?.data?.data?.stops || []))
  }, [draft.routeId])

  const fetchStudents = (filters, pageNo = 1, pageSize = 10) => {
    if (!currentSession?._id) return
    setLoading(true)
    const params = new URLSearchParams({
      sessionId: currentSession._id,
      page: pageNo,
      limit: pageSize,
    })
    if (filters.routeId)       params.append('routeId', filters.routeId)
    if (filters.stopId)        params.append('stopId', filters.stopId)
    if (filters.classId)       params.append('classId', filters.classId)
    if (filters.transportType) params.append('transportType', filters.transportType)
    if (filters.busId)         params.append('busId', filters.busId)
    getRequest(`transport/report?${params.toString()}`)
      .then((r) => {
        setData(r?.data?.data?.students || [])
        setTotal(r?.data?.data?.pagination?.totalRows || 0)
      })
      .catch(() => toast.error('Failed to fetch students'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (currentSession?._id) fetchStudents(applied, page, limit)
  }, [currentSession, applied])

  const handleApply = () => { setIsApplied(true); setPage(1); setApplied({ ...draft }) }
  const handleClear = () => {
    setDraft(emptyFilters); setApplied(emptyFilters)
    setStops([]); setIsApplied(false); setPage(1)
  }

  const openManage = (student) => {
    const name = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim()
    setManageModal({ open: true, studentId: student._id, studentName: name })
  }

  return (
    <div className="min-h-screen">

      {/* HEADER */}
      <div className="bg-white border border-blue-100 rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Settings2 className="text-[#e24028]" /> Transport Fee Manage
            </h1>
            <p className="text-sm text-gray-500">Student-wise transport fee — exempt months, stop/restart mid-session</p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-lg border border-blue-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Route</label>
            <Select allowClear placeholder="Select Route" value={draft.routeId} className="w-[180px]"
              onChange={(v) => setDraft((p) => ({ ...p, routeId: v || null, stopId: null }))}>
              {routes.map((r) => <Option key={r._id} value={r._id}>{r.routeName}</Option>)}
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Stop</label>
            <Select allowClear placeholder="Select Stop" value={draft.stopId} className="w-[160px]"
              disabled={!stops.length}
              onChange={(v) => setDraft((p) => ({ ...p, stopId: v || null }))}>
              {stops.map((s) => <Option key={s._id} value={s._id}>{s.stopName}</Option>)}
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Bus</label>
            <Select allowClear placeholder="Select Bus" value={draft.busId} className="w-[150px]"
              onChange={(v) => setDraft((p) => ({ ...p, busId: v || null }))}>
              {buses.map((b) => <Option key={b._id} value={b._id}>{b.busNumber}</Option>)}
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Class</label>
            <Select allowClear placeholder="Select Class" value={draft.classId} className="w-[150px]"
              onChange={(v) => setDraft((p) => ({ ...p, classId: v || null }))}>
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Type</label>
            <Select allowClear placeholder="All Types" value={draft.transportType} className="w-[160px]"
              onChange={(v) => setDraft((p) => ({ ...p, transportType: v || null }))}>
              <Option value="HOME_TO_SCHOOL">Home to School</Option>
              <Option value="SCHOOL_TO_HOME">School to Home</Option>
              <Option value="BOTH">Both</Option>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs opacity-0 mb-1">x</label>
            <button
              disabled={loading}
              onClick={handleApply}
              className="px-4 py-1.5 rounded-md text-sm font-semibold text-white bg-[#0c3b73] hover:bg-blue-900 disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Apply'}
            </button>
          </div>

          {isApplied && (
            <div className="flex flex-col">
              <label className="text-xs opacity-0 mb-1">x</label>
              <button
                onClick={handleClear}
                className="px-4 py-1.5 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
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
              <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 70 }}>Sr. No.</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 160 }}>Student Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 140 }}>Father Name</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 120 }}>Phone</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Class</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 130 }}>Route</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 130 }}>Stop</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 140 }}>Type</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Amount</th>
              <th className="px-3 py-2 text-sm text-center bg-gray-200" style={{ minWidth: 100 }}>Status</th>
              <th className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 100 }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center py-10">
                  <Empty description="No Records Found" />
                </td>
              </tr>
            ) : (
              data.map((s, i) => (
                <tr key={s._id || i} className="border-t hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center" style={{ minWidth: 70 }}>{(page - 1) * limit + i + 1}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white font-semibold truncate" style={{ minWidth: 160 }} title={`${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.trim()}>
                    {`${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.trim()}
                  </td>
                  <td className="px-3 py-2 text-sm text-center bg-white truncate" style={{ minWidth: 140 }} title={s.fatherName}>{s.fatherName || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 120 }}>{s.phone || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>{s.class?.name || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 130 }}>{s.route?.routeName || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 130 }}>{s.stop?.stopName || '-'}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 140 }}>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      s.transportType === 'HOME_TO_SCHOOL' ? 'bg-[#0c3b73]/10 text-[#0c3b73]' :
                      s.transportType === 'SCHOOL_TO_HOME' ? 'bg-[#0c3b73]/20 text-[#0c3b73]' :
                      s.transportType === 'BOTH'           ? 'bg-[#0c3b73]/30 text-[#0c3b73]' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {s.transportType === 'HOME_TO_SCHOOL' ? 'Home→School' :
                       s.transportType === 'SCHOOL_TO_HOME' ? 'School→Home' :
                       s.transportType === 'BOTH'           ? 'Both' : '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-center bg-white font-semibold" style={{ minWidth: 100 }}>₹{s.transportAmount || 0}</td>
                  <td className="px-3 py-2 text-sm text-center bg-white" style={{ minWidth: 100 }}>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      s.transportRequired === 'YES' ? 'bg-green-100 text-green-700' :
                      s.transportRequired === 'NO'  ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {s.transportRequired === 'YES' ? 'Active' :
                       s.transportRequired === 'NO'  ? 'Stopped' : 'Not Set'}
                    </span>
                  </td>
                  <td className="sticky right-0 z-10 bg-white px-3 py-2 text-center" style={{ minWidth: 100 }}>
                    <button
                      onClick={() => openManage(s)}
                      className="px-3 py-1 rounded-md text-xs font-semibold text-white bg-[#0c3b73] hover:bg-blue-800"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          pageSizeOptions={['5', '10', '20', '50', '100']}
          showSizeChanger
          onChange={(p, s) => { setPage(p); setLimit(s); fetchStudents(applied, p, s) }}
          onShowSizeChange={(_, s) => { setLimit(s); setPage(1); fetchStudents(applied, 1, s) }}
        />
      </div>

      {manageModal.open && (
        <TransportManageModal
          isOpen={manageModal.open}
          onClose={() => setManageModal({ open: false, studentId: '', studentName: '' })}
          studentId={manageModal.studentId}
          studentName={manageModal.studentName}
          sessionId={currentSession?._id}
          onSuccess={() => fetchStudents(applied, page, limit)}
        />
      )}
    </div>
  )
}

export default TransportFeeManage
