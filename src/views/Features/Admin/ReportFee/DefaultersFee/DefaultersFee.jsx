/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { IndianRupee, Filter } from 'lucide-react'
import { Select, Button, Empty, Pagination } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import ExportButton from '../../../../ExportExcelButton'

const { Option } = Select

/* ================= INSTALLMENT PERIOD MAP ================= */

const INSTALLMENT_PERIODS = {
  MONTHLY: [
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
    'JANUARY',
    'FEBRUARY',
    'MARCH',
  ],
  QUARTERLY: ['APR-JUN', 'JUL-SEP', 'OCT-DEC', 'JAN-MAR'],
  CUSTOM_10: [
    'APRIL',
    'MAY-JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
    'JANUARY',
    'FEB-MARCH',
  ],
}

const DefaultersFee = () => {
  const { currentSession } = useContext(SessionContext)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])

  const [isApplied, setIsApplied] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  /* ================= INSTALLMENT STATE ================= */

  const [installmentTypes, setInstallmentTypes] = useState([])
  const [activeInstallmentType, setActiveInstallmentType] = useState(null)

  const getPeriodsByInstallment = () => {
    if (!activeInstallmentType) return []
    const typeName = activeInstallmentType.name?.toUpperCase()
    return INSTALLMENT_PERIODS[typeName] || []
  }

  /* ================= FETCH INSTALLMENT TYPE ================= */

  useEffect(() => {
    getRequest('installment-type/active?isActive=true')
      .then((res) => {
        const types = res?.data?.data || []
        setInstallmentTypes(types)

        if (types.length > 0) {
          setActiveInstallmentType(types[0]) // ✅ same as modal
        }
      })
      .catch(() => {
        console.log('Failed to load installment types')
      })
  }, [])

  /* ================= FILTER STATE ================= */

  const [draftFilters, setDraftFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
    month: null,
  })

  const [appliedFilters, setAppliedFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
    month: null,
  })

  /* ---------------- SESSION CHANGE ---------------- */

  useEffect(() => {
    if (!currentSession?._id) return

    const base = {
      sessionId: currentSession._id,
      classId: null,
      sectionId: null,
      month: null,
    }

    setDraftFilters(base)
    setAppliedFilters(base)
  }, [currentSession])

  /* ---------------- FETCH CLASSES ---------------- */

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => setClasses([]))
  }, [currentSession])

  /* ---------------- FETCH SECTIONS on class change ---------------- */

  useEffect(() => {
    if (!draftFilters.classId) { setSections([]); return }
    getRequest(`sections?classId=${draftFilters.classId}&isPagination=false`)
      .then((res) => setSections(res?.data?.data?.sections || []))
      .catch(() => setSections([]))
  }, [draftFilters.classId])

  /* ---------------- FETCH REPORT ---------------- */

  const fetchReport = async (filters, pageNo = page, pageSize = limit) => {
    try {
      setLoading(true)

      const params = {
        sessionId: filters.sessionId,
        classId: filters.classId,
        sectionId: filters.sectionId,
        month: filters.month,
        page: pageNo,
        limit: pageSize,
      }

      Object.keys(params).forEach((k) => params[k] == null && delete params[k])

      const query = new URLSearchParams(params).toString()

      const res = await getRequest(`reports/fee-defaulters-monthwise?${query}`)

      const list = res?.data?.data?.list || []
      const pagination = res?.data?.data?.pagination || {}

      setData(list)
      setTotal(pagination?.totalRows || 0)
      setPage(pagination?.currentPage || pageNo)
      setLimit(pagination?.perPage || pageSize)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!appliedFilters.sessionId) return
    fetchReport(appliedFilters, page, limit)
  }, [appliedFilters])

  /* ---------------- HANDLERS ---------------- */

  const handleApply = () => {
    setIsApplied(true)
    setPage(1)
    setAppliedFilters({ ...draftFilters })
  }

  const handleClear = () => {
    const reset = {
      sessionId: currentSession?._id || null,
      classId: null,
      sectionId: null,
      month: null,
    }

    setIsApplied(false)
    setDraftFilters(reset)
    setAppliedFilters(reset)
    setPage(1)
  }
  return (
    <div className="min-h-screen ">
      {/* HEADER */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="text-red-500" /> Defaulter List (Summary)
            </h1>
            <p className="text-sm text-gray-500">Students who have not paid their fees</p>
          </div>
          <ExportButton
            data={data.map((item, i) => ({
              'Sr. No.': i + 1,
              'Student ID': item.studentId,
              'Student Name': item.studentName,
              'Father Name': item.fatherName || '-',
              'Phone': item.phone || '-',
              'Address': item.address || '-',
              'Class': item.className || '-',
              'Section': item.sectionName || '-',
              'Due Months': item.dueMonths || '-',
              'Total Fee': item.totalFee,
              'Total Paid': item.totalPaid,
              'Transport': Object.values(item.feeHeadsByPeriod || {}).flat().filter(h => h.type === 'TRANSPORT').reduce((s, h) => s + (h.totalAmount || 0), 0),
              'Late Fee': item.lateFee ?? 0,
              'Total Balance': item.totalDue,
            }))}
            fileName="DefaultersFee.xlsx"
            sheetName="Defaulters Fee"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* CLASS */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Class</label>
            <Select
              allowClear
              placeholder="Select Class"
              value={draftFilters.classId}
              className="w-[180px]"
              onChange={(v) => setDraftFilters((p) => ({ ...p, classId: v || null, sectionId: null }))}
            >
              {classes.map((c) => (
                <Option key={c._id} value={c._id}>{c.name}</Option>
              ))}
            </Select>
          </div>

          {/* SECTION */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Section</label>
            <Select
              allowClear
              placeholder="Select Section"
              value={draftFilters.sectionId}
              className="w-[150px]"
              disabled={!draftFilters.classId}
              onChange={(v) => setDraftFilters((p) => ({ ...p, sectionId: v || null }))}
            >
              {sections.map((s) => (
                <Option key={s._id} value={s._id}>{s.name}</Option>
              ))}
            </Select>
          </div>

          {/* PERIOD */}
          <div className="flex flex-col">
            <label className="text font-medium text-gray-600 mb-1">Due Month</label>
            <Select
              allowClear
              placeholder="Select Month"
              value={draftFilters.month}
              className="w-[180px]"
              onChange={(v) => setDraftFilters((p) => ({ ...p, month: v }))}
            >
              {getPeriodsByInstallment().map((p) => (
                <Option key={p} value={p}>{p}</Option>
              ))}
            </Select>
          </div>

          {/* APPLY */}
          <div className="flex flex-col">
            <label className="text-xs opacity-0 mb-1">Action</label>
            <Button
              loading={loading}
              disabled={loading}
              className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>

          {/* CLEAR */}
          {isApplied && (
            <div className="flex flex-col">
              <label className="text-xs opacity-0 mb-1">Action</label>
              <Button className="border" onClick={handleClear}>
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}

      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center">
            <Loader />
          </div>
        )}

        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="w-20 py-2 text-center">Sr. No.</th>
              <th className="px-4 py-2 text-center">Student ID</th>
              <th className="px-4 py-2 text-center">Student Name</th>
              <th className="px-4 py-2 text-center">Father Name</th>
              <th className="px-4 py-2 text-center">Phone</th>
              <th className="px-4 py-2 text-center">Address</th>
              <th className="px-4 py-2 text-center">Class</th>
              <th className="px-4 py-2 text-center">Section</th>
              <th className="px-4 py-2 text-center">Due Months</th>
              <th className="px-4 py-2 text-center">Total Fee</th>
              <th className="px-4 py-2 text-center">Total Paid</th>
              <th className="px-4 py-2 text-center">Transport</th>
              <th className="px-4 py-2 text-center">Late Fee</th>
              <th className="px-4 py-2 text-center">Total Balance</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="14" className="text-center py-6">
                  <Empty description="No Records Found" />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2 w-20">{(page - 1) * limit + index + 1}</td>
                  <td className="text-center">{item.studentId}</td>
                  <td className="text-center font-semibold">{item.studentName}</td>
                  <td className="text-center">{item.fatherName || '-'}</td>
                  <td className="text-center">{item.phone || '-'}</td>
                  <td className="text-center">{item.address || '-'}</td>
                  <td className="text-center">{item.className || '-'}</td>
                  <td className="text-center">{item.sectionName || '-'}</td>
                  <td className="text-center">{item.dueMonths || '-'}</td>
                  <td className="text-center font-semibold">₹{item.totalFee}</td>
                  <td className="text-center font-semibold">₹{item.totalPaid}</td>
                  <td className="text-center font-semibold">
                    ₹{Object.values(item.feeHeadsByPeriod || {}).flat().filter(h => h.type === 'TRANSPORT').reduce((s, h) => s + (h.totalAmount || 0), 0)}
                  </td>
                  <td className="text-center font-semibold">₹{item.lateFee ?? 0}</td>
                  <td className="text-center font-semibold">₹{item.totalDue}</td>
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
              pageSizeOptions={['5', '10', '20', '50', '100']}
              showSizeChanger
              onChange={(newPage, newSize) => { setPage(newPage); setLimit(newSize); fetchReport(appliedFilters, newPage, newSize) }}
              onShowSizeChange={(current, size) => {
                setLimit(size)
                setPage(1)
                fetchReport(appliedFilters, 1, size)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default DefaultersFee
