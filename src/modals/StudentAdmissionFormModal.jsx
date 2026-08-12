/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/immutability */
import React, { useContext, useEffect, useState } from 'react'
import { Modal } from 'antd'
import toast from 'react-hot-toast'
import { postRequest, putRequest, getRequest } from '../Helpers'
import { SessionContext } from '../Context/Seesion'

const getTodayDate = () => new Date().toISOString().split('T')[0]
const StudentAdmissionFormModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
}) => {
  const [formData, setFormData] = useState({
    formNo: '',
    registrationDate: getTodayDate(),
    session: '', // ✅ ObjectId only
    firstName: '',
    middleName: '',
    lastName: '',
    studentAdhaarNumber: '',
    fatherName: '',
    fatherAdhaarNumber: '',
    motherName: '',
    motherAdhaarNumber: '',
    phone: '',
    gender: '',
    currentClass: '',
    studentType: '',
    registrationFee: '',
    paymentMode: '',
    address: '',
    city: '',
    remark: '',
    isEnroll: false,
    transportRequired: '',
    transportStoppage: '',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianPostalAddress: '',
  })

  console.log('student reg', formData)

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const isEnrolled = Boolean(formData.isEnroll)
  const [classes, setClasses] = useState([])
  const { currentSession, sessionsList } = useContext(SessionContext)

  const col = 'col-12 col-sm-6 col-md-4'

  // Prefill form when modal opens
  useEffect(() => {
    if (isModalOpen && modalData) {
      setFormData({
        formNo: modalData.formNo || '',
        registrationDate: modalData.registrationDate?.split('T')[0] || '',
        session: modalData.session?._id || '', // ✅ ObjectId
        firstName: modalData.firstName || '',
        middleName: modalData.middleName || '',
        lastName: modalData.lastName || '',
        fatherName: modalData.fatherName || '',
        phone: modalData.phone || '',
        gender: modalData.gender,
        currentClass: modalData.currentClass?._id || '',
        studentType: modalData.studentType,
        registrationFee: modalData.registrationFee || '',
        paymentMode: modalData.paymentMode,
        address: modalData.address || '',
        city: modalData.city || '',
        remark: modalData.remark || '',
        isEnroll: Boolean(modalData.isEnroll),
        transportRequired: modalData.transportRequired || '',
        transportStoppage: modalData.transportStoppage || '',
        studentAdhaarNumber: modalData.studentAdhaarNumber || '',
        fatherAdhaarNumber: modalData.fatherAdhaarNumber || '',
        motherName: modalData.motherName || '',
        motherAdhaarNumber: modalData.motherAdhaarNumber || '',
        guardianName: modalData.guardianName || '',
        guardianRelation: modalData.guardianRelation || '',
        guardianPhone: modalData.guardianPhone || '',
        guardianPostalAddress: modalData.guardianPostalAddress || '',
      })
    }
  }, [isModalOpen, modalData])

  useEffect(() => {
    if (currentSession?._id) {
      setFormData((prev) => ({
        ...prev,
        session: currentSession._id,
      }))
    }
  }, [currentSession])
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (!currentSession?._id) return // ✅ safety check
        const res = await getRequest(`classes?isPagination=false&session=${currentSession._id}`)
        setClasses(res?.data?.data?.classes || [])
      } catch (err) {
        console.error(err)
        setClasses([])
      }
    }

    fetchClasses()
  }, [currentSession]) // ✅ dependency added

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // ✅ Phone validation
    if (name === 'phone' || name === 'guardianPhone') {
      if (!/^\d*$/.test(value)) return
      if (value.length > 10) return
    }

    if (name.includes('AdhaarNumber')) {
      if (!/^\d*$/.test(value)) return
      if (value.length > 12) return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // Form validation
  const validateForm = () => {
    const err = {}
    if (!/^\d+$/.test(formData.formNo)) err.formNo = 'Form No is required sfgdgh'
    if (!formData.registrationDate) err.registrationDate = 'Registration Date is required'
    if (!formData.firstName) err.firstName = 'First name is required'
    if (!formData.fatherName) err.fatherName = 'Father name is required'
    if (!formData.phone) err.phone = 'Contact number is required'
    if (!formData.gender) err.gender = 'Gender is required'
    if (!formData.registrationFee) err.registrationFee = 'Registration Fee is required'
    if (!formData.address) err.address = 'Address is required'
    if (!formData.city) err.city = 'City is required'
    if (!formData.currentClass) err.currentClass = 'Expected class is required'
    if (!formData.paymentMode) err.paymentMode = 'Payment mode is required'
    // if (!formData.studentAdhaarNumber) err.studentAdhaarNumber = 'Student Adhaar required'
    // if (!formData.fatherAdhaarNumber) err.fatherAdhaarNumber = 'Father Adhaar required'
    // if (!formData.motherAdhaarNumber) err.motherAdhaarNumber = 'Mother Adhaar required'
    // if (!formData.transportRequired) err.transportRequired = 'Transport Required is required'

    // if (formData.transportRequired === 'YES' && !formData.transportStoppage)
    //   err.transportStoppage = 'Transport Stoppage is required'

    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    postRequest({
      url: 'studentRegistrations',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Class added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  /*  Edit Class */
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `studentRegistrations/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Class updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  // Close modal
  const handleCancel = () => {
    setFormData({ ...formData, session: currentSession?._id || '' })
    setModalData(null)
    setIsModalOpen(false)
    setErrors({})
  }

  const formatToDDMMYYYY = (date) => {
    if (!date) return ''
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <Modal
      destroyOnClose
      title={modalData ? 'Edit Student Registration' : 'Add Student Registration'}
      open={isModalOpen}
      footer={null}
      width={950}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit}>
        <div className="card mb-3">
          <div className="card-header btn-primary !bg-[#0c3b73] text-white">
            Registration Details
          </div>

          <div className="card-body">
            <div className="row g-3">
              {/* Session */}
              <div className={col}>
                <label className="form-label">Session</label>
                <input
                  value={currentSession?.sessionName || ''}
                  className="form-control form-control-sm"
                  disabled
                />
              </div>

              {/* Form No */}
              <div className={col}>
                <label className="form-label">
                  Form No<span className="text-danger">*</span>
                </label>
                <input
                  name="formNo"
                  value={formData.formNo}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${errors.formNo && 'is-invalid'}`}
                  placeholder="Enter From Number"
                />
                <div className="invalid-feedback">{errors.formNo}</div>
              </div>

              {/* Registration Date */}
              <div className={col}>
                <label className="form-label">
                  Registration Date<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="registrationDate"
                  value={formatToDDMMYYYY(formData.registrationDate)}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData((prev) => ({
                      ...prev,
                      registrationDate: convertToISO(value),
                    }))
                  }}
                  placeholder="DD/MM/YYYY"
                  className={`form-control form-control-sm ${errors.registrationDate && 'is-invalid'}`}
                />
                <div className="invalid-feedback">{errors.registrationDate}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header btn-primary !bg-[#0c3b73] text-white">Student Details</div>

          <div className="card-body">
            <div className="row g-3">
              <div className={col}>
                <label className="form-label">
                  First Name<span className="text-danger">*</span>
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${errors.firstName && 'is-invalid'}`}
                  placeholder="Enter First Name"
                />
                <div className="invalid-feedback">{errors.firstName}</div>
              </div>

              <div className={col}>
                <label className="form-label">Middle Name</label>
                <input
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="form-control form-control-sm"
                  placeholder="Enter Middle Name "
                />
              </div>

              <div className={col}>
                <label className="form-label">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-control form-control-sm"
                  placeholder="Enter Last Name"
                />
              </div>
              
              {/* Student Adhaar */}
              {/* <div className={col}>
                <label className="form-label">
                  Adhaar Number<span className="text-danger">*</span>
                </label>
                
                <input
                  name="studentAdhaarNumber"
                  value={formData.studentAdhaarNumber || ''}
                  onChange={handleChange}
                  className="form-control form-control-sm"
                  placeholder="Enter Student Adhaar"
                />
                <div className="invalid-feedback">{errors.studentAdhaarNumber}</div>
              </div> */}

              <div className={col}>
                <label className="form-label">
                  Gender<span className="text-danger">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`form-select form-select-sm ${errors.gender && 'is-invalid'}`}
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="invalid-feedback">{errors.gender}</div>
              </div>

              <div className={col}>
                <label className="form-label">
                  Father Name<span className="text-danger">*</span>
                </label>
                <input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${errors.fatherName && 'is-invalid'}`}
                  placeholder="Enter Fathers Name"
                />
                <div className="invalid-feedback">{errors.fatherName}</div>
              </div>

              {/* <div className={col}>
                <label className="form-label">
                  Father's Adhaar Number<span className="text-danger">*</span>
                </label>
                <input
                  name="fatherAdhaarNumber"
                  value={formData.fatherAdhaarNumber || ''}
                  onChange={handleChange}
                  className="form-control form-control-sm"
                  placeholder="Enter Father Adhaar"
                />

                <div className="invalid-feedback">{errors.fatherAdhaarNumber}</div>
              </div> */}

              {/* <div className={col}>
                <label className="form-label">
                  Mother Name<span className="text-danger">*</span>
                </label>
                <input
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${errors.motherName && 'is-invalid'}`}
                  placeholder="Enter Mother Name"
                />
                <div className="invalid-feedback">{errors.motherName}</div>
              </div> */}

              {/* <div className={col}>
                <label className="form-label">
                  Mother's Adhaar Number<span className="text-danger">*</span>
                </label>
                <input
                  name="motherAdhaarNumber"
                  value={formData.motherAdhaarNumber}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${errors.motherAdhaarNumber && 'is-invalid'}`}
                  placeholder="Enter Mother Adhaar"
                />
                <div className="invalid-feedback">{errors.motherAdhaarNumber}</div>
              </div> */}

              <div className={col}>
                <label className="form-label">
                  Contact No<span className="text-danger">*</span>
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  className={`form-control form-control-sm ${errors.phone && 'is-invalid'}`}
                  placeholder="Enter Contact Number"
                />
                <div className="invalid-feedback">{errors.phone}</div>
              </div>

              <div className={col}>
                <label className="form-label">
                  Expected Class<span className="text-danger">*</span>
                </label>
                <select
                  name="currentClass"
                  value={formData.currentClass}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${errors.currentClass && 'is-invalid'}`}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{errors.currentClass}</div>
              </div>

              {/* Transport Required */}
              {/* <div className={col}>
                <label className="form-label">
                  Transport Required<span className="text-danger">*</span>
                </label>

                <select
                  name="transportRequired"
                  value={formData.transportRequired}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${
                    errors.transportRequired && 'is-invalid'
                  }`}
                >
                  <option value="">Select</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                  <option value="NOT_CONFIRM">NOT CONFIRM</option>
                </select>

                <div className="invalid-feedback">{errors.transportRequired}</div>
              </div> */}

              {/* Transport Stoppage */}
              {/* {formData.transportRequired === 'YES' && (
                <div className={col}>
                  <label className="form-label">
                    Transport Stoppage<span className="text-danger">*</span>
                  </label>

                  <input
                    name="transportStoppage"
                    value={formData.transportStoppage}
                    onChange={handleChange}
                    className={`form-control form-control-sm ${
                      errors.transportStoppage && 'is-invalid'
                    }`}
                    placeholder="Enter Transport Stoppage"
                  />

                  <div className="invalid-feedback">{errors.transportStoppage}</div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* <div className="card mb-3">
          <div className="card-header btn-primary !bg-[#0c3b73] text-white">Guardian Details</div>
          <div className="card-body">
            <div className="row g-3"> */}
        {/* Guardian Name */}
        {/* <div className={col}>
                <label className="form-label">Guardian's Name</label>
                <input
                  name="guardianName"
                  value={formData.guardianName || ''}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${errors.guardianName && 'is-invalid'}`}
                  placeholder="Enter Guardian Name"
                />
                <div className="invalid-feedback">{errors.guardianName}</div>
              </div> */}

        {/* Relationship */}
        {/* <div className={col}>
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  name="guardianRelation"
                  value={formData.guardianRelation || ''}
                  onChange={handleChange}
                  className={`form-control form-control-sm ${
                    errors.guardianRelation && 'is-invalid'
                  }`}
                  placeholder="Enter Relationship"
                />

                <div className="invalid-feedback">{errors.guardianRelation}</div>
              </div> */}

        {/* Mobile Number */}
        {/* <div className={col}>
                <label className="form-label">Mobile Number</label>

                <input
                  name="guardianPhone"
                  value={formData.guardianPhone || ''}
                  onChange={handleChange}
                  maxLength={10}
                  className={`form-control form-control-sm ${errors.guardianPhone && 'is-invalid'}`}
                  placeholder="Enter Mobile Number"
                />

                <div className="invalid-feedback">{errors.guardianPhone}</div>
              </div> */}

        {/* Postal Address */}
        {/* <div className={col}>
                <label className="form-label">Postal Address</label>

                <textarea
                  name="guardianPostalAddress"
                  value={formData.guardianPostalAddress || ''}
                  onChange={handleChange}
                  rows={1}
                  className={`form-control form-control-sm ${
                    errors.guardianPostalAddress && 'is-invalid'
                  }`}
                  placeholder="Enter Postal Address"
                />

                <div className="invalid-feedback">{errors.guardianPostalAddress}</div>
              </div> */}
        {/* </div>
          </div>
        </div> */}

        <div className="row">
          {/* ================= Address Details ================= */}
          <div className="col-md-6">
            <div className="card mb-3 h-100">
              <div className="card-header btn-primary !bg-[#0c3b73] text-white">
                Address Details
              </div>

              <div className="card-body">
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">
                      Address<span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={(e) => {
                        handleChange(e)
                        e.target.style.height = 'auto'
                        e.target.style.height = e.target.scrollHeight + 'px'
                      }}
                      rows={1}
                      className={`form-control form-control-sm ${errors.address && 'is-invalid'}`}
                      placeholder="Enter Address"
                    />
                    <div className="invalid-feedback">{errors.address}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      City<span className="text-danger">*</span>
                    </label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`form-control form-control-sm ${errors.city && 'is-invalid'}`}
                      placeholder="Enter City"
                    />
                    <div className="invalid-feedback">{errors.city}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= Payment Details ================= */}
          <div className="col-md-6">
            <div className="card mb-3 h-100">
              <div className="card-header btn-primary !bg-[#0c3b73] text-white">
                Payment Details
              </div>

              <div className="card-body">
                <div className="row g-3">
                  {/* Registration Fee */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Registration Fee<span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="registrationFee"
                      value={formData.registrationFee}
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: 'registrationFee',
                            value: e.target.value.replace(/\D/g, ''), // only numbers
                          },
                        })
                      }
                      min={1}
                      className={`form-control form-control-sm ${errors.registrationFee && 'is-invalid'}`}
                      placeholder="Enter Fee"
                    />
                    <div className="invalid-feedback">{errors.registrationFee}</div>
                  </div>

                  {/* Payment Mode */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Payment Mode<span className="text-danger">*</span>
                    </label>
                    <select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      className={`form-control form-control-sm ${errors.paymentMode && 'is-invalid'}`}
                    >
                      <option value="">Select</option>
                      <option value="CASH">Cash</option>
                      <option value="ONLINE">Online</option>
                      <option value="CARD">Card</option>
                    </select>
                    <div className="invalid-feedback">{errors.paymentMode}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-success !bg-[#0c3b73] text-white"
          >
            {modalData ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default StudentAdmissionFormModal
