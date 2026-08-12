// /* eslint-disable no-unused-vars */
// import React, { useContext, useState } from 'react'
// import { Search, Eye, Plus, DollarSign, IndianRupee, IndianRupeeIcon } from 'lucide-react'
// import { Pagination } from 'antd'
// import FeePaymentModal from '../../modals/FeePaymentModal.jsx'
// import ExportButton from '../../components/ExportButton.jsx'
// import FeePaymentViewModal from '../../modals/FeePaymentViewModa.jsx'
// import { SessionContext } from '../../Context/Seesion.js'

// const FeeCollection = () => {
//   const getCurrentSession = () => {
//     const year = new Date().getFullYear()
//     return `${year}-${String(year + 1).slice(-2)}`
//   }

//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedClass, setSelectedClass] = useState('Select Class')
//   const [selectedSection, setSelectedSection] = useState('Select Section')
//   const [selectedSession, setSelectedSession] = useState(getCurrentSession())
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false)
//   const { currentSession, sessionsList } = useContext(SessionContext)
//   const [session, setSession] = useState('')
//   const [students, setStudents] = useState([
//     {
//       id: 1,
//       name: 'Rajesh Kumar',
//       father: 'Suresh Kumar',
//       class: 'Class 5',
//       section: 'A',
//       roll: '2501',
//       session: '2024-25',
//       totalFee: 45000,
//       payments: [
//         {
//           date: '2024-04-10',
//           amount: 25000,
//           mode: 'Cash',
//           receipt: 'RCPT1001',
//           installment: '1',
//           month: 'April',
//         },
//       ],
//     },
//     {
//       id: 2,
//       name: 'Amrita Sharma',
//       father: 'Ramesh Sharma',
//       class: 'Class 3',
//       section: 'B',
//       roll: '2302',
//       session: '2025-26',
//       totalFee: 43000,
//       payments: [],
//     },
//     {
//       id: 2,
//       name: 'Ankita Sharma',
//       father: 'Ramesh Sharma',
//       class: 'Class 6',
//       section: 'B',
//       roll: '2302',
//       session: '2026-27',
//       totalFee: 43000,
//       payments: [],
//     },
//   ])
//   const [page, setPage] = useState(1)
//   const [limit, setLimit] = useState(10)
//   const [selectedStudent, setSelectedStudent] = useState(null)
//   const [isModalOpen, setIsModalOpen] = useState(false)

//   const classes = ['Select Class', ...new Set(students.map((s) => s.class))]
//   const sections = ['Select Section', ...new Set(students.map((s) => s.section))]
//   const sessions = [
//     'Select Session',
//     '2022-23',
//     '2023-24',
//     '2024-25', 
//     '2025-26',
//     '2026-27',
//   ]

//   const getPaid = (s) => s.payments.reduce((sum, p) => sum + p.amount, 0)
//   const getPending = (s) => s.totalFee - getPaid(s)
//   const getStatus = (s) =>
//     getPaid(s) === 0 ? 'Unpaid' : getPaid(s) < s.totalFee ? 'Partial' : 'Paid'

//   const filteredData = students.filter(
//     (s) =>
//       (selectedClass === 'Select Class' || s.class === selectedClass) &&
//       (selectedSection === 'Select Section' || s.section === selectedSection) &&
//       (selectedSession === 'Select Session' || s.session === selectedSession) &&
//       (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll.includes(searchTerm)),
//   )

//   const paginatedData = filteredData.slice((page - 1) * limit, page * limit)

//   return (
//     <div className="min-h-screen">
//       {/* Header */}
//       <div className="text-black px-4 py-2 bg-white rounded-lg border border-blue-100 mb-6">
//         <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
//           <div>
//             <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
//               <IndianRupeeIcon className="text-[#e24028]"  />
//               Fee Collection
//             </h1>
//             <p className="text-sm text-gray-500 mt-0.5">Automated fees tracking system</p>
//           </div>
//           {/* <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
//             <ExportButton
//               paginatedData={paginatedData}
//               fileName="Fee Collection.xlsx"
//               sheetName="Fee Collection"
//             />
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="bg-green-500 text-white px-4 py-2 hover:bg-green-600 flex items-center justify-center rounded-md text-sm font-semibold w-full sm:w-auto"
//             >
//               <Plus className="w-4 h-4 mr-2" /> Add Fee
//             </button>
//           </div> */}
//         </div>
//       </div>

//       {/* Filter Bar */}
//       <div className="px-6 py-4 mb-4 bg-white text-sm rounded-lg border border-blue-100 flex flex-wrap gap-4">
//         <div className="flex flex-col w-40">
//           <label  className='mb-2' >Search</label>
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value)
//                 setPage(1)
//               }}
//               className="pl-10 pr-2 py-1.5 border rounded-md w-full text-sm"
//             />
//           </div>
//         </div>
//         <div className="flex flex-col w-40">
//           <label  className='mb-2'>Session</label>
//           {/* <select
//             value={selectedSession}
//             onChange={(e) => setSelectedSession(e.target.value)}
//             className="border rounded-md py-1 px-2"
//           >
//             {sessionsList.map((s) => (
//               <option key={s}>{s}</option>
//             ))}
//           </select> */}
//           <select
//             value={session}
//             onChange={(e) => setSession(e.target.value)}
//             className="border rounded-md  px-2 py-1.5"
//           >
//             <option value="">Select</option>
//             {sessionsList.map((s) => (
//               <option key={s._id} value={s._id}>
//                 {s.sessionName}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="flex flex-col w-40">
//           <label  className='mb-2'>Class</label>
//           <select
//             value={selectedClass}
//             onChange={(e) => setSelectedClass(e.target.value)}
//             className="border rounded-md py-1.5 px-2"
//           >
//             {classes.map((c) => (
//               <option key={c}>{c}</option>
//             ))}
//           </select>
//         </div>
//         <div className="flex flex-col w-40">
//           <label className='mb-2'>Section</label>
//           <select
//             value={selectedSection}
//             onChange={(e) => setSelectedSection(e.target.value)}
//             className="border rounded-md py-1.5 px-2"
//           >
//             {sections.map((s) => (
//               <option key={s}>{s}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto bg-white rounded-lg border border-blue-100">
//         {paginatedData.length === 0 ? (
//           <div className="flex flex-col justify-center items-center py-20 text-gray-500">
//             <IndianRupeeIcon className="w-16 h-16 mb-4" />
//             <p>No students found</p>
//           </div>
//         ) : (
//           <table className="min-w-full border border-gray-300 table-fixed">
//             <thead className="bg-gray-200 text-gray-600">
//               <tr>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Sr. No.</th>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Student</th>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Class</th>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Section</th>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Session</th>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Total</th>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Paid</th>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Pending</th>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Status</th>
//                 <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {paginatedData.map((s, index) => {
//                 const status = getStatus(s)
//                 const statusColor =
//                   status === 'Paid'
//                     ? 'bg-green-100 text-green-800'
//                     : status === 'Partial'
//                       ? 'bg-orange-100 text-orange-800'
//                       : 'bg-red-100 text-red-800'
//                 return (
//                   <tr key={s.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-4 py-2 text-center text-sm">
//                       {(page - 1) * limit + (index + 1)}
//                     </td>
//                     <td className="px-4 py-2 text-center text-sm font-medium">{s.name}</td>
//                     <td className="px-4 py-2 text-center text-sm">{s.class}</td>
//                     <td className="px-4 py-2 text-center text-sm">{s.section}</td>
//                     <td className="px-4 py-2 text-center text-sm">{s.session}</td>
//                     <td className="px-4 py-2 text-center text-sm">₹{s.totalFee}</td>
//                     <td className="px-4 py-2 text-center text-sm text-green-600">₹{getPaid(s)}</td>
//                     <td className="px-4 py-2 text-center text-sm text-red-600">₹{getPending(s)}</td>
//                     <td className="px-4 py-2 text-center text-sm">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
//                         {status}
//                       </span>
//                     </td>
//                     {/* Actions */}
//                     <td className="px-4 py-2 text-center">
//                       <div className="flex justify-center gap-2">
//                         {/* View */}
//                         <button
//                           onClick={() => {
//                             setSelectedStudent(s)
//                             setIsViewModalOpen(true) // separate state for view modal
//                           }}
//                           className="text-blue-600 hover:text-white hover:bg-blue-600 rounded-full p-2"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>

//                         {/* Add Fee */}
//                         <button
//                           onClick={() => {
//                             setSelectedStudent(s)
//                             setIsModalOpen(true) // existing add fee modal
//                           }}
//                           className="text-green-600 hover:text-white hover:bg-green-600 rounded-full p-2"
//                         >
//                           <Plus className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )
//               })}
//             </tbody>
//           </table>
//         )}
//         {/* Pagination */}
//         {paginatedData.length > 0 && (
//           <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
//             <Pagination
//               current={page}
//               pageSize={limit}
//               total={filteredData.length}
//               pageSizeOptions={['5', '10', '20', '50']}
//               onChange={setPage}
//               showSizeChanger
//               onShowSizeChange={(c, size) => {
//                 setLimit(size)
//                 setPage(1)
//               }}
//             />
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <FeePaymentModal
//           isModalOpen={isModalOpen}
//           setIsModalOpen={setIsModalOpen}
//           selectedStudent={selectedStudent}
//           setStudents={setStudents}
//         />
//       )}

//       {/* View Modal */}
//       {isViewModalOpen && (
//         <FeePaymentViewModal
//           isModalOpen={isViewModalOpen}
//           setIsModalOpen={setIsViewModalOpen}
//           selectedStudent={selectedStudent}
//         />
//       )}
//     </div>
//   )
// }

// export default FeeCollection
