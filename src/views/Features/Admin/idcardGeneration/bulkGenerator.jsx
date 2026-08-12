import { useState } from 'react'
import IDCard from './idCardGenerator'
import { TEAL, defaultStudents, primaryBtn, secondaryBtn, FormField } from './constants'

const CARDS_PER_PAGE = 6 // 2 columns × 3 rows fits an A4 sheet

// ─── BulkGenerator ────────────────────────────────────────────────────────────
/**
 * Lets the user:
 *  1. Import students via CSV (ID, Name, Father's Name, Class, Roll)
 *  2. Preview all cards laid out on virtual A4 pages
 *  3. Print / export all pages as a PDF
 */
export default function BulkGenerator() {
  const [students, setStudents] = useState(defaultStudents)
  const [schoolName, setSchoolName] = useState('SCHOOL NAME')
  const [csvText, setCsvText] = useState('')
  const [generated, setGenerated] = useState(false)

  // ── CSV import ──────────────────────────────────────────────────────────────
  const handleImportCSV = () => {
    try {
      const rows = csvText.trim().split('\n').filter(Boolean)
      const parsed = rows.map((row, i) => {
        const [id, name, fatherName, className, classRoll] = row.split(',').map((s) => s.trim())
        return {
          id: id || `ID-${i + 1}`,
          name: name || '',
          fatherName: fatherName || '',
          className: className || '',
          classRoll: classRoll || '',
          photo: null,
        }
      })
      setStudents(parsed)
      setGenerated(false)
    } catch {
      alert("Invalid CSV. Expected format: ID, Name, Father's Name, Class, Roll")
    }
  }

  // ── Print all A4 pages ──────────────────────────────────────────────────────
  const handlePrintAll = () => {
    const cards = document.getElementById('bulk-cards-print')
    if (!cards) return

    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>Student ID Cards</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body { background: white; font-family: 'Segoe UI', sans-serif; }
            .a4-page {
              width: 210mm;
              min-height: 297mm;
              padding: 10mm;
              display: flex;
              flex-wrap: wrap;
              gap: 6mm;
              align-content: flex-start;
              page-break-after: always;
            }
            @media print {
              .a4-page { page-break-after: always; }
              body { margin: 0; }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          ${cards.innerHTML}
          <script>setTimeout(() => window.print(), 400);<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  // ── Paginate students into A4 groups ────────────────────────────────────────
  const pages = []
  for (let i = 0; i < students.length; i += CARDS_PER_PAGE) {
    pages.push(students.slice(i, i + CARDS_PER_PAGE))
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Controls row ── */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 20,
          alignItems: 'flex-end',
        }}
      >
        {/* School name */}
        <div style={{ flex: '1 1 200px' }}>
          <FormField
            label="School Name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="SCHOOL NAME"
          />
        </div>

        {/* CSV importer */}
        <div style={{ flex: '2 1 300px' }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 700,
              color: '#555',
              marginBottom: 5,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Import Students via CSV
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={
                "ID,Name,Father's Name,Class,Roll\nMPS-001,John Doe,James Doe,STD IV,0101"
              }
              style={{
                flex: 1,
                borderRadius: 8,
                border: '1.5px solid #d0ece9',
                padding: '8px 12px',
                fontSize: 12,
                fontFamily: 'monospace',
                resize: 'vertical',
                minHeight: 64,
                outline: 'none',
                color: '#333',
              }}
            />
            <button
              onClick={handleImportCSV}
              style={{
                ...secondaryBtn,
                alignSelf: 'flex-end',
                whiteSpace: 'nowrap',
              }}
            >
              Import CSV
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
            Format: ID, Name, Father's Name, Class Name, Roll — one student per line
          </div>
        </div>
      </div>

      {/* ── Student table ── */}
      <div
        style={{
          background: '#f8fffe',
          borderRadius: 10,
          border: '1.5px solid #d0ece9',
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        {/* Table header bar */}
        <div
          style={{
            background: `linear-gradient(90deg, ${TEAL}, #2aa89e)`,
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
            Students ({students.length})
          </span>
          <button
            onClick={() => {
              setStudents(defaultStudents)
              setGenerated(false)
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Reset to Demo
          </button>
        </div>

        {/* Table body */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#e8f5f4' }}>
                {['ID', 'Name', "Father's Name", 'Class', 'Roll'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      color: TEAL,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} style={{ borderTop: '1px solid #e0f0ee' }}>
                  <td style={{ padding: '7px 12px', color: '#555' }}>{s.id}</td>
                  <td style={{ padding: '7px 12px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '7px 12px', color: '#555' }}>{s.fatherName}</td>
                  <td style={{ padding: '7px 12px', color: '#555' }}>{s.className}</td>
                  <td style={{ padding: '7px 12px', color: '#555' }}>{s.classRoll}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setGenerated(true)} style={primaryBtn}>
          📋 Preview All ID Cards
        </button>
        {generated && (
          <button onClick={handlePrintAll} style={secondaryBtn}>
            🖨️ Print All (A4 Sheets)
          </button>
        )}
      </div>

      {/* ── A4 page previews ── */}
      {generated && (
        <>
          <div
            style={{
              fontSize: 12,
              color: '#888',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            A4 Preview — {pages.length} page{pages.length > 1 ? 's' : ''} · {students.length} cards
          </div>

          <div id="bulk-cards-print">
            {pages.map((pageStudents, pi) => (
              <div
                key={pi}
                className="a4-page"
                style={{
                  width: '100%',
                  maxWidth: 720,
                  background: 'white',
                  border: '1.5px solid #d0ece9',
                  borderRadius: 10,
                  padding: '16px 20px',
                  marginBottom: 24,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 16,
                  alignContent: 'flex-start',
                }}
              >
                {/* Page label */}
                <div
                  style={{
                    width: '100%',
                    fontSize: 12,
                    color: '#aaa',
                    marginBottom: 4,
                    textAlign: 'right',
                  }}
                >
                  Page {pi + 1} of {pages.length}
                </div>

                {pageStudents.map((s, si) => (
                  <div key={si} className="card-item">
                    <IDCard student={s} schoolName={schoolName} small />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
