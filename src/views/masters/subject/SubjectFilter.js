/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Filter, Search } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'

const SubjectFilter = ({
  searchTerm,
  setSearchTerm,
  selectedClassId,
  setSelectedClassId,
  selectedStreamId,
  setSelectedStreamId,
  onApply,
  isApplying,
  setPage,
}) => {
  const [classList, setClassList] = useState([])
  const [streamList, setStreamList] = useState([])
  const { currentSession } = useContext(SessionContext)
  const [selectedClassObj, setSelectedClassObj] = useState(null)

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession?._id}&isPagination=false`).then((res) => {
      setClassList(res?.data?.data?.classes || [])
    })
  }, [currentSession])

  /* ================= LOAD STREAMS (ON CLASS CHANGE) ================= */
  useEffect(() => {
    if (!selectedClassObj?.isSenior) {
      setStreamList([])
      setSelectedStreamId('')
      return
    }

    getRequest(`streams?classId=${selectedClassId}&isPagination=false&isSenior=true`).then(
      (res) => {
        setStreamList(res?.data?.data?.streams || [])
      },
    )
  }, [selectedClassId, selectedClassObj])

  /* ================= SEARCH ================= */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  /* ================= RESET ================= */
  const handleReset = () => {
    setSearchTerm('')
    setSelectedClassId('')
    setSelectedStreamId('')
    setPage(1)
    onApply() // reload without filters
  }

  return (
    <div className="bg-white rounded border p-4 mb-4">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end ">
        {/* Search */}
        <div className="w-full sm:max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Enter Subject name ...."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={isApplying}
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Class Dropdown */}
        <div className="w-full sm:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class<span className="text-red-500">*</span>
          </label>
          <select
            className="form-select"
            value={selectedClassId}
            onChange={(e) => {
              const value = e.target.value
              setSelectedClassId(value)

              const selectedClass = classList.find((c) => c._id === value)
              setSelectedClassObj(selectedClass)

              setSelectedStreamId('')
            }}
            disabled={isApplying}
          >
            <option value="">Select Class</option>
            {classList.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stream Dropdown */}
        {selectedClassObj?.isSenior && (
          <div className="w-full sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stream<span className="text-red-500">*</span>
            </label>

            <select
              className="form-select"
              value={selectedStreamId}
              onChange={(e) => setSelectedStreamId(e.target.value)}
              disabled={isApplying}
            >
              <option value="">Select Stream</option>
              {streamList.map((stream) => (
                <option key={stream._id} value={stream._id}>
                  {stream.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={onApply}
          disabled={
            !selectedClassId || (selectedClassObj?.isSenior && !selectedStreamId) || isApplying
          }
          className="bg-[#0c3b73] hover:bg-[#1b5498] text-white px-6 py-2 rounded flex items-center gap-2 disabled:bg-gray-300 h-[38px]"
        >
          {/* {isApplying && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {isApplying ? 'Applying...' : 'Apply'} */}
          Apply
        </button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          disabled={isApplying}
          className="bg-gray-500 hover:bg-[#1b5498] text-white px-6 py-2 rounded flex items-center disabled:bg-gray-300 h-[38px]"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default SubjectFilter
