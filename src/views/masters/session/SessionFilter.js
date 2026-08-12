import React from 'react'
import { Filter, Search } from 'lucide-react'

const SessionFilter = ({ searchTerm, setSearchTerm, setPage }) => {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1) // ✅ reset pagination
  }

  return (
    <div className="bg-white rounded border p-4 mb-4">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="search">
            Search
          </label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="search"
              type="text"
              placeholder="Enter class name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionFilter
