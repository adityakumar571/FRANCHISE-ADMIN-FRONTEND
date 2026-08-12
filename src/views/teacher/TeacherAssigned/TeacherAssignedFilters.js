/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React from 'react'
import { Filter, Search } from 'lucide-react'

const TeacherAssignedFilters = ({
  searchTerm,
  setSearchTerm,
  selectedTeacherId,
  setSelectedTeacherId,
  teacherList,
  onApply,
  onReset,
  isApplying,
  isFilterApplied,
  setPage,
}) => {
  return (
    <div className="bg-white rounded border p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-700 mb-0">Filters & Search</h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        {/* SEARCH */}
        <div className="w-full sm:max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search subject / section"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              disabled={isApplying}
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        {/* TEACHER */}
        <div className="w-full sm:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
          <select
            className="form-select"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            disabled={isApplying}
          >
            <option value="">Select Teacher</option>
            {teacherList.map((t) => (
              <option key={t._id} value={t._id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* APPLY */}
        <button
          onClick={onApply}
          disabled={!selectedTeacherId || isApplying}
          className="bg-[#0c3b73] text-white px-6 py-2 rounded h-[38px]"
        >
          {isApplying ? 'Applying...' : 'Apply'}
        </button>

        {/* RESET */}
        {isFilterApplied && (
          <button
            onClick={onReset}
            disabled={isApplying}
            className="border px-6 py-2 rounded h-[38px]"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

export default TeacherAssignedFilters
