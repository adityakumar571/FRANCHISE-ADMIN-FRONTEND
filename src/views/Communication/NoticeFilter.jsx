/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { Filter, Search, X } from 'lucide-react'

const getTodayDate = () => new Date().toISOString().split('T')[0]

const NoticeFilter = ({ onApply, initialFilters }) => {
  const [tempFilters, setTempFilters] = useState({
    search: initialFilters.search,
    dateFrom: initialFilters.fromDate,
    dateTo: initialFilters.toDate,
    sortBy: initialFilters.sortBy,
  })
  

  useEffect(() => {
    onApply({
      search: tempFilters.search,
      fromDate: tempFilters.dateFrom,
      toDate: tempFilters.dateTo,
      sortBy: tempFilters.sortBy,
    })
  }, [])

  // check if any filter active
  const hasActiveFilters =
    tempFilters.search ||
    tempFilters.dateFrom !== getTodayDate() ||
    tempFilters.dateTo !== getTodayDate() ||
    tempFilters.sortBy !== 'recent'

  // page load → current date ke notices
  useEffect(() => {
    onApply({
      search: tempFilters.search,
      fromDate: tempFilters.dateFrom,
      toDate: tempFilters.dateTo,
      sortBy: tempFilters.sortBy,
    })
  }, [])

  const applyFilters = () => {
    onApply({
      search: tempFilters.search,
      fromDate: tempFilters.dateFrom,
      toDate: tempFilters.dateTo,
      sortBy: tempFilters.sortBy,
    })
  }

  const clearFilters = () => {
    const reset = {
      search: '',
      dateFrom: getTodayDate(),
      dateTo: getTodayDate(),
      sortBy: 'recent',
    }
    setTempFilters(reset)
    onApply({
      search: '',
      fromDate: reset.dateFrom,
      toDate: reset.dateTo,
      sortBy: 'recent',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-md px-4 py-4 mb-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-700 mb-0">Filters & Search</h3>
      </div>
      <div className="flex gap-3 items-end flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Title, description, sender..."
              value={tempFilters.search}
              onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* From Date */}
        <div className="w-44">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
          <input
            type="date"
            value={tempFilters.dateFrom}
            onChange={(e) => setTempFilters({ ...tempFilters, dateFrom: e.target.value })}
            className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* To Date */}
        <div className="w-44">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
          <input
            type="date"
            value={tempFilters.dateTo}
            onChange={(e) => setTempFilters({ ...tempFilters, dateTo: e.target.value })}
            className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Sort By */}
        {/* <div className="w-44">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Sort By</label>
          <select
            value={tempFilters.sortBy}
            onChange={(e) => setTempFilters({ ...tempFilters, sortBy: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div> */}

        {/* Apply Button */}
        <button
          onClick={applyFilters}
          className="px-6 py-2.5 bg-[#0c3b73] hover:bg-blue-700 text-white text-sm rounded-lg font-medium shadow-sm"
        >
          Apply Filters
        </button>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium flex items-center gap-2"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

export default NoticeFilter
