/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Modal, Upload } from 'antd'
import toast from 'react-hot-toast'
import { fileUpload, getRequest, postRequest, putRequest } from '../../../Helpers'
import { PlusOutlined } from '@ant-design/icons'
import { Edit, Trash2 } from 'lucide-react'
import { SessionContext } from '../../../Context/Seesion'

const initialState = {
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  gender: '',
  category: '',
  religion: '',
  caste: '',
  aadhaarNo: '',
  // session: '',
  phone: '',
  email: '',
  medium: '',
  emergencyContact: {
    name: '',
    relation: '',
    phone: '',
  },
  // otherCategoryName: '',

  address: {
    present: {
      Address1: '',
      Address2: '',
      City: '',
      State: '',
      Pin: '',
      Mobile: '',
      Email: '',
    },
    permanent: {
      Address1: '',
      Address2: '',
      City: '',
      State: '',
      Pin: '',
      Mobile: '',
      Email: '',
    },
  },
  profilePic: '',

  employeeId: '',
  dateOfJoining: '',
  department: '',
  designation: '',
  employmentType: '',
  subjects: ['', ''],

  classesAssigned: [
    {
      session: '',
      classId: '',
      sectionId: '',
      stream: '',
      subjectId: '',
      isClassTeacher: false,
    },
  ],
  house: '',
  shift: '',

  experience: [
    {
      schoolName: '',
      designation: '',
      startDate: '',
      endDate: '',
      subjects: [''],
    },
  ],

  totalExperience: '',
  salary: '',

  bankAccount: {
    accountNumber: '',
    bankName: '',
    ifsc: '',
  },
  specialAllowance: '',
  remarks: '',
  documents: [],
  status: 'Active',
}

const TeacherModal = ({ isModalOpen, setIsModalOpen, modalData, setUpdateStatus }) => {
  const [formData, setFormData] = useState(initialState)
  console.log('Form Data:', formData);
  
  const [activeTab, setActiveTab] = useState(1)
  const [loading, setLoading] = useState(false)
  const [editingExpIndex, setEditingExpIndex] = useState(null)
  const { currentSession, sessionsList1 } = useContext(SessionContext)
  const [tempSession, setTempSession] = useState('')
  const [classesDropdowns, setClassesDropdowns] = useState([
    { sectionList: [], subjectList: [], streamList: [] },
  ])
  const [streams, setStreams] = useState([])
  const [fileList, setFileList] = useState([])
  const [photoFile, setPhotoFile] = useState(null)
  const [previewImage, setPreviewImage] = useState('')
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [editingDocIndex, setEditingDocIndex] = useState(null)
  const tempFileRef = useRef(null)
  const [categoryList, setCategoryList] = useState([])

  const emptyClassRow = {
    classId: '',
    sectionId: '',
    stream: '',
    subjectId: '',
    session: tempSession || currentSession?._id || '',
    isClassTeacher: false,
  }
  const [subjectList, setSubjectList] = useState([])
  const [streamList, setStreamList] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)




  /* ---------------- DEFAULT SESSION ---------------- */
  useEffect(() => {
    if (currentSession?._id) {
      setTempSession(currentSession._id)
      setFormData((p) => ({
        ...p,
        session: currentSession._id,
      }))
    }
  }, [currentSession])

  useEffect(() => {
    console.log('API CALL START')

    getRequest('categoryMaster/list?isPagination=false')
      .then((res) => {
        setCategoryList(res?.data?.data || [])
      })
      .catch((err) => {
        console.log('API ERROR:', err)
        toast.error('Failed to load categories')
      })
  }, [isModalOpen])


  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  const ph = (label) => `Enter ${label}`

  const isEdit = Boolean(modalData)

  useEffect(() => {
    if (isEdit && formData.classesAssigned?.length) {
      const classId = formData.classesAssigned[0]?.classId
      if (classId) {
        getRequest(`sections?classId=${classId}&isPagination=false`).then((res) => {
          setSectionList(res?.data?.data?.sections || [])
        })
      }
    }
  }, [isEdit, formData.classesAssigned])

  const [classList, setClassList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [documentOptions, setDocumentOptions] = useState([])
  const [uploadingDocs, setUploadingDocs] = useState([])
  const [tempDoc, setTempDoc] = useState({
    documentId: '',
    documentName: '',
    documentNumber: '',
    document: '',
  })

  const validateCurrentTab = () => {
    // ================= TAB 1 =================
    if (activeTab === 1) {
      if (!formData.firstName?.trim()) {
        toast.error('First Name is required')
        return false
      }

      if (!formData.lastName?.trim()) {
        toast.error('Last Name is required')
        return false
      }

      if (!formData.phone || formData.phone.length !== 10) {
        toast.error('Valid 10 digit Phone Number is required')
        return false
      }

      if (!formData.gender?.trim()) {
        toast.error('Please select Gender')
        return false
      }

      if (!formData.dob?.trim()) {
        toast.error('Date of Birth is required')
        return false
      }

      if (!formData.email?.trim()) {
        toast.error('Email is required')
        return false
      }

      if (!formData.category) {
        toast.error('Category is required')
        return false
      }

      if (!formData.caste?.trim()) {
        toast.error('Caste is required')
        return false
      }

      if (!formData.religion?.trim()) {
        toast.error('Religion is required')
        return false
      }

      // Present Address
      if (!formData.address?.present?.Address1?.trim()) {
        toast.error('Present Address Line 1 is required')
        return false
      }

      if (!formData.address?.present?.City?.trim()) {
        toast.error('Present City is required')
        return false
      }

      if (!formData.address?.present?.State?.trim()) {
        toast.error('Present State is required')
        return false
      }

      // Permanent Address
      if (!formData.address?.permanent?.Address1?.trim()) {
        toast.error('Permanent Address Line 1 is required')
        return false
      }

      if (!formData.address?.permanent?.City?.trim()) {
        toast.error('Permanent City is required')
        return false
      }

      if (!formData.address?.permanent?.State?.trim()) {
        toast.error('Permanent State is required')
        return false
      }
    }

    // ================= TAB 2 =================
    // ================= TAB 2 =================
    if (activeTab === 2) {
      if (!formData.dateOfJoining?.trim()) {
        toast.error('Date of Joining is required')
        return false
      }

      if (!formData.department?.trim()) {
        toast.error('Department is required')
        return false
      }

      if (!formData.medium?.trim()) {
        toast.error('Medium is required')
        return false
      }

      if (!formData.designation?.trim()) {
        toast.error('Designation is required')
        return false
      }

      if (!formData.employmentType?.trim()) {
        toast.error('Employment Type is required')
        return false
      }

      // const rows = formData.classesAssigned.slice(1)

      // for (let i = 0; i < rows.length; i++) {
      //   const cls = rows[i]

      //   if (!cls.classId) {
      //     toast.error(`Class is required  ${i + 1})`)
      //     return false
      //   }

      //   if (!cls.sectionId) {
      //     toast.error(`Section is required ${i + 1})`)
      //     return false
      //   }

      //   if (!cls.subjectId) {
      //     toast.error(`Subject is required  ${i + 1})`)
      //     return false
      //   }

      //   if (isSeniorClass(cls.classId) && !cls.stream) {
      //     toast.error(`Stream is required  ${i + 1})`)
      //     rheturn false
      //   }
      // }
    }

    // ================= TAB 3 =================
    // ================= TAB 3 =================
    if (activeTab === 3) {
      if (!formData.salary?.trim()) {
        toast.error('Salary is required')
        return false
      }

      if (!formData.bankAccount?.accountNumber?.trim()) {
        toast.error('Account Number is required')
        return false
      }

      if (!formData.bankAccount?.bankName?.trim()) {
        toast.error('Bank Name is required')
        return false
      }

      if (!formData.bankAccount?.ifsc?.trim()) {
        toast.error('IFSC is required')
        return false
      }
    }

    return true
  }
  const goNext = () => {
    if (!validateCurrentTab()) return
    setActiveTab((p) => p + 1)
  }
  const goPrev = () => {
    if (activeTab > 1) {
      setActiveTab((p) => p - 1)
    }
  }

  

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(
      `documents?category=Teacher&session=${currentSession._id}&isPagination=false&isActive=true`,
    )
      .then((res) => {
        const docs = res?.data?.data?.documents || []
        setDocumentOptions(docs)
      })
      .catch((err) => console.error('Error fetching documents:', err))
  }, [isModalOpen, currentSession])

  useEffect(() => {
    if (!currentSession?._id) return

    getRequest(`classes?session=${currentSession._id}&isPagination=false`).then((res) =>
      setClassList(res?.data?.data?.classes || []),
    )
  }, [currentSession])

  const isSeniorClass = (classId) => {
    const cls = classList.find((c) => c._id === classId)
    return cls?.isSenior === true
  }

  const handleClassChange = async (classId, i) => {
    handleNestedChange(['classesAssigned', i, 'classId'], classId)
    if (!classId) return
    const cls = classList.find((c) => c._id === classId)
    const [secRes, streamRes] = await Promise.all([
      getRequest(`sections?classId=${classId}&isPagination=false`),
      cls?.isSenior
        ? getRequest(`streams?classId=${classId}`)
        : Promise.resolve({ data: { data: { streams: [] } } }),
    ])
    let subRes = { data: { data: { subjects: [] } } }
    if (!cls?.isSenior) {
      subRes = await getRequest(`subjects?classId=${classId}&isPagination=false`)
    }
    setClassesDropdowns((prev) => {
      const updated = [...prev]
      updated[i] = {
        sectionList: secRes?.data?.data?.sections || [],
        subjectList: subRes?.data?.data?.subjects || [],
        streamList: streamRes?.data?.data?.streams || [],
      }
      return updated
    })
    handleNestedChange(['classesAssigned', i, 'sectionId'], '')
    handleNestedChange(['classesAssigned', i, 'subjectId'], '')
    handleNestedChange(['classesAssigned', i, 'stream'], '')
  }

  const handleStreamChange = async (streamId, i) => {
    handleNestedChange(['classesAssigned', i, 'stream'], streamId)
    const classId = formData.classesAssigned[i].classId
    if (!classId || !streamId) return
    const subRes = await getRequest(
      `subjects?classId=${classId}&streamId=${streamId}&isPagination=false`,
    )
    setClassesDropdowns((prev) => {
      const updated = [...prev]
      updated[i] = {
        ...updated[i],
        subjectList: subRes?.data?.data?.subjects || [],
      }
      return updated
    })

    handleNestedChange(['classesAssigned', i, 'subjectId'], '')
  }

  /* ================= PREFILL EDIT ================= */
  useEffect(() => {
    if (!modalData || !isModalOpen) return
    const prepareEdit = async () => {
      const matchedCategoryId =
        typeof modalData.category === 'object'
          ? categoryList.find((c) => c.name === modalData.category.name)?._id
          : modalData.category

  //         const matchedCategoryId =
  // modalData?.category?._id || modalData?.category || ''

      setFormData((prev) => ({
        ...prev,
        ...modalData,
        dob: modalData?.dob?.split('T')[0],
        dateOfJoining: modalData?.dateOfJoining?.split('T')[0],

  category: matchedCategoryId || '',

        classesAssigned: normalizeClassesAssigned(modalData.classesAssigned),
        documents: normalizeDocuments(modalData.documents),
        experience: [
          // 🔥 TEMP ROW (for inputs)
          {
            schoolName: '',
            designation: '',
            startDate: '',
            endDate: '',
            subjects: [],
          },
          ...(modalData.experience || []), // 🔥 TABLE DATA
        ],
      }))

      const dropdowns = [
        { sectionList: [], subjectList: [], streamList: [] }, // 🔥 TEMP ROW (index 0)
      ]

      for (let i = 0; i < modalData.classesAssigned.length; i++) {
        

        const cls = modalData.classesAssigned[i]
        const classId = cls.classId || cls.class?._id

        const clsObj = classList.find((c) => c._id === classId)

        const [secRes, subRes, streamRes] = await Promise.all([
          getRequest(`sections?classId=${classId}&isPagination=false`),
          getRequest(`subjects?classId=${classId}&isPagination=false`),
          clsObj?.isSenior
            ? getRequest(`streams?classId=${classId}`)
            : Promise.resolve({ data: { data: { streams: [] } } }),
        ])

        dropdowns.push({
          sectionList: secRes?.data?.data?.sections || [],
          subjectList: subRes?.data?.data?.subjects || [],
          streamList: streamRes?.data?.data?.streams || [],
        })
      }

      setClassesDropdowns(dropdowns)
    }

    prepareEdit()
  }, [modalData, isModalOpen, classList, categoryList])

  const handleUploadChange = async ({ fileList }) => {
    setFileList(fileList)

    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj
      await uploadProfilePhoto(file) // 🔥 API CALL
    } else {
      handleNestedChange(['profilePic'], '')
    }
  }

  useEffect(() => {
    if (modalData?.profilePic) {
      setFileList([
        {
          uid: '-1',
          name: 'profile.png',
          status: 'done',
          url: modalData.profilePic,
        },
      ])
    }
  }, [modalData])

  const handleNestedChange = (path, value) => {
    setFormData((prev) => {
      const updated = structuredClone(prev)
      let obj = updated
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]]
      }
      obj[path[path.length - 1]] = value
      return updated
    })
  }

  const normalizeDocuments = (docs = []) =>
    docs.map((d) => {
      const docMeta = documentOptions.find((opt) => opt._id === d.documentId)
      return {
        documentId: d.documentId || '',
        documentNumber: d.documentNumber || '',
        document: d.document || '',
        verified: Boolean(d.verified),
        name: docMeta?.name || '',
      }
    })

  const handleSameAddress = (checked) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        sameAsPresent: checked,
        permanent: checked ? { ...prev.address.present } : prev.address.permanent,
      },
    }))
  }

  useEffect(() => {
    if (!modalData || !documentOptions.length) return
    setFormData((p) => ({
      ...p,
      documents: normalizeDocuments(modalData.documents),
    }))
  }, [modalData, documentOptions])

  const addExperience = () => {
    const temp = formData.experience[0]
    if (!temp.schoolName || !temp.designation) {
      toast.error('Organization & Designation required')
      return
    }
    setFormData((p) => {
      const updated = [...p.experience]
      const payload = {
        schoolName: temp.schoolName,
        designation: temp.designation,
        startDate: temp.startDate,
        endDate: temp.endDate,
        subjects: temp.subjects || [],
      }
      if (editingExpIndex !== null) {
        updated[editingExpIndex] = payload
      } else {
        updated.push(payload)
      }
      return {
        ...p,
        experience: [
          {
            schoolName: '',
            designation: '',
            startDate: '',
            endDate: '',
            subjects: [],
          },
          ...updated.slice(1),
        ],
      }
    })
    setEditingExpIndex(null) // ✅ RESET
  }

  const removeExperience = (index) => {
    setFormData((p) => ({
      ...p,
      experience: p.experience.filter((_, i) => i !== index),
    }))
  }
  const handleExperienceChange = (index, field, value) => {
    setFormData((p) => {
      const updated = [...p.experience]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      return { ...p, experience: updated }
    })
  }

  // years + months calculate karega
  const calculateTotalExperience = (experience = []) => {
    let totalMonths = 0

    experience.forEach((exp) => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate)
        const end = new Date(exp.endDate)

        if (end >= start) {
          const months =
            (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())

          totalMonths += months
        }
      }
    })

    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    if (years === 0 && months === 0) return ''

    return `${years} Years ${months} Months`
  }

  useEffect(() => {
    const total = calculateTotalExperience(formData.experience)
    setFormData((p) => ({
      ...p,
      totalExperience: total,
    }))
  }, [formData.experience])

  const alreadyHasClassTeacher = formData.classesAssigned.slice(1).some((r, idx) => {
    // agar edit mode hai aur ye wahi row hai → ignore
    if (editingIndex !== null && idx + 1 === editingIndex) return false
    return r.isClassTeacher
  })

  const addClassAssignment = () => {
    const row = formData.classesAssigned[0]

    // 🔒 Validation
    if (!row.classId || !row.sectionId || !row.subjectId) {
      toast.error('Class, Section & Subject required')
      return
    }

    if (isSeniorClass(row.classId) && !row.stream) {
      toast.error('Stream required for class 9–12')
      return
    }

    setFormData((prev) => {
      let updated = [...prev.classesAssigned]

      if (editingIndex !== null) {
        // 🔥 CLASS TEACHER LOGIC (EDIT MODE)
        if (row.isClassTeacher) {
          updated = updated.map((r, i) =>
            i === editingIndex ? { ...row, isClassTeacher: true } : { ...r, isClassTeacher: false },
          )
        } else {
          updated[editingIndex] = { ...row, session: tempSession }
        }

        // 🔄 dropdown sync (edit row)
        setClassesDropdowns((prevDD) => {
          const copy = [...prevDD]
          copy[editingIndex] = {
            sectionList: prevDD[0]?.sectionList || [],
            subjectList: prevDD[0]?.subjectList || [],
            streamList: prevDD[0]?.streamList || [],
          }
          return copy
        })
      } else {
        // 🔥 CLASS TEACHER LOGIC (ADD MODE)
        if (row.isClassTeacher) {
          updated = updated.map((r) => ({ ...r, isClassTeacher: false }))
        }

        updated.push({ ...row, session: tempSession })

        // 🔄 dropdown sync (new row)
        setClassesDropdowns((prevDD) => [
          ...prevDD,
          {
            sectionList: prevDD[0]?.sectionList || [],
            subjectList: prevDD[0]?.subjectList || [],
            streamList: prevDD[0]?.streamList || [],
          },
        ])
      }

      return {
        ...prev,
        classesAssigned: [
          {
            classId: '',
            sectionId: '',
            subjectId: '',
            stream: '',
            isClassTeacher: false,
          },
          ...updated.slice(1),
        ],
      }
    })

    setEditingIndex(null) // reset edit mode
  }

  const removeClassAssignment = (index) => {
    setFormData((p) => ({
      ...p,
      classesAssigned: p.classesAssigned.filter((_, i) => i !== index),
    }))

    setClassesDropdowns((p) => p.filter((_, i) => i !== index))
  }

  // File upload handler
  const handleFileUpload = (e, index) => {
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

    // ✅ Mark this doc as uploading
    setUploadingDocs((prev) => [...prev, index])

    fileUpload({ url: 'upload/uploadImage', cred: formDataFile })
      .then((res) => {
        const uploadedFileUrl = res?.data?.data?.imageUrl
        if (uploadedFileUrl) {
          handleNestedChange(['documents', index, 'document'], uploadedFileUrl)
        } else {
          alert('File upload failed. No URL returned.')
        }
      })
      .catch((err) => {
        console.error('File upload failed', err)
      })
      .finally(() => {
        // ✅ Remove from uploading state
        setUploadingDocs((prev) => prev.filter((i) => i !== index))
      })
  }

  // Image upload
  const uploadProfilePhoto = async (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG images allowed')
      return
    }

    const formDataFile = new FormData()
    formDataFile.append('file', file)

    try {
      const res = await fileUpload({
        url: 'upload/uploadImage', // 🔥 same API
        cred: formDataFile,
      })

      const imageUrl = res?.data?.data?.imageUrl

      if (imageUrl) {
        handleNestedChange(['profilePic'], imageUrl) // ✅ SAVE URL
        toast.success('Profile photo uploaded')
      } else {
        toast.error('Image upload failed')
      }
    } catch (err) {
      toast.error('Profile photo upload error')
    }
  }
  const handlePreview = async (file) => {
    setPreviewImage(file.thumbUrl || file.url)
    setIsPreviewVisible(true)
  }
  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    if (!validateCurrentTab()) return

    setLoading(true)

    const payload = structuredClone(formData)
    payload.session = tempSession

    // ✅ ADD TEMP DOC HERE 👇
    if (tempDoc.documentId && tempDoc.documentNumber && tempDoc.document) {
      payload.documents.push({
        documentId: tempDoc.documentId,
        documentNumber: tempDoc.documentNumber,
        document: tempDoc.document,
        verified: false,
      })
    }

    // 🔥 VERY IMPORTANT FIX
    payload.classesAssigned = payload.classesAssigned
      .slice(1) // ❌ temp row remove
      .map((row) => ({
        classId: row.classId,
        sectionId: row.sectionId,
        subjectId: row.subjectId,
        stream: row.stream || null,
        session: row.session || tempSession,
        isClassTeacher: row.isClassTeacher,
      }))
  payload.category = payload.category?._id || payload.category || ''

    payload.documents = payload.documents.map(({ name, documentName, ...doc }) => doc)

    // payload.experience = payload.experience.map(({ subjectsText, ...exp }) => exp)
    payload.experience = payload.experience
      .slice(1) // 🔥 TEMP ROW REMOVE
      .map(({ subjectsText, ...exp }) => exp)

    postRequest({ url: 'teachers', cred: payload })
      .then(() => {
        toast.success('Teacher added successfully')
        setIsModalOpen(false)
        setUpdateStatus((p) => !p)
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  const handleEdit = () => {
    if (!validateCurrentTab()) return

    setLoading(true)

    const payload = structuredClone(formData)
    payload.session = tempSession

    // ✅ AUTO ADD TEMP DOCUMENT (EDIT MODE)
    if (tempDoc.documentId && tempDoc.documentNumber && tempDoc.document) {
      payload.documents.push({
        documentId: tempDoc.documentId,
        documentNumber: tempDoc.documentNumber,
        document: tempDoc.document,
        verified: false,
      })
    }

    delete payload._id

    // 🔥 IMPORTANT: remove temp row + map for backend
    payload.classesAssigned = payload.classesAssigned.slice(1).map((row) => ({
      classId: row.classId,
      sectionId: row.sectionId,
      subjectId: row.subjectId,
      stream: row.stream || null,
      session: row.session || tempSession,
      isClassTeacher: row.isClassTeacher,
    }))

    if (payload.classesAssigned.length === 0) {
      toast.error('Please assign at least one class')
      setLoading(false)
      return
    }

    // ❌ UI-only fields remove
    payload.documents = payload.documents.map(({ name, documentName, ...doc }) => doc)

    // payload.experience = payload.experience.map(({ subjectsText, ...exp }) => exp)
    payload.experience = payload.experience
      .slice(1) // 🔥 TEMP ROW REMOVE
      .map(({ subjectsText, ...exp }) => exp)
  payload.category = payload.category?._id || payload.category || ''

    putRequest({ url: `teachers/${modalData._id}`, cred: payload })
      .then(() => {
        toast.success('Teacher updated successfully')
        setIsModalOpen(false)
        setUpdateStatus((p) => !p)
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  // Add a new document
  const addDocument = () => {
    handleNestedChange(
      ['documents'],
      [
        ...(formData.documents || []),
        {
          documentId: '',
          documentNumber: '',
          document: '',
          verified: false,
        },
      ],
    )
  }

  const addTempDocument = () => {
    if (!tempDoc.documentId || !tempDoc.documentNumber || !tempDoc.document) {
      toast.error('Please complete document details')
      return
    }

    setFormData((p) => {
      const updated = [...p.documents]

      const payload = {
        documentId: tempDoc.documentId,
        name: tempDoc.documentName,
        documentNumber: tempDoc.documentNumber,
        document: tempDoc.document,
        verified: false,
      }

      if (editingDocIndex !== null) {
        updated[editingDocIndex] = payload // ✏️ UPDATE
      } else {
        updated.push(payload) // ➕ ADD
      }

      return { ...p, documents: updated }
    })

    // RESET
    setTempDoc({
      documentId: '',
      documentName: '',
      documentNumber: '',
      document: '',
    })
    setEditingDocIndex(null)
    if (tempFileRef.current) tempFileRef.current.value = ''
  }

  const handleTempFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowed.includes(file.type)) {
      toast.error('Only image or PDF allowed')
      e.target.value = ''
      return
    }

    const fd = new FormData()
    fd.append('file', file)

    fileUpload({ url: 'upload/uploadImage', cred: fd }).then((res) => {
      const url = res?.data?.data?.imageUrl
      if (!url) return toast.error('Upload failed')

      setTempDoc((p) => ({
        ...p,
        document: url,
      }))
    })
  }

  // Remove a document by index
  const removeDocument = (index) => {
    setFormData((p) => ({
      ...p,
      documents: p.documents.filter((_, i) => i !== index),
    }))
  }

  const normalizeClassesAssigned = (list = []) => [
    {
      classId: '',
      sectionId: '',
      subjectId: '',
      stream: '',
      isClassTeacher: false,
    },
    ...list.map((item) => ({
      classId: item.class?._id || item.classId || '',
      className: item.class?.name || '',

      sectionId: item.section?._id || item.sectionId || '',
      sectionName: item.section?.name || '',

      subjectId: item.subject?._id || item.subjectId || '',
      subjectName: item.subject?.name || '',

      stream: item.stream?._id || item.stream || '',
      streamName: item.stream?.name || '',
      session: item.session || tempSession,
      isClassTeacher: Boolean(item.isClassTeacher),
    })),
  ]

  const editClassAssign = async (index) => {
    const row = formData.classesAssigned[index + 1]

    // 1️⃣ temp row fill
    handleNestedChange(['classesAssigned', 0], { ...row })

    // 2️⃣ VERY IMPORTANT
    setEditingIndex(index + 1)
    // 🔍 class object find karo
    const clsObj = classList.find((c) => c._id === row.classId)

    // sections always load
    const secRes = await getRequest(`sections?classId=${row.classId}&isPagination=false`)

    // 🔥 subjects stream ke hisaab se load honge
    let subRes = { data: { data: { subjects: [] } } }

    if (clsObj?.isSenior && row.stream) {
      subRes = await getRequest(
        `subjects?classId=${row.classId}&streamId=${row.stream}&isPagination=false`,
      )
    } else {
      subRes = await getRequest(`subjects?classId=${row.classId}&isPagination=false`)
    }

    // 🔥 streams sirf senior class ke liye
    let streamRes = { data: { data: { streams: [] } } }

    if (clsObj?.isSenior) {
      streamRes = await getRequest(`streams?classId=${row.classId}`)
    }
    setClassesDropdowns((prev) => {
      const updated = [...prev]
      updated[0] = {
        sectionList: secRes?.data?.data?.sections || [],
        subjectList: subRes?.data?.data?.subjects || [],
        streamList: streamRes?.data?.data?.streams || [],
      }
      return updated
    })
  }

  const editExperience = (index) => {
    const actualIndex = index + 1
    const exp = formData.experience[actualIndex]

    setEditingExpIndex(actualIndex)

    setFormData((p) => ({
      ...p,
      experience: [
        {
          ...exp,
          startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
          endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
          subjects: exp.subjects || [],
        },
        ...p.experience.slice(1),
      ],
    }))
  }

  const editDocument = (index) => {
    const doc = formData.documents[index]

    setTempDoc({
      documentId: doc.documentId,
      documentName: doc.name,
      documentNumber: doc.documentNumber,
      document: doc.document,
    })

    setEditingDocIndex(index)

    if (tempFileRef.current) {
      tempFileRef.current.value = ''
    }
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )


  return (
    <Modal
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      width={850}
      footer={null}
      title={isEdit ? 'Edit Teacher' : 'Add Teacher'}
    >
      {/* ================= TABS ================= */}
      <ul className="nav nav-tabs mb-3">
        {[' Basic Information ', 'Employment & Documents'].map((t, i) => (
          <li className="nav-item " key={i}>
            <button
              type="button"
              className={`nav-link  !text-[#0c3b73] ${activeTab === i + 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(i + 1)}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>

      {/* ================= BASIC ================= */}
      {activeTab === 1 && (
        <>
          {/* ================= PERSONAL INFORMATION ================= */}
          <div className="card mb-3">
            <div className="card-header btn-primary !bg-[#0c3b73] text-white">
              Personal Information
            </div>

            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    Teacher ID<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.employeeId}
                    placeholder="Enter Teacher ID"
                    disabled={isEdit} // 🔥 YE LINE IMPORTANT
                    onChange={(e) => handleNestedChange(['employeeId'], e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    First Name<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.firstName}
                    placeholder="Enter Your Name"
                    onChange={(e) => handleNestedChange(['firstName'], e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Enter Your Middle Name"
                    value={formData.middleName}
                    onChange={(e) => handleNestedChange(['middleName'], e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Last Name<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Enter Your Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleNestedChange(['lastName'], e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Gender<span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.gender}
                    required
                    onChange={(e) => handleNestedChange(['gender'], e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Category<span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.category || ''}
                    onChange={(e) => handleNestedChange(['category'], e.target.value)}
                  >
                    <option value="">Select Category</option>

                    {categoryList.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* {formData.category === 'Other' && (
                  <div className="col-md-4">
                    <label className="form-label">Other Category Name</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Enter Category"
                      value={formData.otherCategoryName || ''}
                      onChange={(e) => handleNestedChange(['otherCategoryName'], e.target.value)}
                    />
                  </div>
                )} */}

                <div className="col-md-4">
                  <label className="form-label">
                    Religion<span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.religion}
                    onChange={(e) => handleNestedChange(['religion'], e.target.value)}
                  >
                    <option value="">Select Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Islam">Islam</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Jain">Jain</option>
                    <option value="Other">Parsi(Zoroastrian)</option>
                    <option value="Other">Jewish</option>
                    <option value="Other">Bahai</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Caste<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.caste}
                    placeholder={ph('Caste')}
                    onChange={(e) => handleNestedChange(['caste'], e.target.value)}
                  />
                </div>

                {/* <div className="col-md-4">
                  <label className="form-label">
                    Aadhaar No<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    maxLength={12}
                    inputMode="numeric"
                    placeholder={ph('Aadhaar No')}
                    value={formData.aadhaarNo}
                    onChange={(e) =>
                      handleNestedChange(
                        ['aadhaarNo'],
                        e.target.value.replace(/\D/g, '').slice(0, 12),
                      )
                    }
                  />
                </div> */}

                <div className="col-md-4">
                  <label className="form-label">
                    Date of Birth<span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    placeholder={ph('Date of Birth ')}
                    value={formData.dob}
                    onChange={(e) => handleNestedChange(['dob'], e.target.value)}
                  />
                </div>
                {/* ================= CONTACT DETAILS ================= */}
                <div className="col-md-4">
                  <label className="form-label">
                    Phone<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    maxLength={10}
                    inputMode="numeric"
                    placeholder={ph('Phone')}
                    value={formData.phone}
                    onChange={(e) =>
                      handleNestedChange(['phone'], e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Email<span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={formData.email}
                    placeholder={ph('Email')}
                    onChange={(e) => handleNestedChange(['email'], e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Contact Name(In Emergency)</label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.emergencyContact.name}
                    placeholder={ph('Emergency Contact Name')}
                    onChange={(e) =>
                      handleNestedChange(['emergencyContact', 'name'], e.target.value)
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Contact Phone(In Emergency)</label>
                  <input
                    className="form-control form-control-sm"
                    maxLength={10}
                    value={formData.emergencyContact.phone}
                    onChange={(e) =>
                      handleNestedChange(
                        ['emergencyContact', 'phone'],
                        e.target.value.replace(/\D/g, '').slice(0, 10),
                      )
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Relation(In Emergency)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.emergencyContact.relation}
                    placeholder={ph('Emergency Relation')}
                    onChange={(e) =>
                      handleNestedChange(['emergencyContact', 'relation'], e.target.value)
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Profile image</label>
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    onPreview={handlePreview}
                    beforeUpload={() => false} // prevent auto upload
                    maxCount={1}
                  >
                    {fileList.length >= 1 ? null : uploadButton}
                  </Upload>
                  <Modal
                    open={isPreviewVisible}
                    footer={null}
                    onCancel={() => setIsPreviewVisible(false)}
                  >
                    <img alt="Profile Preview" style={{ width: '75%' }} src={previewImage} />
                  </Modal>
                </div>
              </div>
            </div>
          </div>

          {/* ================= ADDRESS ================= */}
          <div className="row g-3">
            {['present', 'permanent'].map((type) => (
              <div className="col-md-6" key={type}>
                <div className="card  h-100">
                  <div className="card-header btn-primary !bg-[#0c3b73] text-white d-flex justify-content-between align-items-center">
                    {type === 'present' ? 'Present Address' : 'Permanent Address'}

                    {type === 'permanent' && (
                      <div className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.address.sameAsPresent}
                          onChange={(e) => handleSameAddress(e.target.checked)}
                        />
                        <label className="form-check-label">Same as Present</label>
                      </div>
                    )}
                  </div>

                  <div className="card-body">
                    {/* Address 1 */}
                    <div className="mb-2">
                      <label className="form-label">
                        Address Line 1 <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.address[type].Address1}
                        placeholder={ph('Address Line 1')}
                        disabled={type === 'permanent' && formData.address.sameAsPresent}
                        onChange={(e) =>
                          handleNestedChange(['address', type, 'Address1'], e.target.value)
                        }
                      />
                    </div>

                    {/* Address 2 */}
                    <div className="mb-2">
                      <label className="form-label">Address Line 2</label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.address[type].Address2}
                        placeholder={ph('Address Line 2')}
                        disabled={type === 'permanent' && formData.address.sameAsPresent}
                        onChange={(e) =>
                          handleNestedChange(['address', type, 'Address2'], e.target.value)
                        }
                      />
                    </div>

                    {/* City & State */}
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label">
                          City <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.address[type].City}
                          placeholder={ph('City')}
                          disabled={type === 'permanent' && formData.address.sameAsPresent}
                          onChange={(e) =>
                            handleNestedChange(['address', type, 'City'], e.target.value)
                          }
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label">
                          State <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.address[type].State}
                          placeholder={ph('State')}
                          disabled={type === 'permanent' && formData.address.sameAsPresent}
                          onChange={(e) =>
                            handleNestedChange(['address', type, 'State'], e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Pin & Mobile */}
                    <div className="row g-2 mt-2">
                      <div className="col-6">
                        <label className="form-label">
                          Pin Code <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control form-control-sm"
                          maxLength={6}
                          inputMode="numeric"
                          placeholder={ph('Pin Code')}
                          value={formData.address[type].Pin}
                          disabled={type === 'permanent' && formData.address.sameAsPresent}
                          onChange={(e) =>
                            handleNestedChange(
                              ['address', type, 'Pin'],
                              e.target.value.replace(/\D/g, '').slice(0, 6),
                            )
                          }
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label">
                          Mobile <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control form-control-sm"
                          maxLength={10}
                          inputMode="numeric"
                          placeholder={ph('Mobile')}
                          value={formData.address[type].Mobile}
                          disabled={type === 'permanent' && formData.address.sameAsPresent}
                          onChange={(e) =>
                            handleNestedChange(
                              ['address', type, 'Mobile'],
                              e.target.value.replace(/\D/g, '').slice(0, 10),
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="mt-2">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={formData.address[type].Email}
                        placeholder={ph('Email')}
                        disabled={type === 'permanent' && formData.address.sameAsPresent}
                        onChange={(e) =>
                          handleNestedChange(['address', type, 'Email'], e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ================= Experience TAB ================= */}
          <div className="card mb-3">
            <div className="card-header btn-primary !bg-[#0c3b73] text-white">
              Experience Details
            </div>
            <div className="card-body">
              <div className="row g-2 align-items-end mb-3">
                <div className="col-md-3">
                  <label className="form-label">Organization Name</label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.experience[0]?.schoolName || ''}
                    onChange={(e) => handleExperienceChange(0, 'schoolName', e.target.value)}
                    placeholder="Enter Organization name"
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Designation</label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.experience[0]?.designation || ''}
                    onChange={(e) => handleExperienceChange(0, 'designation', e.target.value)}
                    placeholder="Enter Designation"
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={formData.experience[0]?.startDate || ''}
                    onChange={(e) => handleExperienceChange(0, 'startDate', e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={formData.experience[0]?.endDate || ''}
                    onChange={(e) => handleExperienceChange(0, 'endDate', e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Subjects</label>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Hindi, English, Maths"
                    value={(formData.experience[0]?.subjects || []).join(', ')}
                    onChange={(e) => {
                      const subjectsArray = e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)

                      handleExperienceChange(0, 'subjects', subjectsArray)
                    }}
                  />
                </div>

                <div className="col-md-1 d-flex">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm w-100 text-nowrap"
                    onClick={addExperience}
                  >
                    {editingExpIndex !== null ? 'Update' : '+ Add'}
                  </button>
                </div>
              </div>
              {/* ================= Experience Table TAB ================= */}
              <div className="table-responsive">
                <table className="table table-bordered table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 60 }} className="text-center">
                        Sr. No.
                      </th>
                      <th className="text-center">Organization</th>
                      <th className="text-center">Designation</th>
                      <th className="text-center">From Date</th>
                      <th className="text-center">To Date</th>
                      <th className="text-center">Subjects</th>
                      <th className="text-center" style={{ width: 120 }}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {formData.experience.slice(1).length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          No experience added
                        </td>
                      </tr>
                    ) : (
                      formData.experience.slice(1).map((exp, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{exp.schoolName}</td>
                          <td>{exp.designation}</td>
                          <td>{formatDate(exp.startDate)}</td>
                          <td>{formatDate(exp.endDate)}</td>
                          {/* <td>{exp.subjects.join(', ')}</td> */}
                          <td>
                            {Array.isArray(exp.subjects) && exp.subjects.length > 0
                              ? exp.subjects.join(', ')
                              : '-'}
                          </td>

                          <td>
                            <button
                              className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-full"
                              onClick={() => editExperience(i)}
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-full"
                              onClick={() => removeExperience(i + 1)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= EMPLOYMENT TAB ================= */}
      {activeTab === 2 && (
        <>
          {/* ===== EMPLOYMENT DETAILS ===== */}
          <div className="card mb-3">
            <div className="card-header btn-primary !bg-[#0c3b73] text-white">
              Employment Details
            </div>
            <div className="card-body">
              {/* Department, Designation, Employment Type, Shift, Date of Joining, House */}
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label">
                    Department<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.department}
                    placeholder={ph('Department')}
                    onChange={(e) => handleNestedChange(['department'], e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Designation<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.designation}
                    placeholder={ph('Designation')}
                    onChange={(e) => handleNestedChange(['designation'], e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Employment Type<span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.employmentType}
                    onChange={(e) => handleNestedChange(['employmentType'], e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Date Of Joining<span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={formData.dateOfJoining}
                    onChange={(e) => handleNestedChange(['dateOfJoining'], e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Medium<span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.medium} // yahi selected value control karega
                    onChange={(e) => handleNestedChange(['medium'], e.target.value)}
                  >
                    <option value="">Select Medium</option>
                    <option value="English">English </option>
                    <option value="Hindi">Hindi </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          {/* ================= Class & Section Assignments ================= */}
          {/* Add Class Assignment button */}

          <div className="card mb-3">
            <div className="card-header btn-primary !bg-[#0c3b73] text-white">Class Assign</div>

            {/* 🔹 CARD BODY */}
            <div className="card-body">
              {/* ================= FORM ROW ================= */}
              <div className="row g-3 align-items-end mb-4">
                {/* Session */}
                <div className="col-md-3">
                  <label className="form-label mb-1">Session</label>
                  <select
                    className="form-select form-select-sm"
                    value={tempSession}
                    onChange={(e) => setTempSession(e.target.value)}
                    disabled
                  >
                    <option value="">Select</option>
                    {sessionsList1.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.sessionName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class */}

                <div className="col-md-3">
                  <label className="form-label mb-1">Class</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.classesAssigned[0].classId}
                    onChange={(e) => handleClassChange(e.target.value, 0)}
                  >
                    <option value="">Select Class</option>
                    {classList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div className="col-md-3">
                  <label className="form-label mb-1">Section</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.classesAssigned[0].sectionId}
                    disabled={!formData.classesAssigned[0].classId}
                    onChange={(e) =>
                      handleNestedChange(['classesAssigned', 0, 'sectionId'], e.target.value)
                    }
                  >
                    <option value="">Select Section</option>
                    {classesDropdowns[0]?.sectionList?.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stream */}
                {isSeniorClass(formData.classesAssigned[0].classId) && (
                  <div className="col-md-3">
                    <label className="form-label mb-1">Stream</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.classesAssigned[0].stream}
                      // onChange={(e) =>
                      //   handleNestedChange(['classesAssigned', 0, 'stream'], e.target.value)
                      // }
                      onChange={(e) => handleStreamChange(e.target.value, 0)}
                    >
                      <option value="">Select Stream</option>
                      {classesDropdowns[0]?.streamList?.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subject */}
                <div className="col-md-3">
                  <label className="form-label mb-1">Subject</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.classesAssigned[0].subjectId}
                    disabled={!formData.classesAssigned[0].classId}
                    onChange={(e) =>
                      handleNestedChange(['classesAssigned', 0, 'subjectId'], e.target.value)
                    }
                  >
                    <option value="">Select Subject</option>
                    {classesDropdowns[0]?.subjectList?.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Teacher */}
                <div className="col-md-2 d-flex align-items-center">
                  <div className="form-check mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.classesAssigned[0].isClassTeacher}
                      disabled={alreadyHasClassTeacher}
                      onChange={(e) =>
                        handleNestedChange(
                          ['classesAssigned', 0, 'isClassTeacher'],
                          e.target.checked,
                        )
                      }
                    />
                    <label className="form-check-label">Class Teacher</label>
                  </div>
                </div>

                {/* Add Button */}
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm w-100"
                    onClick={addClassAssignment}
                  >
                    {editingIndex !== null ? 'Update' : '+ Add'}
                  </button>
                </div>
              </div>

              {/* ================= TABLE ================= */}
              <div className="table-responsive mt-3">
                <table className="table table-bordered table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 70 }}>Sr No</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Stream</th>
                      <th>Subject</th>
                      <th>Class Teacher</th>
                      <th style={{ width: 120 }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {formData.classesAssigned.slice(1).length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          No Records Added
                        </td>
                      </tr>
                    ) : (
                      formData.classesAssigned.slice(1).map((row, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{classList.find((c) => c._id === row.classId)?.name}</td>

                          <td>
                            {classesDropdowns[i + 1]?.sectionList?.find(
                              (s) => s._id === row.sectionId,
                            )?.name || '—'}
                          </td>

                          <td>
                            {row.stream
                              ? classesDropdowns[i + 1]?.streamList?.find(
                                  (st) => st._id === row.stream,
                                )?.name
                              : '—'}
                          </td>

                          <td>
                            {classesDropdowns[i + 1]?.subjectList?.find(
                              (sub) => sub._id === row.subjectId,
                            )?.name || '—'}
                          </td>

                          <td className="text-center">{row.isClassTeacher ? '✔' : '—'}</td>
                          <td className="text-center">
                            <button
                              className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-full"
                              onClick={() => editClassAssign(i)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-full"
                              onClick={() => removeClassAssignment(i + 1)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ====== Documents ====== */}

          <div className="card mb-3">
            <div className="card-header bg-primary !bg-[#0c3b73] text-white">Documents</div>

            <div className="card-body">
              <div className="row g-3 align-items-end">
                {/* Document Name */}
                <div className="col-md-3">
                  <label className="form-label">Document Name</label>
                  <select
                    className="form-control form-control-sm"
                    value={tempDoc.documentId}
                    onChange={(e) => {
                      const doc = documentOptions.find((d) => d._id === e.target.value)
                      setTempDoc((p) => ({
                        ...p,
                        documentId: e.target.value,
                        documentName: doc?.name || '',
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
                <div className="col-md-3">
                  <label className="form-label">Document Number</label>
                  <input
                    className="form-control form-control-sm"
                    value={tempDoc.documentNumber}
                    onChange={(e) => setTempDoc((p) => ({ ...p, documentNumber: e.target.value }))}
                  />
                </div>

                {/* Upload */}
                <div className="col-md-4 d-flex flex-column">
                  <label className="form-label">Upload Document</label>

                  <div className="d-flex align-items-center gap-2">
                    {/* FILE INPUT */}
                    <input
                      type="file"
                      ref={tempFileRef}
                      className="form-control form-control-sm"
                      onChange={handleTempFileUpload}
                      style={{ height: 31 }} // 🔥 match other inputs
                    />

                    {/* PREVIEW */}
                    {tempDoc.document && (
                      <div
                        className="position-relative flex-shrink-0 d-flex justify-content-center align-items-center"
                        style={{
                          width: 36,
                          height: 36,
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          background: '#fafafa',
                        }}
                      >
                        {tempDoc.document.endsWith('.pdf') ? (
                          <a href={tempDoc.document} target="_blank" rel="noreferrer">
                            📄
                          </a>
                        ) : (
                          <img
                            src={tempDoc.document}
                            alt="preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        )}

                        {/* ❌ REMOVE */}
                        <span
                          onClick={() => {
                            setTempDoc((p) => ({ ...p, document: '' }))
                            if (tempFileRef.current) tempFileRef.current.value = ''
                          }}
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            cursor: 'pointer',
                            background: '#fff',
                            borderRadius: '50%',
                            fontSize: 10,
                            border: '1px solid #ccc',
                          }}
                        >
                          ❌
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Button */}
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm w-100"
                    onClick={addTempDocument}
                    disabled={!tempDoc.documentId || !tempDoc.documentNumber || !tempDoc.document}
                  >
                    {editingDocIndex !== null ? 'Update' : '+ Add'}
                  </button>
                </div>
              </div>
              <table className="table table-bordered mt-3">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">Sr. No.</th>
                    <th className="text-center">Document Name</th>
                    <th className="text-center">Document Number</th>
                    <th className="text-center">Document</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {formData.documents.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No documents added
                      </td>
                    </tr>
                  )}

                  {formData.documents.map((doc, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{doc.name}</td>
                      <td>{doc.documentNumber}</td>

                      <td>
                        {doc.document?.endsWith('.pdf') ? (
                          <a href={doc.document} target="_blank">
                            📄 View
                          </a>
                        ) : (
                          <img
                            src={doc.document}
                            style={{ width: 40, height: 40, objectFit: 'cover' }}
                          />
                        )}
                      </td>

                      <td>
                        <button
                          className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-full"
                          onClick={() => editDocument(i)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-full"
                          onClick={() => removeDocument(i)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ====== Remarks ====== */}
          <div className="card-body">
            <div className="row g-3">
              {/* Remarks */}
              <div className="col-md-8">
                <label className="form-label semi-bold">Remarks</label>
                <textarea
                  className="form-control"
                  rows={1}
                  style={{ resize: 'none', overflow: 'hidden' }}
                  value={formData.remarks}
                  placeholder={ph('Remarks')}
                  onChange={(e) => handleNestedChange(['remarks'], e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                />
              </div>

              {/* Status */}
              <div className="col-md-4">
                <label className="form-label">Status</label>

                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => handleNestedChange(['status'], e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* {activeTab === 3 && (
        <> */}
      {/* ====== Salary & Bank Details ====== */}
      {/* <div className="card mb-3">
            <div className="card-header bg-primary !bg-[#0c3b73] text-white">
              Salary & Bank Details
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <label className="form-label">
                    Salary<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.salary}
                    placeholder={ph('Salary')}
                    onChange={(e) => handleNestedChange(['salary'], e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Special Allowance</label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.specialAllowance}
                    onChange={(e) => handleNestedChange(['specialAllowance'], e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label text-nowrap">
                    Account Number<span className="text-danger">*</span>
                  </label>

                  <input
                    className="form-control form-control-sm"
                    value={formData.bankAccount.accountNumber}
                    placeholder={ph('Account Number')}
                    onChange={(e) =>
                      handleNestedChange(['bankAccount', 'accountNumber'], e.target.value)
                    }
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">
                    Bank Name<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.bankAccount.bankName}
                    placeholder={ph('Bank Name')}
                    onChange={(e) =>
                      handleNestedChange(['bankAccount', 'bankName'], e.target.value)
                    }
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">
                    IFSC<span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    value={formData.bankAccount.ifsc}
                    placeholder={ph('IFSC')}
                    onChange={(e) => handleNestedChange(['bankAccount', 'ifsc'], e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div> */}
      {/* </>
      )} */}

      {/* ================= FOOTER ================= */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        {/* Cancel */}
        <button className="btn btn-secondary text-sm btn-sm" onClick={() => setIsModalOpen(false)}>
          Cancel
        </button>

        {/* Previous */}
        {activeTab > 1 && (
          <button className="btn btn-outline-primary text-sm btn-sm" onClick={goPrev}>
            Previous
          </button>
        )}

        {/* Next */}
        {activeTab < 2 && (
          <button
            className="btn btn-primary text-white text-sm btn-sm !bg-[#0c3b73]"
            onClick={goNext}
          >
            Next
          </button>
        )}

        {/* Save / Update (ONLY last tab) */}
        {activeTab === 2 && !isEdit && (
          <button
            className="btn btn-success text-white text-sm btn-sm !bg-[#0c3b73]"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        )}

        {activeTab === 2 && isEdit && (
          <button
            className="btn btn-success text-white text-sm btn-sm !bg-[#0c3b73]"
            onClick={handleEdit}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        )}
      </div>

      <style>
        {`
        .ant-modal .ant-modal-content {
        height: 637px;
        overflow-x: auto;
        }
        `}
      </style>
    </Modal>
  )
}

export default TeacherModal