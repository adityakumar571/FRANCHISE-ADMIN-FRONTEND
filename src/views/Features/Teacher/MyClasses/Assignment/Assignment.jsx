import React, { useState } from 'react';
import { ChevronDown, Plus, AlertTriangle, Upload, FileText, Presentation, Calendar, FileCheck } from 'lucide-react';
// ==================== Assignments.jsx ====================
const Assignments = ({ selectedClass, selectedSubject }) => {
  const assignments = [
    { title: 'Ch-5 HW', dueDate: '20 Jan', submissions: '18 / 25' },
    { title: 'Algebra Test', dueDate: '25 Jan', submissions: '10 / 25' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Classes → Assignments</h2>
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

      <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium mb-6">
        <Plus size={20} />
        Create Assignment
      </button>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Submissions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700">{assignment.title}</td>
                <td className="py-3 px-4 text-gray-700">{assignment.dueDate}</td>
                <td className="py-3 px-4 text-gray-700">{assignment.submissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assignments;