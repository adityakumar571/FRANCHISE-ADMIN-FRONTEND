import React from 'react'
import { Modal, Tag } from 'antd'

const FeeInstallmentViewModal = ({ open, onClose, data }) => {
  if (!data) return null

  const { feeStructure, installments } = data

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title={`Installments - ${feeStructure?.classId?.name} | ${feeStructure?.feeHeadName}`}
      
    >
      <div className="mb-3 text-sm text-gray-600">
        <b>Total Amount:</b> ₹ {feeStructure.totalAmount} <br />
        <b>Installment Type:</b> {feeStructure.installmentType}
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Sr.No</th>
            <th className="p-2 border">Period</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Due Date</th>
            {/* <th className="p-2 border">Status</th> */}
          </tr>
        </thead>
        <tbody>
          {installments.map((ins, i) => (
            <tr key={ins._id} className="text-center">
              <td className="p-2 border">{i + 1}</td>
              <td className="p-2 border">{ins.period}</td>
              <td className="p-2 border">₹ {ins.amount}</td>
              <td className="p-2 border">
                {new Date(ins.dueDate).toLocaleDateString()}
              </td>
              {/* <td className="p-2 border">
                <Tag color={ins.status === 'PAID' ? 'green' : 'orange'}>
                  {ins.status}
                </Tag>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}

export default FeeInstallmentViewModal
