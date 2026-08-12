import React, { useEffect, useState, useContext } from 'react'
import { Users, Trash2, Edit, ChevronDown, Plus, Eye, AlertTriangle, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { Pagination, Select, Tag, Spin, Empty } from 'antd'
import { deleteRequest, getRequest, putRequest } from '../../../../../Helpers'
import FeeStructureModal from './feeStructureModal'
import { SessionContext } from '../../../../../Context/Seesion'
import FeeInstallmentViewModal from './FeeInstallmentViewModal'
import Loader from '../../../../../components/Loading/Loader'
import { useRoles } from '../../../../../Context/AuthContext'

const { Option } = Select

const    FeesStructure = () => {
  const { currentSession, sessionsList1, loading: sessionLoading } = useContext(SessionContext)
  const { role } = useRoles()
  const isSuperAdmin = role === 'SuperAdmin'
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [streams, setStreams] = useState([])
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewData, setViewData] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [classes, setClasses] = useState([])
  const [draftFilters, setDraftFilters] = useState({
    sessionId: null,
    classId: null,
    streamId: null,
  })
  const [appliedFilters, setAppliedFilters] = useState({
    sessionId: null,
    classId: null,
    streamId: null,
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState(null)

  /* ================= LOAD CLASSES ONLY ================= */

  useEffect(() => {
    if (!currentSession?._id) return

    // console.log('📥 Loading classes with filters')

    const url = `classes?isPagination=false&session=${currentSession._id}`

    getRequest(url)
      .then((res) => {
        // console.log('✅ Raw classes response:', res.data.data)

        const classArray = res?.data?.data?.classes || []
        setClasses(classArray)

        // console.log('✅ Classes array set:', classArray)
      })
      .catch((err) => {
        console.error('❌ Class fetch error:', err)
      })
  }, [currentSession])

  useEffect(() => {
    const selectedClass = classes.find((c) => c._id === draftFilters.classId)

    // ❌ agar class nahi ya junior hai → clear streams
    if (!draftFilters.classId || !draftFilters.sessionId || !selectedClass?.isSenior) {
      setStreams([])
      return
    }

    // ✅ sirf senior class pe API call
    const query = new URLSearchParams({
      classId: draftFilters.classId,
      session: draftFilters.sessionId,
      isPagination: false,
    }).toString()

    getRequest(`streams?${query}`)
      .then((res) => {
        setStreams(res?.data?.data?.streams || [])
      })
      .catch((err) => console.error(err))
  }, [draftFilters.classId, draftFilters.sessionId, classes])

  /* ================= AUTO SET CURRENT SESSION ================= */

  // useEffect(() => {
  //   if (currentSession?._id) {
  //     // UI ke liye
  //     setDraftFilters({
  //       sessionId: currentSession._id,
  //       classId: '',
  //       streamId: '',
  //     })

  //     // API ke liye (🔥 yahi se first load hoga)
  //     setAppliedFilters({
  //       sessionId: currentSession._id,
  //       classId: '',
  //       streamId: '',
  //     })
  //   }
  // }, [currentSession])

  useEffect(() => {
    if (currentSession?._id) {
      const base = {
        sessionId: currentSession._id,
        classId: null,
        streamId: null,
      }
      setDraftFilters(base) // UI → placeholder
      setAppliedFilters(base) // API → data
    }
  }, [currentSession])

  // const filteredStreams = draftFilters.classId
  //   ? streams.filter((s) => s.classId === draftFilters.classId)
  //   : []

  const filteredStreams = streams

  /* ================= FETCH Academic Tuition Fees ================= */

  useEffect(() => {
    if (!appliedFilters.sessionId) return
    setLoading(true)
    const params = {
      sessionId: appliedFilters.sessionId,
      page,
      limit,
    }

    if (appliedFilters.classId) {
      params.classId = appliedFilters.classId
    }

    if (appliedFilters.streamId) {
      params.streamId = appliedFilters.streamId
    }

    const query = new URLSearchParams(params).toString()

    getRequest(`fee-structures/full?${query}`)
      .then((res) => {
        const list = res?.data?.data?.list || []
        const pagination = res?.data?.data?.pagination || {}

        setData(Array.isArray(list) ? list : [])
        setTotal(pagination.totalRows || 0)
      })
      .finally(() => setLoading(false))
  }, [appliedFilters, page])

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!selectedItem) return
    const id = selectedItem.feeStructure?._id || selectedItem._id
    setDeleteLoading(true)
    try {
      await deleteRequest(`fee-structures/${id}`)
      toast.success('Academic tuition fee deleted')

      setData((prev) => prev.filter((d) => (d.feeStructure?._id || d._id) !== id))

      setShowDeleteModal(false)
      setSelectedItem(null)
    } catch (err) {
      toast.error('Delete failed')
    } finally {
      setDeleteLoading(false)
    }
  }

  /* ================= STATUS TOGGLE ================= */

  const toggleStatus = (fs) => {
    // console.log('🔁 Toggling status:', fs)

    putRequest({
      url: `fee-structures/${fs._id}`,
      cred: { isActive: !fs.isActive },
    })
      .then(() => {
        toast.success('Status updated')

        setData((prev) =>
          prev.map((d) => {
            const obj = d.feeStructure || d
            if (obj._id === fs._id) {
              return {
                ...d,
                feeStructure: {
                  ...obj,
                  isActive: !obj.isActive,
                },
              }
            }
            return d
          }),
        )
      })
      .catch((err) => {
        console.error('❌ Status update error:', err)
        toast.error('Update failed')
      })
  }
  const handleClearFilters = () => {
    if (!currentSession?._id) return

    const reset = {
      sessionId: currentSession._id,
      classId: '',
      streamId: '',
    }

    setDraftFilters(reset)
    setAppliedFilters(reset)
    setPage(1)
  }
  const selectedClass = classes.find((c) => c._id === draftFilters.classId)
  // const isStreamAllowed = selectedClass ? selectedClass.order >= 9 : false
  const isStreamAllowed = selectedClass?.isSenior || false

  return (
    <div className="min-h-screen">
      {/* ================= HEADER ================= */}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <b>{selectedItem?.feeStructure?.feeHeadName || selectedItem?.feeHeadName}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className={`px-5 py-2 text-white rounded ${
                  deleteLoading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded border mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Users className="text-[#e24028]" />
            Academic Tuition Fees
          </h1>
          <p className="text-sm text-gray-500">Manage class-wise academic tuition fees</p>
        </div>

          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-[#0c3b73] hover:bg-[#0c3b73] text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} />
            Add Academic Tuition Fees
          </button>
  
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white p-4 rounded border mb-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 leading-none">
            <Filter className="w-5 h-5 text-orange-500 translate-y-[1px]" />
            Filters & Search
          </h3>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-end">
          {/* Session */}
          {/* <div className="flex flex-col w-full sm:w-[220px]">
            <label className="text-sm font-medium mb-1">Session</label>
            <Select
              value={draftFilters.sessionId}
              disabled
              loading={sessionLoading}
              placeholder="Session"
            >
              {(sessionsList1 || []).map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.sessionName}
                </Option>
              ))}
            </Select>
          </div> */}

          {/* Class */}
          <div className="flex flex-col w-full sm:w-[220px]">
            <label className="text-sm font-medium mb-1">Class</label>
            <Select
              value={draftFilters.classId}
              placeholder="Select Class"
              allowClear
              onChange={(v) => {
                const cls = classes.find((c) => c._id === v)
                setDraftFilters((p) => ({
                  ...p,
                  classId: v ?? null,
                  streamId: cls?.isSenior ? p.streamId : null,
                }))
              }}
            >
              {classes.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Stream */}
          <div className="flex flex-col w-full sm:w-[220px]">
            <label className="text-sm font-medium mb-1">Stream</label>
            <Select
              value={draftFilters.streamId}
              placeholder="Select Stream"
              allowClear
              disabled={!draftFilters.classId || !isStreamAllowed}
              onChange={(v) =>
                setDraftFilters((p) => ({
                  ...p,
                  streamId: v ?? null,
                }))
              }
            >
              {filteredStreams.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPage(1)
                setAppliedFilters({ ...draftFilters })
              }}
              className="h-[32px] px-5 rounded bg-[#0c3b73] text-white hover:bg-[#0a2f5c] transition"
            >
              Apply
            </button>

            {(appliedFilters.classId || appliedFilters.streamId) && (
              <button
                onClick={handleClearFilters}
                className="h-[32px] px-5 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-2 text-center">
            <Loader />
            <p>Loading records...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 w-20 text-center font-semibold">Sr. No.</th>
                <th className="px-3 py-2 text-center font-semibold">Class</th>
                <th className="px-3 py-2 text-center font-semibold">Stream</th>
                {/* <th className="px-3 py-2 text-center font-semibold">Fee Head</th> */}
                <th className="px-3 py-2 text-center font-semibold">Installment</th>
                <th className="px-3 py-2 text-center font-semibold">Installment Type</th>
                <th className="px-3 py-2 text-center font-semibold">Total Amount</th>
                <th className="px-3 py-2 w-40 text-center font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(data) && data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    <Empty className="mt-2" />
                    No Records Found
                  </td>
                </tr>
              ) : (
                Array.isArray(data) &&
                data.map((row, index) => {
                  const fs = row.feeStructure || row

                  return (
                    <tr key={fs._id} className="hover:bg-gray-50">
                      {/* Sr No (pagination aware) */}
                      <td className="border px-3 py-2 text-center">
                        {(page - 1) * limit + index + 1}
                      </td>

                      <td className="border px-3 py-2 text-center">{fs.classId?.name}</td>

                      <td className="border px-3 py-2 text-center">{fs.streamId?.name || '-'}</td>

                      <td className="border px-3 py-2 text-center">{fs.feeHeadName}</td>

                      <td className="border px-3 py-2 text-center">{fs.installmentType?.name}</td>

                      <td className="border px-3 py-2 text-center font-semibold">
                        ₹ {fs.totalAmount}
                      </td>

                      {/* ACTION */}
                      <td className="border px-3 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            title="View Installments"
                            onClick={() => {
                              setViewData(row)
                              setViewModalOpen(true)
                            }}
                            className="text-green-600 hover:bg-green-600 hover:text-white p-2 rounded"
                          >
                            <Eye size={16} />
                          </button>

                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setSelectedItem(row)
                                setIsModalOpen(true)
                              }}
                              className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded"
                            >
                              <Edit size={16} />
                            </button>
                          )}

                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setSelectedItem(fs)
                                setShowDeleteModal(true)
                              }}
                              className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}

        {/* ---------- Pagination (Documents Pattern) ---------- */}
        {!loading && data?.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                results
              </div>

              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                pageSizeOptions={['5', '10', '20', '50', '100', '200', '500', '1000']}
                showSizeChanger
                // showQuickJumper
                onChange={(newPage) => setPage(newPage)}
                onShowSizeChange={(current, size) => {
                  setLimit(size)
                  setPage(1)
                }}
              />
            </div>
          </div>
        )}
      </div>

      {viewModalOpen && (
        <FeeInstallmentViewModal
          open={viewModalOpen}
          data={viewData}
          onClose={() => {
            setViewModalOpen(false)
            setViewData(null)
          }}
        />
      )}

      {isModalOpen && (
        <FeeStructureModal
          key={selectedItem?.feeStructure?._id || 'new'}
          open={isModalOpen}
          editData={selectedItem}
          onClose={() => setIsModalOpen(false)}
          refresh={() => {
            setPage(1)
            setAppliedFilters({ ...appliedFilters })
          }}
          currentSession={currentSession}
        />
      )}
    </div>
  )
}

export default FeesStructure
