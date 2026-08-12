import React, { useState, useEffect, useContext } from 'react'
import { Select } from 'antd'
import { Search, Filter, Columns3, X, Columns2Icon } from 'lucide-react'
import { getRequest } from '../../Helpers'
import { SessionContext } from '../../Context/Seesion'

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
}) => {
  const classOptions = [...new Set(students.map((s) => s.expectedClass).filter(Boolean))]
  const sectionOptions = [...new Set(students.map((s) => s.section).filter(Boolean))]
  const genderOptions = ['Male', 'Female']
  const categoryOptions = ['General', 'OBC', 'SC', 'ST']
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [currentSection, setCurrentSection] = useState('')
  const [currentClass, setCurrentClass] = useState('')
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const [session, setSession] = useState('')
  //  const [sessionsList, setSessionsList] = useState([])
  const { currentSession, sessionsList } = useContext(SessionContext)
  const [classList, setClassList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [hasApplied, setHasApplied] = useState(false)



  const activeFiltersCount = Object.values(filters).filter((f) => f && f !== 'all').length

  const clearAllFilters = () => {
    const cleared = {
      session: 'all',
      class: 'all',
      section: 'all',
      gender: 'all',
      category: 'all',
    }

    setFilters(cleared)
    setSearchTerm('')
    applyFilters() // 👈 IMPORTANT
  }

  useEffect(() => {
    if (currentSession?._id) {
      setSession(currentSession._id)
    }
  }, [currentSession])

  /* ---------------- LOAD CLASSES ---------------- */
  useEffect(() => {
    getRequest('classes?isPagination=false')
      .then((res) => setClassList(res.data?.data?.classes || []))
      .catch(console.error)
  }, [])
  useEffect(() => {
    if (currentSession?._id) {
      setFilters((prev) => ({
        ...prev,
        session: currentSession._id,
      }))
    }
  }, [currentSession])
  /* ---------------- LOAD SECTIONS (CLASS WISE) ---------------- */
  useEffect(() => {
    if (!currentClass) {
      setSectionList([])
      return
    }

    getRequest(`sections?classId=${currentClass}&isPagination=false`)
      .then((res) => setSectionList(res.data?.data?.sections || []))
      .catch(console.error)
  }, [currentClass])

  useEffect(() => {
    setHasApplied(false)
  }, [filters, searchTerm])


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 relative">
        <div className="flex items-center  gap-1">
          <div className=" rounded-lg flex items-center justify-center ">
            <Filter className="w-5 h-5 text-orange-500 " />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-0">Filters & Search</h3>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 items-center">
          {/* Reset Button */}
          {hasApplied && (
            <button
              onClick={() => {
                clearAllFilters()
                setHasApplied(false) // 👈 Reset fir hide ho jayega
              }}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 whitespace-nowrap"
            >
              Reset
            </button>
          )}



          {/* Apply Button */}
          <button
            onClick={() => {
              applyFilters()
              setHasApplied(true)   // ✅ Apply hua
            }}
            className="px-5 py-2 text-sm text-white bg-[#0c3b73] rounded-lg hover:bg-blue-800 whitespace-nowrap"
          >
            Apply
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1  2xl:grid-cols-2 gap-4">
        {/* Filter Dropdowns */}
        <div className="xl:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 ">
          {/* Class Filter */}
          <div className="space-y-2 ">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Class
            </label>
            <select
              className="w-full text-sm border px-3 py-2 rounded"
              value={filters.class}
              onChange={(e) => {
                const value = e.target.value
                setCurrentClass(value)
                setFilters((prev) => ({
                  ...prev,
                  class: value,
                  section: 'all',
                }))
                setPage(1)
              }}
            >
              <option value="all">All Classes</option>
              {classList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Section
            </label>
            <select
              className="w-full text-sm border px-3 py-2 rounded"
              value={filters.section}
              onChange={(e) => {
                setCurrentSection(e.target.value)
                setFilters((prev) => ({
                  ...prev,
                  section: e.target.value,
                }))
                setPage(1)
              }}
              disabled={!filters.class || filters.class === 'all'}
            >
              <option value="all">All Sections</option>
              {sectionList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category + Buttons */}
          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Gender
            </label>

            <Select
              className="w-full custom-select"
              value={filters.gender}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, gender: value }))
              }
            >
              <Option value="all">All Genders</Option>
              {genderOptions.map((g) => (
                <Option key={g} value={g}>
                  {g}
                </Option>
              ))}
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Category
            </label>

            <Select
              className="w-full custom-select"
              value={filters.category}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, category: value }))
              }
            >
              <Option value="all">All Categories</Option>
              {categoryOptions.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </div>

        </div>

        {/* Search and Column Selector */}
        <div className="grid grid-cols-3 gap-5">
          {/* Search */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
              <Search className="w-4 h-4" />
              Search
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search ..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-11 pr-4 py-1.5 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {/* Column Selector */}
          <div className="space-y-2 col-span-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
              <Columns2Icon className="w-4 h-4" />
              Visible Columns
            </label>
            <Select
              mode="multiple"
              value={visibleColumns}
              onChange={setVisibleColumns}
              allowClear
              className="w-full custom-select-multi text-sm"
              size="medium"
              placeholder="Select columns to display"
              maxTagCount="responsive"
              suffixIcon={<div className=" text-gray-400">▼</div>}
            >
              {allColumns.map((col) => (
                <Option key={col.key} value={col.key}>
                  {col.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <style>{`
        :global(.custom-select .ant-select-selector),
        :global(.custom-select-multi .ant-select-selector) {
          border-radius: 0.5rem !important;
          border-color: #d1d5db !important;
          transition: all 0.2s !important;
        }

        :global(.custom-select .ant-select-selector:hover),
        :global(.custom-select-multi .ant-select-selector:hover) {
          border-color: #9ca3af !important;
        }

        :global(.custom-select.ant-select-focused .ant-select-selector),
        :global(.custom-select-multi.ant-select-focused .ant-select-selector) {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        :global(.ant-select-dropdown) {
          border-radius: 0.5rem !important;
          box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
        }

        :global(.ant-select-item-option-selected) {
          background-color: #eff6ff !important;
          color: #2563eb !important;
          font-weight: 500 !important;
        }

        :global(.ant-select-item-option-active) {
          background-color: #f3f4f6 !important;
        }
      `}</style>
    </div>
  )
}

export default StudentEnrollmentFilters
