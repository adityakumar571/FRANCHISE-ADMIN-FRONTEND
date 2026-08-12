/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useContext } from 'react'
import { Select, Modal, DatePicker } from 'antd'
import { Search, Filter, Columns2Icon, X } from 'lucide-react'
import { getRequest } from '../../Helpers'
import { SessionContext } from '../../Context/Seesion'
import dayjs from 'dayjs'

const { Option } = Select

const StudentEnrollmentFilters = ({
  students,
  filters,
  setFilters,
  applyFilters,
  setPage,
  visibleColumns,
  setVisibleColumns,
  allColumns,
  searchTerm,
  setSearchTerm,
  onReset,
  isDefaultFilters,
}) => {
  const { currentSession } = useContext(SessionContext)

  const genderOptions = ['Male', 'Female']
  const categoryOptions = ['General', 'OBC', 'SC', 'ST']

  const [classList, setClassList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [streamList, setStreamList] = useState([])

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const getAppliedFilterCount = () => {
    let count = 0

    if (filters.currentClass && filters.currentClass !== 'all') count++
    if (filters.currentSection && filters.currentSection !== 'all') count++
    if (filters.stream && filters.stream !== 'all') count++
    if (filters.gender && filters.gender !== 'all') count++
    if (filters.category && filters.category !== 'all') count++
    if (filters.dob) count++

    return count
  }

  const appliedFilterCount = getAppliedFilterCount()

  /* Load Classes */
  useEffect(() => {
    if(!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession?._id}`).then((res) =>
      setClassList(res.data?.data?.classes || []),
    )
  }, [currentSession])

  /* Load Sections (Class-wise) */
  useEffect(() => {
    if (!filters.currentClass || filters.currentClass === 'all') {
      setSectionList([])
      return
    }

    getRequest(`sections?classId=${filters.currentClass}&isPagination=false`).then((res) =>
      setSectionList(res.data?.data?.sections || []),
    )
  }, [filters.currentClass])

  /* Load Streams (Class-wise) */
  useEffect(() => {
    if (!filters.currentClass || filters.currentClass === 'all') {
      setStreamList([])
      return
    }

    getRequest(`streams?classId=${filters.currentClass}&isPagination=false`).then((res) => {
      setStreamList(res.data?.data?.streams || [])
    })
  }, [filters.currentClass])

  /* Session Auto */
  useEffect(() => {
    if (currentSession?._id) {
      setFilters((prev) => ({ ...prev, session: currentSession._id }))
    }
  }, [currentSession])

  const resetFilters = () => {
    const resetData = {
      session: currentSession?._id || 'all',
      currentClass: 'all',
      currentSection: 'all',
      stream: 'all',
      gender: 'all',
      category: 'all',
      dob: '',
    }

    setFilters(resetData) // draftFilters reset
    setSearchTerm('')
    setPage(1)

    setIsFilterModalOpen(false)

    // ❌ applyFilters(resetData) hata do
  }

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <div className="bg-white rounded border p-4 mb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2 relative">
          <div className="flex items-center  gap-1">
            <div className=" rounded-lg flex items-center justify-center ">
              <Filter className="w-5 h-5 text-orange-500 " />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-0">Filters & Search</h3>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="text-xs font-medium uppercase">Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                placeholder="Search students..."
                className="pl-9 pr-8 py-1.5 w-full border rounded-lg text-sm"
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-2.5 w-4 h-4 cursor-pointer"
                  onClick={() => setSearchTerm('')}
                />
              )}
            </div>
          </div>

          {/* Visible Columns */}
          <div>
            <label className="text-xs font-medium uppercase">Visible Columns</label>
            <Select
              mode="multiple"
              value={visibleColumns}
              onChange={setVisibleColumns}
              className="w-full mt-1"
              maxTagCount="responsive"
            >
              {allColumns.map((col) => (
                <Option key={col.key} value={col.key}>
                  {col.label}
                </Option>
              ))}
            </Select>
          </div>

          {/* Filters Button */}
          <div className="flex items-end gap-4">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`relative px-4 py-2 text-sm rounded-lg flex items-center gap-2 
    ${appliedFilterCount > 0 ? 'bg-[#0c3b73] text-white' : 'bg-[#0c3b73] text-white'}`}
              title={
                appliedFilterCount > 0
                  ? `${appliedFilterCount} filters applied`
                  : 'No filters applied'
              }
            >
              <Filter size={16} />
              Advanced Filters
              {/* Count Badge */}
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

            <button
              onClick={onReset}
              disabled={isDefaultFilters(filters)}
              className={`px-3 py-2 rounded-md text-sm border
    ${
      isDefaultFilters(filters)
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
    }`}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ================= FILTER MODAL ================= */}
      <Modal
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={null}
        title="Filters"
        width={520}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Class */}
            <div>
              <label className="text-xs uppercase">Class</label>
              <Select
                value={filters.currentClass}
                onChange={(v) =>
                  setFilters((prev) => ({ ...prev, currentClass: v, currentSection: 'all' }))
                }
                className="w-full text-xs text-gray-600"
              >
                <Option className value="all">
                  All Classes
                </Option>
                {classList.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Section */}
            <div>
              <label className="text-xs uppercase">Section</label>
              <Select
                value={filters.currentSection}
                disabled={filters.currentClass === 'all'}
                onChange={(v) => setFilters((prev) => ({ ...prev, currentSection: v }))}
                className="w-full text-gray-600"
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

          <div className="grid grid-cols-2 gap-3">
            {/* Stream */}
            <div>
              <label className="text-xs uppercase">Stream</label>
              <Select
                value={filters.stream}
                onChange={(v) => setFilters((prev) => ({ ...prev, stream: v }))}
                className="w-full"
              >
                <Option value="all">All Streams</Option>
                {streamList.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </div>
            {/* Gender */}
            <div>
              <label className="text-xs uppercase">Gender</label>
              <Select
                value={filters.gender}
                onChange={(v) => setFilters((prev) => ({ ...prev, gender: v }))}
                className="w-full"
              >
                <Option value="all">All</Option>
                {genderOptions.map((g) => (
                  <Option key={g} value={g}>
                    {g}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="text-xs uppercase">Category</label>
              <Select
                value={filters.category}
                onChange={(v) => setFilters((prev) => ({ ...prev, category: v }))}
                className="w-full"
              >
                <Option value="all">All</Option>
                {categoryOptions.map((c) => (
                  <Option key={c} value={c}>
                    {c}
                  </Option>
                ))}
              </Select>
            </div>
            {/* DOB */}
            <div>
              <label className="text-xs uppercase">Date of Birth</label>
              <DatePicker
                value={filters.dob ? dayjs(filters.dob) : null}
                onChange={(d) =>
                  setFilters((prev) => ({
                    ...prev,
                    dob: d ? d.format('YYYY-MM-DD') : '',
                  }))
                }
                className="w-full"
                format="YYYY-MM-DD"
                placeholder="Select DOB"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex text-sm justify-end gap-3 pt-4">
            <button
              onClick={onReset}
              disabled={isDefaultFilters(filters)}
              className={`px-4 py-2 rounded-md text-sm
    ${
      isDefaultFilters(filters)
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
        : 'bg-red-600 text-white hover:bg-red-700'
    }`}
            >
              Reset 
            </button>

            <button
              onClick={() => {
                applyFilters()
                setIsFilterModalOpen(false)
              }}
              className="px-5 py-1.5 bg-[#0c3b73] text-white rounded"
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default StudentEnrollmentFilters
