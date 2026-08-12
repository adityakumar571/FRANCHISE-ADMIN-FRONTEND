/* eslint-disable react/prop-types */
import { Filter, Search } from 'lucide-react'
import React, { useState } from 'react'
import { Select } from 'antd'

const { Option } = Select

const PerformanceFilters = ({
  searchTerm,
  setSearchTerm,
  onApplyFilters,
  onResetFilters,
  classList = [],
  streams = [],
  sections = [],
}) => {
  const [filters, setFilters] = useState({
    classId: null,
    streamId: null,
    sectionId: null,
  })

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="text-orange-500" />
        <h3 className="font-semibold">Filters</h3>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SEARCH */}
        <input
          placeholder="Search student"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />

        {/* CLASS */}
        <Select
          placeholder="Class"
          allowClear
          className="w-full"
          value={filters.classId}
          onChange={(v) =>
            setFilters((p) => ({ ...p, classId: v, streamId: null, sectionId: null }))
          }
        >
          {classList.map((c) => (
            <Option key={c._id} value={c._id}>
              {c.name}
            </Option>
          ))}
        </Select>

        {/* STREAM */}
        <Select
          placeholder="Stream"
          allowClear
          className="w-full"
          value={filters.streamId}
          onChange={(v) => setFilters((p) => ({ ...p, streamId: v, sectionId: null }))}
        >
          {streams.map((s) => (
            <Option key={s._id} value={s._id}>
              {s.name}
            </Option>
          ))}
        </Select>

        {/* SECTION */}
        <Select
          placeholder="Section"
          allowClear
          className="w-full"
          value={filters.sectionId}
          onChange={(v) => setFilters((p) => ({ ...p, sectionId: v }))}
        >
          {sections.map((s) => (
            <Option key={s._id} value={s._id}>
              {s.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={() => onApplyFilters(filters)}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Apply
        </button>

        <button
          onClick={() => {
            setFilters({
              classId: null,
              streamId: null,
              sectionId: null,
            })
            onResetFilters()
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default PerformanceFilters
