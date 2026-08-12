/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { IndianRupee, Printer } from 'lucide-react'
import { Pagination, Empty } from 'antd'
import { AppContext } from '../../../Context/AppContext'
import { getRequest } from '../../../Helpers'
import Loader from '../../../components/Loading/Loader'
import FeeReportStats from './FeeReportStats'
import {
  buildFeeReceiptPageHTML,
  buildFeeReceiptHTML,
  generateReceiptPdfBlob,
  downloadBlob,
  sharePdfOnWhatsApp,
} from '../../Features/Admin/FeeCollection/receiptUtils'

const StudentFeeCollectionReport = () => {
  const { user } = useContext(AppContext)
  const { tenantDetails } = useContext(AppContext)
  const studentId = user?.profile?._id
  const sessionId = user?.profile?.session?._id

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [summary, setSummary] = useState(null)
  const [whatsappLoading, setWhatsappLoading] = useState(null)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    if (!studentId || !sessionId) return

    setLoading(true)
    getRequest(
      `reports/fee-collection?sessionId=${sessionId}&studentId=${studentId}&page=${page}&limit=${limit}`,
    )
      .then((res) => {
        const data = res?.data?.data
        setList(data?.list || [])
        setSummary(data?.summary || null)
      })
      .catch(() => {
        setList([])
        setSummary(null)
      })
      .finally(() => setLoading(false))
  }, [studentId, sessionId, page, limit])

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-IN') : '-')

  // Build student object from user profile for the receipt
  const getStudentObj = (item) => ({
    name:       user?.profile ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() : (item.studentName || '-'),
    fatherName: user?.profile?.fatherName || '-',
    class:      item.className || '-',
    section:    item.sectionName || '-',
    stream:     item.stream || '',
    studentId:  user?.profile?.studentId || '-',
    formNo:     user?.profile?.formNo || '-',
    phone:      user?.profile?.phone || user?.profile?.guardianPhone || '-',
  })

  const handlePrintReceipt = (item) => {
    const receiptWindow = window.open('', '_blank', 'width=794,height=1123')
    if (!receiptWindow) return

    const html = buildFeeReceiptPageHTML({
      paymentItem: item,
      breakdown:   [],          // no breakdown from collection-report API
      student:     getStudentObj(item),
      tenantDetails,
      collectedByName: item.clerkName || (item.gatewayOrderId ? 'Online Payment' : '-'),
    })

    receiptWindow.document.write(html)
    receiptWindow.document.close()
  }

  const handleWhatsAppReceipt = async (item) => {
    setWhatsappLoading(item._id)
    try {
      const html = buildSingleMonthReceiptHTML
        ? undefined
        : undefined  // not needed — we use buildFeeReceiptHTML directly

      // Build a single-copy HTML for PDF
      const singleHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>Receipt</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  html, body { background:#fff; width:794px; }
  body { font-family:Arial,sans-serif; font-size:12px; padding:8px; }
</style>
</head><body>
<div id="receipt" style="width:778px;margin:0 auto;">
  ${buildFeeReceiptHTML({
    paymentItem: item,
    breakdown:   [],
    student:     getStudentObj(item),
    tenantDetails,
    collectedByName: item.clerkName || (item.gatewayOrderId ? 'Online Payment' : '-'),
    copyLabel: 'STUDENT COPY',
  })}
</div></body></html>`

      const blob = await generateReceiptPdfBlob(singleHTML)
      const fileName = `Fee_Receipt_${(getStudentObj(item).name).replace(/\s+/g, '_')}_${item.receiptNo}.pdf`
      await sharePdfOnWhatsApp(blob, fileName, getStudentObj(item).phone, getStudentObj(item).name, {
        schoolName:  tenantDetails?.schoolName || '',
        amountPaid:  item.amountPaid,
        paymentMode: item.paymentMode,
        receiptNo:   item.receiptNo,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setWhatsappLoading(null)
    }
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <IndianRupee className="text-red-600" />
          Payment History
        </h1>
        <p className="text-sm text-gray-500">View all your payment receipts</p>
      </div>

      {/* SUMMARY */}
      <FeeReportStats summary={summary} loading={loading} />

      {/* LOADING */}
      {loading ? (
        <div className="bg-white border rounded-lg p-10 text-center">
          <Loader />
          <p className="mt-3 text-gray-500">Loading report...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white border rounded-lg p-10">
          <Empty description="No Fee Collection Found" />
        </div>
      ) : (
        <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-200">
              <tr>
                {[
                  'Sr. No.',
                  'Receipt No',
                  'Date',
                  'Class',
                  'Payment Mode',
                  'Amount Paid',
                  'Payment Status',
                  'Collected By',
                  'Action',
                ].map((h) => (
                  <th key={h} className="px-4 py-2 text-center text-sm font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {list.map((item, i) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2">{(page - 1) * limit + i + 1}</td>
                  <td className="text-center">{item.receiptNo}</td>
                  <td className="text-center text-sm">{formatDate(item.createdAt)}</td>
                  <td className="text-center">{item.className}</td>
                  <td className="text-center">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {item.paymentMode}
                    </span>
                  </td>
                  <td className="text-center text-green-600 font-medium">₹{item.amountPaid}</td>
                  <td
                    className={`text-center text-sm font-medium ${
                      item.paymentStatus?.toLowerCase() === 'success'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {item.paymentStatus}
                  </td>

                  <td className="text-center">{item.clerkName || '-'}</td>

                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Print */}
                      <button
                        onClick={() => handlePrintReceipt(item)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {/* WhatsApp */}
                      <button
                        disabled={whatsappLoading === item._id}
                        onClick={() => handleWhatsAppReceipt(item)}
                        title="Share on WhatsApp"
                        className={`inline-flex items-center justify-center w-7 h-7 rounded border transition-colors
                          ${whatsappLoading === item._id
                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-wait'
                            : 'bg-white text-[#25D366] hover:bg-[#25D366] hover:text-white border-[#25D366]'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 flex justify-end">
            <Pagination
              current={page}
              pageSize={limit}
              total={summary?.totalReceipts || 0}
              pageSizeOptions={['5', '10', '20', '50', '100', '200', '500', '1000']}
              showSizeChanger
              onChange={(newPage) => {
                setPage(newPage)
              }}
              onShowSizeChange={(current, size) => {
                setLimit(size)
                setPage(1)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentFeeCollectionReport
