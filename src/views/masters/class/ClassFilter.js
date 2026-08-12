import React from 'react'
import { Filter, Search } from 'lucide-react'

const ClassFilter = ({ searchTerm, setSearchTerm, setPage, isSenior, setIsSenior }) => {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleSeniorChange = (e) => {
    setIsSenior(e.target.checked ? true : '')
    setPage(1)
  }

  const handleClearFilter = () => {
    setIsSenior('')
    setSearchTerm('')
    setPage(1)
  }

  const isFilterApplied = isSenior === true || searchTerm !== ''

  return (
    <div className="bg-white rounded border p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-500 -translate-y-[5px]" />
        <h3 className="text-lg font-semibold text-gray-700">
          Filters & Search
        </h3>
      </div>

      {/* Search + Checkbox */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        {/* Search */}
        <div className="w-full sm:max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter class name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full h-[38px] pl-9 pr-3 border border-gray-300 rounded-md text-sm
              focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Senior Checkbox + Clear */}
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="seniorFilter"
              checked={isSenior === true}
              onChange={handleSeniorChange}
              className="w-4 h-4"
            />
            <label htmlFor="seniorFilter" className="text-sm text-gray-700">
              Senior Classes
            </label>
          </div>

          {isFilterApplied && (
            <button
              onClick={handleClearFilter}
              className="bg-gray-500 hover:bg-[#1b5498] text-white px-6 py-2 rounded
             flex items-center justify-center
             disabled:bg-gray-300 h-[38px]"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClassFilter
