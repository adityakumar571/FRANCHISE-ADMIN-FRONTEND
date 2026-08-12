/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useContext } from 'react'
import { Filter, Search } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'

const initialFilters = {
  search: '',
  examListId: '',
  classId: '',
  sectionId: '',
  streamId: '',
}

const MarksFilters = ({ onApply }) => {
  const [filters, setFilters] = useState(initialFilters)
  const [examList, setExamList] = useState([])
  const [classList, setClassList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [streamList, setStreamList] = useState([])
  const [isApplied, setIsApplied] = useState(false)
  const { currentSession } = useContext(SessionContext)

  // ===== LOAD CLASSES =====
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession._id}&isPagination=false`).then((res) => {
      setClassList(res?.data?.data?.classes || [])
    })
  }, [currentSession?._id])

  // ===== LOAD EXAMS by classId =====
  useEffect(() => {
    if (!filters.classId) {
      setExamList([])
      setFilters((prev) => ({ ...prev, examListId: '' }))
      return
    }
    getRequest(`examsList?classId=${filters.classId}&isActive=true&isPagination=false`)
      .then((res) => setExamList(res?.data?.data?.examLists || []))
      .catch(() => {})
  }, [filters.classId])

  // ===== LOAD SECTIONS + STREAMS by classId =====
  useEffect(() => {
    if (!filters.classId) {
      setSectionList([])
      setStreamList([])
      setFilters((prev) => ({ ...prev, sectionId: '', streamId: '' }))
      return
    }

    getRequest(`sections?classId=${filters.classId}&isPagination=false`)
      .then((res) => setSectionList(res?.data?.data?.sections || []))
      .catch(() => {})

    const selectedClass = classList.find((c) => c._id === filters.classId)
    if (selectedClass?.isSenior) {
      getRequest(`streams?classId=${filters.classId}&isPagination=false`)
        .then((res) => setStreamList(res?.data?.data?.streams || []))
        .catch(() => {})
    } else {
      setStreamList([])
      setFilters((prev) => ({ ...prev, streamId: '' }))
    }
  }, [filters.classId, classList])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApply = () => {
    onApply && onApply(filters)
    setIsApplied(true)
  }

  const handleReset = () => {
    setFilters(initialFilters)
    setSectionList([])
    setStreamList([])
    setExamList([])
    setIsApplied(false)
    onApply && onApply(initialFilters)
  }

  const isAnyFilterApplied = Object.values(filters).some((v) => v !== '')

  return (
    <div className="bg-white rounded border p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="w-full xl:max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="search"
              placeholder="Name / Roll No"
              value={filters.search}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Class */}
        <div className="w-full sm:w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select name="classId" value={filters.classId} onChange={handleChange} className="w-full border rounded-md p-2 text-sm">
            <option value="">Select Class</option>
            {classList.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {/* Section */}
        <div className="w-full sm:w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            name="sectionId"
            value={filters.sectionId}
            onChange={handleChange}
            disabled={!sectionList.length}
            className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100"
          >
            <option value="">Select Section</option>
            {sectionList.map((sec) => (
              <option key={sec._id} value={sec._id}>{sec.name}</option>
            ))}
          </select>
        </div>

        {/* Exam — loads after class selected */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
          <select
            name="examListId"
            value={filters.examListId}
            onChange={handleChange}
            disabled={!examList.length}
            className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100"
          >
            <option value="">{filters.classId ? 'Select Exam' : 'Select Class first'}</option>
            {examList.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.examMaster?.examName} ({ex.examMaster?.category})
              </option>
            ))}
          </select>
        </div>

        {/* Stream (senior classes only) */}
        {streamList.length > 0 && (
          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
            <select name="streamId" value={filters.streamId} onChange={handleChange} className="w-full border rounded-md p-2 text-sm">
              <option value="">Select Stream</option>
              {streamList.map((st) => (
                <option key={st._id} value={st._id}>{st.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Apply */}
        <button onClick={handleApply} className="bg-[#0c3b73] hover:bg-[#1b5498] text-white px-6 py-2 rounded h-[38px]">
          Apply
        </button>

        {/* Reset */}
        {isAnyFilterApplied && (
          <button onClick={handleReset} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded h-[38px]">
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

export default MarksFilters
