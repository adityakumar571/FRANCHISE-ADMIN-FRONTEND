/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */

import { Filter } from "lucide-react"

/* eslint-disable react/react-in-jsx-scope */
const RouteFilter = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="bg-white p-4 rounded border border-blue-100 mb-4">
      <div className="sm:col-span-12 flex items-center gap-2">
        {' '}
        <Filter className="w-5 h-5 text-orange-500" />{' '}
        <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>{' '}
      </div>
      <label className="text-sm font-medium mb-1 block">Search Route</label>
      <input
        type="text"
        placeholder="Search route..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  )
}

export default RouteFilter
