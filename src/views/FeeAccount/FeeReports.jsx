/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { IndianRupee, FileText, TrendingUp, Users, Download, Printer, Filter, XCircle, Eye } from 'lucide-react'
import { Select, DatePicker, Button, Pagination, Modal, Input } from 'antd'
import dayjs from 'dayjs'
import { getRequest, postRequest } from '../../Helpers'
import { SessionContext } from '../../Context/Seesion'
import Loader from '../../components/Loading/Loader'
import FeeReportsStats from './FeeReportsStasts'
import { AppContext } from '../../Context/AppContext'
import toast from 'react-hot-toast'
import { generateReceiptPdfBlob, sharePdfOnWhatsApp, downloadBlob, buildFeeReceiptHTML } from '../Features/Admin/FeeCollection/receiptUtils'

const { Option } = Select

const FeeReports = () => {
  const {
    currentSession,
    sessionsList1 = [],
    loading: sessionLoading = false,
  } = useContext(SessionContext)

  /* ------------------ STATES ------------------ */
  const [data, setData] = useState([])
  const [summaryApi, setSummaryApi] = useState({})
  const [loading, setLoading] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState(null)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])

  // clerk id → name map
  const [clerkMap, setClerkMap] = useState({})

  // 🔥 applied = API call ke liye
  const [appliedFilters, setAppliedFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
    fromDate: null,
    toDate: null,
    receiptNo: '',
  })

  // 🔥 draft = UI ke liye
  const [draftFilters, setDraftFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
    fromDate: null,
    toDate: null,
    receiptNo: '',
  })

  const { tenantDetails } = useContext(AppContext)

  /* ------------------ LOAD ALL CLERKS (Admin + Accountant) ------------------ */
  useEffect(() => {
    Promise.all([
      getRequest('admins?isPagination=false&role=Admin'),
      getRequest('admins?isPagination=false&role=Accountant'),
    ])
      .then(([adminRes, accRes]) => {
        const admins = adminRes?.data?.data?.data || []
        const accountants = accRes?.data?.data?.data || []
        const map = {}
        ;[...admins, ...accountants].forEach((u) => {
          if (u._id) map[u._id] = u.name || u.fullName || '-'
        })
        setClerkMap(map)
      })
      .catch(() => {})
  }, [])

  const fetchReport = async (filters, pageNo = page, pageSize = limit) => {
    try {
      setLoading(true)

      const params = {
        sessionId: filters.sessionId,
        classId: filters.classId,
        sectionId: filters.sectionId,
        fromDate: filters.fromDate ? dayjs(filters.fromDate).format('YYYY-MM-DD') : null,
        toDate: filters.toDate ? dayjs(filters.toDate).format('YYYY-MM-DD') : null,
        ...(filters.receiptNo?.trim() && { receiptNo: filters.receiptNo.trim() }),
        page: pageNo,
        limit: pageSize,
      }

      Object.keys(params).forEach((k) => params[k] == null && delete params[k])

      const query = new URLSearchParams(params).toString()
      const res = await getRequest(`reports/fee-collection?${query}`)

      setData(res?.data?.data?.list || [])
      setSummaryApi(res?.data?.data?.summary || {})
      setPagination(res?.data?.data?.pagination || null)

      setPage(res?.data?.data?.pagination?.currentPage || pageNo)
      setLimit(res?.data?.data?.pagination?.perPage || pageSize)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  /* ------------------ SESSION CHANGE ------------------ */
  useEffect(() => {
    if (!currentSession?._id) return

    const base = {
      sessionId: currentSession._id,
      classId: null,
      sectionId: null,
      fromDate: null,
      toDate: null,
      receiptNo: '',
    }

    setDraftFilters(base)
    setIsApplied(false)
    // ✅ FIX: directly call fetchReport with base filters (avoids double API call)
    fetchReport(base, 1, limit)
  }, [currentSession])

  /* ------------------ LOAD CLASSES ------------------ */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => {
        setClasses(res?.data?.data?.classes || [])
      })
      .catch(() => {
        setClasses([])
      })
  }, [currentSession])

  /* ------------------ LOAD SECTIONS ------------------ */
  useEffect(() => {
    if (!draftFilters.classId) { setSections([]); return }
    getRequest(`sections?isPagination=false&classId=${draftFilters.classId}`)
      .then((res) => setSections(res?.data?.data?.sections || res?.data?.data || []))
      .catch(() => setSections([]))
  }, [draftFilters.classId])

  const handleApply = () => {
    setIsApplied(true)
    setPage(1)
    const filters = { ...draftFilters }
    setAppliedFilters(filters)
    fetchReport(filters, 1, limit)
  }

  const handleClear = () => {
    setIsApplied(false)
    const base = {
      sessionId: currentSession?._id || null,
      classId: null,
      sectionId: null,
      fromDate: null,
      toDate: null,
      receiptNo: '',
    }
    setDraftFilters(base)
    setSections([])
    // ✅ FIX: also reset appliedFilters so next Apply uses fresh filters
    setAppliedFilters(base)
    setPage(1)
    fetchReport(base, 1, limit)
  }

  /* ------------------ SUMMARY ------------------ */
  const summary = useMemo(() => {
    const total = summaryApi?.totalCollection || 0
    const receipts = summaryApi?.totalReceipts || 0

    return {
      total,
      receipts,
      avg: receipts ? Math.round(total / receipts) : 0,
    }
  }, [summaryApi])

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-IN') : '-')

  /* ------------------ CSV ------------------ */
  const [printLoading, setPrintLoading] = useState(null) // receiptNo of item being printed
  const [whatsappLoading, setWhatsappLoading] = useState(null) // receiptNo of item being shared

  /* ------------------ VIEW DETAIL ------------------ */
  const [viewModal, setViewModal] = useState({ open: false, item: null })

  /* ------------------ CANCEL PAYMENT ------------------ */
  const [cancelModal, setCancelModal] = useState({ open: false, item: null })
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  const handleCancelClick = (item) => {
    setCancelModal({ open: true, item })
    setCancelReason('')
  }

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      toast.error('Cancellation reason is required')
      return
    }
    setCancelLoading(true)
    try {
      await postRequest({
        url: 'student-fees/cancel-payment',
        cred: { paymentId: cancelModal.item._id, reason: cancelReason.trim() },
      })
      toast.success(`Payment ₹${cancelModal.item.amountPaid} cancelled & allocations recalculated`)
      setCancelModal({ open: false, item: null })
      setCancelReason('')
      // Refresh the list
      fetchReport(isApplied ? appliedFilters : draftFilters, page, limit)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancellation failed')
    } finally {
      setCancelLoading(false)
    }
  }

  const handlePrint = async (item) => {
    try {
      setPrintLoading(item.receiptNo)

      const params = new URLSearchParams({
        sessionId: appliedFilters.sessionId || currentSession?._id,
        receiptNo: item.receiptNo,
        limit: 100,
      })
      const res = await getRequest(`reports/fee-register-detailed?${params}`)
      const breakdown = res?.data?.data?.list || []

      const clerkName = item.clerkName || clerkMap[item.clerkId] || (item.paymentType === 'ONLINE' || item.gatewayOrderId ? 'Online Payment' : '-')

      // breakdown[0] has the most accurate student data (formNo, fatherName etc from fee-register-detailed)
      const bItem = breakdown[0] || {}

      const student = {
        name:            bItem.studentName  || item.studentName  || '-',
        fatherName:      bItem.fatherName   || item.fatherName   || '-',
        class:           bItem.className    || item.className    || '-',
        section:         bItem.sectionName  || item.sectionName  || '',
        studentIdNumber: bItem.studentId    || item.studentId    || '',
        formNo:          bItem.formNo       || item.formNo       || '-',
        phone:           bItem.studentPhone || item.studentPhone || '-',
      }

      const receiptBody = buildFeeReceiptHTML({
        paymentItem: item,
        breakdown,
        student,
        tenantDetails,
        collectedByName: clerkName,
        remark: item.remarks || '',
      })

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Fee Receipt — ${item.receiptNo || ''}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 8mm; }
  html, body { font-family: Arial, sans-serif; background: #fff; width: 794px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body style="padding:0;">
  <div style="width:794px;margin:0 auto;">
    ${receiptBody}
  </div>
  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 500); };
  <\/script>
</body>
</html>`

      const receiptWindow = window.open('', '_blank', 'width=794,height=1123')
      if (!receiptWindow) { toast.error('Pop-up blocked. Please allow pop-ups for printing.'); return }
      receiptWindow.document.write(html)
      receiptWindow.document.close()
    } catch (e) {
      console.error('Print error', e)
      toast.error('Could not generate receipt')
    } finally {
      setPrintLoading(null)
    }
  }

  // ── WhatsApp share: generate receipt PDF and open WhatsApp on parent's number ──
  const handleWhatsAppShare = async (item) => {
    const phone       = item.studentPhone || ''
    const studentName = item.studentName || 'Student'
    const receiptNo   = item.receiptNo

    // Normalize phone
    const digits = phone.replace(/\D/g, '')
    let normalized = ''
    if      (digits.length === 10)                             normalized = '91' + digits
    else if (digits.length === 11 && digits.startsWith('0'))   normalized = '91' + digits.slice(1)
    else if (digits.length === 12 && digits.startsWith('91'))  normalized = digits
    else if (digits.length > 0)                                normalized = digits

    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    const msg =
      `*${tenantDetails?.schoolName || 'School'}*\n` +
      `--------------------------------\n*FEE PAYMENT RECEIPT*\n--------------------------------\n\n` +
      `Dear Parent,\n\nFee payment received for your ward.\n\n` +
      `*Student    :* ${studentName}\n*Amount     :* Rs. ${item.amountPaid}\n` +
      `*Mode       :* ${item.paymentMode || ''}\n*Receipt No :* ${receiptNo}\n*Date       :* ${today}\n\n` +
      `--------------------------------\n*Status: PAID*\nPDF receipt is attached.\n\nThank you!`

    const waUrl = normalized
      ? `https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`

    // Open WhatsApp FIRST (must be inside user-gesture, before any await)
    const waTab = window.open(waUrl, '_blank')
    if (!waTab) window.location.href = waUrl

    setWhatsappLoading(receiptNo)
    try {
      const params = new URLSearchParams({
        sessionId: appliedFilters.sessionId || currentSession?._id,
        receiptNo,
        limit: 100,
      })
      const res       = await getRequest(`reports/fee-register-detailed?${params}`)
      const breakdown = res?.data?.data?.list || []
      const clerkName = item.clerkName || clerkMap[item.clerkId] || (item.paymentType === 'ONLINE' || item.gatewayOrderId ? 'Online Payment' : '-')

      // breakdown[0] has the most accurate student data (formNo, fatherName etc)
      const bItem = breakdown[0] || {}

      const student = {
        name:            bItem.studentName  || item.studentName  || '-',
        fatherName:      bItem.fatherName   || item.fatherName   || '-',
        class:           bItem.className    || item.className    || '-',
        section:         bItem.sectionName  || item.sectionName  || '',
        studentIdNumber: bItem.studentId    || item.studentId    || '',
        formNo:          bItem.formNo       || item.formNo       || '-',
        phone:           bItem.studentPhone || item.studentPhone || '-',
      }

      const singleCopyHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Fee Receipt — ${receiptNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 6mm; }
  html, body { font-family: Arial, sans-serif; background: #fff; width: 820px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body style="padding:0;">
  <div style="width:794px;margin:0 auto;">
    ${buildFeeReceiptHTML({
      paymentItem: item,
      breakdown,
      student,
      tenantDetails,
      collectedByName: clerkName,
      remark: bItem.remarks || item.remarks || '',
    })}
  </div>
</body>
</html>`

      const blob     = await generateReceiptPdfBlob(singleCopyHTML)
      const fileName = `Fee_Receipt_${studentName.replace(/\s+/g, '_')}_${receiptNo}.pdf`
      downloadBlob(blob, fileName)
    } catch (err) {
      console.error('PDF generation error', err)
      toast.error('Could not generate PDF receipt')
    } finally {
      setWhatsappLoading(null)
    }
  }

  return (
    <>
      <div className="min-h-screen text-sm text-gray-700">
      {/* HEADER */}
      <div className="mb-4 px-4 py-2 bg-white rounded-lg border flex items-center justify-between">
        {/* LEFT CONTENT */}
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <IndianRupee className="text-red-500" /> Fee Reports
          </h1>
          <p className="text-sm text-gray-500">Automated fee collection report</p>
        </div>
      </div>

      {/* SUMMARY */}
      <FeeReportsStats summary={summary} loading={loading} />

      {/* FILTERS */}

      <div className="bg-white rounded border p-4 mb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2 relative">
          <div className="flex items-center  gap-1">
            <div className=" rounded-lg flex items-center justify-center ">
              <Filter className="w-5 h-5 text-orange-500 " />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-0">Filters & Search</h3>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* SESSION */}
          {/* <div className="flex flex-col w-full sm:w-[220px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Session</label>
            <Select
              value={draftFilters.sessionId}
              loading={sessionLoading}
              className="w-full"
              placeholder="Session"
            >
              {(sessionsList1 || []).map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.sessionName || s.name}
                </Option>
              ))}
            </Select>
          </div> */}

          {/* CLASS */}
          <div className="flex flex-col w-[200px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Class</label>
            <Select
              allowClear
              placeholder="Select Class"
              value={draftFilters.classId}
              className="w-full"
              onChange={(v) => setDraftFilters((p) => ({ ...p, classId: v || null, sectionId: null }))}
            >
              {classes.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* SECTION */}
          <div className="flex flex-col w-[200px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Section</label>
            <Select
              allowClear
              placeholder="Select Section"
              value={draftFilters.sectionId}
              className="w-full"
              disabled={!draftFilters.classId}
              onChange={(v) => setDraftFilters((p) => ({ ...p, sectionId: v || null }))}
            >
              {sections.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* FROM DATE */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">From Date</label>
            <DatePicker
              value={draftFilters.fromDate}
              onChange={(v) => setDraftFilters((p) => ({ ...p, fromDate: v }))}
              placeholder="From Date"
            />
          </div>

          {/* TO DATE */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">To Date</label>
            <DatePicker
              value={draftFilters.toDate}
              onChange={(v) => setDraftFilters((p) => ({ ...p, toDate: v }))}
              placeholder="To Date"
            />
          </div>

          {/* RECEIPT NO */}
          <div className="flex flex-col w-[180px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Receipt No</label>
            <Input
              allowClear
              placeholder="e.g. RCPT-2026-000010"
              value={draftFilters.receiptNo}
              onChange={(e) => setDraftFilters((p) => ({ ...p, receiptNo: e.target.value }))}
              onPressEnter={handleApply}
            />
          </div>

          {/* APPLY BUTTON */}
          <div className="flex items-end">
            <Button
              loading={loading}
              disabled={loading}
              className="bg-[#0c3b73] text-white hover:!bg-[#0c3b73] hover:!text-white"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>

          {/* CLEAR BUTTON */}
          {isApplied && (
            <div className="flex items-end">
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
              {[
                'Sr. No.',
                'Receipt No',
                'Student Name',
                'Class',
                'Section',
                'Payment Mode',
                'Received By',
                'Paid Amount',
                'Date',
                'Status',
                'Action',
              ].map((h) => (
                <th key={h} className="px-4 py-2 text-center text-sm font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-6">
                  No Fee Records Found
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2">{(page - 1) * limit + index + 1}</td>
                  <td className="text-center font-medium">{item.receiptNo}</td>
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {item.studentName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || '-'}
                  </td>
                  <td className="text-center">{item.className}</td>
                  <td className="text-center">{item.sectionName || '-'}</td>
                  <td className="text-center">{item.paymentMode}</td>
                  <td className="text-center text-sm">
                    {item.clerkName
                      || clerkMap[item.clerkId]
                      || (item.paymentType === 'ONLINE' || item.gatewayOrderId ? 'Online' : '-')}
                  </td>
                  <td className="text-center font-semibold text-green-600">₹{item.amountPaid}</td>
                  <td className="text-center text-sm">
                    {dayjs(item.createdAt).format('DD-MM-YYYY')}
                  </td>
                  <td className="text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.paymentStatus === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : item.paymentType === 'ONLINE' || item.gatewayOrderId
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.paymentStatus === 'CANCELLED'
                        ? 'Cancelled'
                        : item.paymentType === 'ONLINE' || item.gatewayOrderId
                        ? 'Online'
                        : 'Success'}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* VIEW */}
                      <button
                        onClick={() => setViewModal({ open: true, item })}
                        title="View"
                        className="inline-flex items-center justify-center w-7 h-7 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        <Eye size={14} />
                      </button>

                      {/* PRINT */}
                      <button
                        disabled={!!printLoading || item.paymentStatus === 'CANCELLED'}
                        onClick={() => handlePrint(item)}
                        title="Print"
                        className={`inline-flex items-center justify-center w-7 h-7 rounded border transition-colors
                          ${item.paymentStatus === 'CANCELLED'
                            ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                          }`}
                      >
                        <Printer size={14} />
                      </button>

                      {/* WHATSAPP */}
                      <button
                        disabled={whatsappLoading === item.receiptNo || item.paymentStatus === 'CANCELLED'}
                        onClick={() => handleWhatsAppShare(item)}
                        title={item.studentPhone ? `Send to ${item.studentPhone}` : 'Share on WhatsApp'}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded border transition-colors
                          ${item.paymentStatus === 'CANCELLED'
                            ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                            : whatsappLoading === item.receiptNo
                            ? 'bg-gray-50 text-gray-400 border-gray-300 cursor-wait'
                            : 'bg-white text-[#25D366] hover:bg-[#25D366] hover:text-white border-[#25D366] group'
                          }`}
                        style={
                          item.paymentStatus !== 'CANCELLED' && whatsappLoading !== item.receiptNo
                            ? { color: '#25D366', borderColor: '#25D366' }
                            : {}
                        }
                      >
                        {whatsappLoading === item.receiptNo ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="14"
                            height="14"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        )}
                      </button>

                      {/* CANCEL */}
                      {item.paymentStatus !== 'CANCELLED' && item.paymentType !== 'ONLINE' && !item.gatewayOrderId && (
                        <button
                          onClick={() => handleCancelClick(item)}
                          title="Cancel"
                          className="inline-flex items-center justify-center w-7 h-7 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* PAGINATION */}
        {pagination && (
          <div className="p-4 flex justify-end">
            <Pagination
              current={pagination?.currentPage}
              pageSize={pagination?.perPage}
              total={pagination?.totalRows}
              pageSizeOptions={['5', '10', '20', '50', '100', '200', '500', '1000']}
              showSizeChanger
              onChange={(newPage, newSize) => {
                setPage(newPage)
                setLimit(newSize)
                fetchReport(draftFilters, newPage, newSize)
              }}
              onShowSizeChange={(current, size) => {
                setLimit(size)
                setPage(1)
                fetchReport(draftFilters, 1, size)
              }}
            />
          </div>
        )}
      </div>
    </div>

    {/* ────── VIEW DETAIL MODAL ────── */}
    <Modal
      open={viewModal.open}
      title={
        <div className="flex items-center gap-2" style={{ color: '#0c3b73' }}>
          <Eye size={16} />
          <span className="font-semibold">Payment Details</span>
        </div>
      }
      footer={[
        <Button key="close" type="primary" className="!bg-[#0c3b73]" onClick={() => setViewModal({ open: false, item: null })}>
          Close
        </Button>
      ]}
      onCancel={() => setViewModal({ open: false, item: null })}
      width={520}
    >
      {viewModal.item && (
        <div className="mt-2">
          {/* STATUS CARD */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white d-flex justify-content-between align-items-center">
              <span>Payment Info</span>
              <span className={`badge ${
                viewModal.item.paymentStatus === 'CANCELLED'
                  ? 'bg-danger'
                  : viewModal.item.paymentType === 'ONLINE' || viewModal.item.gatewayOrderId
                  ? 'bg-primary'
                  : 'bg-success'
              }`}>
                {viewModal.item.paymentStatus === 'CANCELLED'
                  ? 'Cancelled'
                  : viewModal.item.paymentType === 'ONLINE' || viewModal.item.gatewayOrderId
                  ? 'Online'
                  : 'Success'}
              </span>
            </div>
            <div className="card-body p-0">
              <table className="table table-sm table-bordered mb-0">
                <tbody>
                  {[
                    ['Receipt No',     viewModal.item.receiptNo],
                    ['Student',        viewModal.item.studentName || '-'],
                    ['Class',          `${viewModal.item.className || '-'}${viewModal.item.sectionName ? ' - ' + viewModal.item.sectionName : ''}`],
                    ['Amount',         `₹${viewModal.item.amountPaid}`],
                    ['Payment Mode',   viewModal.item.paymentMode],
                    ['Received By',    viewModal.item.clerkName || clerkMap[viewModal.item.clerkId] || (viewModal.item.paymentType === 'ONLINE' || viewModal.item.gatewayOrderId ? 'Online / Razorpay' : '-')],
                    ['Date',           dayjs(viewModal.item.createdAt).format('DD MMM YYYY, hh:mm A')],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="fw-semibold text-muted" style={{ width: '40%', fontSize: 13 }}>{label}</td>
                      <td className="fw-semibold" style={{ fontSize: 13 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CANCELLATION REASON */}
          {viewModal.item.paymentStatus === 'CANCELLED' && (
            <div className="card mb-3">
              <div className="card-header !bg-[#0c3b73] text-white">Cancellation Reason</div>
              <div className="card-body" style={{ fontSize: 13 }}>
                {viewModal.item.remarks
                  ? viewModal.item.remarks.replace('[CANCELLED] ', '').replace('[CANCELLED]', '') || 'No reason provided'
                  : 'No reason provided'}
              </div>
            </div>
          )}

          {/* ONLINE GATEWAY INFO */}
          {(viewModal.item.paymentType === 'ONLINE' || viewModal.item.gatewayOrderId) && (
            <div className="card mb-3">
              <div className="card-header !bg-[#0c3b73] text-white">Gateway Info</div>
              <div className="card-body p-0">
                <table className="table table-sm table-bordered mb-0">
                  <tbody>
                    {viewModal.item.gatewayOrderId && (
                      <tr>
                        <td className="fw-semibold text-muted" style={{ width: '40%', fontSize: 13 }}>Order ID</td>
                        <td className="font-monospace" style={{ fontSize: 12 }}>{viewModal.item.gatewayOrderId}</td>
                      </tr>
                    )}
                    {viewModal.item.gatewayPaymentId && (
                      <tr>
                        <td className="fw-semibold text-muted" style={{ fontSize: 13 }}>Payment ID</td>
                        <td className="font-monospace" style={{ fontSize: 12 }}>{viewModal.item.gatewayPaymentId}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>

    {/* ────── CANCEL PAYMENT MODAL ────── */}
    <Modal
      open={cancelModal.open}
      onCancel={() => { setCancelModal({ open: false, item: null }); setCancelReason('') }}
      footer={null}
      width={480}
      title={null}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      {cancelModal.item && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2 font-semibold text-base" style={{ color: '#0c3b73' }}>
              <XCircle size={18} />
              Cancel / Reverse Payment
            </div>
            <button
              onClick={() => { setCancelModal({ open: false, item: null }); setCancelReason('') }}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {/* Receipt info card */}
            <div className="rounded-lg p-4 mb-4 text-sm space-y-1.5" style={{ backgroundColor: '#eef2f9', border: '1px solid #c8d8f0' }}>
              <div><span className="font-semibold text-gray-700">Receipt No:</span> <span>{cancelModal.item.receiptNo}</span></div>
              <div><span className="font-semibold text-gray-700">Student:</span> <span>{cancelModal.item.studentName || '-'}</span></div>
              <div><span className="font-semibold text-gray-700">Amount:</span> <span className="font-bold" style={{ color: '#0c3b73' }}>₹{cancelModal.item.amountPaid}</span></div>
              <div><span className="font-semibold text-gray-700">Date:</span> <span>{dayjs(cancelModal.item.createdAt).format('DD-MM-YYYY')}</span></div>
              <div><span className="font-semibold text-gray-700">Mode:</span> <span>{cancelModal.item.paymentMode}</span></div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-800">
              ⚠️ This will <b>reverse this payment</b> and <b>recalculate all allocations</b> for this student. Fee dues will be restored accordingly.
            </div>

            {/* Reason */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              rows={3}
              placeholder="e.g. Amount entered by mistake, duplicate entry, etc."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t flex justify-end gap-2">
            <Button
              onClick={() => { setCancelModal({ open: false, item: null }); setCancelReason('') }}
              className="px-5"
            >
              No, Keep It
            </Button>
            <Button
              type="primary"
              loading={cancelLoading}
              onClick={handleCancelConfirm}
              className="px-5 !bg-[#0c3b73] hover:!bg-[#062447]"
            >
              Yes, Cancel Payment
            </Button>
          </div>
        </div>
      )}
    </Modal>
    </>
  )
}

/* ------------------ COMPONENTS ------------------ */

const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-white border rounded-lg p-3 flex justify-between">
    <div>
      <p className="text-gray-500">{title}</p>
      <p className="font-semibold">{value}</p>
    </div>
    {icon}
  </div>
)

const Th = ({ children }) => <th className="px-4 py-2 text-left">{children}</th>

export default FeeReports
