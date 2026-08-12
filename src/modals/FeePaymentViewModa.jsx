// import { Modal, Divider, Table } from 'antd'
// import React from 'react'

// const FeePaymentViewModal = ({ isModalOpen, setIsModalOpen, selectedStudent }) => {
//   if (!selectedStudent) return null

//   const getPaid = (s) => s.payments.reduce((sum, p) => sum + p.amount, 0)
//   const getPending = (s) => s.totalFee - getPaid(s)

//   return (
//     <Modal
//       open={isModalOpen}
//       onCancel={() => setIsModalOpen(false)}
//       footer={null}
//       title="Student Fee Details"
//       width={620}
//       centered
//     >
//       <div className="grid grid-cols-2 gap-y-1 text-sm mb-3">
//         <p>
//           <b>Name:</b> {selectedStudent.name}
//         </p>
//         <p>
//           <b>Father:</b> {selectedStudent.father}
//         </p>
//         <p>
//           <b>Total Fee:</b> ₹{selectedStudent.totalFee}
//         </p>
//         <p>
//           <b>Paid:</b> ₹{getPaid(selectedStudent)}
//         </p>
//         <p>
//           <b>Pending:</b> ₹{getPending(selectedStudent)}
//         </p>
//       </div>

//       <Divider />

//       <Table
//         size="small"
//         pagination={false}
//         dataSource={selectedStudent.payments}
//         rowKey={(r, i) => i}
//         locale={{ emptyText: 'No payment done' }}
//         columns={[
//           { title: 'Date', dataIndex: 'date' },
//           { title: 'Amount', render: (r) => `₹${r.amount}` },
//           { title: 'Mode', dataIndex: 'mode' },
//           { title: 'Receipt', dataIndex: 'receipt' },
//           { title: 'Inst', dataIndex: 'installment' },
//           { title: 'Month', dataIndex: 'month' },
//         ]}
//       />
//     </Modal>
//   )
// }

// export default FeePaymentViewModal
