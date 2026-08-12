/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { Filter } from 'lucide-react'

const HomeworkFilter = ({ onApply, subjects = [], initialFilters = {} }) => {
  const [localFilters, setLocalFilters] = useState({
    subject: initialFilters?.subject || '',
    fromDate: initialFilters?.fromDate || '',
    toDate: initialFilters?.toDate || '',
  })

  const handleApply = () => onApply(localFilters)

  const handleClear = () => {
    const reset = { subject: '', fromDate: '', toDate: '' }
    setLocalFilters(reset)
    onApply(reset)
  }

  return (
    <div className="bg-white rounded border p-4 mb-4">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
      </div>

      {/* FILTERS ROW */}
      <div className="flex flex-col xl:flex-row gap-4 xl:items-end">

        {/* SUBJECT */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select
            value={localFilters.subject}
            onChange={e => setLocalFilters(p => ({ ...p, subject: e.target.value }))}
            className="w-full h-[38px] border border-gray-300 rounded-md text-sm px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {/* FROM DATE */}
        <div className="w-full sm:w-44">
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={localFilters.fromDate}
            onChange={e => setLocalFilters(p => ({ ...p, fromDate: e.target.value }))}
            className="w-full h-[38px] border border-gray-300 rounded-md text-sm px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* TO DATE */}
        <div className="w-full sm:w-44">
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={localFilters.toDate}
            onChange={e => setLocalFilters(p => ({ ...p, toDate: e.target.value }))}
            className="w-full h-[38px] border border-gray-300 rounded-md text-sm px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* BUTTONS */}
        <button
          onClick={handleApply}
          className="bg-[#0c3b73] hover:bg-[#1b5498] text-white px-6 py-2 rounded h-[38px]"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded h-[38px]"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default HomeworkFilter
