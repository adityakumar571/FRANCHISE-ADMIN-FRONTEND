/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Filter, Search } from 'lucide-react'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'

const HomeworkFilter = ({ filters, setFilters, setPage, classList, streamList, subjectList }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleApply = () => {
    setFilters(localFilters)
    setPage(1)
  }

  const handleClear = () => {
    const reset = {
      classId: '',
      streamId: '',
      subjectId: '',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
    }
    setLocalFilters(reset)
    setFilters(reset)
    setPage(1)
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

        {/* CLASS */}
        <div className="w-full sm:w-44">
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={localFilters.classId}
            onChange={e => setLocalFilters(p => ({ ...p, classId: e.target.value, streamId: '', subjectId: '' }))}
            className="w-full h-[38px] border border-gray-300 rounded-md text-sm px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {classList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {/* STREAM */}
        {streamList.length > 0 && (
          <div className="w-full sm:w-44">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
            <select
              value={localFilters.streamId}
              onChange={e => setLocalFilters(p => ({ ...p, streamId: e.target.value }))}
              disabled={!localFilters.classId}
              className="w-full h-[38px] border border-gray-300 rounded-md text-sm px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">All Streams</option>
              {streamList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        )}

        {/* SUBJECT */}
        <div className="w-full sm:w-44">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select
            value={localFilters.subjectId}
            onChange={e => setLocalFilters(p => ({ ...p, subjectId: e.target.value }))}
            disabled={!localFilters.classId}
            className="w-full h-[38px] border border-gray-300 rounded-md text-sm px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">All Subjects</option>
            {subjectList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {/* FROM DATE */}
        <div className="w-full sm:w-44">
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <DatePicker
            format="DD-MM-YYYY"
            placeholder="From Date"
            value={localFilters.fromDate ? dayjs(localFilters.fromDate) : null}
            onChange={date => setLocalFilters(p => ({ ...p, fromDate: date ? dayjs(date).format('YYYY-MM-DD') : '' }))}
            className="w-full h-[38px]"
          />
        </div>

        {/* TO DATE */}
        <div className="w-full sm:w-44">
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <DatePicker
            format="DD-MM-YYYY"
            placeholder="To Date"
            value={localFilters.toDate ? dayjs(localFilters.toDate) : null}
            onChange={date => setLocalFilters(p => ({ ...p, toDate: date ? dayjs(date).format('YYYY-MM-DD') : '' }))}
            className="w-full h-[38px]"
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
