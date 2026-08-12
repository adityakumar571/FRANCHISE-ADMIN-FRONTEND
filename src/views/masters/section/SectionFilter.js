/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { Filter, Search } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'

const SectionFilter = ({ searchTerm, setSearchTerm, onApply, onReset }) => {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const { currentSession } = useContext(SessionContext)

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession?._id}&isPagination=false`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => console.error('Failed to load classes'))
  }, [currentSession])

  return (
    <div className="bg-white rounded border p-4 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
        {/* HEADER */}
        <div className="sm:col-span-12 flex items-center gap-2">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>

        {/* SEARCH */}
        <div className="sm:col-span-4 w-full">
          <label className="text-sm font-medium mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter section name"
              className="w-full h-10 pl-9 pr-3 border rounded-md text-sm focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* CLASS */}
        <div className="sm:col-span-3 w-full">
          <label className="text-sm font-medium mb-1 block">
            Class<span className="text-red-500">*</span>
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full h-10 px-3 border rounded-md text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {Array.isArray(classes) &&
              classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
          </select>
        </div>

        {/* APPLY */}
        <button
          disabled={!selectedClassId}
          onClick={() => onApply(selectedClassId)}
          className="bg-[#0c3b73] hover:bg-[#1b5498] text-white px-6 py-2 rounded
             flex items-center justify-center gap-2
             disabled:bg-gray-300 h-[38px]"
        >
          Apply
        </button>

        {/* RESET */}
        <button
          onClick={() => {
            setSelectedClassId('')
            setSearchTerm('')
            onReset()
          }}
          className="bg-gray-500 hover:bg-[#1b5498] text-white px-6 py-2 rounded
             flex items-center justify-center
             disabled:bg-gray-300 h-[38px]"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default SectionFilter
