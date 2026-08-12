
import React, { useState } from 'react';
import { ChevronDown, Plus, AlertTriangle, Upload, FileText, Presentation, Calendar, FileCheck } from 'lucide-react';
const ReportCard = ({ selectedClass, selectedSubject }) => {
  const students = [
    { roll: '01', name: 'Rahul Kumar', maths: 85, science: 78, english: 90, total: 253, percentage: 84.3 },
    { roll: '02', name: 'Neha Singh', maths: 72, science: 68, english: 75, total: 215, percentage: 71.7 },
    { roll: '03', name: 'Aman Verma', maths: 90, science: 88, english: 85, total: 263, percentage: 87.7 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Classes → Report Card</h2>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white">
          <span className="text-sm font-medium">Class: {selectedClass}</span>
          <ChevronDown size={16} />
        </div>
        <div className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white">
          <span className="text-sm font-medium">Term: Final 2025</span>
          <ChevronDown size={16} />
        </div>
      </div>

      <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium mb-6">
        <FileCheck size={20} />
        Generate Report Cards
      </button>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Maths</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Science</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">English</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">%</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.roll} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700">{student.roll}</td>
                <td className="py-3 px-4 text-gray-700">{student.name}</td>
                <td className="py-3 px-4 text-gray-700">{student.maths}</td>
                <td className="py-3 px-4 text-gray-700">{student.science}</td>
                <td className="py-3 px-4 text-gray-700">{student.english}</td>
                <td className="py-3 px-4 font-semibold text-gray-700">{student.total}</td>
                <td className="py-3 px-4 font-semibold text-gray-700">{student.percentage}%</td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportCard;