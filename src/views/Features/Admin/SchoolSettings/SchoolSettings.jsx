import React, { useState, useEffect, useContext, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Loader2, Save, Building2, Upload, X } from 'lucide-react'
import { getRequest, patchRequest, fileUpload } from '../../../../Helpers'
import { AppContext } from '../../../../Context/AppContext'

const EMPTY_CP = { name: '', designation: '', contactNo: '', email: '' }

const EMPTY_FORM = {
  schoolName:       '',
  logo:             '',
  description:      '',
  schoolEmail:      '',
  schoolContact:    '',
  schoolContactAlt: '',
  schoolCode:       '',
  estNo:            '',
  affiliationLine:  '',
  affiliationNo:    '',
  schoolMedium:     '',
  msmeRegNo:        '',
  isoRegNo:         '',
  regInfo:          '',
  registrationNo:   '',
  nitiAayog:        '',
  managedBy:        '',
  addressLine1:     '',
  city:             '',
  state:            '',
  country:          'India',
  pincode:          '',
  contactPerson1:   { ...EMPTY_CP },
  contactPerson2:   { ...EMPTY_CP },
}

const TABS = [
  { key: 'identity', label: 'School Identity' },
  { key: 'address',  label: 'Address & Contact' },
  { key: 'persons',  label: 'Contact Persons' },
]

export default function SchoolSettings() {
  const { setTenantDetails, refreshTenantDetails } = useContext(AppContext)
  const [activeTab, setActiveTab]     = useState('identity')
  const [form, setForm]               = useState(EMPTY_FORM)
  const [errors, setErrors]           = useState({})
  const [loading, setLoading]         = useState(false)
  const [fetching, setFetching]       = useState(true)
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef                  = useRef(null)

  /* ── Fetch ── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getRequest('school/profile')
        const d   = res?.data?.data || {}
        setForm({
          schoolName:       d.schoolName       || '',
          logo:             d.logo             || '',
          description:      d.description      || '',
          schoolEmail:      d.schoolEmail      || '',
          schoolContact:    d.schoolContact    || '',
          schoolContactAlt: d.schoolContactAlt || '',
          schoolCode:       d.schoolCode       || '',
          estNo:            d.estNo            || '',
          affiliationLine:  d.affiliationLine  || '',
          affiliationNo:    d.affiliationNo    || '',
          schoolMedium:     d.schoolMedium     || '',
          msmeRegNo:        d.msmeRegNo        || '',
          isoRegNo:         d.isoRegNo         || '',
          regInfo:          d.regInfo          || '',
          registrationNo:   d.registrationNo   || '',
          nitiAayog:        d.nitiAayog        || '',
          managedBy:        d.managedBy        || '',
          addressLine1:     d.addressLine1     || '',
          city:             d.city             || '',
          state:            d.state            || '',
          country:          d.country          || 'India',
          pincode:          d.pincode          || '',
          contactPerson1: {
            name:        d.contactPerson1?.name        || '',
            designation: d.contactPerson1?.designation || '',
            contactNo:   d.contactPerson1?.contactNo   || '',
            email:       d.contactPerson1?.email       || '',
          },
          contactPerson2: {
            name:        d.contactPerson2?.name        || '',
            designation: d.contactPerson2?.designation || '',
            contactNo:   d.contactPerson2?.contactNo   || '',
            email:       d.contactPerson2?.email       || '',
          },
        })
      } catch {
        toast.error('Failed to load school profile')
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [])

  const set   = (k, v)    => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })) }
  const setCP = (p, k, v) => setForm(f => ({ ...f, [p]: { ...f[p], [k]: v } }))
  const numOnly = (v, max = 10) => v.replace(/\D/g, '').slice(0, max)

  /* ── Logo Upload ── */
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP or SVG images allowed')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB')
      return
    }

    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fileUpload({ url: 'upload/uploadImage', cred: formData })
      const url = res?.data?.data?.imageUrl
      if (url) {
        set('logo', url)
        toast.success('Logo uploaded successfully')
      } else {
        toast.error('Upload failed — no URL returned')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Logo upload failed')
    } finally {
      setLogoUploading(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const renderError = (key) => errors[key]
    ? <div className="invalid-feedback d-block">{errors[key]}</div>
    : null

  /* ── Validate ── */
  const validate = () => {
    const e = {}
    if (!form.schoolName.trim()) e.schoolName = 'Required'
    if (form.schoolEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.schoolEmail))
      e.schoolEmail = 'Enter a valid email'
    if (form.schoolContact && !/^\d{10}$/.test(form.schoolContact))
      e.schoolContact = 'Enter a valid 10-digit number'
    if (form.schoolContactAlt && !/^\d{10}$/.test(form.schoolContactAlt))
      e.schoolContactAlt = 'Enter a valid 10-digit number'
    if (form.contactPerson1.contactNo && !/^\d{10}$/.test(form.contactPerson1.contactNo))
      e.cp1_contactNo = 'Enter a valid 10-digit number'
    if (form.contactPerson1.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactPerson1.email))
      e.cp1_email = 'Enter a valid email'
    if (form.contactPerson2.contactNo && !/^\d{10}$/.test(form.contactPerson2.contactNo))
      e.cp2_contactNo = 'Enter a valid 10-digit number'
    if (form.contactPerson2.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactPerson2.email))
      e.cp2_email = 'Enter a valid email'
    return e
  }

  /* ── Submit ── */
  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      toast.error('Please fix the errors before saving')
      return
    }
    setLoading(true)
    try {
      const res = await patchRequest({ url: 'school/profile', cred: form })
      // Update tenantDetails in context + localStorage so marksheet reflects new address immediately
      if (res?.data?.data) {
        setTenantDetails(res.data.data)
      }
      // Also do a full refresh from server (picks up auto-composed schoolAddress from backend)
      await refreshTenantDetails()
      toast.success('School profile updated successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: 1000 }}>

      {/* ── Page Header ── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: '#0c3b73',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={20} color="#fff" />
          </div>
          <div>
            <h5 className="mb-0 fw-bold" style={{ fontSize: 18, color: '#1e293b' }}>School Settings</h5>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>Update your school's profile and contact information</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary d-flex align-items-center gap-2"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* ── Tabs ── */}
      <ul className="nav nav-tabs mb-0" style={{ borderBottom: '2px solid #e2e8f0' }}>
        {TABS.map(({ key, label }) => (
          <li className="nav-item" key={key}>
            <button
              className={`nav-link ${activeTab === key ? 'active fw-semibold' : ''}`}
              style={{ fontSize: 13, color: activeTab === key ? '#0c3b73' : '#64748b' }}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* ══════════════════════
          TAB 1 — School Identity
      ══════════════════════ */}
      {activeTab === 'identity' && (
        <div className="container-fluid px-0 pt-4">

          {/* Logo */}
          <div className="card mb-3">
            <div className="card-header !bg-[#0c3b73] text-white" style={{ background: '#0c3b73' }}>School Logo</div>
            <div className="card-body">
              <div className="d-flex align-items-center gap-4 flex-wrap">

                {/* Preview */}
                <div style={{
                  width: 80, height: 80, border: '2px dashed #cbd5e1', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#f8fafc', flexShrink: 0, overflow: 'hidden',
                }}>
                  {form.logo
                    ? <img src={form.logo} alt="School Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                    : <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: 4 }}>No Logo</span>
                  }
                </div>

                {/* Upload area */}
                <div className="d-flex flex-column gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    style={{ fontSize: 13 }}
                    disabled={logoUploading}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoUploading
                      ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                      : <><Upload size={14} /> {form.logo ? 'Change Logo' : 'Upload Logo'}</>
                    }
                  </button>
                  {form.logo && (
                    <button
                      type="button"
                      className="btn btn-outline-danger d-flex align-items-center gap-2"
                      style={{ fontSize: 13 }}
                      onClick={() => set('logo', '')}
                    >
                      <X size={14} /> Remove Logo
                    </button>
                  )}
                  <small className="text-muted" style={{ fontSize: 11 }}>
                    JPG, PNG, WEBP or SVG · Max 2MB
                  </small>
                </div>

              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="card mb-3">
            <div className="card-header text-white" style={{ background: '#0c3b73' }}>Basic Information</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">School Name <span className="text-danger">*</span></label>
                  <input className={`form-control form-control-sm ${errors.schoolName ? 'is-invalid' : ''}`}
                    value={form.schoolName} onChange={e => set('schoolName', e.target.value)}
                    placeholder="e.g. Maple Grove High School" />
                  {renderError('schoolName')}
                </div>
                <div className="col-md-4">
                  <label className="form-label">School Code</label>
                  <input className="form-control form-control-sm"
                    value={form.schoolCode} onChange={e => set('schoolCode', e.target.value)}
                    placeholder="e.g. SCH001" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Establishment No.</label>
                  <input className="form-control form-control-sm"
                    value={form.estNo} onChange={e => set('estNo', e.target.value)}
                    placeholder="e.g. EST/2001/001" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Register Email ID</label>
                  <input type="email" className={`form-control form-control-sm ${errors.schoolEmail ? 'is-invalid' : ''}`}
                    value={form.schoolEmail} onChange={e => set('schoolEmail', e.target.value)}
                    placeholder="school@gmail.com" />
                  {renderError('schoolEmail')}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Register Phone No.</label>
                  <input className={`form-control form-control-sm ${errors.schoolContact ? 'is-invalid' : ''}`}
                    value={form.schoolContact}
                    onChange={e => set('schoolContact', numOnly(e.target.value))}
                    placeholder="10-digit number" />
                  {renderError('schoolContact')}
                </div>
                <div className="col-md-4">
                  <label className="form-label">School Medium</label>
                  <input className="form-control form-control-sm"
                    value={form.schoolMedium} onChange={e => set('schoolMedium', e.target.value)}
                    placeholder="e.g. English / Hindi" />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control form-control-sm" rows={2}
                    value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Brief description of the school (optional)"
                    style={{ resize: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Registration & Accreditations */}
          <div className="card mb-3">
            <div className="card-header text-white" style={{ background: '#0c3b73' }}>Registration & Accreditations</div>
            <div className="card-body">
              <div className="row g-3">
                {[
                  ['affiliationLine', 'Affiliation Line',  'e.g. CBSE'],
                  ['affiliationNo',   'Affiliation No.',   'e.g. 2130100'],
                  ['registrationNo',  'Registration No.',  'e.g. REG/2024/001'],
                  ['msmeRegNo',       'MSME Reg. No.',     'UDYAM-XX-00-000000'],
                  ['isoRegNo',        'ISO Reg. No.',      'ISO-9001-2015'],
                  ['nitiAayog',       'NITI Aayog',        'NITI AAYOG/XX'],
                  ['managedBy',       'Managed By',        'Trust / Society'],
                  ['regInfo',         'Reg. Info',         'e.g. Reg. 12A'],
                ].map(([key, lbl, ph]) => (
                  <div className="col-md-4" key={key}>
                    <label className="form-label">{lbl}</label>
                    <input className="form-control form-control-sm"
                      value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════
          TAB 2 — Address & Contact
      ══════════════════════ */}
      {activeTab === 'address' && (
        <div className="container-fluid px-0 pt-4">

          {/* School Address */}
          <div className="card mb-3">
            <div className="card-header text-white" style={{ background: '#0c3b73' }}>School Address</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Address Line 1</label>
                  <input className={`form-control form-control-sm ${errors.addressLine1 ? 'is-invalid' : ''}`}
                    value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)}
                    placeholder="Street / Building / Area" />
                  {renderError('addressLine1')}
                </div>
                <div className="col-md-3">
                  <label className="form-label">City / District</label>
                  <input className="form-control form-control-sm"
                    value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Noida" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">State</label>
                  <input className="form-control form-control-sm"
                    value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Uttar Pradesh" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Country</label>
                  <input className="form-control form-control-sm"
                    value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. India" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Pincode</label>
                  <input className="form-control form-control-sm"
                    value={form.pincode} onChange={e => set('pincode', numOnly(e.target.value))}
                    placeholder="e.g. 201301" />
                </div>
                {(form.addressLine1 || form.city || form.state) && (
                  <div className="col-12">
                    <small className="text-muted">
                      <strong>Full address:</strong>{' '}
                      {[form.addressLine1, form.city, form.state, form.country, form.pincode].filter(Boolean).join(', ')}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="card mb-3">
            <div className="card-header text-white" style={{ background: '#0c3b73' }}>Contact Numbers</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Alternate Contact No.</label>
                  <input className={`form-control form-control-sm ${errors.schoolContactAlt ? 'is-invalid' : ''}`}
                    value={form.schoolContactAlt}
                    onChange={e => set('schoolContactAlt', numOnly(e.target.value))}
                    placeholder="10-digit number (optional)" />
                  {renderError('schoolContactAlt')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════
          TAB 3 — Contact Persons
      ══════════════════════ */}
      {activeTab === 'persons' && (
        <div className="container-fluid px-0 pt-4">

          {/* Contact Person 1 */}
          <div className="card mb-3">
            <div className="card-header text-white" style={{ background: '#0c3b73' }}>Contact Person 1</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Full Name</label>
                  <input className="form-control form-control-sm"
                    value={form.contactPerson1.name}
                    onChange={e => setCP('contactPerson1', 'name', e.target.value)}
                    placeholder="e.g. Ramesh Kumar" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Designation</label>
                  <input className="form-control form-control-sm"
                    value={form.contactPerson1.designation}
                    onChange={e => setCP('contactPerson1', 'designation', e.target.value)}
                    placeholder="e.g. Principal" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Contact No.</label>
                  <input className={`form-control form-control-sm ${errors.cp1_contactNo ? 'is-invalid' : ''}`}
                    value={form.contactPerson1.contactNo}
                    onChange={e => setCP('contactPerson1', 'contactNo', numOnly(e.target.value))}
                    placeholder="10-digit number" />
                  {renderError('cp1_contactNo')}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Email ID</label>
                  <input type="email" className={`form-control form-control-sm ${errors.cp1_email ? 'is-invalid' : ''}`}
                    value={form.contactPerson1.email}
                    onChange={e => setCP('contactPerson1', 'email', e.target.value)}
                    placeholder="name@school.com" />
                  {renderError('cp1_email')}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person 2 */}
          <div className="card mb-3">
            <div className="card-header text-white" style={{ background: '#0c3b73' }}>
              Contact Person 2 <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>(Optional)</span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Full Name</label>
                  <input className="form-control form-control-sm"
                    value={form.contactPerson2.name}
                    onChange={e => setCP('contactPerson2', 'name', e.target.value)}
                    placeholder="e.g. Sunita Sharma" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Designation</label>
                  <input className="form-control form-control-sm"
                    value={form.contactPerson2.designation}
                    onChange={e => setCP('contactPerson2', 'designation', e.target.value)}
                    placeholder="e.g. Vice Principal" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Contact No.</label>
                  <input className={`form-control form-control-sm ${errors.cp2_contactNo ? 'is-invalid' : ''}`}
                    value={form.contactPerson2.contactNo}
                    onChange={e => setCP('contactPerson2', 'contactNo', numOnly(e.target.value))}
                    placeholder="10-digit number" />
                  {renderError('cp2_contactNo')}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Email ID</label>
                  <input type="email" className={`form-control form-control-sm ${errors.cp2_email ? 'is-invalid' : ''}`}
                    value={form.contactPerson2.email}
                    onChange={e => setCP('contactPerson2', 'email', e.target.value)}
                    placeholder="name@school.com" />
                  {renderError('cp2_email')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
