/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Modal } from 'antd'
import toast from 'react-hot-toast'
import { postRequest } from '../../../../Helpers'
import { AppContext } from '../../../../Context/AppContext'
import {
  buildSingleMonthReceiptHTML,
  generateReceiptPdfBlob,
  downloadBlob,
  sharePdfOnWhatsApp,
} from './receiptUtils'

const FeePaymentModal = ({ isModalOpen, setIsModalOpen, studentData, setUpdateStatus, ledgerData }) => {
  const { user, tenantDetails } = useContext(AppContext)
  const collectedByName = user?.user?.name || user?.user?.fullName || user?.name || 'Staff'

  const [amount, setAmount] = useState(studentData?.amount || '')
  const [mode, setMode] = useState('Cash')
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const [receiptInfo, setReceiptInfo] = useState(null)
  const [showShareStep, setShowShareStep] = useState(false)
  const [pdfBlob, setPdfBlob] = useState(null)

  useEffect(() => {
    if (studentData?.amount) setAmount(studentData.amount)
  }, [studentData])

  // Auto-generate PDF after fee collected
  useEffect(() => {
    if (!showShareStep || !receiptInfo) return
    setPdfLoading(true)

    // Use the most recently paid month as the receipt (first month with totalPaid > 0)
    // Fallback: use all months combined — pick first period that matches amount paid
    const paidMonth = (ledgerData || []).find((m) => m.totalPaid > 0) || (ledgerData || [])[0]

    if (!paidMonth) {
      setPdfLoading(false)
      return
    }

    const html = buildSingleMonthReceiptHTML({
      student: {
        name:            studentData?.name            || '-',
        fatherName:      studentData?.fatherName      || '-',
        class:           studentData?.class           || studentData?.className   || '-',
        section:         studentData?.section         || studentData?.sectionName || '',
        stream:          studentData?.stream          || '',
        studentId:       studentData?.studentIdNumber || studentData?.studentId   || '',
        studentIdNumber: studentData?.studentIdNumber || '',
        formNo:          studentData?.formNo          || studentData?.registrationNo || '-',
        phone:           studentData?.phone           || '-',
      },
      month: {
        ...paidMonth,
        receiptNos: receiptInfo.receiptNo ? [receiptInfo.receiptNo] : paidMonth.receiptNos,
        paymentMode: receiptInfo.paymentMode,
      },
      tenantDetails,
      collectedByName,
      remark: receiptInfo.remark,
    })

    generateReceiptPdfBlob(html)
      .then((blob) => setPdfBlob(blob))
      .catch((err) => {
        console.error('PDF generation failed:', err)
        toast.error('Could not generate PDF receipt')
      })
      .finally(() => setPdfLoading(false))
  }, [showShareStep, receiptInfo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clerkId = user?.user?._id || user?._id || user?.id || null

    const payload = {
      clerkId,
      sessionId: studentData.sessionId,
      studentId: studentData.studentId,
      classId: studentData.classId,
      streamId: studentData.streamId,
      amountPaid: Number(amount),
      paymentMode: mode.toUpperCase(),
      remarks: remark.trim() || undefined,
    }

    try {
      setLoading(true)
      const res = await postRequest({ url: 'student-fees/collect', cred: payload })

      if (res?.status === 200 || res?.status === 201) {
        toast.success('Fee collected successfully')
        setUpdateStatus((p) => !p)
        const receiptNo = res.data?.data?.receiptNo || res.data?.receiptNo || null
        setReceiptInfo({ receiptNo, amountPaid: Number(amount), paymentMode: mode, remark: remark.trim() })
        setShowShareStep(true)
      } else {
        toast.error('Failed to collect fee')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to collect fee')
    } finally {
      setLoading(false)
    }
  }

  const getFileName = () => {
    const name = (studentData?.name || 'Receipt').replace(/\s+/g, '_')
    const no = receiptInfo?.receiptNo || 'Receipt'
    return `Fee_Receipt_${name}_${no}.pdf`
  }

  const handleDownload = () => {
    if (!pdfBlob) return
    downloadBlob(pdfBlob, getFileName())
  }

  const handleWhatsApp = async () => {
    if (!pdfBlob) return
    try {
      await sharePdfOnWhatsApp(
        pdfBlob,
        getFileName(),
        studentData?.phone || '',
        studentData?.name || '',
        {
          schoolName: tenantDetails?.schoolName || '',
          receiptNo: receiptInfo?.receiptNo,
          amountPaid: receiptInfo?.amountPaid,
          paymentMode: receiptInfo?.paymentMode,
        },
      )
    } catch (err) {
      toast.error('Share failed. Please download and share manually.')
    }
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setShowShareStep(false)
    setReceiptInfo(null)
    setPdfBlob(null)
    setRemark('')
    setMode('Cash')
  }

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <Modal open={isModalOpen} title="Collect Fee" footer={null} onCancel={handleClose} centered>
      {/* Collecting as */}
      {(user?.user?._id || user?._id) ? (
        <div className="text-xs text-gray-400 mb-2">
          Collecting as: <b>{collectedByName}</b>
        </div>
      ) : (
        <div className="text-xs text-orange-500 mb-2">
          ⚠️ Session not loaded — refresh the page if clerk ID is missing
        </div>
      )}

      {/* Student card */}
      <div className="bg-blue-50 p-3 rounded mb-3 text-sm">
        <b>{studentData.name}</b>
        <div>Class: {studentData.className}</div>
        <div>Section: {studentData.sectionName}</div>
        <div>Stream: {studentData.stream || '-'}</div>
      </div>

      {/* ── STEP 1: Collect Form ── */}
      {!showShareStep && (
        <form onSubmit={handleSubmit}>
          <label className="form-label">Amount</label>
          <div className="input-group mb-3">
            <span className="input-group-text">₹</span>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <label className="form-label">Payment Mode</label>
          <select className="form-select mb-3" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Online">Online</option>
          </select>

          <label className="form-label">
            Remark <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <textarea
            className="form-control mb-3"
            rows={2}
            placeholder="e.g. April installment, Cheque no. 123456..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            maxLength={200}
          />

          <div className="text-end">
            <button type="submit" disabled={loading} className="bg-[#0c3b73] text-white px-4 py-2 rounded">
              {loading ? 'Saving...' : 'Collect Fee'}
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 2: Share Receipt ── */}
      {showShareStep && (
        <div className="text-center py-4">
          <div className="text-green-600 text-4xl mb-2">✓</div>
          <div className="font-semibold text-gray-800 mb-1">Fee Collected Successfully</div>
          {receiptInfo?.receiptNo && (
            <div className="text-sm text-gray-500 mb-1">Receipt No: <b>{receiptInfo.receiptNo}</b></div>
          )}
          <div className="text-sm text-gray-500 mb-5">
            ₹{receiptInfo?.amountPaid} via {receiptInfo?.paymentMode}
          </div>

          {pdfLoading ? (
            <div className="flex flex-col items-center gap-2 mb-5">
              <span className="w-7 h-7 border-2 border-[#0c3b73] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Generating PDF receipt...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 items-center">
              {/* Download PDF */}
              <button
                onClick={handleDownload}
                disabled={!pdfBlob}
                className="flex items-center gap-2 bg-[#0c3b73] text-white px-6 py-2 rounded font-medium hover:bg-[#0a3060] transition-colors disabled:opacity-50 w-56 justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>

              {/* Share on WhatsApp */}
              <button
                onClick={handleWhatsApp}
                disabled={!pdfBlob}
                className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-2 rounded font-medium hover:bg-[#1ebe5d] transition-colors disabled:opacity-50 w-56 justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {canNativeShare ? 'Share on WhatsApp' : 'Download & Open WhatsApp'}
              </button>

              <button onClick={handleClose} className="text-gray-500 text-sm hover:underline mt-1">
                Skip
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

export default FeePaymentModal
