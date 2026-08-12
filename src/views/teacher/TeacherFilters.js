/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { Select } from 'antd'
import { Search, Filter, X, Columns2Icon } from 'lucide-react'
import { getRequest } from '../../Helpers'
import { Modal, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { SessionContext } from '../../Context/Seesion'

const { Option } = Select

const TeacherFilters = ({
  filters,
  setFilters,
  applyFilters,
  setPage,
  visibleColumns,
  setVisibleColumns,
  allColumns,
  searchTerm,
  setSearchTerm,
  setAppliedFilters,
}) => {
  /* ---------- MANUAL OPTIONS ---------- */
  const departments = [
    { label: 'Science', value: 'science' },
    { label: 'Math', value: 'math' },
    { label: 'English', value: 'english' },
    { label: 'Computer', value: 'computer' },
  ]

  const designations = [
    { label: 'Junior Teacher', value: 'junior' },
    { label: 'Senior Teacher', value: 'enior' },
    { label: 'Head Teacher', value: 'head teacher' },
    { label: 'Principal Teacher', value: 'principal' },
  ]

  const employmentTypes = [
    { label: 'Permanent', value: 'permanent' },
    { label: 'Contract', value: 'contract' },
  ]

  const statuses = ['Active', 'On Leave', 'Resigned', 'Retired']

  /* ---------- CLASS / SECTION ---------- */
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const { currentSession } = useContext(SessionContext)
  const [tempFilters, setTempFilters] = useState(filters)
  // useEffect(() => {
  //   if (isFilterModalOpen) {
  //     setTempFilters(filters)
  //   }
  // }, [isFilterModalOpen])

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      department: 'all',
      designation: 'all',
      employmentType: 'all',
      classId: 'all',
      sectionId: 'all',
      session: 'all',
      stream: 'all',
      // subjectId: 'all',
      isClassTeacher: 'all',
      gender: 'all',
      dob: '',
      currentClass: undefined,
      currentSection: undefined,
    })

    setSearchTerm('')
    setPage(1)
  }

  /* ---------- LOAD CLASSES ---------- */
  useEffect(() => {
    setLoadingClasses(true)
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession?._id}`)
      .then((res) => setClasses(res.data?.data?.classes || []))
      .catch(console.error)
      .finally(() => setLoadingClasses(false))
  }, [currentSession?._id])

  /* ---------- LOAD SECTIONS ---------- */
  useEffect(() => {
    if (filters.classId === 'all') {
      setSections([])
      return
    }

    setLoadingSections(true)
    getRequest(`sections?classes=${filters.classId}&isPagination=false`)
      .then((res) => setSections(res.data?.data?.sections || []))
      .catch(console.error)
      .finally(() => setLoadingSections(false))
  }, [filters.classId])

  const [classList, setClassList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [streams, setStreams] = useState([])

  const getAppliedFilterCount = () => {
    let count = 0

    if (filters.status && filters.status !== 'all') count++
    if (filters.department && filters.department !== 'all') count++
    if (filters.designation && filters.designation !== 'all') count++
    if (filters.employmentType && filters.employmentType !== 'all') count++
    if (filters.classId && filters.classId !== 'all') count++
    if (filters.sectionId && filters.sectionId !== 'all') count++
    if (filters.stream && filters.stream !== 'all') count++
    if (filters.subjectId && filters.subjectId !== 'all') count++
    if (filters.isClassTeacher && filters.isClassTeacher !== 'all') count++
    if (filters.gender && filters.gender !== 'all') count++
    if (filters.dob) count++

    return count
  }

  const appliedFilterCount = getAppliedFilterCount()

  useEffect(() => {
    getRequest('subjects?isPagination=false').then((res) =>
      setSubjects(res.data?.data?.subjects || []),
    )
  }, [])

  /* Load Classes */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession?._id}`)
      .then((res) => setClassList(res.data?.data?.classes || []))
      .catch(console.error)
  }, [currentSession?._id])

  useEffect(() => {
    getRequest('streams').then((res) => {
      console.log('Streams API:', res.data?.data?.streams)
      setStreams(res.data?.data?.streams || [])
    })
  }, [])

  /* Load Sections (Class-wise) */
  useEffect(() => {
    if (!tempFilters.currentClass || tempFilters.currentClass === 'all') {
      setSectionList([])
      return
    }

    getRequest(`sections?classId=${tempFilters.currentClass}&isPagination=false`).then((res) =>
      setSectionList(res.data?.data?.sections || []),
    )
  }, [tempFilters.currentClass])

  /* Session Auto */
  useEffect(() => {
    if (currentSession?._id) {
      setFilters((prev) => ({ ...prev, session: currentSession._id }))
    }
  }, [currentSession])

  const resetFilters = () => {
    setTempFilters({
      status: 'all',
      department: 'all',
      designation: 'all',
      employmentType: 'all',
      classId: 'all',
      sectionId: 'all',
      currentClass: undefined,
      currentSection: undefined,
      session: currentSession?._id || 'all',
      stream: 'all',
      subjectId: 'all',
      isClassTeacher: 'all',
      gender: 'all',
      dob: '',
    })
  }

  const selectedClass = classList.find((c) => c._id === tempFilters.currentClass)

  useEffect(() => {
    console.log('Selected Class:', tempFilters.currentClass)
  }, [tempFilters.currentClass])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700 mb-0">Filters & Search</h3>
        </div>

        <div className="flex gap-3">
          <button
            onClick={clearAllFilters}
            className="px-4 py-1.5 text-sm border bg-gray-400 text-white rounded-lg"
          >
            Reset
          </button>
          {/* <button
            onClick={applyFilters}
            className="px-6 py-1.5 text-sm  text-white bg-[#0c3b73] hover:bg-blue-800 rounded-lg"
          >
            Apply
          </button> */}
          {/* 
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 bg-[#0c3b73] text-white text-sm rounded-lg flex items-center gap-2"
          >
            <Filter size={16} />
            Advanced Filters
          </button> */}

          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="relative px-4 py-2 bg-[#0c3b73] text-white text-sm rounded-lg flex items-center gap-2"
          >
            <Filter size={16} />
            Advanced Filters
            {appliedFilterCount > 0 && (
              <span
                className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1
      bg-red-600 text-white text-xs rounded-full
      flex items-center justify-center font-medium"
              >
                {appliedFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
        {/* ---------- SEARCH + COLUMNS ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs  uppercase text-gray-700">
              <Search className="w-4 h-4" /> Search
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="Search teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-1.5 px-3 pr-9 text-sm border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute text-sm right-3 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Visible Columns */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="flex items-center gap-2 text-xs  uppercase text-gray-700 mb-2">
              <Columns2Icon className="w-4 h-4" /> Visible Columns
            </label>

            <Select
              mode="multiple"
              value={visibleColumns}
              onChange={setVisibleColumns}
              allowClear
              className="w-full text-sm custom-select-multi"
              placeholder="Select columns"
              maxTagCount="responsive"
              size="medium"
            >
              {allColumns.map((col) => (
                <Option key={col.key} value={col.key}>
                  {col.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* ---------- FILTER DROPDOWNS ---------- */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
         
        </div> */}

        {/* ================= FILTER MODAL ================= */}
        <Modal
          open={isFilterModalOpen}
          onCancel={() => setIsFilterModalOpen(false)}
          footer={null}
          title="Advanced Filters"
          width={540}
        >
          <div className="space-y-5">
            {/* ===== Class & Section ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-gray-600">Class</label>
                <Select
                  className="w-full"
                  placeholder="Select class"
                  allowClear
                  value={tempFilters.currentClass}
                  onChange={(v) =>
                    setTempFilters((p) => ({
                      ...p,
                      currentClass: v,
                      classId: v || 'all',
                      currentSection: undefined,
                      sectionId: 'all',
                    }))
                  }
                >
                  <Option value="all">All Classes</Option>
                  {classList.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-gray-600">Section</label>
                <Select
                  className="w-full"
                  placeholder="Select section"
                  allowClear
                  value={tempFilters.currentSection}
                  disabled={!tempFilters.currentClass}
                  onChange={(v) =>
                    setTempFilters((p) => ({
                      ...p,
                      currentSection: v,
                      sectionId: v || 'all', // 🔥 IMPORTANT
                    }))
                  }
                >
                  <Option value="all">All Sections</Option>
                  {sectionList.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* ===== Subject & Class Teacher ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-gray-600">Subject</label>
                <Select
                  className="w-full"
                  value={tempFilters.subjectId}
                  onChange={(v) => setTempFilters((p) => ({ ...p, subjectId: v }))}
                >
                  <Option value="all">All</Option>
                  {subjects.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-gray-600">Class Teacher</label>
                <Select
                  className="w-full"
                  value={tempFilters.isClassTeacher}
                  onChange={(v) => setTempFilters((p) => ({ ...p, isClassTeacher: v }))}
                >
                  <Option value="all">All</Option>
                  <Option value="yes">Yes</Option>
                  <Option value="no">No</Option>
                </Select>
              </div>
            </div>

            {/* ===== Stream & DOB (SAME ROW) ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stream */}
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-gray-600">Stream</label>

                <Select
                  className="w-full"
                  placeholder="Select stream"
                  value={tempFilters.stream}
                  disabled={!tempFilters.currentClass || tempFilters.currentClass === 'all'}
                  onChange={(v) => setTempFilters((p) => ({ ...p, stream: v }))}
                >
                  <Option value="all">All</Option>

                  {streams
                    .filter((s) => s.classId === tempFilters.currentClass)
                    .map((s) => (
                      <Option key={s._id} value={s._id}>
                        {s.name}
                      </Option>
                    ))}
                </Select>
              </div>

              {/* DOB */}
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-gray-600">Date of Birth</label>
                <DatePicker
                  className="w-full"
                  placeholder="Select DOB"
                  value={tempFilters.dob ? dayjs(tempFilters.dob) : null}
                  onChange={(d) =>
                    setTempFilters((p) => ({
                      ...p,
                      dob: d ? d.format('YYYY-MM-DD') : '',
                    }))
                  }
                  format="YYYY-MM-DD"
                />
              </div>
            </div>

            {/* ===== Buttons ===== */}
            <div className="flex items-end justify-between gap-3 pt-2">
              {/* LEFT : Status */}
              <div className="w-48">
                <FilterItem label="Status">
                  <Select
                    value={tempFilters.status}
                    onChange={(v) => setTempFilters((p) => ({ ...p, status: v }))}
                    className="w-full custom-select"
                  >
                    <Option value="all">All</Option>
                    {statuses.map((s) => (
                      <Option key={s} value={s}>
                        {s}
                      </Option>
                    ))}
                  </Select>
                </FilterItem>
              </div>

              {/* RIGHT : Buttons */}
              <div className="flex gap-3">
                <button onClick={resetFilters} className="px-4 py-2 text-sm border rounded">
                  Reset
                </button>

                <button
                  onClick={() => {
                    setFilters(tempFilters)
                    applyFilters()
                    setIsFilterModalOpen(false)
                  }}
                  className="px-5 py-2 text-sm bg-[#0c3b73] text-white rounded"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default TeacherFilters

/* ---------- SMALL COMPONENT ---------- */
const FilterItem = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-xs font-medium uppercase">{label}</label>
    {children}
  </div>
)
