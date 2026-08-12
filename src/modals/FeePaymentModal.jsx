// /* eslint-disable react-hooks/immutability */
// import React, { useEffect, useState } from 'react'
// import { Modal } from 'antd'
// import toast from 'react-hot-toast'
// import dayjs from 'dayjs'
// import { postRequest } from '../Helpers'

// // Initial form state
// const initialState = {
//   date: dayjs().format('YYYY-MM-DD'),
//   month: '',
//   installment: '',
//   amount: '',
//   mode: 'Cash',
//   remarks: '',
// }

// const FeePaymentModal = ({ isModalOpen, setIsModalOpen, studentData, setUpdateStatus }) => {
//   const [formData, setFormData] = useState({ ...initialState })
//   const [errors, setErrors] = useState({})
//   const [loading, setLoading] = useState(false)

//   // Prefill modal with student info when opened
//   useEffect(() => {
//     if (isModalOpen) {
//       setFormData({ ...initialState })
//       setErrors({})
//     }
//   }, [isModalOpen])

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//     setErrors((prev) => ({ ...prev, [name]: '' }))
//   }

//   // Validate form
//   const validateForm = () => {
//     const err = {}
//     if (!formData.date) err.date = 'Date is required'
//     if (!formData.amount) err.amount = 'Amount is required'
//     if (!formData.mode) err.mode = 'Payment mode is required'
//     setErrors(err)
//     return Object.keys(err).length === 0
//   }

//   // Submit payment
//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) return

//     setLoading(true)
//     try {
//       await postRequest({
//         url: `fee/${studentData?.id}/payment`,
//         cred: formData,
//       })
//       toast.success('Fee collected successfully')
//       setUpdateStatus((prev) => !prev)
//       handleCancel()
//     } catch (err) {
//       toast.error('Failed to collect fee')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCancel = () => {
//     setFormData({ ...initialState })
//     setErrors({})
//     setIsModalOpen(false)
//   }

//   return (
//     <Modal
//       title={`Fee Payment for ${studentData?.name || ''}`}
//       open={isModalOpen}
//       footer={null}
//       width={520}
//       onCancel={handleCancel}
//     >
//       <div className="bg-gray-50 p-3 rounded mb-4">
//         <p>
//           <b>Class:</b> {studentData?.class || '-'} | <b>Section:</b> {studentData?.section || '-'} |{' '}
//           <b>Session:</b> {studentData?.session || '-'}
//         </p>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="row g-3">
//           {/* Posting Date */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">
//               Posting Date <span className="text-danger">*</span>
//             </label>
//             <input
//               type="date"
//               name="date"
//               value={formData.date}
//               onChange={handleChange}
//               className={`form-control form-control-sm ${errors.date && 'is-invalid'}`}
//             />
//             <div className="invalid-feedback">{errors.date}</div>
//           </div>

//           {/* For Month */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">For Month</label>
//             <input
//               type="text"
//               name="month"
//               placeholder="April / May"
//               value={formData.month}
//               onChange={handleChange}
//               className="form-control form-control-sm"
//             />
//           </div>

//           {/* Installment */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">Installment</label>
//             <input
//               type="text"
//               name="installment"
//               placeholder="1 / 2 / Final"
//               value={formData.installment}
//               onChange={handleChange}
//               className="form-control form-control-sm"
//             />
//           </div>

//           {/* Amount */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">
//               Amount <span className="text-danger">*</span>
//             </label>
//             <input
//               type="number"
//               name="amount"
//               placeholder="Enter Amount"
//               value={formData.amount}
//               onChange={handleChange}
//               className={`form-control form-control-sm ${errors.amount && 'is-invalid'}`}
//             />
//             <div className="invalid-feedback">{errors.amount}</div>
//           </div>

//           {/* Payment Mode */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">
//               Payment Mode <span className="text-danger">*</span>
//             </label>
//             <select
//               name="mode"
//               value={formData.mode}
//               onChange={handleChange}
//               className={`form-select form-select-sm ${errors.mode && 'is-invalid'}`}
//             >
//               <option value="">Select</option>
//               <option value="Cash">Cash</option>
//               <option value="Cheque">Cheque</option>
//               <option value="Online">Online</option>
//             </select>
//             <div className="invalid-feedback">{errors.mode}</div>
//           </div>

//           {/* Remarks */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">Remarks</label>
//             <textarea
//               name="remarks"
//               placeholder="Remarks"
//               value={formData.remarks}
//               onChange={handleChange}
//               rows={1}
//               className="form-control form-control-sm"
//             />
//           </div>

//           {/* Buttons */}
//           <div className="d-flex justify-content-end gap-2 mt-3">
//             <button type="button" onClick={handleCancel} className="btn btn-secondary text-sm">
//               Cancel
//             </button>
//             <button disabled={loading} type="submit" className="bg-[#0c3b73] text-white px-3 text-sm rounded">
//               Save & Generate Receipt
//             </button>
//           </div>
//         </div>
//       </form>
//     </Modal>
//   )
// }

// export default FeePaymentModal
/* eslint-disable react-hooks/immutability */


// import React, { useContext, useEffect, useState } from 'react'
// import { Modal } from 'antd'
// import toast from 'react-hot-toast'
// import dayjs from 'dayjs'
// import { postRequest } from '../Helpers'
// import { SessionContext } from '../Context/Seesion'

// const initialState = {
//   date: dayjs().format('YYYY-MM-DD'),
//   sessionId: '',
//   month: '',
//   installment: '',
//   amount: '',
//   mode: 'Cash',
//   remarks: '',
// }
// const { currentSession } = useContext(SessionContext)

// const FeePaymentModal = ({ isModalOpen, setIsModalOpen, studentData, setUpdateStatus }) => {
//   const [formData, setFormData] = useState({ ...initialState })
//   const [errors, setErrors] = useState({})
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     if (currentSession?._id) {
//       setFormData((p) => ({ ...p, sessionId: currentSession._id }))
//     }
//   }, [currentSession])
//   useEffect(() => {
//     if (isModalOpen) {
//       setFormData({ ...initialState })
//       setErrors({})
//     }
//   }, [isModalOpen])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//     setErrors((prev) => ({ ...prev, [name]: '' }))
//   }

//   const validateForm = () => {
//     const err = {}
//     if (!formData.date) err.date = 'Date is required'
//     if (!formData.amount) err.amount = 'Amount is required'
//     if (!formData.mode) err.mode = 'Payment mode is required'
//     setErrors(err)
//     return Object.keys(err).length === 0
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) return
// const payload = {
//   sessionId: studentData?.sessionId,
//   studentId: studentData?.id,
//   classId: studentData?.classId,
//   streamId: studentData?.streamId || null,

//   amountPaid: Number(formData.amount),
//   paymentMode: formData.mode.toUpperCase(),

//   paymentDate: formData.date,        // 🔥 IMPORTANT
//   month: formData.month || null,
//   installment: formData.installment || null,
//   remarks: formData.remarks || '',
// }


//     setLoading(true)
//     try {
//       await postRequest({
//         url: 'student-fees/collect',
//         cred: payload,
//       })

//       toast.success('Fee collected successfully')
//       setUpdateStatus((prev) => !prev)
//       handleCancel()
//     } catch (error) {
//       console.error(error)
//       toast.error('Failed to collect fee')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCancel = () => {
//     setFormData({ ...initialState })
//     setErrors({})
//     setIsModalOpen(false)
//   }

//   return (
//     <Modal
//       title={`Fee Payment for ${studentData?.name || ''}`}
//       open={isModalOpen}
//       footer={null}
//       width={520}
//       onCancel={handleCancel}
//     >
//       <div className="bg-gray-50 p-3 rounded mb-4">
//         <p>
//           <b>Class:</b> {studentData?.class || '-'} | <b>Section:</b> {studentData?.section || '-'}{' '}
//           | <b>Session:</b> {studentData?.session || '-'}
//         </p>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="row g-3">
//           {/* Date */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">
//               Posting Date <span className="text-danger">*</span>
//             </label>
//             <input
//               type="date"
//               name="date"
//               value={formData.date}
//               onChange={handleChange}
//               className={`form-control form-control-sm ${errors.date && 'is-invalid'}`}
//             />
//             <div className="invalid-feedback">{errors.date}</div>
//           </div>

//           {/* Month */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">For Month</label>
//             <input
//               type="text"
//               name="month"
//               value={formData.month}
//               onChange={handleChange}
//               className="form-control form-control-sm"
//             />
//           </div>

//           {/* Installment */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">Installment</label>
//             <input
//               type="text"
//               name="installment"
//               value={formData.installment}
//               onChange={handleChange}
//               className="form-control form-control-sm"
//             />
//           </div>

//           {/* Amount */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">
//               Amount <span className="text-danger">*</span>
//             </label>
//             <input
//               type="number"
//               name="amount"
//               value={formData.amount}
//               onChange={handleChange}
//               className={`form-control form-control-sm ${errors.amount && 'is-invalid'}`}
//             />
//             <div className="invalid-feedback">{errors.amount}</div>
//           </div>

//           {/* Payment Mode */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">
//               Payment Mode <span className="text-danger">*</span>
//             </label>
//             <select
//               name="mode"
//               value={formData.mode}
//               onChange={handleChange}
//               className={`form-select form-select-sm ${errors.mode && 'is-invalid'}`}
//             >
//               <option value="">Select</option>
//               <option value="Cash">Cash</option>
//               <option value="Cheque">Cheque</option>
//               <option value="Online">Online</option>
//             </select>
//             <div className="invalid-feedback">{errors.mode}</div>
//           </div>

//           {/* Remarks */}
//           <div className="col-12 col-sm-6">
//             <label className="form-label">Remarks</label>
//             <textarea
//               name="remarks"
//               value={formData.remarks}
//               onChange={handleChange}
//               rows={1}
//               className="form-control form-control-sm"
//             />
//           </div>

//           {/* Buttons */}
//           <div className="d-flex justify-content-end gap-2 mt-3">
//             <button type="button" onClick={handleCancel} className="btn btn-secondary text-sm">
//               Cancel
//             </button>
//             <button
//               disabled={loading}
//               type="submit"
//               className="bg-[#0c3b73] text-white px-3 text-sm rounded"
//             >
//               {loading ? 'Saving...' : 'Save & Generate Receipt'}
//             </button>
//           </div>
//         </div>
//       </form>
//     </Modal>
//   )
// }

// export default FeePaymentModal
