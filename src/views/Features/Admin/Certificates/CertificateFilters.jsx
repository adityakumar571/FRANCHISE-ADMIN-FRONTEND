import React, { useState } from 'react'
import { Search, X } from 'lucide-react'

const CertificateFilters = ({ appliedFilters, onApply, onClear }) => {
  const [search, setSearch] = useState(appliedFilters.search || '')

  const handleApply = () => {
    onApply({ search: search.trim() })
  }

  const handleClear = () => {
    setSearch('')
    onClear()
  }

  const isDirty = search !== ''

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Search by student name or admission no."
          className="w-full pl-8 pr-3 h-[32px] text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0c3b73] focus:border-[#0c3b73] transition"
        />
      </div>

      <button
        onClick={handleApply}
        className="px-4 h-[32px] text-sm bg-[#0c3b73] text-white rounded-md hover:bg-[#0a2f5c] transition"
      >
        Search
      </button>

      {isDirty && (
        <button
          onClick={handleClear}
          className="px-3 h-[32px] text-sm border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 flex items-center gap-1 transition"
        >
          <X size={13} />
          Clear
        </button>
      )}
    </div>
  )
}

export default CertificateFilters
