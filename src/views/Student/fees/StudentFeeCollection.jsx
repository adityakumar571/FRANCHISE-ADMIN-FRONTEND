/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from 'react'
import { IndianRupee, Plus } from 'lucide-react'
import { Pagination, Empty } from 'antd'
import { AppContext } from '../../../Context/AppContext'
import { getRequest, postRequest } from '../../../Helpers'

import RenderRazorPay from '../../payment/RenderRazorPay'
import { Modal, Input, Button } from 'antd'
import Loader from '../../../components/Loading/Loader'
import FeeSummaryStats from './FeeSummaryStats'
import MonthlyInvoice from './MonthlyInvoice'
import { getLedgerRowStatus, STATUS_COLORS, STATUS_LABELS, getItemDisplayStatus } from '../../../Utils/feeUtils'
const suggestedAmounts = [100, 500, 1000, 1500, 2000, 2500, 5000, 10000]

const FeePaymentModal = ({ isModalOpen, setIsModalOpen, onPay, defaultAmount }) => {
  const [amount, setAmount] = useState(defaultAmount ? defaultAmount.toString() : '')

  useEffect(() => {
    if (isModalOpen) {
      setAmount(defaultAmount ? defaultAmount.toString() : '')
    }
  }, [isModalOpen, defaultAmount])

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      alert('Please enter valid amount')
      return
    }
    onPay(amount)
  }

   const handleAmountClick = (value) => {
    setAmount(value.toString())
  }
  return (
     <Modal
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={null}
      centered
      width={420}
      title={
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[#0c3b73]">
            Franchise Fee Payment
          </h2>
          <p className="text-xs text-gray-500">
            Secure Online Payment
          </p>
        </div>
      }
    >
      <div className="space-y-5">

        {/* Amount Input */}
        <div>
          <label className="text-sm font-medium text-gray-600">
            Enter Amount
          </label>

          <Input
            size="large"
            prefix={<IndianRupee size={18} />}
            placeholder="Enter amount"
            value={amount}
            type="number"
            min={0}
            className="mt-2 rounded-lg"
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === 'e') {
                e.preventDefault()
              }
            }}
            onChange={(e) => {
              const value = e.target.value
              if (Number(value) < 0) return
              setAmount(value)
            }}
          />
        </div>

        {/* Suggested Amount Buttons */}
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Quick Select Amount
          </p>

          <div className="grid grid-cols-4 gap-2">
            {suggestedAmounts.map((amt) => (
              <Button
                key={amt}
                type={amount === amt.toString() ? 'primary' : 'default'}
                className={`rounded-lg ${
                  amount === amt.toString()
                    ? 'bg-[#0c3b73]'
                    : ''
                }`}
                onClick={() => handleAmountClick(amt)}
              >
                ₹{amt}
              </Button>
            ))}
          </div>
        </div>

        {/* Proceed Button */}
        <Button
          type="primary"
          block
          size="large"
          className="bg-[#0c3b73] rounded-lg mt-2"
          onClick={handleSubmit}
        >
          Proceed to Pay
        </Button>

      </div>
    </Modal>

   
  )
}

const StudentFeeCollection = () => {
  const { user, tenantDetails } = useContext(AppContext)

  const studentId = user?.profile?._id
  const sessionId = user?.profile?.session?._id
  const classId = user?.profile?.currentClass?._id
  // stream could be an object or a string id — always extract _id
  const streamId = user?.profile?.stream?._id || user?.profile?.stream || null
  
  const currentClass = user?.profile?.currentClass 
const isSeniorClass = currentClass?.isSenior || false

  const [ledgerData, setLedgerData] = useState([])
  const [studentData, setStudentData] = useState(null)
  const [ledgerSummary, setLedgerSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showRazorpay, setShowRazorpay] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showMonthModal, setShowMonthModal] = useState(false)
  const [selectedMonthLedger, setSelectedMonthLedger] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null)
  const handlePayNow = async (amount) => {
    try {
      setPaymentLoading(true)
      const payload = {
        sessionId,
        studentId,
        classId,
        streamId: isSeniorClass ? streamId : null,
        amount: Number(amount), 
      }

      const res = await postRequest({
        url: 'payments/create-order',
        cred: payload,
      })

      const order = res?.data?.data
      if (!order?.orderId) throw new Error('Order creation failed')

      setOrderData(order)
      setShowRazorpay(true)
      setIsModalOpen(false)    } catch (err) {
      alert('Unable to start payment')
    } finally {
      setPaymentLoading(false)
    }
  }

  /* ---------- Senior Class Check ---------- */
  // const isSeniorClass = useMemo(() => {
  //   if (!className) return false
  //   const match = className.match(/\d+/)
  //   return match && Number(match[0]) >= 9
  // }, [className])

  /* ---------- FETCH LEDGER ---------- */
  useEffect(() => {
    if (!studentId || !sessionId || !classId) return

    let url = `student-fees/ledger?sessionId=${sessionId}&classId=${classId}&studentId=${studentId}`

    if (isSeniorClass && streamId) {
      url += `&streamId=${streamId}`
    }
    setLoading(true)
    getRequest(url)
      .then((res) => {
        const data = res.data?.data
        if (!data?.ledger) {
          setLedgerData([])
          return
        }

        setStudentData(data.student)
        setLedgerSummary(data.summary || null)
        setLedgerData(data.ledger || [])
      })
      .catch(() => setLedgerData([]))
      .finally(() => setLoading(false))
  }, [studentId, sessionId, classId, streamId, isSeniorClass, updateStatus])

  const paginatedData = ledgerData.slice((page - 1) * limit, page * limit)

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN')
  }


  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white border flex items-center justify-between rounded-lg px-4 py-3 mb-4">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <IndianRupee className="text-red-600" />
            Fee Payment
          </h1>
          <p className="text-sm text-gray-500">View your fee payment details</p>
        </div>

        {/* PAY NOW BUTTON — Razorpay integration pending, temporarily hidden
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0c3b73] text-white px-4 py-2 hover:bg-blue-800 flex items-center justify-center rounded-md text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Pay Now
        </button>
        */}
      </div>

      {/* STUDENT SUMMARY CARD */}
      <FeeSummaryStats ledgerData={ledgerData} summary={ledgerSummary} loading={loading} />

      {/* LOADING */}
      {loading ? (
        <div className="bg-white border rounded-lg p-10 text-center">
          <Loader />
          <p className="mt-3 text-gray-500">Loading fee details...</p>
        </div>
      ) : ledgerData.length === 0 ? (
        <div className="bg-white border rounded-lg p-10">
          <Empty description="No Fee Records Found" />
        </div>
      ) : (
        <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                {[
                  'Sr. No.',
                  'Month',
                  'Total Amount',
                  'Paid Amount',
                  'Due Amount',
                  'Status',
                  'Action',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-sm font-semibold text-gray-700"
                    style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((month, i) => {
                const status = getLedgerRowStatus(month)
                const statusColor = STATUS_COLORS[status]

                return (
                  <tr
                    key={month.period}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    className="hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      setSelectedMonthLedger(month)
                      setShowMonthModal(true)
                    }}
                  >
                    <td className="text-center text-sm text-gray-600" style={{ padding: '12px 16px' }}>
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className="text-center text-sm font-semibold text-gray-800" style={{ padding: '12px 16px' }}>
                      {month.period}
                    </td>
                    <td className="text-center text-sm text-gray-800" style={{ padding: '12px 16px' }}>
                      ₹{Number(month.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="text-center text-sm font-semibold text-green-600" style={{ padding: '12px 16px' }}>
                      ₹{Number(month.totalPaid || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="text-center text-sm font-semibold text-red-500" style={{ padding: '12px 16px' }}>
                      ₹{Number(month.totalDue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="text-center" style={{ padding: '12px 16px' }}>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
                        {STATUS_LABELS[status] || status}
                      </span>
                    </td>
                    <td className="text-center" style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        type="link"
                        title="Download Receipt"
                        className="text-blue-600"
                        onClick={() => {
                          setSelectedInvoiceData(month)
                          setShowInvoiceModal(true)
                        }}
                      >
                        🖨️ Print
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="p-4 flex justify-end">
            <Pagination
              current={page}
              pageSize={limit}
              total={ledgerData.length}
              pageSizeOptions={['6', '12']}
              showSizeChanger
              onChange={(newPage) => {
                setPage(newPage)
              }}
              onShowSizeChange={(_current, size) => {
                setLimit(size)
                setPage(1)
              }}
            />
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {isModalOpen && (
        <FeePaymentModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onPay={(amount) => handlePayNow(amount)}
          defaultAmount={(() => {
            const firstDue = ledgerData.find((l) => Number(l.totalDue) > 0)
            return firstDue ? Number(firstDue.totalDue) : null
          })()}
        />
      )}

      <Modal
        open={showMonthModal}
        onCancel={() => setShowMonthModal(false)}
        footer={null}
        centered
        width={660}
        destroyOnHidden
        styles={{ body: { padding: '0 0 8px 0' } }}
        title={
          <span className="text-base font-bold text-gray-800">
            {selectedMonthLedger?.period} Fee Details
          </span>
        }
      >
        {selectedMonthLedger && (() => {
          const concessionItem = selectedMonthLedger.items.find(i => i.type === 'CONCESSION')
          const concessionAmt = concessionItem ? Math.abs(Number(concessionItem.dueAmount)) : 0
          // Show all items — including CONCESSION row inline (no separate row)
          const regularItems = selectedMonthLedger.items.filter(i => i.type !== 'CONCESSION')
          const totTotal = regularItems.reduce((s, i) => s + Number(i.totalAmount || 0), 0)
          const totPaid  = regularItems.reduce((s, i) => s + Number(i.paidAmount  || 0), 0)
          const totDue   = regularItems.reduce((s, i) => s + Number(i.dueAmount   || 0), 0)
          // Net due after concession adjustment
          const concessionDueAdjustment = concessionItem ? Number(concessionItem.dueAmount || 0) : 0
          const netDue = totDue + concessionDueAdjustment // concessionDueAmount is negative
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>

                {/* ── HEADER — same look as main table ── */}
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                    {[
                      { label: 'FEE HEAD',  align: 'left'   },
                      { label: 'DUE DATE',  align: 'center' },
                      { label: 'TOTAL',     align: 'center' },
                      { label: 'PAID',      align: 'center' },
                      { label: 'DUE',       align: 'center' },
                      { label: 'STATUS',    align: 'center' },
                    ].map(({ label, align }) => (
                      <th
                        key={label}
                        className="text-sm font-semibold text-gray-700"
                        style={{ padding: '12px 16px', textAlign: align, whiteSpace: 'nowrap' }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* ── BODY ROWS ── */}
                <tbody>
                  {regularItems.map((item, idx) => {
                    const { label: itemLabel, color: itemColor } = getItemDisplayStatus(item, selectedMonthLedger)
                    const isTuition = item.type === 'TUITION' || item.feeHead?.toLowerCase().includes('tuition')
                    const showConcession = isTuition && concessionAmt > 0
                    return (
                      <tr
                        key={item.referenceId || idx}
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Fee Head */}
                        <td className="text-sm text-gray-800 font-medium" style={{ padding: '12px 16px' }}>
                          <div className="flex items-center gap-1.5">
                            {item.type === 'TRANSPORT' && <span className="leading-none flex-shrink-0">🚌</span>}
                            {item.type === 'LATE_FEE'   && <span className="leading-none flex-shrink-0">⏰</span>}
                            <span>
                              {item.feeHead}
                              {item.isWaived && (
                                <span className="ml-1 text-[11px] text-purple-500 italic font-normal">
                                  {item.waiverReason ? `(${item.waiverReason})` : '(Waived)'}
                                </span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="text-sm text-center text-gray-600 whitespace-nowrap" style={{ padding: '12px 16px' }}>
                          {formatDate(item.dueDate)}
                        </td>

                        {/* Total */}
                        <td className="text-sm text-center text-gray-800" style={{ padding: '12px 16px' }}>
                          <div>₹{Number(item.totalAmount || 0).toFixed(2)}</div>
                          {showConcession && (
                            <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                              - ₹{concessionAmt} concession
                            </div>
                          )}
                        </td>

                        {/* Paid */}
                        <td className="text-sm text-center font-semibold text-green-600" style={{ padding: '12px 16px' }}>
                          ₹{Number(item.paidAmount || 0).toFixed(2)}
                        </td>

                        {/* Due */}
                        <td className="text-sm text-center font-semibold" style={{ padding: '12px 16px' }}>
                          {item.isWaived ? (
                            <span className="text-purple-500 line-through">
                              ₹{Number(item.dueAmount || 0).toFixed(2)}
                            </span>
                          ) : showConcession ? (
                            <div>
                              <span className="text-gray-400 line-through text-xs">
                                ₹{Number(item.totalAmount || 0).toFixed(2)}
                              </span>
                              <div className="text-red-500">
                                ₹{Number(item.dueAmount || 0).toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-red-500">
                              ₹{Number(item.dueAmount || 0).toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="text-center" style={{ padding: '12px 16px' }}>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${itemColor}`}>
                            {itemLabel}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>

                {/* ── TOTAL ROW — same style as main table header ── */}
                <tfoot>
                  <tr style={{ background: '#f1f5f9', borderTop: '2px solid #e2e8f0' }}>
                    <td className="text-sm font-semibold text-gray-700" style={{ padding: '12px 16px' }}>
                      Total
                    </td>
                    <td />
                    <td className="text-sm text-center font-semibold text-gray-700" style={{ padding: '12px 16px' }}>
                      <div>₹{totTotal.toFixed(2)}</div>
                      {concessionAmt > 0 && (
                        <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                          - ₹{concessionAmt} concession
                        </div>
                      )}
                    </td>
                    <td className="text-sm text-center font-semibold text-green-600" style={{ padding: '12px 16px' }}>
                      ₹{totPaid.toFixed(2)}
                    </td>
                    <td className="text-sm text-center font-semibold text-red-500" style={{ padding: '12px 16px' }}>
                      ₹{netDue.toFixed(2)}
                    </td>
                    <td />
                  </tr>
                </tfoot>

              </table>
            </div>
          )
        })()}
      </Modal>

      {showInvoiceModal && selectedInvoiceData && (
        <Modal
          open={showInvoiceModal}
          onCancel={() => setShowInvoiceModal(false)}
          footer={null}
          width={900}
          centered
          destroyOnHidden
        >
          <MonthlyInvoice student={studentData} monthLedger={selectedInvoiceData} />
        </Modal>
      )}

      {showRazorpay && orderData && (
        <RenderRazorPay
          orderId={orderData.orderId}
          currency={orderData.currency || 'INR'}
          amount={orderData.amount}
          razorpayKey={orderData.key}
          schoolName={tenantDetails?.schoolName || tenantDetails?.name || 'Franchise Fee Payment'}
          setUpdateStatus={async (paymentResponse) => {
            try {
              await postRequest({
                url: 'payments/verify-payment',
                cred: {
                  gatewayOrderId: paymentResponse.razorpay_order_id,
                  gatewayPaymentId: paymentResponse.razorpay_payment_id,
                  gatewaySignature: paymentResponse.razorpay_signature,
                },
              })
              setShowRazorpay(false)
              setUpdateStatus((prev) => !prev)
            } catch {
              alert('Payment verification failed. Please contact support.')
              setShowRazorpay(false)
            }
          }}
          onClose={() => setShowRazorpay(false)}
        />
      )}
    </div>
  )
}

export default StudentFeeCollection
