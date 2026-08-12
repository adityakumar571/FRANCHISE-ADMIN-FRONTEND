/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { ClipboardList, Upload, Download, FileText, Printer, BookOpen } from 'lucide-react'
import ExamListTab from './tabs/ExamListTab'
import UpdateMarksTab from './tabs/UpdateMarksTab'
import UploadMarksTab from './tabs/UploadMarksTab'
import CrossListMarksheetTab from './tabs/CrossListMarksheetTab'
import GenerateMarksheetTab from './tabs/GenerateMarksheetTab'
import PrintClassWiseTab from './tabs/PrintClassWiseTab'

const TABS = [
  { id: 'exam-list',          label: 'Exam List',                  icon: ClipboardList },
  { id: 'update-marks',       label: 'Update Marks',               icon: Download      },
  { id: 'upload-marks',       label: 'Upload Marks (Excel/CSV)',   icon: Upload        },
  { id: 'cross-list',         label: 'Cross List Marksheet',       icon: FileText      },
  { id: 'generate-marksheet', label: 'Generate Marksheet',         icon: BookOpen      },
  { id: 'print-classwise',    label: 'Print Marksheet (Class)',    icon: Printer       },
]

const ExaminationModule = () => {
  const [activeTab, setActiveTab] = useState('exam-list')

  const renderTab = () => {
    switch (activeTab) {
      case 'exam-list':          return <ExamListTab />
      case 'update-marks':       return <UpdateMarksTab />
      case 'upload-marks':       return <UploadMarksTab />
      case 'cross-list':         return <CrossListMarksheetTab />
      case 'generate-marksheet': return <GenerateMarksheetTab />
      case 'print-classwise':    return <PrintClassWiseTab />
      default:                   return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white rounded border px-4 py-3 mb-4">
        <h1 className="text-base font-semibold flex items-center gap-2">
          <BookOpen size={18} className="text-[rgb(4,41,84)]" />
          Examination Management
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage exams, marks entry, marksheets and reports</p>
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-x-auto">
        <div className="flex min-w-max border-b border-gray-200">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all
                  ${isActive
                    ? 'border-[rgb(4,41,84)] text-[rgb(4,41,84)] bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div>{renderTab()}</div>
    </div>
  )
}

export default ExaminationModule
