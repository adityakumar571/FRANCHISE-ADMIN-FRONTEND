
import { Modal, Divider, Table, Tag, Spin } from 'antd'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'

const FeePaymentViewModal = ({ isModalOpen, setIsModalOpen, selectedStudent }) => {
  const [loading, setLoading] = useState(false)
const [ledger, setLedger] = useState({})
const [studentInfo, setStudentInfo] = useState(null)

  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    due: 0,
  })

  useEffect(() => {
    if (isModalOpen && selectedStudent) {
      fetchLedger()
    }
  }, [isModalOpen, selectedStudent])

  const fetchLedger = async () => {
    try {
      setLoading(true)

      const res = await getRequest(
        `/api/student-fees/ledger?sessionId=${selectedStudent.sessionId}&classId=${selectedStudent.classId}&studentId=${selectedStudent.studentId}`,
      )

      const data = res?.data || {}
      setLedger(data)

      // 🔢 Summary calculation
      let total = 0
      let paid = 0
      let due = 0

      Object.values(data).forEach((m) => {
        total += m.totalAmount
        paid += m.totalPaid
        due += m.totalDue
      })

      setSummary({ total, paid, due })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedStudent) return null

  return (
    <Modal
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={null}
      width={900}
      centered
      title="Student Fee Ledger"
    >
      {/* Student Info */}
      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <p><b>Name:</b> {selectedStudent.name}</p>
        <p><b>Father:</b> {selectedStudent.father}</p>
        <p><b>Total Fee:</b> ₹{summary.total}</p>
        <p className="text-green-600"><b>Paid:</b> ₹{summary.paid}</p>
        <p className="text-red-600"><b>Pending:</b> ₹{summary.due}</p>
      </div>

      <Divider />

      {loading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        Object.keys(ledger).map((month) => (
          <div key={month} className="mb-6">
            <h3 className="font-semibold mb-2">{month}</h3>

            <Table
              size="small"
              pagination={false}
              rowKey="referenceId"
              dataSource={ledger[month].items}
              columns={[
                {
                  title: 'Fee Head',
                  dataIndex: 'feeHead',
                },
                {
                  title: 'Type',
                  dataIndex: 'type',
                },
                {
                  title: 'Period',
                  dataIndex: 'period',
                },
                {
                  title: 'Due Date',
                  render: (_, r) => dayjs(r.dueDate).format('DD MMM YYYY'),
                },
                {
                  title: 'Total',
                  render: (_, r) => `₹${r.totalAmount}`,
                },
                {
                  title: 'Paid',
                  render: (_, r) => `₹${r.paidAmount}`,
                },
                {
                  title: 'Due',
                  render: (_, r) => `₹${r.dueAmount}`,
                },
                {
                  title: 'Status',
                  render: (_, r) => (
                    <Tag
                      color={
                        r.status === 'PAID'
                          ? 'green'
                          : r.status === 'WAIVED'
                          ? 'purple'
                          : r.status === 'ADJUSTMENT'
                          ? 'blue'
                          : r.status === 'PARTIAL'
                          ? 'orange'
                          : 'red'
                      }
                    >
                      {r.status}
                    </Tag>
                  ),
                },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4}><b>Month Total</b></Table.Summary.Cell>
                  <Table.Summary.Cell>₹{ledger[month].totalAmount}</Table.Summary.Cell>
                  <Table.Summary.Cell>₹{ledger[month].totalPaid}</Table.Summary.Cell>
                  <Table.Summary.Cell>₹{ledger[month].totalDue}</Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              )}
            />
          </div>
        ))
      )}
    </Modal>
  )
}

export default FeePaymentViewModal
