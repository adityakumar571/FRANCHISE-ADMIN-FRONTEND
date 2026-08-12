/* eslint-disable prettier/prettier */
/* eslint-disable react/display-name */

import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef, useContext } from 'react'
import { Upload, Button, Checkbox, Modal } from 'antd'
import { UploadOutlined, EyeOutlined } from '@ant-design/icons'
import { getRequest, fileUpload } from '../../Helpers'
import { Edit, Edit2, Trash2 } from 'lucide-react'
import { SessionContext } from '../../Context/Seesion'

const ConcessionAndTransport = forwardRef(({ modalData, onChange }, ref) => {
  const [errors, setErrors] = useState({})
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [documentOptions, setDocumentOptions] = useState([])
  const [uploadingDocs, setUploadingDocs] = useState([])
  const fileInputRef = useRef(null)
  const { currentSession } = useContext(SessionContext)

  const [formData, setFormData] = useState({
    brotherSisterApplied: false,
    fullFeeConcession: false,
    fullFeeExceptTransport: false,
    applySpecialConcession: false,
    brotherSisterConcession: false,
    concessionType: '',
    discount: '',
    discountType: '%',
  })

  // ✅ SEPARATE STATE for sibling selection UI
  const [siblingSelectionClass, setSiblingSelectionClass] = useState('')
  const [siblingSelectionSection, setSiblingSelectionSection] = useState('')
  const [sections, setSections] = useState([])
  const [siblingInput, setSiblingInput] = useState({
    siblingStudentId: '',
    name: '',
    class: '',
    section: '',
    fatherName: '',
    classId: '',
    sectionId: '',
  })

  const [siblings, setSiblings] = useState([])
  const [editingSiblingIndex, setEditingSiblingIndex] = useState(null)
  const [selectedSiblingStudentId, setSelectedSiblingStudentId] = useState('')

  // ✅ SEPARATE STATE for documents
  const [documentInput, setDocumentInput] = useState({
    documentId: '',
    name: '',
    documentNumber: '',
    document: '',
  })
  const [documents, setDocuments] = useState([])
  const [editingDocIndex, setEditingDocIndex] = useState(null)

  const [previewImage, setPreviewImage] = useState('')
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getRequest('classes?isPagination=false')
        setClasses(res?.data?.data?.classes || [])
      } catch (err) {
        console.error('Class fetch error', err)
        setClasses([])
      }
    }
    fetchClasses()
  }, [])

  /* ================= FETCH SECTIONS ================= */
  useEffect(() => {
    if (!siblingSelectionClass) {
      setSections([])
      return
    }

    const fetchSections = async () => {
      try {
        const res = await getRequest(
          `sections?page=1&isPagination=false&classId=${siblingSelectionClass}`,
        )
        setSections(res?.data?.data?.sections || [])
      } catch (err) {
        console.error('Section fetch error:', err)
        setSections([])
      }
    }
    fetchSections()
  }, [siblingSelectionClass])

  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    if (!siblingSelectionClass || !siblingSelectionSection) {
      setStudents([])
      return
    }

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true)
        const res = await getRequest(
          `studentEnrollment?isPagination=false&classId=${siblingSelectionClass}&sectionId=${siblingSelectionSection}`,
        )
        const list = res?.data?.data?.students || []
        const filteredStudents = list.filter((stu) => {
          return (
            stu?.currentClass?._id === siblingSelectionClass &&
            stu?.currentSection?._id === siblingSelectionSection
          )
        })
        setStudents(filteredStudents)
      } catch (err) {
        console.error('Student fetch error:', err)
        setStudents([])
      } finally {
        setLoadingStudents(false)
      }
    }

    fetchStudents()
  }, [siblingSelectionClass, siblingSelectionSection])

  /* ================== FORM DATA HANDLER ================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSiblingInput = (e) => {
    const { name, value } = e.target
    setSiblingInput((prev) => ({ ...prev, [name]: value }))
  }

  const addOrUpdateSibling = () => {
    if (editingSiblingIndex !== null) {
      // Update existing sibling
      setSiblings((prev) =>
        prev.map((sib, idx) => (idx === editingSiblingIndex ? siblingInput : sib)),
      )
      setEditingSiblingIndex(null)
    } else {
      // Add new sibling
      setSiblings((prev) => [...prev, siblingInput])
    }

    // Reset sibling input fields
    setSiblingInput({
      name: '',
      class: '',
      section: '',
      fatherName: '',
    })
    setSiblingSelectionClass('')
    setSiblingSelectionSection('')
    setSelectedSiblingStudentId('')
  }

  const editSibling = (index) => {
    const sib = siblings[index]
    setSiblingInput(sib)
    setEditingSiblingIndex(index)
    setSiblingSelectionClass(sib.classId || '')
    setSiblingSelectionSection(sib.sectionId || '')
    // ✅ IMPORTANT: student dropdown value
    setSelectedSiblingStudentId(sib.siblingStudentId || '')

    // input values
    setSiblingInput({
      siblingStudentId: sib.siblingStudentId,
      name: sib.name,
      fatherName: sib.fatherName,
      class: sib.class,
      section: sib.section,
      classId: sib.classId,
      sectionId: sib.sectionId,
    })
  }

  const removeSibling = (index) => {
    setSiblings((prev) => prev.filter((_, i) => i !== index))
    if (editingSiblingIndex === index) {
      setEditingSiblingIndex(null)
      setSiblingInput({
        name: '',
        class: '',
        section: '',
        fatherName: '',
      })
    }
  }

  const handleCancel = () => setIsPreviewVisible(false)

  const renderError = (field) =>
    errors[field] && <div className="text-danger small">{errors[field]}</div>

  // useEffect(() => {
  //   const fetchDocuments = async () => {
  //     const res = await getRequest('documents?category=Student&isPagination=false&isActive=true')
  //     setDocumentOptions(res?.data?.data?.documents || [])
  //   }
  //   fetchDocuments()
  // }, [])

  useEffect(() => {
    if (!currentSession?._id) return

    const fetchDocuments = async () => {
      try {
        const res = await getRequest(
          `documents?category=Student&session=${currentSession._id}&isPagination=false&isActive=true`,
        )
        setDocumentOptions(res?.data?.data?.documents || [])
      } catch (err) {
        console.error('Error fetching documents:', err)
      }
    }

    fetchDocuments()
  }, [currentSession])

  /* ================== ✅ EDIT MODE PREFILL - FIXED ================== */
  useEffect(() => {
    if (!modalData) return

    // ✅ Prefill siblings with all fields
    if (modalData.sibling && Array.isArray(modalData.sibling) && modalData.sibling.length > 0) {
      const mappedSiblings = modalData.sibling.map((sib) => {
        const student = sib.siblingStudentId || {}

        return {
          siblingStudentId: student._id || '',

          // ✅ NAME from populated student
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),

          // ✅ FATHER NAME
          fatherName: student.fatherName || '',

          // ✅ Class / Section
          class: sib.class?.name || '',
          section: sib.section?.name || '',
          classId: sib.class?._id || '',
          sectionId: sib.section?._id || '',
        }
      })
      setSiblings(mappedSiblings)

      // ✅ Check the checkbox if siblings exist
      setFormData((prev) => ({
        ...prev,
        brotherSisterApplied: true,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        brotherSisterApplied: modalData.brotherSisterApplied || false,
      }))
    }

    // ✅ Prefill concession fields
    setFormData((prev) => ({
      ...prev,
      fullFeeConcession:     modalData.fullFeeConcession     || false,
      fullFeeExceptTransport: modalData.fullFeeExceptTransport || false,
      discount:     modalData.discount     || '',
      discountType: modalData.discountType || '%',
    }))

    // ✅ Prefill documents
    if (!modalData || !Array.isArray(modalData.documents)) return

    const normalizedDocs = modalData.documents.map((doc) => {
      const resolvedId = typeof doc.documentId === 'object' ? doc.documentId._id : doc.documentId

      const resolvedName = typeof doc.documentId === 'object' ? doc.documentId.name : ''

      return {
        documentId: resolvedId, // ✅ STRING ONLY
        name: resolvedName || '', // ✅ FIXED
        documentNumber: doc.documentNumber || '',
        document: doc.document || '',
      }
    })

    setDocuments(normalizedDocs)

    // console.log('🟢 NORMALIZED DOCUMENTS', normalizedDocs)
  }, [modalData])

  /* ================== LIVE DATA PROPAGATION ================== */
  useEffect(() => {
    onChange?.({
      ...formData,
      sibling: siblings.map((sib) => ({
        siblingStudentId: sib.siblingStudentId,
        name: sib.name, // ✅
        fatherName: sib.fatherName,
        class: sib.classId,
        section: sib.sectionId,
      })),
      documents: documents,
    })
  }, [formData, siblings, documents, onChange])

  /* ================== IMPERATIVE HANDLE ================== */
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      const docs = documents.filter((doc) => Boolean(doc.documentId))

      // ✅ Send only IDs in payload
      const siblingsPayload = siblings.map((sib) => ({
        siblingStudentId: sib.siblingStudentId,

        class: sib.classId,
        section: sib.sectionId,
      }))

      return {
        valid: true,
        data: {
          ...formData,
          sibling: siblingsPayload,
          documents: docs.map((d) => ({
            documentId: d.documentId,
            documentNumber: d.documentNumber,
            document: d.document,
          })),
        },
      }
    },
  }))

  // console.log("✅ DOCUMENTS FINAL STATE", documents)

  /* ================== DOCUMENT HANDLERS ================== */
  const handleDocumentInput = (e) => {
    const { name, value } = e.target
    setDocumentInput((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Only images (jpg, jpeg, png) and PDF files are allowed!')
      e.target.value = ''
      return
    }

    const formDataFile = new FormData()
    formDataFile.append('file', file)

    setUploading(true)

    fileUpload({ url: 'upload/uploadImage', cred: formDataFile })
      .then((res) => {
        const uploadedFileUrl = res?.data?.data?.imageUrl
        if (uploadedFileUrl) {
          setDocumentInput((prev) => ({
            ...prev,
            document: uploadedFileUrl,
          }))
        }
      })
      .catch((err) => {
        console.error('File upload failed', err)
      })
      .finally(() => {
        setUploading(false)
      })
  }

  const removeDocumentImage = () => {
    // 1️⃣ clear preview state
    setDocumentInput((prev) => ({
      ...prev,
      document: '',
    }))

    // 2️⃣ clear file input value (MOST IMPORTANT)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // 3️⃣ safety: uploading false
    setUploading(false)
  }

  // const addOrUpdateDocument = () => {
  //   if (editingDocIndex !== null) {
  //     // Update existing document
  //     setDocuments((prev) =>
  //       prev.map((doc, idx) => (idx === editingDocIndex ? documentInput : doc)),
  //     )
  //     setEditingDocIndex(null)
  //   } else {
  //     // Add new document
  //     setDocuments((prev) => [...prev, documentInput])
  //   }

  //   // Reset document input fields
  //   setDocumentInput({
  //     documentId: '',
  //     name: '',
  //     documentNumber: '',
  //     document: '',
  //   })
  // }
  const addOrUpdateDocument = () => {
    if (!documentInput.documentId) return

    const finalDoc = {
      documentId:
        typeof documentInput.documentId === 'object'
          ? documentInput.documentId._id
          : documentInput.documentId, // ✅ SAFETY
      name: documentInput.name || '',
      documentNumber: documentInput.documentNumber || '',
      document: documentInput.document || '',
    }

    if (editingDocIndex !== null) {
      setDocuments((prev) => prev.map((doc, i) => (i === editingDocIndex ? finalDoc : doc)))
    } else {
      setDocuments((prev) => [...prev, finalDoc])
    }

    setEditingDocIndex(null)

    setDocumentInput({
      documentId: '',
      name: '',
      documentNumber: '',
      document: '',
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const editDocument = (index) => {
    const doc = documents[index]

    setDocumentInput({
      documentId: doc.documentId, // ✅ string
      name: doc.name || '',
      documentNumber: doc.documentNumber || '',
      document: doc.document || '',
    })

    setEditingDocIndex(index)
  }

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
    if (editingDocIndex === index) {
      setEditingDocIndex(null)
      setDocumentInput({
        documentId: '',
        name: '',
        documentNumber: '',
        document: '',
      })
    }
  }

  // ✅ Check if sibling add button should be disabled
  const isSiblingAddDisabled =
    !siblingSelectionClass || !siblingSelectionSection || !siblingInput.name

  // ✅ Check if document add button should be disabled
  const isDocumentAddDisabled = !documentInput.documentId || !documentInput.documentNumber

  /* ================== RETURN JSX ================== */
  return (
    <form className="container mt-3">

      {/* ================= CONCESSION ================= */}
      <div className="card mb-3">
        <div className="card-header !bg-[#0c3b73] text-white">Fee Concession</div>
        <div className="card-body">
          <div className="row g-3 align-items-end">

            {/* Full Fee Concession */}
            <div className="col-md-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="fullFeeConcession"
                  name="fullFeeConcession"
                  checked={formData.fullFeeConcession}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setFormData((prev) => ({
                      ...prev,
                      fullFeeConcession: checked,
                      // uncheck the other options
                      fullFeeExceptTransport: checked ? false : prev.fullFeeExceptTransport,
                      discount: checked ? '' : prev.discount,
                    }))
                  }}
                />
                <label className="form-check-label fw-semibold" htmlFor="fullFeeConcession">
                  Full Fee Concession (100%)
                </label>
              </div>
            </div>

            {/* Full Fee Except Transport */}
            <div className="col-md-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="fullFeeExceptTransport"
                  name="fullFeeExceptTransport"
                  checked={formData.fullFeeExceptTransport}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setFormData((prev) => ({
                      ...prev,
                      fullFeeExceptTransport: checked,
                      fullFeeConcession: checked ? false : prev.fullFeeConcession,
                      discount: checked ? '' : prev.discount,
                    }))
                  }}
                />
                <label className="form-check-label fw-semibold" htmlFor="fullFeeExceptTransport">
                  Full Fee Except Transport
                </label>
              </div>
            </div>

            {/* Discount (only if no full concession) */}
            {!formData.fullFeeConcession && !formData.fullFeeExceptTransport && (
              <>
                <div className="col-md-2">
                  <label className="form-label">Discount</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    name="discount"
                    value={formData.discount}
                    min="0"
                    placeholder="e.g. 10"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select form-select-sm"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                  >
                    <option value="%">% (Percent)</option>
                    <option value="₹">₹ (Fixed Amount)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= SIBLINGS ================= */}
      <div className="card mb-3">
        <div className="card-header !bg-[#0c3b73] text-white">Siblings Details</div>
        <div className="card-body">
          <div className="form-check mb-2">
            <input
              type="checkbox"
              className="form-check-input"
              name="brotherSisterApplied"
              checked={formData.brotherSisterApplied}
              onChange={handleChange}
            />
            <label className="form-check-label fw-semibold">Siblings Studying</label>
          </div>

          {formData.brotherSisterApplied && (
            <div className="mb-3">
              <div className="row g-2 align-items-end mb-3">
                {/* Class */}
                <div className="col-md-3">
                  <label className="form-label">Class</label>
                  <select
                    className="form-select form-select-sm"
                    value={siblingSelectionClass}
                    onChange={(e) => {
                      setSiblingSelectionClass(e.target.value)
                      setSiblingSelectionSection('')
                      setSiblingInput((prev) => ({
                        ...prev,
                        classId: e.target.value,
                        class: classes.find((c) => c._id === e.target.value)?.name || '',
                      }))
                    }}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div className="col-md-3">
                  <label className="form-label">Section</label>
                  <select
                    className="form-select form-select-sm"
                    value={siblingSelectionSection}
                    onChange={(e) => {
                      setSiblingSelectionSection(e.target.value)
                      setSiblingInput((prev) => ({
                        ...prev,
                        sectionId: e.target.value,
                        section: sections.find((s) => s._id === e.target.value)?.name || '',
                      }))
                    }}
                    disabled={!sections.length}
                  >
                    <option value="">Select Section</option>
                    {sections.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student */}
                <div className="col-md-4">
                  <label className="form-label">Student Name</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedSiblingStudentId}
                    onChange={(e) => {
                      const value = e.target.value
                      setSelectedSiblingStudentId(value)

                      const student = students.find((s) => s._id === value)
                      if (!student) return

                      setSiblingInput((prev) => ({
                        ...prev,
                        siblingStudentId: student._id,
                        name: `${student.firstName} ${student.lastName}`,
                        fatherName: student.fatherName || '',
                      }))
                    }}
                    disabled={!students.length}
                  >
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.studentId} | {s.firstName} {s.lastName} | {s.fatherName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add/Update Button */}
                <div className="col-md-2">
                  <Button
                    type="primary"
                    size="small"
                    className="text-sm"
                    onClick={addOrUpdateSibling}
                    block
                    disabled={isSiblingAddDisabled}
                    style={{
                      height: '2rem',
                      fontSize: '',
                      padding: '0 0.1rem',
                      color: 'white',
                      backgroundColor: '#0c3b73',
                    }}
                  >
                    {editingSiblingIndex !== null ? 'Update' : ' Add'}
                  </Button>
                </div>
              </div>

              {/* Sibling Table */}
              <div className="table-responsive mt-2">
                <table className="table table-bordered table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Sr. No.</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Father Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siblings.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No Records Added
                        </td>
                      </tr>
                    ) : (
                      siblings.map((sib, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{sib.name}</td>
                          <td>{sib.class}</td>
                          <td>{sib.section}</td>
                          <td>{sib.fatherName}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                className="w-8 h-8 flex items-center justify-center rounded-full
              text-blue-600 hover:text-white hover:bg-blue-600"
                                size="small"
                                onClick={() => editSibling(i)}
                              >
                                <Edit className="w-4 h-4 cursor-pointer " />
                              </Button>
                              <Button
                                className="w-8 h-8 flex items-center justify-center rounded-full
              text-red-600 hover:text-white hover:bg-red-600"
                                size="small"
                                onClick={() => removeSibling(i)}
                              >
                                <Trash2 className="w-4 h-4 cursor-pointer " />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= DOCUMENTS ================= */}
      <div className="card mb-3">
        <div className="card-header !bg-[#0c3b73] text-white">Documents</div>
        <div className="card-body">
          <div className="row g-2 align-items-start mb-3">
            {' '}
            {/* Document Name */}
            <div className="col-lg-3 col-md-6 col-12">
              <label className="form-label">Document Name</label>
              <select
                className="form-control form-control-sm"
                value={documentInput.documentId}
                onChange={(e) => {
                  const selectedId = e.target.value
                  const selectedDoc = documentOptions.find((d) => d._id === selectedId)

                  setDocumentInput((prev) => ({
                    ...prev,
                    documentId: selectedId, // ✅ string only
                    name: selectedDoc?.name || '',
                  }))
                }}
              >
                <option value="">Select Document</option>
                {documentOptions.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Document Number */}
            <div className="col-lg-3 col-md-6 col-12">
              <label className="form-label">Document Number</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="documentNumber"
                value={documentInput.documentNumber}
                onChange={handleDocumentInput}
                placeholder="Enter Document Number"
              />
            </div>
            {/* Upload + Preview */}
            <div className="col-lg-4 col-md-8 col-12">
              <label className="form-label">Upload Document</label>
              <div className="d-flex gap-2 align-items-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="form-control form-control-sm"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />

                {(uploading || documentInput.document) && (
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed #ddd',
                      borderRadius: 4,
                      position: 'relative',
                    }}
                  >
                    {uploading && <small className="text-danger">uploading...</small>}
                    {!uploading && documentInput.document && (
                      <>
                        {typeof documentInput.document === 'string' &&
                        documentInput.document.endsWith('.pdf') ? (
                          <a href={documentInput.document} target="_blank" rel="noreferrer">
                            PDF
                          </a>
                        ) : (
                          <img
                            src={documentInput.document}
                            alt="doc"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 4,
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={removeDocumentImage}
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            background: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            cursor: 'pointer',
                            fontSize: 12,
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Add/Update Button */}
            <div className="col-lg-2 col-md-4 col-12">
              {/* 🔑 EMPTY LABEL SPACER */}
              <label className="form-label" style={{ visibility: 'hidden' }}>
                Add
              </label>

              <Button
                type="primary"
                className="text-sm"
                size="small"
                onClick={addOrUpdateDocument}
                block
                disabled={isDocumentAddDisabled}
                style={{
                  height: '2rem',
                  fontSize: '',
                  padding: '0 0.1rem',
                  backgroundColor: '#0c3b73',
                  color: 'white',
                }}
              >
                {editingDocIndex !== null ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>

          {/* Document Table */}
          <div className="table-responsive mt-2">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Sr. No.</th>
                  <th>Document Name</th>
                  <th>Document Number</th>
                  <th>Document</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No Records Added
                    </td>
                  </tr>
                ) : (
                  documents.map((doc, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{doc.name}</td>
                      <td>{doc.documentNumber}</td>
                      <td>
                        {doc.document && (
                          <div
                            style={{
                              width: 50,
                              height: 50,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #ddd',
                              borderRadius: 4,
                            }}
                          >
                            {typeof doc.document === 'string' && doc.document.endsWith('.pdf') ? (
                              <a href={doc.document} target="_blank" rel="noreferrer">
                                PDF
                              </a>
                            ) : (
                              <img
                                src={doc.document}
                                alt="doc"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: 4,
                                }}
                              />
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            className="w-8 h-8 flex items-center justify-center rounded-full
              text-blue-600 hover:text-white hover:bg-blue-600"
                            size="small"
                            onClick={() => editDocument(i)}
                          >
                            <Edit className="w-4 h-4 cursor-pointer " />
                          </Button>
                          <Button
                            className="w-8 h-8 flex items-center justify-center rounded-full
              text-red-600 hover:text-white hover:bg-red-600"
                            size="small"
                            onClick={() => removeDocument(i)}
                          >
                            <Trash2 className="w-4 h-4 cursor-pointer " />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={isPreviewVisible} footer={null} onCancel={handleCancel}>
        <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </form>
  )
})

export default ConcessionAndTransport
