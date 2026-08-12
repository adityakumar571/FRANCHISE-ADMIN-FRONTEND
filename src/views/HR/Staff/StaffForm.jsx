import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { User, ArrowLeft, Upload } from 'lucide-react'
import { getRequest, postRequest, putRequest, fileUpload } from '../../../Helpers'
import toast from 'react-hot-toast'

const STAFF_TYPES      = ['Teaching', 'Non-Teaching']
const EMPLOYMENT_TYPES = ['Permanent', 'Temporary', 'Contract', 'Part-Time']
const GENDERS          = ['Male', 'Female', 'Other']

const initialForm = {
  employeeCode:   '',
  employeeName:   '',
  staffType:      '',
  department:     '',
  designation:    '',
  mobile:         '',
  email:          '',
  dateOfBirth:    '',
  dateOfJoining:  '',
  gender:         '',
  address:        '',
  employmentType: '',
  monthlySalary:  '',
  bankName:       '',
  accountNumber:  '',
  ifscCode:       '',
  photo:          '',
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components defined OUTSIDE StaffForm so they are never remounted on
// parent re-render (fixes "only one character can be typed" bug)
// ─────────────────────────────────────────────────────────────────────────────

const SectionTitle = ({ title }) => (
  <div className="col-span-full">
    <h3 className="text-sm font-semibold text-[#0c3b73] border-b border-blue-100 pb-1 mb-1">
      {title}
    </h3>
  </div>
)

const InputField = ({ label, field, type = 'text', placeholder, required, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
        error ? 'border-red-400' : 'border-gray-300'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
)

const SelectField = ({ label, field, options, required, value, onChange, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
        error ? 'border-red-400' : 'border-gray-300'
      }`}
    >
      <option value="">— Select —</option>
      {children || options?.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────

const StaffForm = () => {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = !!id

  const [form,                setForm]                = useState(initialForm)
  const [departments,         setDepartments]         = useState([])
  const [designations,        setDesignations]        = useState([])
  const [filteredDesignations,setFilteredDesignations]= useState([])
  const [loading,             setLoading]             = useState(false)
  const [photoUploading,      setPhotoUploading]      = useState(false)
  const [errors,              setErrors]              = useState({})
  const [photoPreview,        setPhotoPreview]        = useState(null)

  /* ── FETCH MASTERS ── */
  useEffect(() => {
    getRequest('hr/departments?limit=200')
      .then((res) => setDepartments(res?.data?.data?.departments || []))
      .catch(() => {})
    getRequest('hr/designations?limit=500')
      .then((res) => setDesignations(res?.data?.data?.designations || []))
      .catch(() => {})
  }, [])

  /* ── FILTER DESIGNATIONS BY DEPARTMENT + STAFF TYPE ── */
  useEffect(() => {
    if (!form.department && !form.staffType) {
      setFilteredDesignations(designations)
      return
    }
    setFilteredDesignations(
      designations.filter((d) => {
        const deptMatch = !form.department || d.department?._id === form.department || d.department === form.department
        const typeMatch = !form.staffType  || d.staffType === form.staffType
        return deptMatch && typeMatch
      }),
    )
    setForm((f) => ({ ...f, designation: '' }))
  }, [form.department, form.staffType, designations])

  /* ── FETCH STAFF FOR EDIT ── */
  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    getRequest(`hr/staff/${id}`)
      .then((res) => {
        const s = res?.data?.data
        setForm({
          employeeCode:   s.employeeCode   || '',
          employeeName:   s.employeeName   || '',
          staffType:      s.staffType      || '',
          department:     s.department?._id || s.department || '',
          designation:    s.designation?._id || s.designation || '',
          mobile:         s.mobile         || '',
          email:          s.email          || '',
          dateOfBirth:    s.dateOfBirth    ? s.dateOfBirth.slice(0, 10)   : '',
          dateOfJoining:  s.dateOfJoining  ? s.dateOfJoining.slice(0, 10) : '',
          gender:         s.gender         || '',
          address:        s.address        || '',
          employmentType: s.employmentType || '',
          monthlySalary:  s.monthlySalary  || '',
          bankName:       s.bankName       || '',
          accountNumber:  s.accountNumber  || '',
          ifscCode:       s.ifscCode       || '',
          photo:          s.photo          || '',
        })
        if (s.photo) setPhotoPreview(s.photo)
      })
      .catch(() => toast.error('Failed to load staff details'))
      .finally(() => setLoading(false))
  }, [id])

  /* ── PHOTO UPLOAD ── */
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setPhotoUploading(true)
    try {
      const res = await fileUpload({ url: 'upload/uploadImage', cred: formData })
      const url = res?.data?.data?.imageUrl
      setForm((f) => ({ ...f, photo: url }))
      setPhotoPreview(url)
      toast.success('Photo uploaded')
    } catch {
      toast.error('Photo upload failed')
    } finally {
      setPhotoUploading(false)
    }
  }

  /* ── VALIDATION ── */
  const validate = () => {
    const errs = {}
    if (!form.employeeName.trim())  errs.employeeName  = 'Employee name is required'
    if (!form.staffType)            errs.staffType      = 'Staff type is required'
    if (!form.department)           errs.department     = 'Department is required'
    if (!form.designation)          errs.designation    = 'Designation is required'
    if (!form.mobile.trim())        errs.mobile         = 'Mobile number is required'
    if (form.mobile && !/^\d{10}$/.test(form.mobile))   errs.mobile = 'Enter valid 10-digit mobile'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email  = 'Enter valid email'
    if (!form.dateOfJoining)        errs.dateOfJoining  = 'Date of joining is required'
    if (form.monthlySalary && Number(form.monthlySalary) <= 0)
      errs.monthlySalary = 'Salary must be greater than 0'
    return errs
  }

  /* ── SUBMIT ── */
  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const payload = {
      ...form,
      monthlySalary: form.monthlySalary ? Number(form.monthlySalary) : undefined,
    }

    const req = isEdit
      ? putRequest({ url: `hr/staff/${id}`, cred: payload })
      : postRequest({ url: 'hr/staff', cred: payload })

    req
      .then(() => {
        toast.success(isEdit ? 'Staff updated successfully' : 'Staff created successfully')
        navigate('/hr/staff')
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Operation failed'))
      .finally(() => setLoading(false))
  }

  /* ── onChange helper ── */
  const set = (key) => (e) => {
    setForm((f)  => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: '' }))
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hr/staff')} className="text-gray-500 hover:text-[#0c3b73] transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <User className="text-[#e24028] w-5 h-5" />
              {isEdit ? 'Edit Staff' : 'Add New Staff'}
            </h1>
            <p className="text-xs text-gray-500">
              {isEdit ? 'Update staff member information' : 'Fill in details to register new staff'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT — PHOTO */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-4 flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {photoPreview
                  ? <img src={photoPreview} alt="staff" className="w-full h-full object-cover" />
                  : <User className="w-12 h-12 text-gray-300" />
                }
              </div>
              <label className="cursor-pointer flex items-center gap-2 text-sm text-[#0c3b73] hover:text-blue-700 border border-[#0c3b73] rounded px-3 py-1 transition">
                <Upload size={14} />
                {photoUploading ? 'Uploading...' : 'Upload Photo'}
                <input type="file" accept="image/*" className="hidden" disabled={photoUploading} onChange={handlePhotoChange} />
              </label>
              <p className="text-xs text-gray-400 text-center">JPG, PNG up to 2MB</p>
            </div>
          </div>

          {/* RIGHT — FORM FIELDS */}
          <div className="lg:col-span-2 space-y-4">

            {/* Basic Info */}
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SectionTitle title="Basic Information" />

                <InputField label="Employee Name" field="employeeName" placeholder="Full name" required
                  value={form.employeeName} onChange={set('employeeName')} error={errors.employeeName} />

                <InputField label="Employee Code" field="employeeCode" placeholder="Auto-generated if empty"
                  value={form.employeeCode} onChange={set('employeeCode')} error={errors.employeeCode} />

                <SelectField label="Staff Type" field="staffType" options={STAFF_TYPES} required
                  value={form.staffType} onChange={set('staffType')} error={errors.staffType} />

                <SelectField label="Department" field="department" required
                  value={form.department} onChange={set('department')} error={errors.department}>
                  {departments.filter((d) => d.isActive).map((d) =>
                    <option key={d._id} value={d._id}>{d.name}</option>
                  )}
                </SelectField>

                <SelectField label="Designation" field="designation" required
                  value={form.designation} onChange={set('designation')} error={errors.designation}>
                  {filteredDesignations.filter((d) => d.isActive).map((d) =>
                    <option key={d._id} value={d._id}>{d.name}</option>
                  )}
                </SelectField>

                <SelectField label="Employment Type" field="employmentType" options={EMPLOYMENT_TYPES}
                  value={form.employmentType} onChange={set('employmentType')} error={errors.employmentType} />

                <SelectField label="Gender" field="gender" options={GENDERS}
                  value={form.gender} onChange={set('gender')} error={errors.gender} />

                <InputField label="Date of Birth" field="dateOfBirth" type="date"
                  value={form.dateOfBirth} onChange={set('dateOfBirth')} error={errors.dateOfBirth} />

                <InputField label="Date of Joining" field="dateOfJoining" type="date" required
                  value={form.dateOfJoining} onChange={set('dateOfJoining')} error={errors.dateOfJoining} />
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SectionTitle title="Contact Details" />

                <InputField label="Mobile Number" field="mobile" placeholder="10-digit mobile" required
                  value={form.mobile} onChange={set('mobile')} error={errors.mobile} />

                <InputField label="Email" field="email" type="email" placeholder="email@example.com"
                  value={form.email} onChange={set('email')} error={errors.email} />

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea rows={3} value={form.address} onChange={set('address')}
                    placeholder="Full address..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Salary */}
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SectionTitle title="Salary Details" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹)</label>
                  <input type="number" min="0" value={form.monthlySalary} onChange={set('monthlySalary')}
                    placeholder="e.g. 25000"
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                      errors.monthlySalary ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {errors.monthlySalary && <p className="text-red-500 text-xs mt-1">{errors.monthlySalary}</p>}
                </div>
              </div>
            </div>

            {/* Bank */}
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SectionTitle title="Bank Details" />

                <InputField label="Bank Name" field="bankName" placeholder="e.g. SBI, HDFC"
                  value={form.bankName} onChange={set('bankName')} error={errors.bankName} />

                <InputField label="Account Number" field="accountNumber" placeholder="Bank account number"
                  value={form.accountNumber} onChange={set('accountNumber')} error={errors.accountNumber} />

                <InputField label="IFSC Code" field="ifscCode" placeholder="e.g. SBIN0001234"
                  value={form.ifscCode} onChange={set('ifscCode')} error={errors.ifscCode} />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-4 pb-6">
          <button type="button" onClick={() => navigate('/hr/staff')}
            className="px-5 py-2 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className={`px-6 py-2 text-sm text-white rounded transition ${
              loading ? 'bg-blue-300' : 'bg-[#0c3b73] hover:bg-blue-700'
            }`}>
            {loading ? 'Saving...' : isEdit ? 'Update Staff' : 'Save Staff'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StaffForm
