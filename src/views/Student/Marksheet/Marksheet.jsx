import React, { useState, useEffect, useContext } from 'react'
import {
  FileText,
  Printer,
  Save,
  Calendar,
  Users,
  User,
  X,
  Download,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'


import MarksModal from '../../ReportCard/MarksModal'
import { SessionContext } from '../../../Context/Seesion'

/* ---------------- SUBJECT CONFIG ---------------- */
const SUBJECTS = [
  { name: 'English', maxMarks: { rr: 30, dic: 30, oral: 30, written: 80 } },
  { name: 'Hindi', maxMarks: { rr: 30, dic: 30, oral: 30, written: 80 } },
  { name: 'Mathematics', maxMarks: { rr: 30, dic: 30, oral: 30, written: 80 } },
  { name: 'Science', maxMarks: { rr: 30, dic: 30, oral: 30, written: 80 } },
  { name: 'Social Science', maxMarks: { rr: 30, dic: 30, oral: 30, written: 80 } },
]

/* ---------------- STUDENTS ---------------- */
const STUDENTS = [
  {
    id: 1,
    name: 'Rahul Kumar',
    roll: 1,
    class: '5',
    section: 'A',
    dob: '2015-03-15',
    father: 'Mr. Rajesh Kumar',
    mother: 'Mrs. Sunita Kumar',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    roll: 2,
    class: '5',
    section: 'A',
    dob: '2015-05-22',
    father: 'Mr. Vijay Sharma',
    mother: 'Mrs. Anita Sharma',
  },
  {
    id: 3,
    name: 'Aman Verma',
    roll: 3,
    class: '5',
    section: 'A',
    dob: '2015-01-10',
    father: 'Mr. Suresh Verma',
    mother: 'Mrs. Kavita Verma',
  },
  {
    id: 4,
    name: 'Neha Singh',
    roll: 4,
    class: '5',
    section: 'A',
    dob: '2015-07-08',
    father: 'Mr. Arun Singh',
    mother: 'Mrs. Priya Singh',
  },
  {
    id: 5,
    name: 'Arjun Patel',
    roll: 5,
    class: '5',
    section: 'A',
    dob: '2015-04-18',
    father: 'Mr. Kiran Patel',
    mother: 'Mrs. Meera Patel',
  },
  {
    id: 6,
    name: 'Riya Gupta',
    roll: 6,
    class: '5',
    section: 'A',
    dob: '2015-09-25',
    father: 'Mr. Amit Gupta',
    mother: 'Mrs. Pooja Gupta',
  },
]

/* ---------------- GRADE ---------------- */
const gradeFromPercent = (p) => {
  if (p >= 91) return { grade: 'A1', points: 10, remark: 'Outstanding' }
  if (p >= 81) return { grade: 'A2', points: 9, remark: 'Excellent' }
  if (p >= 71) return { grade: 'B1', points: 8, remark: 'Very Good' }
  if (p >= 61) return { grade: 'B2', points: 7, remark: 'Good' }
  if (p >= 51) return { grade: 'C1', points: 6, remark: 'Above Average' }
  if (p >= 41) return { grade: 'C2', points: 5, remark: 'Average' }
  if (p >= 33) return { grade: 'D', points: 4, remark: 'Pass' }
  return { grade: 'E', points: 0, remark: 'Need Improvement' }
}

/* ---------------- INIT MARKS ---------------- */
const initMarks = () =>
  SUBJECTS.map((s) => ({
    subject: s.name,
    rr: 0,
    dic: 0,
    oral: 0,
    written: 0,
    total: 0,
    maxMarks: s.maxMarks,
  }))

export default function Marksheet() {
  const [session, setSession] = useState('2025-26')
  const [className, setClassName] = useState('5')
  const [section, setSection] = useState('A')
  const [exam, setExam] = useState('Annual')
  const [mode, setMode] = useState('student')
  const [marksDB, setMarksDB] = useState({})
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { currentSession, sessionsList } = useContext(SessionContext)
  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reportCardData')
    if (saved) {
      setMarksDB(JSON.parse(saved))
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('reportCardData', JSON.stringify(marksDB))
  }, [marksDB])

  const students = STUDENTS.filter(
    (s) =>
      s.class === className &&
      s.section === section &&
      (searchTerm === '' ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll.toString().includes(searchTerm)),
  )

  /* ---------------- SUMMARY ---------------- */
  const getSummary = (marks) => {
    const total = marks.reduce((s, m) => s + m.total, 0)
    const maxTotal = SUBJECTS.length * 100
    const percent = ((total / maxTotal) * 100).toFixed(2)
    const gradeInfo = gradeFromPercent(percent)
    return { total, maxTotal, percent, ...gradeInfo }
  }

  const deleteMarks = (studentId) => {
    if (window.confirm("Are you sure you want to delete this student's marks?")) {
      const updated = { ...marksDB }
      delete updated[studentId]
      setMarksDB(updated)
    }
  }

  const exportToCSV = () => {
    const headers = ['Roll', 'Name', ...SUBJECTS.map((s) => s.name), 'Total', 'Percentage', 'Grade']
    const rows = students.map((s) => {
      const marks = marksDB[s.id]
      const summary = marks && getSummary(marks)
      return [
        s.roll,
        s.name,
        ...SUBJECTS.map((sub) => {
          const m = marks?.find((x) => x.subject === sub.name)
          return m ? m.total : 0
        }),
        summary?.total || 0,
        summary?.percent || 0,
        summary?.grade || '-',
      ]
    })

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Class_${className}_Section_${section}_${exam}_${session}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen ">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .input { 
          padding: 0.5rem; 
          border: 2px solid #e5e7eb; 
          border-radius: 0.5rem;
          transition: all 0.3s;
          background: white;
        }
        .input:focus { 
          outline: none; 
          border-color: #6366f1; 
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .card {
          background: white;
          border-radius: 1rem;
          transition: all 0.3s;
        }
        .card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          border: none;
          font-size: 0.875rem;
          color: #4a5565;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .btn:active {
          transform: translateY(0);
        }
        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        table {
          border-collapse: separate;
          border-spacing: 0;
        }
        th {
          background: #f3f4f6;
          
          font-weight: 600;
          padding: 0.5rem 1rem;
          text-align: center;
          font-size:0.875rem;
        }
        th:first-child {
          border-top-left-radius: 0.5rem;
        }
        th:last-child {
          border-top-right-radius: 0.5rem;
        }
        td {
          padding: 0.5rem 1rem;;
          text-align: center;
          border-bottom: 1px solid #f3f4f6;
        }
        tr:hover td {
          background: #faf5ff;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          animation: fadeIn 0.2s;
        }
        .modal-content {
          background: white;
          border-radius: 1rem;
          max-width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="mx-auto">
        {/* ================= HEADER ================= */}
        <div className="card px-4 py-2 mb-6  text-white">
          <div className="flex items-center justify-between">
            {/* HEADER */}
            <div className="">
              <h1 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-3">
                <Calendar className="text-[#e24028]" size={36} />
                Report Card Management
              </h1>
              <p className="text-gray-600 text-sm">Academic Performance Tracking System</p>
            </div>
            <div className="text-right text-gray-600">
              <div className="flex items-center gap-2 text-sm font-semibold justify-end">
                <Calendar size={24} />
                <span>Session: {currentSession?.sessionName}</span>
              </div>
              <div className="text-gray-600 text-sm mt-1">{exam} Examination</div>
            </div>
          </div>
        </div>

        {/* ================= FILTER ================= */}
        <div className="card p-6 mb-6 no-print">
          <h2 className="text-sm font-bold mb-4 text-gray-600">Filters & Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Session</label>
              {/* <select value={session} onChange={(e) => setSession(e.target.value)} className="text-sm input w-full">
                                <option>2025-26</option>
                                <option>2024-25</option>
                                <option>2023-24</option>
                            </select> */}
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="text-sm input w-full"
              >
                <option value="">Select</option>
                {sessionsList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.sessionName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Class</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="text-sm input w-full"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="text-sm input w-full"
              >
                {['A', 'B', 'C', 'D'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Exam</label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="text-sm input w-full"
              >
                <option>Unit Test 1</option>
                <option>Unit Test 2</option>
                <option>Half Yearly</option>
                <option>Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Search</label>
              <input
                type="text"
                placeholder="Name or Roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm input w-full"
              />
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <span className="text-sm font-semibold text-gray-600">View Mode:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={mode === 'student'}
                onChange={() => setMode('student')}
                className="w-4 h-4 text-indigo-600"
              />
              <User size={18} />
              <span className="text-sm font-semibold text-gray-600 ">Student Wise</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={mode === 'class'}
                onChange={() => setMode('class')}
                className="w-4 h-4 text-indigo-600"
              />
              <Users size={18} />
              <span className="text-sm font-semibold text-gray-600 ">Class Wise</span>
            </label>
          </div>
        </div>

        {/* ================= STUDENT WISE ================= */}
        {mode === 'student' && (
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-600">Student Wise Performance</h2>
            </div>

            <div className="overflow-x-auto ">
              <table className="w-full text-sm ">
                <thead className="text-sm text-gray-600">
                  <tr>
                    <th>Roll</th>
                    <th>Name</th>
                    {SUBJECTS.map((s) => (
                      <th key={s.name}>{s.name}</th>
                    ))}
                    <th>Total</th>
                    <th>%</th>
                    <th>Grade</th>
                    <th className="no-print">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const marks = marksDB[s.id]
                    const summary = marks && getSummary(marks)
                    return (
                      <tr className="border-t" key={s.id}>
                        <td className="font-semibold text-sm">{s.roll}</td>
                        <td className="text-left text-sm">{s.name}</td>
                        {SUBJECTS.map((sub) => {
                          const m = marks?.find((x) => x.subject === sub.name)
                          return (
                            <td key={sub.name} className="font-semibold text-sm">
                              {m ? m.total : '-'}
                            </td>
                          )
                        })}
                        <td className="font-bold text-sm text-blue-600">
                          {summary ? `${summary.total}/${summary.maxTotal}` : '-'}
                        </td>
                        <td className="font-semibold text-sm">{summary?.percent || '-'}</td>
                        <td>
                          {summary && (
                            <span
                              className={`badge  ${
                                summary.grade.startsWith('A')
                                  ? 'bg-green-600 text-green-800 text-sm'
                                  : summary.grade.startsWith('B')
                                    ? 'bg-blue-600 text-blue-800 text-sm'
                                    : summary.grade.startsWith('C')
                                      ? 'bg-yellow-600 text-yellow-800 text-sm'
                                      : 'bg-red-600 text-red-800 text-sm'
                              }`}
                            >
                              {summary.grade}
                            </span>
                          )}
                        </td>
                        <td className="no-print text-sm">
                          <div className="flex gap-2 justify-center text-sm">
                            <button
                              onClick={() => {
                                setSelectedStudent(s)
                                setViewMode(false)
                                setShowModal(true)
                              }}
                              className="btn bg-blue-600 text-blue-700 text-sm py-1 px-3"
                            >
                              <Edit className="text-blue-700 text-sm" size={16} />
                              {marks ? 'Edit' : 'Add'}
                            </button>
                            {summary && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedStudent(s)
                                    setViewMode(true)
                                    setShowModal(true)
                                  }}
                                  className="btn bg-green-600 text-green-700 text-[0.875rem] py-1 px-3"
                                >
                                  <Eye className=" text-green-700 " size={16} />
                                  View
                                </button>
                                <button
                                  onClick={() => deleteMarks(s.id)}
                                  className="btn bg-red-600 text-red-600 text-sm py-1 px-3"
                                >
                                  <Trash2 className="text-red-600" size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= CLASS WISE ================= */}
        {mode === 'class' && (
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-800">Class Wise Result Summary</h2>
              <div className="flex gap-2 text-sm">
                <button
                  onClick={exportToCSV}
                  className="btn bg-primary text-white text-[0.875rem] no-print"
                >
                  <Download size={18} />
                  Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn bg-secondary text-white text-[0.875rem] no-print"
                >
                  <Printer size={18} />
                  Print Report
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>Roll</th>
                    <th>Name</th>
                    {SUBJECTS.map((s) => (
                      <th key={s.name}>{s.name}</th>
                    ))}
                    <th>Total</th>
                    <th>%</th>
                    <th>Grade</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const marks = marksDB[s.id]
                    const summary = marks && getSummary(marks)
                    return (
                      <tr key={s.id}>
                        <td className="font-semibold">{s.roll}</td>
                        <td className="text-left font-medium">{s.name}</td>
                        {SUBJECTS.map((sub) => {
                          const m = marks?.find((x) => x.subject === sub.name)
                          return (
                            <td key={sub.name} className="font-semibold">
                              {m ? m.total : '-'}
                            </td>
                          )
                        })}
                        <td className="font-bold text-indigo-600">
                          {summary ? `${summary.total}/${summary.maxTotal}` : '-'}
                        </td>
                        <td className="font-semibold">{summary?.percent || '-'}</td>
                        <td>
                          {summary && (
                            <span
                              className={`badge ${
                                summary.grade.startsWith('A')
                                  ? 'bg-green-100 text-black'
                                  : summary.grade.startsWith('B')
                                    ? 'bg-blue-100 text-black'
                                    : summary.grade.startsWith('C')
                                      ? 'bg-yellow-100 text-black'
                                      : 'bg-red-100 text-black'
                              }`}
                            >
                              {summary.grade}
                            </span>
                          )}
                        </td>
                        <td className="text-sm italic">{summary?.remark || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= MODAL ================= */}
        {showModal && selectedStudent && (
          <MarksModal
            student={selectedStudent}
            initialMarks={marksDB[selectedStudent.id] || initMarks()}
            onClose={() => {
              setShowModal(false)
              setSelectedStudent(null)
              setViewMode(false)
            }}
            onSave={(id, marks) => {
              setMarksDB((prev) => ({ ...prev, [id]: marks }))
              setShowModal(false)
              setSelectedStudent(null)
              setViewMode(false)
            }}
            session={session}
            exam={exam}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  )
}
