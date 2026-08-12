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
// ==================== StudyMaterial.jsx ====================
const StudyMaterial = ({ selectedClass, selectedSubject }) => {
  const materials = [
    { title: 'Ch-5 Notes', type: 'PDF', uploadedOn: '15 Jan' },
    { title: 'Algebra PPT', type: 'PPT', uploadedOn: '12 Jan' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Classes → Study Material</h2>
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
      </div>

      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium mb-6">
        <Upload size={20} />
        Upload Material
      </button>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Uploaded On</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {material.type === 'PDF' ? (
                      <FileText size={18} className="text-red-600" />
                    ) : (
                      <Presentation size={18} className="text-orange-600" />
                    )}
                    <span className="text-gray-700">{material.title}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">{material.type}</td>
                <td className="py-3 px-4 text-gray-700">{material.uploadedOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudyMaterial
