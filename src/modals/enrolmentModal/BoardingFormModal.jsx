/* eslint-disable react/display-name */
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react'

const BoardingFormModal = forwardRef(({ modalData, onChange }, ref) => {
  const [formData, setFormData] = useState({
    // Hostel
    hostelName: '',
    boardingRequired: false,
    roomType: '',

    // ================= Local Guardian =================
    guardianName: '',
    guardianRelation: '',
    guardianAddress1: '',
    guardianAddress2: '',
    guardianCity: '',
    guardianState: '',
    guardianPin: '',
    guardianMobile: '',
    guardianEmail: '',

    // ================= Local Physician =================
    physicianName: '',
    physicianAddress1: '',
    physicianAddress2: '',
    physicianCity: '',
    physicianState: '',
    physicianPin: '',
    physicianMobile: '',
    physicianEmail: '',

    // ================= Emergency Contact =================
    emergencyName1: '',
    emergencyPhone1: '',
    sameAsGuardian1: false,

    // ================= Physique =================
    height: '',
    weight: '',
    bloodGroup: '',
    complexion: '',
    faceMark: '',
    isSpectacles: false,

    // Optional extra fields
    medicalComment: '',
    tcSubmit: '',
    lastPassedExam: '',
    previousSchool: '',
  })

  const [errors, setErrors] = useState({})

  // Generic handler for all inputs including checkboxes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // Handle "Same as Local Guardian"
  const handleSameAsGuardian = (e) => {
    const checked = e.target.checked
    setFormData((prev) => ({
      ...prev,
      sameAsGuardian1: checked,
      emergencyName1: checked ? prev.guardianName : '',
      emergencyPhone1: checked ? prev.guardianMobile : '',
    }))
  }

  // Expose submitForm to parent
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      const newErrors = {}

      if (formData.boardingRequired) {
        if (!formData.hostelName) newErrors.hostelName = 'Hostel required'
        if (!formData.roomType) newErrors.roomType = 'Room type required'
      }

      setErrors(newErrors)

      if (Object.keys(newErrors).length > 0) {
        return { valid: false }
      }

      return { valid: true, data: formData }
    },
  }))

  // Populate form from modalData
  useEffect(() => {
    if (!modalData) return
    setFormData((prev) => ({
      ...prev,
      ...modalData,
    }))
  }, [modalData])

  // Notify parent of changes if onChange is passed
  useEffect(() => {
    if (onChange) {
      onChange(formData)
    }
  }, [formData])


  useEffect(() => {
    if (!formData.boardingRequired) {
      setFormData(prev => ({
        ...prev,
        hostelName: '',
        roomType: '',
      }))
    }
  }, [formData.boardingRequired])

  useEffect(() => {
    if (formData.sameAsGuardian1) {
      setFormData(prev => ({
        ...prev,
        emergencyName1: prev.guardianName,
        emergencyPhone1: prev.guardianMobile,
      }))
    }
  }, [formData.guardianName, formData.guardianMobile])


  const payload = {
    boardingRequired: formData.boardingRequired,

    ...(formData.boardingRequired && {
      hostelName: formData.hostelName,
      roomType: formData.roomType,
    }),

    guardian: {
      name: formData.guardianName,
      relation: formData.guardianRelation,
      address1: formData.guardianAddress1,
      address2: formData.guardianAddress2,
      city: formData.guardianCity,
      state: formData.guardianState,
      pin: formData.guardianPin,
      mobile: formData.guardianMobile,
      email: formData.guardianEmail,
    },

    physician: {
      name: formData.physicianName,
      address1: formData.physicianAddress1,
      address2: formData.physicianAddress2,
      city: formData.physicianCity,
      state: formData.physicianState,
      pin: formData.physicianPin,
      mobile: formData.physicianMobile,
      email: formData.physicianEmail,
    },

    emergencyContact: {
      name: formData.emergencyName1,
      phone: formData.emergencyPhone1,
    },

    physique: {
      height: formData.height,
      weight: formData.weight,
      bloodGroup: formData.bloodGroup,
      complexion: formData.complexion,
      faceMark: formData.faceMark,
      isSpectacles: formData.isSpectacles,
    },

    medicalComment: formData.medicalComment,
  }






  return (
    <div className="container mt-3">
      {/* ================= Hostel ================= */}
      <div className="card mb-3">
        <div className="card-header !bg-[#0c3b73] text-white">Hostel Details</div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-bold">Hostel Name</label>
            <input
              type="text"
              className="form-control form-control-sm"
              name="hostelName"
              value={formData.hostelName}
              onChange={handleChange}
              placeholder="Enter Hostel Name"
            />
            {errors.hostelName && <small className="text-danger">{errors.hostelName}</small>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Room Type</label>
            <input
              type="text"
              className="form-control form-control-sm"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              placeholder="Enter Room Type"
            />
            {errors.roomType && <small className="text-danger">{errors.roomType}</small>}
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="boardingRequired"
              checked={formData.boardingRequired}
              onChange={handleChange}
            />
            <label className="form-check-label">Boarding Required</label>
          </div>
        </div>
      </div>

      {/* ================= Local Guardian & Physician ================= */}
      <div className="row g-3">
        {/* Local Guardian */}
        <div className="col-md-6">
          <div className="card mb-3 h-100">
            <div className="card-header !bg-[#0c3b73] text-white">Local Guardian</div>
            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label mb-1">Guardian Name</label>
                  <input
                    className="form-control form-control-sm"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    placeholder="Guardian Name"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label mb-1">Relation</label>
                  <input
                    className="form-control form-control-sm"
                    name="guardianRelation"
                    value={formData.guardianRelation}
                    onChange={handleChange}
                    placeholder="Relation"
                  />
                </div>
              </div>

              {/* Address */}
              <fieldset className="border rounded p-2">
                <legend className="float-none w-auto px-2 small fw-semibold">Address</legend>
                <div className="mb-2">
                  <label className="form-label">Address 1</label>
                  <input
                    className="form-control form-control-sm"
                    name="guardianAddress1"
                    value={formData.guardianAddress1}
                    onChange={handleChange}
                    placeholder="Address 1"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Address 2</label>
                  <input
                    className="form-control form-control-sm"
                    name="guardianAddress2"
                    value={formData.guardianAddress2}
                    onChange={handleChange}
                    placeholder="Address 2"
                  />
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label">City/District</label>
                    <input
                      className="form-control form-control-sm"
                      name="guardianCity"
                      value={formData.guardianCity}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">State</label>
                    <input
                      className="form-control form-control-sm"
                      name="guardianState"
                      value={formData.guardianState}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="row g-2 mt-2">
                  <div className="col-6">
                    <label className="form-label">Pin Code</label>
                    <input
                      className="form-control form-control-sm"
                      name="guardianPin"
                      value={formData.guardianPin}
                      onChange={handleChange}
                      placeholder="Pin"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Mobile</label>
                    <input
                      className="form-control form-control-sm"
                      name="guardianMobile"
                      value={formData.guardianMobile}
                      onChange={handleChange}
                      placeholder="Mobile"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    name="guardianEmail"
                    value={formData.guardianEmail}
                    onChange={handleChange}
                    placeholder="Email"
                  />
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* Local Physician */}
        <div className="col-md-6">
          <div className="card mb-3 h-100">
            <div className="card-header !bg-[#0c3b73] text-white">Local Physician</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Doctor Name</label>
                <input
                  className="form-control form-control-sm"
                  name="physicianName"
                  value={formData.physicianName}
                  onChange={handleChange}
                  placeholder="Doctor Name"
                />
              </div>

              {/* Address */}
              <fieldset className="border rounded p-2">
                <legend className="float-none w-auto px-2 small fw-semibold">Address</legend>
                <div className="mb-2">
                  <label className="form-label">Address 1</label>
                  <input
                    className="form-control form-control-sm"
                    name="physicianAddress1"
                    value={formData.physicianAddress1}
                    onChange={handleChange}
                    placeholder="Address 1"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Address 2</label>
                  <input
                    className="form-control form-control-sm"
                    name="physicianAddress2"
                    value={formData.physicianAddress2}
                    onChange={handleChange}
                    placeholder="Address 2"
                  />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label">City/District</label>
                    <input
                      className="form-control form-control-sm"
                      name="physicianCity"
                      value={formData.physicianCity}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">State</label>
                    <input
                      className="form-control form-control-sm"
                      name="physicianState"
                      value={formData.physicianState}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="row g-2 mt-2">
                  <div className="col-6">
                    <label className="form-label">Pin</label>
                    <input
                      className="form-control form-control-sm"
                      name="physicianPin"
                      value={formData.physicianPin}
                      onChange={handleChange}
                      placeholder="Pin"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Mobile</label>
                    <input
                      className="form-control form-control-sm"
                      name="physicianMobile"
                      value={formData.physicianMobile}
                      onChange={handleChange}
                      placeholder="Mobile"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    name="physicianEmail"
                    value={formData.physicianEmail}
                    onChange={handleChange}
                    placeholder="Email"
                  />
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Emergency Contact & Physique ================= */}
      <div className="row g-3 mt-3">
        {/* Emergency Contact */}
        <div className="col-md-6">
          <div className="card mb-3 h-100">
            <div className="card-header !bg-[#0c3b73] text-white">Emergency Contact</div>
            <div className="card-body">
              <div className="mb-2">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="emergencyName1"
                  value={formData.emergencyName1}
                  onChange={handleChange}
                  placeholder="Name"
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Mobile</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="emergencyPhone1"
                  value={formData.emergencyPhone1}
                  onChange={handleChange}
                  placeholder="Mobile"
                />
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="sameAsGuardian1"
                  checked={formData.sameAsGuardian1}
                  onChange={handleSameAsGuardian}
                />
                <label className="form-check-label">Same as Local Guardian</label>
              </div>
            </div>
          </div>
        </div>

        {/* Physique */}
        <div className="col-md-6">
          <div className="card mb-3 h-100">
            <div className="card-header !bg-[#0c3b73] text-white">Physique at Admission</div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Weight"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-select form-select-sm"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Complexion</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="complexion"
                    value={formData.complexion}
                    onChange={handleChange}
                    placeholder="Complexion"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Face Mark</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="faceMark"
                    value={formData.faceMark}
                    onChange={handleChange}
                    placeholder="Any Face Mark"
                  />
                </div>
                <div className="col-6">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isSpectacles"
                      checked={formData.isSpectacles}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Wears Spectacles</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default BoardingFormModal
