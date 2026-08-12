import React, { useState } from 'react'
import { X, Save, Printer } from 'lucide-react'
import { useApp } from '../../Context/AppContext'

/* ---------------- GRADE LOGIC ---------------- */
const gradeFromPercent = (p) => {
  if (p >= 91) return { grade: 'A1', remark: 'Outstanding' }
  if (p >= 81) return { grade: 'A2', remark: 'Excellent' }
  if (p >= 71) return { grade: 'B1', remark: 'Very Good' }
  if (p >= 61) return { grade: 'B2', remark: 'Good' }
  if (p >= 51) return { grade: 'C1', remark: 'Above Average' }
  if (p >= 41) return { grade: 'C2', remark: 'Average' }
  if (p >= 33) return { grade: 'D', remark: 'Pass' }
  return { grade: 'E', remark: 'Need Improvement' }
}

export default function MarksModal({
  student,
  initialMarks,
  onClose,
  onSave,
  session,
  exam,
  viewMode = false,
}) {
  const [marks, setMarks] = useState(initialMarks)
  const { tenantDetails } = useApp()

  /* ---------------- UPDATE MARKS ---------------- */
  const update = (i, field, value) => {
    const updated = [...marks]
    const max = updated[i].maxMarks[field]
    const val = Math.min(Number(value || 0), max)

    updated[i][field] = val
    updated[i].total = updated[i].rr + updated[i].dic + updated[i].oral + updated[i].written

    setMarks(updated)
  }

  /* ---------------- SUMMARY ---------------- */
  const totalObtained = marks.reduce((s, m) => s + m.total, 0)
  const maxTotal = marks.length * 100
  const percent = ((totalObtained / maxTotal) * 100).toFixed(2)
  const gradeInfo = gradeFromPercent(percent)

  /* =====================================================
     ================== VIEW MODE ========================
     ===================================================== */
  if (viewMode) {
    return (
      <div className="fixed inset-0 bg-black/60 z-100 flex justify-center items-center">
        <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-auto rounded-xl shadow-2xl p-8 print-area">
          {/* HEADER */}
          <div className="text-center border-b pb-4">
            {/* Logo + Affiliation + School Name + Medium */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {tenantDetails?.logo && (
                <div
                  className="flex-shrink-0 rounded-full border-2 border-[#0c3b73] overflow-hidden bg-white"
                  style={{ width: '60px', height: '60px' }}
                >
                  <img
                    src={tenantDetails.logo}
                    alt="school-logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="text-left">
                {tenantDetails?.affiliationLine && (
                  <p className="text-[9px] font-semibold text-[#0c3b73] leading-tight m-0 tracking-wide">
                    {tenantDetails.affiliationLine}
                  </p>
                )}
                <h2 className="text-xl font-black uppercase text-[#0c3b73] leading-none m-0">
                  {tenantDetails?.schoolName || 'PROGRESS REPORT'}
                </h2>
                {tenantDetails?.schoolMedium && (
                  <p className="text-[10px] text-gray-500 m-0">{tenantDetails.schoolMedium}</p>
                )}
              </div>
            </div>

            {/* Address */}
            {tenantDetails?.schoolAddress && (
              <p className="text-[11px] text-gray-700 mt-1 mb-0">
                <span className="font-semibold text-[#0c3b73]">Address:</span>{' '}
                {tenantDetails.schoolAddress}
              </p>
            )}

            {/* Managed By */}
            {tenantDetails?.managedBy && (
              <p className="text-[10px] text-gray-500 italic mt-0 mb-0">{tenantDetails.managedBy}</p>
            )}

            {/* Reg Info */}
            {[tenantDetails?.msmeRegNo, tenantDetails?.isoRegNo, tenantDetails?.nitiAayog, tenantDetails?.regInfo]
              .filter(Boolean).length > 0 && (
              <p className="text-[9px] text-gray-500 mt-0 mb-0 tracking-wide">
                {[tenantDetails?.msmeRegNo, tenantDetails?.isoRegNo, tenantDetails?.nitiAayog, tenantDetails?.regInfo]
                  .filter(Boolean).join('  |  ')}
              </p>
            )}

            {/* Contact */}
            {(tenantDetails?.schoolContact || tenantDetails?.schoolContactAlt) && (
              <p className="text-[10px] text-gray-700 mt-0 mb-1">
                <span className="font-semibold text-[#0c3b73]">Contact:</span>{' '}
                {[...new Set([tenantDetails?.schoolContact, tenantDetails?.schoolContactAlt].filter(Boolean))].join(', ')}
              </p>
            )}

            <h2 className="text-base font-bold mt-2 mb-0">PROGRESS REPORT</h2>
            <p className="text-sm text-gray-500">
              Session: {session} | Exam: {exam}
            </p>
          </div>

          {/* STUDENT INFO */}
          <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-4 rounded-lg">
            <div>
              <b>Name:</b> {student.name}
            </div>
            <div>
              <b>Fathers Name:</b> {student.father}{' '}
            </div>
            <div>
              <b>Roll:</b> {student.roll}
            </div>
            <div>
              <b>Class:</b> {student.class} {student.section}
            </div>
          </div>

          {/* MARKS TABLE */}
          <table className="w-full border mb-6 text-center text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Subject</th>
                <th>Term 1</th>
                <th>Term 2 </th>
                <th>Mid-Term </th>
                <th>Final</th>
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m, i) => {
                const g = gradeFromPercent(m.total)
                return (
                  <tr key={i} className="border-t">
                    <td className="p-2 text-left font-medium">{m.subject}</td>
                    <td>{m.rr}</td>
                    <td>{m.dic}</td>
                    <td>{m.oral}</td>
                    <td>{m.written}</td>
                    <td className="font-bold">{m.total}</td>
                    <td className="font-bold">{g.grade}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* SUMMARY */}
          <div className="grid grid-cols-3 bg-indigo-50 p-2 rounded-lg text-sm text-center">
            <div>
              <div className="text-sm">Total</div>
              <div className="text-base font-bold">
                {totalObtained}/{maxTotal}
              </div>
            </div>
            <div>
              <div className="text-sm">Percentage</div>
              <div className="text-base font-bold">{percent}%</div>
            </div>
            <div>
              <div className="text-sm">Grade</div>
              <div className="text-base font-bold">{gradeInfo.grade}</div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-center text-sm gap-4 mt-6 no-print">
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-green-600 text-white rounded flex gap-2"
            >
              <Printer size={18} /> Print
            </button>
            <button onClick={onClose} className="px-5 py-2 bg-gray-600 text-white rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* =====================================================
     ================= EDIT MODE ==========================
     ===================================================== */
  return (
    <div className="fixed inset-0 bg-black/60 z-100 flex justify-center items-center">
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 pt-4 border-b">
          <div>
            <h2 className="text-lg font-bold">Marks Entry</h2>
            <p className="text-sm text-gray-500">
              {student.name} • Roll {student.roll}
            </p>
          </div>
          <X onClick={onClose} className="cursor-pointer text-gray-500 hover:text-red-500" />
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <table className="w-full text-sm border rounded-lg text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Subject</th>
                <th>RR (30)</th>
                <th>DIC (30)</th>
                <th>Oral (30)</th>
                <th>Written (80)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 text-left font-medium">{m.subject}</td>
                  {['rr', 'dic', 'oral', 'written'].map((f) => (
                    <td key={f}>
                      <input
                        type="number"
                        min="0"
                        max={m.maxMarks[f]}
                        value={m[f]}
                        onChange={(e) => update(i, f, e.target.value)}
                        className="w-20 border rounded-md text-center py-1 font-semibold focus:ring-2 focus:ring-indigo-400"
                      />
                    </td>
                  ))}
                  <td className="font-bold text-blue-600">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SUMMARY BAR */}
        <div className="bg-indigo-50 px-6 py-3 border-t">
          <div className="grid grid-cols-3 text-center">
            <div>
              <div className="text-sm">Total</div>
              <div className="font-bold">
                {totalObtained}/{maxTotal}
              </div>
            </div>
            <div>
              <div className="text-sm">Percentage</div>
              <div className="font-bold">{percent}%</div>
            </div>
            <div>
              <div className="text-sm">Grade</div>
              <div className="font-bold">{gradeInfo.grade}</div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-sm flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">
            Cancel
          </button>
          <button
            onClick={() => onSave(student.id, marks)}
            className="px-4 py-2 bg-blue-600 text-white rounded flex gap-2"
          >
            <Save size={18} /> Save Marks
          </button>
        </div>
      </div>
    </div>
  )
}
