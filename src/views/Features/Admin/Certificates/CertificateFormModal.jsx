import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Loader2, Printer, Search, User, X, CheckCircle } from 'lucide-react'
import { Modal, Select, Input, Spin } from 'antd'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest, getTenant } from '../../../../Helpers'
import { AppContext } from '../../../../Context/AppContext'

const { Option } = Select

const CERT_TYPES = [
  { value: 'transfer',  label: 'Transfer Certificate (TC)' },
  { value: 'character', label: 'Character Certificate'      },
]
const CONDUCT_OPTIONS   = ['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement']
const LEAVING_REASONS   = ["Parents' Request", 'Migration', 'Admission in Other School', 'Completed Course', 'Other']
const STATUS_OPTIONS    = ['Draft', 'Issued', 'Cancelled']
const SCHOOL_STATUS_OPT = ['Primary', 'Middle', 'Secondary/Sr. Secondary', 'Secondary', 'Sr. Secondary']
const YES_NO            = ['Yes', 'No', 'N/A']

/* ── helpers ── */
const RequiredLabel = ({ label }) => <>{label} <span className="text-red-500">*</span></>
const SectionHeader = ({ title }) => (
  <div style={{ backgroundColor: '#0c3b73' }} className="px-4 py-2 rounded-t-md">
    <span className="text-sm font-semibold text-white tracking-wide">{title}</span>
  </div>
)
const SectionBody = ({ children }) => (
  <div className="border border-gray-200 rounded-b-md p-4 mb-4">{children}</div>
)
const Field = ({ label, error, children, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-medium text-gray-600">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)
const inputCls = (err = false) =>
  `w-full h-[34px] px-3 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#0c3b73] focus:border-[#0c3b73] transition bg-white ${err ? 'border-red-400' : 'border-gray-300'}`

/* ── empty templates ── */
const EMPTY_TRANSFER = {
  type: 'transfer',
  // school
  affiliationNo: '', schoolCode: '', bookNo: '', slNo: '',
  registrationNo: '', renewedUpto: '', statusOfSchool: 'Secondary/Sr. Secondary',
  // student
  studentName: '', admissionNo: '', category: '', relation: 'Son',
  penNo: '', apaarNo: '',
  fatherName: '', motherName: '', guardianName: '',
  dateOfBirth: '', dateOfBirthInWords: '',
  nationality: 'Indian', religion: '', placeOfBirth: '',
  scheduleCasteTribe: '',
  className: '', section: '', rollNo: '', classInWords: '',
  admittedClass: '',
  dateOfAdmission: '', dateOfLeaving: '', dateStruck: '',
  reasonOfLeaving: "Parents' Request",
  lastExamAppeared: '', lastExamResult: 'Pass', boardExamResult: '',
  failedTimes: '', subjectStudied: '',
  promotedClass: '', promotedClassInWords: '',
  totalWorkingDays: '', totalPresent: '',
  nccScoutGuide: '', feesStatus: 'Paid', feesPaidUpTo: '', feeConcession: '',
  whetherGovt: '', extraCurricular: '', medium: 'English',
  migrationCertIssued: '', characterCertIssued: '',
  conduct: 'Good', certificateNo: '', issueDate: '', status: 'Draft', remarks: '',
}
const EMPTY_CHARACTER = {
  type: 'character',
  studentName: '', admissionNo: '', fatherName: '', motherName: '',
  dateOfBirth: '', nationality: 'Indian', category: '',
  className: '', section: '', rollNo: '', dateOfAdmission: '',
  conduct: 'Good', characterDescription: '',
  certificateNo: '', issueDate: '', status: 'Draft', remarks: '',
}

/* ════════════════════════════════════════════
   STUDENT SEARCH PANEL
════════════════════════════════════════════ */
const StudentSearchPanel = ({ onSelect }) => {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched,setSearched]= useState(false)

  const search = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true); setSearched(true)
    try {
      const res = await getRequest(`certificates/students?search=${encodeURIComponent(query.trim())}&limit=10`)
      setResults(res?.data?.data?.students || [])
    } catch { toast.error('Failed to search students') }
    finally { setLoading(false) }
  }, [query])

  return (
    <div className="mb-4">
      <SectionHeader title="Search & Select Student (from Database)" />
      <div className="border border-gray-200 rounded-b-md p-4">
        <div className="flex gap-2 mb-3">
          <Input placeholder="Type name, student ID, father's name..." value={query}
            onChange={(e) => setQuery(e.target.value)} onPressEnter={search}
            prefix={<Search size={13} className="text-gray-400" />} allowClear />
          <button type="button" onClick={search} disabled={loading || !query.trim()}
            className="px-4 py-1.5 text-sm rounded-lg bg-[#0c3b73] text-white hover:bg-[#0a2f5c] transition disabled:opacity-50 flex items-center gap-1.5">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />} Search
          </button>
        </div>
        {loading && <div className="py-4 flex justify-center"><Spin size="small" /></div>}
        {!loading && searched && results.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No students found</p>}
        {!loading && results.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {results.map((s) => {
              const name = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')
              return (
                <button key={s._id} type="button" onClick={() => onSelect(s._id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#0c3b73] hover:bg-[#0c3b73]/5 transition text-left group">
                  {s.profilePic
                    ? <img src={s.profilePic} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    : <div className="w-8 h-8 rounded-full bg-[#0c3b73]/10 flex items-center justify-center flex-shrink-0"><User size={14} className="text-[#0c3b73]" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-400">
                      ID: {s.studentId}{s.currentClass?.name && ` · Class ${s.currentClass.name}`}{s.currentSection?.name && ` - ${s.currentSection.name}`}
                    </p>
                  </div>
                  <span className="text-xs text-[#0c3b73] opacity-0 group-hover:opacity-100 transition">Select →</span>
                </button>
              )
            })}
          </div>
        )}
        {!searched && <p className="text-xs text-gray-400 text-center py-2">Search students to auto-fill the form</p>}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   MAIN MODAL
════════════════════════════════════════════ */
const CertificateFormModal = ({ open, onClose, editData, defaultType = 'transfer', refresh, onPrint }) => {
  const isEdit = !!editData
  const { tenantDetails } = useContext(AppContext)
  const [certType,        setCertType]        = useState(editData?.type || defaultType)
  const [form,            setForm]            = useState(certType === 'transfer' ? EMPTY_TRANSFER : EMPTY_CHARACTER)
  const [errors,          setErrors]          = useState({})
  const [loading,         setLoading]         = useState(false)
  const [fetchingStudent, setFetchingStudent] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [schoolData,      setSchoolData]      = useState(null)

  // Fetch fresh school data when modal opens
  useEffect(() => {
    if (!open) return
    const fetchSchool = async () => {
      try {
        const subdomain = getTenant()
        const res = await getRequest(`schools?subdomain=${subdomain}`)
        const data = res?.data?.data?.tenants?.[0]
        if (data) setSchoolData(data)
      } catch {
        // fallback to tenantDetails from context
        setSchoolData(tenantDetails)
      }
    }
    fetchSchool()
  }, [open])

  // Helper to build school defaults — prefer fresh schoolData, fallback to context
  const getSchoolDefaults = (src = schoolData || tenantDetails) => ({
    affiliationNo:  src?.affiliationNo  || '',
    schoolCode:     src?.schoolCode     || '',
    statusOfSchool: src?.statusOfSchool || 'Secondary/Sr. Secondary',
    medium:         src?.schoolMedium   || 'English',
    registrationNo: src?.registrationNo || '',
  })

  useEffect(() => {
    if (editData) {
      setCertType(editData.type || defaultType)
      setForm({ ...(editData.type === 'transfer' ? EMPTY_TRANSFER : EMPTY_CHARACTER), ...editData })
      setSelectedStudent(null)
    } else {
      setCertType(defaultType)
      // Pre-fill school fields from tenantDetails when creating new certificate
      setForm({ ...(defaultType === 'transfer' ? EMPTY_TRANSFER : EMPTY_CHARACTER), ...getSchoolDefaults() })
      setSelectedStudent(null)
    }
    setErrors({})
  }, [editData, open, defaultType, schoolData, tenantDetails])

  const set = (key, val) => { setForm(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: undefined })) }

  const handleTypeChange = (val) => {
    setCertType(val)
    setForm({ ...(val === 'transfer' ? EMPTY_TRANSFER : EMPTY_CHARACTER), ...getSchoolDefaults() })
    setSelectedStudent(null); setErrors({})
  }

  const handleStudentSelect = async (studentId) => {
    setFetchingStudent(true)
    try {
      const res = await getRequest(`certificates/students/${studentId}`)
      const { prefill, student } = res?.data?.data || {}
      if (!prefill) return
      setSelectedStudent({
        name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
        id: student.studentId,
        class: prefill.className || '',
        section: prefill.section || '',
      })
      setForm(prev => ({
        ...prev,
        studentName:         prefill.studentName         || prev.studentName,
        admissionNo:         prefill.admissionNo         || prev.admissionNo,
        fatherName:          prefill.fatherName          || prev.fatherName,
        motherName:          prefill.motherName          || prev.motherName,
        guardianName:        prefill.guardianName        || prev.guardianName,
        dateOfBirth:         prefill.dateOfBirth         || prev.dateOfBirth,
        dateOfBirthInWords:  prefill.dateOfBirthInWords  || prev.dateOfBirthInWords,
        nationality:         prefill.nationality         || prev.nationality,
        category:            prefill.category            || prev.category,
        religion:            prefill.religion            || prev.religion,
        scheduleCasteTribe:  prefill.scheduleCasteTribe  || prev.scheduleCasteTribe,
        penNo:               prefill.penNo               || prev.penNo,
        apaarNo:             prefill.apaarNo             || prev.apaarNo,
        relation:            prefill.relation            || prev.relation,
        className:           prefill.className           || prev.className,
        admittedClass:       prefill.admittedClass       || prev.admittedClass,
        section:             prefill.section             || prev.section,
        rollNo:              prefill.rollNo              || prev.rollNo,
        dateOfAdmission:     prefill.dateOfAdmission     || prev.dateOfAdmission,
        session:             prefill.session             || prev.session,
        lastExamAppeared:    prefill.lastExamAppeared    || prev.lastExamAppeared,
        medium:              prefill.medium              || prev.medium,
        affiliationNo:       prefill.affiliationNo       || prev.affiliationNo,
        schoolCode:          prefill.schoolCode          || prev.schoolCode,
        statusOfSchool:      prefill.statusOfSchool      || prev.statusOfSchool,
        registrationNo:      prefill.registrationNo      || prev.registrationNo,
        studentDbId:         student._id,
      }))
      setErrors({})
      toast.success('Student details filled from database')
    } catch { toast.error('Failed to fetch student details') }
    finally { setFetchingStudent(false) }
  }

  const clearStudent = () => {
    setSelectedStudent(null)
    setForm(prev => ({ ...prev, studentName:'', admissionNo:'', fatherName:'', motherName:'', dateOfBirth:'', className:'', section:'', rollNo:'', dateOfAdmission:'', studentDbId: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.studentName?.trim()) e.studentName = 'Required'
    if (!form.admissionNo?.trim()) e.admissionNo = 'Required'
    if (!form.fatherName?.trim())  e.fatherName  = 'Required'
    if (!form.dateOfBirth)         e.dateOfBirth = 'Required'
    if (!form.className?.trim())   e.className   = 'Required'
    if (!form.issueDate)           e.issueDate   = 'Required'
    if (certType === 'transfer' && !form.dateOfLeaving) e.dateOfLeaving = 'Required'
    return e
  }

  const handleSubmit = async (andPrint = false) => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); toast.error('Please fix errors'); return }
    setLoading(true)
    try {
      const payload = { ...form, type: certType }
      let savedData
      if (isEdit) {
        const res = await putRequest({ url: `certificates/${editData._id}`, cred: payload })
        savedData = res?.data?.data || payload
        toast.success('Certificate updated')
      } else {
        const res = await postRequest({ url: 'certificates', cred: payload })
        savedData = res?.data?.data || payload
        toast.success('Certificate issued')
      }
      refresh()
      andPrint && onPrint ? onPrint(savedData) : onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || (isEdit ? 'Update failed' : 'Issue failed'))
    } finally { setLoading(false) }
  }

  const title = certType === 'transfer' ? 'Transfer Certificate (TC)' : 'Character Certificate'

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={800} destroyOnClose
      title={
        <div>
          <p className="text-base font-semibold text-gray-800">{isEdit ? `Edit ${title}` : `Issue ${title}`}</p>
          <p className="text-xs text-gray-400 font-normal mt-0.5">{isEdit ? 'Update certificate details' : 'Search student to auto-fill, then customize'}</p>
        </div>
      }
    >
      <div className="max-h-[80vh] overflow-y-auto pr-1 mt-3">

        {/* Certificate Type */}
        {!isEdit && (
          <><SectionHeader title="Certificate Type" />
          <SectionBody>
            <Field label={<RequiredLabel label="Type" />}>
              <Select value={certType} onChange={handleTypeChange} className="w-full">
                {CERT_TYPES.map(({ value, label }) => <Option key={value} value={value}>{label}</Option>)}
              </Select>
            </Field>
          </SectionBody></>
        )}

        {/* Student Search */}
        {!isEdit && (
          <div className="relative">
            {fetchingStudent && <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-b-md"><Spin /></div>}
            <StudentSearchPanel onSelect={handleStudentSelect} />
          </div>
        )}

        {/* Selected student chip */}
        {selectedStudent && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
            <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">{selectedStudent.name}</p>
              <p className="text-xs text-green-600">{selectedStudent.id}{selectedStudent.class && ` · Class ${selectedStudent.class}`} · Auto-filled</p>
            </div>
            <button type="button" onClick={clearStudent} className="p-1 rounded hover:bg-green-100 text-green-700"><X size={13} /></button>
          </div>
        )}

        {/* ── School / Certificate Header Info ── */}
        <SectionHeader title="School & Certificate Info" />
        <SectionBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Affiliation No.">
              <input value={form.affiliationNo || ''} onChange={e => set('affiliationNo', e.target.value)} placeholder="e.g. 2131047" className={inputCls()} />
            </Field>
            <Field label="School Code">
              <input value={form.schoolCode || ''} onChange={e => set('schoolCode', e.target.value)} placeholder="e.g. 70426" className={inputCls()} />
            </Field>
            <Field label="Book No.">
              <input value={form.bookNo || ''} onChange={e => set('bookNo', e.target.value)} placeholder="Book No." className={inputCls()} />
            </Field>
            <Field label="S.L. No.">
              <input value={form.slNo || ''} onChange={e => set('slNo', e.target.value)} placeholder="SL No." className={inputCls()} />
            </Field>
            <Field label="Registration No.">
              <input value={form.registrationNo || ''} onChange={e => set('registrationNo', e.target.value)} placeholder="Reg. No." className={inputCls()} />
            </Field>
            <Field label="Renewed Upto">
              <input type="date" value={form.renewedUpto || ''} onChange={e => set('renewedUpto', e.target.value)} className={inputCls()} />
            </Field>
            <Field label="Status of School" className="col-span-2 sm:col-span-1">
              <Select value={form.statusOfSchool || 'Secondary/Sr. Secondary'} onChange={v => set('statusOfSchool', v)} className="w-full">
                {SCHOOL_STATUS_OPT.map(o => <Option key={o} value={o}>{o}</Option>)}
              </Select>
            </Field>
            <Field label={<RequiredLabel label="Certificate No." />} error={errors.certificateNo}>
              <input value={form.certificateNo || ''} onChange={e => set('certificateNo', e.target.value)} placeholder="e.g. TC/2024/001" className={inputCls(errors.certificateNo)} />
            </Field>
            <Field label={<RequiredLabel label="Issue Date" />} error={errors.issueDate}>
              <input type="date" value={form.issueDate || ''} onChange={e => set('issueDate', e.target.value)} className={inputCls(errors.issueDate)} />
            </Field>
          </div>
        </SectionBody>

        {/* ── Student Personal Info ── */}
        <SectionHeader title="Student Information" />
        <SectionBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={<RequiredLabel label="5. Student's Name" />} error={errors.studentName}>
              <input value={form.studentName} onChange={e => set('studentName', e.target.value)} placeholder="Full name" className={inputCls(errors.studentName)} />
            </Field>
            <Field label={<RequiredLabel label="Admission No." />} error={errors.admissionNo}>
              <input value={form.admissionNo} onChange={e => set('admissionNo', e.target.value)} placeholder="e.g. ADM/2024/001" className={inputCls(errors.admissionNo)} />
            </Field>
            <Field label="1. PEN No.">
              <input value={form.penNo || ''} onChange={e => set('penNo', e.target.value)} placeholder="PEN Number" className={inputCls()} />
            </Field>
            <Field label="4. APAAR No.">
              <input value={form.apaarNo || ''} onChange={e => set('apaarNo', e.target.value)} placeholder="APAAR Number" className={inputCls()} />
            </Field>
            <Field label={<RequiredLabel label="6. Father's Name" />} error={errors.fatherName}>
              <input value={form.fatherName} onChange={e => set('fatherName', e.target.value)} placeholder="Father's full name" className={inputCls(errors.fatherName)} />
            </Field>
            <Field label="7. Mother's Name">
              <input value={form.motherName} onChange={e => set('motherName', e.target.value)} placeholder="Mother's full name" className={inputCls()} />
            </Field>
            <Field label="8. Guardian's Name (if applicable)">
              <input value={form.guardianName || ''} onChange={e => set('guardianName', e.target.value)} placeholder="Guardian name or Not Applicable" className={inputCls()} />
            </Field>
            <Field label="9. Nationality">
              <input value={form.nationality || 'Indian'} onChange={e => set('nationality', e.target.value)} className={inputCls()} />
            </Field>
            <Field label="10. Religion">
              <input value={form.religion || ''} onChange={e => set('religion', e.target.value)} placeholder="e.g. Hindu / Muslim / Christian" className={inputCls()} />
            </Field>
            <Field label="11. Caste & Category (Gen/OBC/SC/ST)">
              <input value={form.category || ''} onChange={e => set('category', e.target.value)} placeholder="e.g. General / OBC / SC / ST" className={inputCls()} />
            </Field>
            <Field label={<RequiredLabel label="12. Date of Birth (figures)" />} error={errors.dateOfBirth}>
              <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={inputCls(errors.dateOfBirth)} />
            </Field>
            <Field label="Date of Birth (in words)">
              <input value={form.dateOfBirthInWords || ''} onChange={e => set('dateOfBirthInWords', e.target.value)} placeholder="e.g. Fifteen August Two Thousand Eight" className={inputCls()} />
            </Field>
            <Field label="13. Place of Birth">
              <input value={form.placeOfBirth || ''} onChange={e => set('placeOfBirth', e.target.value)} placeholder="City / District" className={inputCls()} />
            </Field>
            <Field label="Whether SC/ST/OBC (Schedule Caste/Tribe)">
              <input value={form.scheduleCasteTribe || ''} onChange={e => set('scheduleCasteTribe', e.target.value)} placeholder="e.g. OBC / General" className={inputCls()} />
            </Field>
          </div>
        </SectionBody>

        {/* ── Academic Info ── */}
        <SectionHeader title="Academic Information" />
        <SectionBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="15. Class in Which Admitted">
              <input value={form.admittedClass || ''} onChange={e => set('admittedClass', e.target.value)} placeholder="e.g. Class I" className={inputCls()} />
            </Field>
            <Field label={<RequiredLabel label="16. Class Last Attended" />} error={errors.className}>
              <input value={form.className} onChange={e => set('className', e.target.value)} placeholder="e.g. 10" className={inputCls(errors.className)} />
            </Field>
            <Field label="Class (in words)">
              <input value={form.classInWords || ''} onChange={e => set('classInWords', e.target.value)} placeholder="e.g. Tenth" className={inputCls()} />
            </Field>
            <Field label="Section">
              <input value={form.section} onChange={e => set('section', e.target.value)} placeholder="e.g. A" className={inputCls()} />
            </Field>
            <Field label="Roll No.">
              <input value={form.rollNo} onChange={e => set('rollNo', e.target.value)} placeholder="e.g. 23" className={inputCls()} />
            </Field>
            <Field label="14. Date of Admission">
              <input type="date" value={form.dateOfAdmission || ''} onChange={e => set('dateOfAdmission', e.target.value)} className={inputCls()} />
            </Field>
          </div>
        </SectionBody>

        {/* ── Transfer-Specific Fields ── */}
        {certType === 'transfer' && (<>
          <SectionHeader title="Transfer Details (CBSE Format)" />
          <SectionBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="8. Board/Annual Exam Last Taken with Result">
                <input value={form.boardExamResult || ''} onChange={e => set('boardExamResult', e.target.value)} placeholder="e.g. Annual Exam 2024 — Pass" className={inputCls()} />
              </Field>
              <Field label="8. Last Exam Result">
                <Select value={form.lastExamResult || 'Pass'} onChange={v => set('lastExamResult', v)} className="w-full">
                  {['Pass', 'Fail', 'Compartment', 'Absent', 'Not Applicable'].map(r => <Option key={r} value={r}>{r}</Option>)}
                </Select>
              </Field>
              <Field label="9. Whether failed once/twice in same class">
                <input value={form.failedTimes || ''} onChange={e => set('failedTimes', e.target.value)} placeholder="e.g. No / Once in Class 9" className={inputCls()} />
              </Field>
              <Field label="10. Subject Studied">
                <input value={form.subjectStudied || ''} onChange={e => set('subjectStudied', e.target.value)} placeholder="e.g. Hindi, English, Math, Science, S.St" className={inputCls()} />
              </Field>
              <Field label="11. Promoted to class (figures)">
                <input value={form.promotedClass || ''} onChange={e => set('promotedClass', e.target.value)} placeholder="e.g. 11" className={inputCls()} />
              </Field>
              <Field label="11. Promoted class (in words)">
                <input value={form.promotedClassInWords || ''} onChange={e => set('promotedClassInWords', e.target.value)} placeholder="e.g. Eleventh" className={inputCls()} />
              </Field>
              <Field label="12. Total Working Days">
                <input value={form.totalWorkingDays || ''} onChange={e => set('totalWorkingDays', e.target.value)} placeholder="e.g. 220" className={inputCls()} />
              </Field>
              <Field label="13. Total Days Present">
                <input value={form.totalPresent || ''} onChange={e => set('totalPresent', e.target.value)} placeholder="e.g. 198" className={inputCls()} />
              </Field>
              <Field label="14. Month upto which Fees Paid">
                <input value={form.feesPaidUpTo || ''} onChange={e => set('feesPaidUpTo', e.target.value)} placeholder="e.g. March 2026" className={inputCls()} />
              </Field>
              <Field label="15. Fee Concession (if any)">
                <input value={form.feeConcession || ''} onChange={e => set('feeConcession', e.target.value)} placeholder="e.g. No / 50% scholarship" className={inputCls()} />
              </Field>
              <Field label="16. NCC / Boy Scout / Girl Guide">
                <input value={form.nccScoutGuide || ''} onChange={e => set('nccScoutGuide', e.target.value)} placeholder="e.g. NCC 'B' Certificate" className={inputCls()} />
              </Field>
              <Field label="Whether School is Govt./Minority/Independent">
                <input value={form.whetherGovt || ''} onChange={e => set('whetherGovt', e.target.value)} placeholder="e.g. Independent" className={inputCls()} />
              </Field>
              <Field label={<RequiredLabel label="18. Date of Leaving" />} error={errors.dateOfLeaving}>
                <input type="date" value={form.dateOfLeaving || ''} onChange={e => set('dateOfLeaving', e.target.value)} className={inputCls(errors.dateOfLeaving)} />
              </Field>
              <Field label="Date struck off rolls">
                <input type="date" value={form.dateStruck || ''} onChange={e => set('dateStruck', e.target.value)} className={inputCls()} />
              </Field>
              <Field label="20. Reason for Leaving">
                <Select value={form.reasonOfLeaving} onChange={v => set('reasonOfLeaving', v)} className="w-full">
                  {LEAVING_REASONS.map(r => <Option key={r} value={r}>{r}</Option>)}
                </Select>
              </Field>
              <Field label="24. Conduct & Behavior">
                <Select value={form.conduct} onChange={v => set('conduct', v)} className="w-full">
                  {CONDUCT_OPTIONS.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Field>
              <Field label="25. Fee Dues Status">
                <Select value={form.feesStatus || 'Paid'} onChange={v => set('feesStatus', v)} className="w-full">
                  {['Cleared', 'Paid', 'Partially Paid', 'Due'].map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Field>
              <Field label="30. Medium of Instruction">
                <input value={form.medium || 'English'} onChange={e => set('medium', e.target.value)} placeholder="e.g. English / Hindi" className={inputCls()} />
              </Field>
              <Field label="31. Migration Certificate Issued">
                <Select value={form.migrationCertIssued || ''} onChange={v => set('migrationCertIssued', v)} className="w-full">
                  {['Yes', 'No', 'N/A'].map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Field>
              <Field label="32. Character Certificate Issued">
                <Select value={form.characterCertIssued || ''} onChange={v => set('characterCertIssued', v)} className="w-full">
                  {['Yes', 'No', 'N/A'].map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Field>
              <Field label="28. Co-Curricular Activities / Achievements" className="sm:col-span-2">
                <textarea value={form.extraCurricular || ''} onChange={e => set('extraCurricular', e.target.value)}
                  rows={2} placeholder="e.g. Debate, Art Competition, Sports..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0c3b73] transition resize-none" />
              </Field>
            </div>
          </SectionBody>
        </>)}

        {/* ── Character Details ── */}
        {certType === 'character' && (<>
          <SectionHeader title="Character Details" />
          <SectionBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="General Conduct">
                <Select value={form.conduct} onChange={v => set('conduct', v)} className="w-full">
                  {CONDUCT_OPTIONS.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Character Description (optional — leave blank for auto-generated text)">
                <textarea value={form.characterDescription || ''} onChange={e => set('characterDescription', e.target.value)}
                  rows={3} placeholder="The above mentioned student has been a sincere and dedicated student..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0c3b73] transition resize-none" />
              </Field>
            </div>
          </SectionBody>
        </>)}

        {/* ── Remarks & Status ── */}
        <SectionHeader title="Remarks & Status" />
        <SectionBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={form.status} onChange={v => set('status', v)} className="w-full">
                {STATUS_OPTIONS.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Select>
            </Field>
            <Field label="Any Other Remark" className="sm:col-span-1">
              <input value={form.remarks || ''} onChange={e => set('remarks', e.target.value)} placeholder="Optional remarks" className={inputCls()} />
            </Field>
          </div>
        </SectionBody>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
        <button onClick={onClose} className="px-5 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Cancel</button>
        <button onClick={() => handleSubmit(false)} disabled={loading}
          className="px-5 py-2 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-60">
          {loading && <Loader2 size={14} className="animate-spin" />}{loading ? 'Saving...' : 'Save Draft'}
        </button>
        <button onClick={() => handleSubmit(true)} disabled={loading}
          className="px-5 py-2 text-sm rounded bg-[#0c3b73] text-white hover:bg-[#0a2f5c] transition flex items-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
          {loading ? 'Processing...' : 'Save & Print'}
        </button>
      </div>
    </Modal>
  )
}

export default CertificateFormModal
