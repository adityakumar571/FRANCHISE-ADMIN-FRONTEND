import React, { useState } from 'react'
import {
  ChevronDown,
  Plus,
  AlertTriangle,
  Upload,
  FileText,
  Presentation,
  Calendar,
  FileCheck,
} from 'lucide-react'
// ==================== Leaves.jsx ====================
const Leaves = ({ selectedClass }) => {
  const [filterStatus, setFilterStatus] = useState('all')

  const leaveRequests = [
    {
      id: 1,
      roll: '01',
      name: 'Rahul Kumar',
      startDate: '18 Jan',
      endDate: '20 Jan',
      days: 3,
      reason: 'Family function',
      status: 'pending',
    },
    {
      id: 2,
      roll: '02',
      name: 'Neha Singh',
      startDate: '15 Jan',
      endDate: '15 Jan',
      days: 1,
      reason: 'Medical checkup',
      status: 'approved',
    },
    {
      id: 3,
      roll: '03',
      name: 'Aman Verma',
      startDate: '22 Jan',
      endDate: '23 Jan',
      days: 2,
      reason: 'Sick leave',
      status: 'pending',
    },
  ]

  const filteredLeaves =
    filterStatus === 'all'
      ? leaveRequests
      : leaveRequests.filter((leave) => leave.status === filterStatus)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Classes → Leave Requests</h2>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white">
          <span className="text-sm font-medium">Class: {selectedClass}</span>
          <ChevronDown size={16} />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 bg-white text-sm font-medium"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">End Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Days</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave) => (
              <tr key={leave.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700">{leave.roll}</td>
                <td className="py-3 px-4 text-gray-700">{leave.name}</td>
                <td className="py-3 px-4 text-gray-700">{leave.startDate}</td>
                <td className="py-3 px-4 text-gray-700">{leave.endDate}</td>
                <td className="py-3 px-4 text-gray-700">{leave.days}</td>
                <td className="py-3 px-4 text-gray-600">{leave.reason}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      leave.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : leave.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {leave.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-800 font-medium">
                        Approve
                      </button>
                      <button className="text-red-600 hover:text-red-800 font-medium">
                        Reject
                      </button>
                    </div>
                  )}
                  {leave.status !== 'pending' && (
                    <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default Leaves;