import React, { useState } from 'react'
import {
  ChevronDown,
  Plus,
  AlertTriangle,
  Upload,
  FileText,
  Presentation,
  Calendar,
  FileCheck,
} from 'lucide-react'

const ExamsMarks = ({ selectedClass, selectedSubject }) => {
  const [selectedExam, setSelectedExam] = useState('mid-term')

  const exams = [
    { id: 'mid-term', name: 'Mid-Term Exam', date: '15 Dec 2025' },
    { id: 'final', name: 'Final Exam', date: '20 Jan 2026' },
    { id: 'unit-test', name: 'Unit Test 1', date: '10 Jan 2026' },
  ]

  const marksData = [
    { roll: '01', name: 'Rahul Kumar', marks: 85, maxMarks: 100, grade: 'A' },
    { roll: '02', name: 'Neha Singh', marks: 72, maxMarks: 100, grade: 'B' },
    { roll: '03', name: 'Aman Verma', marks: 90, maxMarks: 100, grade: 'A+' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Classes → Exams & Marks</h2>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white">
          <span className="text-sm font-medium">Class: {selectedClass}</span>
          <ChevronDown size={16} />
        </div>
        <div className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white">
          <span className="text-sm font-medium">Subject: {selectedSubject}</span>
          <ChevronDown size={16} />
        </div>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 bg-white text-sm font-medium"
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name}
            </option>
          ))}
        </select>
      </div>

      <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 font-medium mb-6">
        <Plus size={20} />
        Add Marks Entry
      </button>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Marks Obtained</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Max Marks</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {marksData.map((student) => (
              <tr key={student.roll} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700">{student.roll}</td>
                <td className="py-3 px-4 text-gray-700">{student.name}</td>
                <td className="py-3 px-4 text-gray-700 font-semibold">{student.marks}</td>
                <td className="py-3 px-4 text-gray-700">{student.maxMarks}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      student.grade === 'A+'
                        ? 'bg-green-100 text-green-800'
                        : student.grade === 'A'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {student.grade}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExamsMarks
