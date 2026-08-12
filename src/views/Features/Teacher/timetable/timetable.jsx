

import React, { useState } from 'react';
import { ChevronDown, Plus, AlertTriangle, Upload, FileText, Presentation, Calendar, FileCheck } from 'lucide-react';
const Timetable = ({ selectedClass }) => {
  const schedule = {
    Monday: [
      { time: '08:00-09:00', subject: 'Maths', teacher: 'Mr. Sharma' },
      { time: '09:00-10:00', subject: 'English', teacher: 'Ms. Gupta' },
      { time: '10:00-11:00', subject: 'Science', teacher: 'Mr. Verma' },
      { time: '11:00-11:30', subject: 'Break', teacher: '-' },
      { time: '11:30-12:30', subject: 'Hindi', teacher: 'Ms. Rani' },
    ],
    Tuesday: [
      { time: '08:00-09:00', subject: 'Science', teacher: 'Mr. Verma' },
      { time: '09:00-10:00', subject: 'Maths', teacher: 'Mr. Sharma' },
      { time: '10:00-11:00', subject: 'Social Studies', teacher: 'Ms. Jain' },
      { time: '11:00-11:30', subject: 'Break', teacher: '-' },
      { time: '11:30-12:30', subject: 'PT', teacher: 'Mr. Singh' },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Classes → Timetable</h2>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white">
          <span className="text-sm font-medium">Class: {selectedClass}</span>
          <ChevronDown size={16} />
        </div>
      </div>

      <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium mb-6">
        <Calendar size={20} />
        Edit Timetable
      </button>

      <div className="space-y-6">
        {Object.entries(schedule).map(([day, periods]) => (
          <div key={day} className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
              <h3 className="font-semibold text-gray-800">{day}</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Time</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Subject</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period, idx) => (
                  <tr key={idx} className={`border-b border-gray-200 ${period.subject === 'Break' ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                    <td className="py-2 px-4 text-sm text-gray-700">{period.time}</td>
                    <td className="py-2 px-4 text-sm font-medium text-gray-700">{period.subject}</td>
                    <td className="py-2 px-4 text-sm text-gray-600">{period.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Timetable;