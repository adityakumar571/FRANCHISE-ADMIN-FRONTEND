import React, { useState } from 'react'
import { Filter, Search } from 'lucide-react'

const DocumentsFilter = ({
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  onApply,
  onReset,
  currentSession,
}) => {
  return (
    <div className="bg-white p-4 rounded mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SEARCH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search document"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded w-full"
            />
          </div>
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded w-full h-[38px] text-sm"
          >
            <option value="">Select Category</option>
            <option value="Teacher">Teacher</option>
            <option value="Student">Student</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-end gap-2">
          <button
            onClick={() =>
              onApply({
                searchTerm,
                category,
                session: currentSession?._id || '', // ✅ pass session here
              })
            }
            className="bg-[#0c3b73] text-white px-4 py-2 rounded"
          >
            Apply
          </button>
          <button
            onClick={() =>
              onReset({
                session: currentSession?._id || '', // ✅ pass session on reset
              })
            }
            className="bg-gray-300 border px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default DocumentsFilter
