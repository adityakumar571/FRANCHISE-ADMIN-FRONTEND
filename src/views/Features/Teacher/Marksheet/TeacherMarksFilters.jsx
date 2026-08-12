/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import { Filter } from 'lucide-react'
import React, { useState, useMemo } from 'react'

const TeacherMarksFilters = ({ assignedClasses = [], onApply }) => {
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [streamId, setStreamId] = useState('')

  // 🔹 unique classes from assignedClasses
  const uniqueClasses = useMemo(() => {
    const map = new Map()
    assignedClasses.forEach((c) => {
      if (!map.has(c.classId._id)) {
        map.set(c.classId._id, c.classId)
      }
    })
    return Array.from(map.values())
  }, [assignedClasses])

  // 🔹 sections for selected class
  const sections = assignedClasses.filter((c) => c.classId._id === classId)

  // 🔹 check if selected class is senior (9–12)
  const selectedClass = uniqueClasses.find((c) => c._id === classId)

  const isSeniorClass = selectedClass?.isSenior === true

  const handleApply = () => {
    if (!classId || !sectionId) return

    onApply({
      classId,
      sectionId,
      streamId: isSeniorClass ? streamId : '',
    })
  }
  const handleReset = () => {
    setClassId('')
    setSectionId('')
    setStreamId('')
    onApply && onApply({})
  }

  const isAnyFilterApplied = classId || sectionId || streamId

  return (
    <div className="bg-white rounded border p-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
        {/* Class */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value)
              setSectionId('')
              setStreamId('')
            }}
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="">Select Class</option>
            {uniqueClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Section */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            value={sectionId}
            onChange={(e) => {
              setSectionId(e.target.value)

              const selected = assignedClasses.find(
                (c) => c.classId._id === classId && c.sectionId._id === e.target.value,
              )

              setStreamId(selected?.stream?._id || '')
            }}
            disabled={!sections.length}
            className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100"
          >
            <option value="">Select Section</option>
            {sections.map((c) => (
              <option key={c.sectionId._id} value={c.sectionId._id}>
                {c.sectionId.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stream (Only Senior) */}
        {isSeniorClass && (
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
            <select
              value={streamId}
              onChange={(e) => setStreamId(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="">Select Stream</option>
              {sections.map((c) =>
                c.stream ? (
                  <option key={c.stream._id} value={c.stream._id}>
                    {c.stream.name}
                  </option>
                ) : null,
              )}
            </select>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="bg-[#0c3b73] hover:bg-[#1b5498] text-white px-6 py-2 rounded h-[38px]"
        >
          Apply
        </button>

        {/* Reset Button */}
        {isAnyFilterApplied && (
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded h-[38px]"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

export default TeacherMarksFilters
