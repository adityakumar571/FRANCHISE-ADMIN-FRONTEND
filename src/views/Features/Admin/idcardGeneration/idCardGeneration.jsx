/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useContext } from 'react'
import { GraduationCap, Printer, Eye, Search, IdCard } from 'lucide-react'
import { Select, Pagination, Empty } from 'antd'
import IDCard from './idCardGenerator'
import { TEAL, ORANGE, SchoolLogo } from './constants'
import { getRequest } from '../../../../Helpers'
import Loader from '../../../../components/Loading/Loader'
import { SessionContext } from '../../../../Context/Seesion'
import { AppContext } from '../../../../Context/AppContext'

const { Option } = Select

// ─── Print CSS ────────────────────────────────────────────────────────────────
const PRINT_STYLE = `
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
    box-sizing: border-box;
  }
  body {
    background: white;
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 0;
  }
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body { margin: 0; }
  }
`

// ─── A4 layout constants ──────────────────────────────────────────────────────
// ID card physical size: 85.6mm × ~120mm (standard CR80-like)
// At 96dpi: 85.6mm ≈ 323px, scaled to 220px wide in UI
// For A4 print (210mm × 297mm) with 8mm margins → usable 194mm × 281mm
// Card width 85mm → 2 per row; card height ~120mm → 2 rows = 4 per A4 page
// We use 3 columns × 3 rows = 9 if cards are smaller, but 2×4 = 8 is safer
// We'll go 2 columns × 3 rows = 6 cards per A4 page

const CARDS_PER_A4 = 6 // 2 col × 3 row

// ─── Open a popup window (not a new tab) ─────────────────────────────────────
function openPrintPopup(html) {
  const w = 900
  const h = 700
  const left = window.screenX + (window.outerWidth - w) / 2
  const top = window.screenY + (window.outerHeight - h) / 2
  const win = window.open(
    '',
    '_blank',
    `width=${w},height=${h},left=${left},top=${top},toolbar=0,menubar=0,scrollbars=1,resizable=1`,
  )
  if (!win) {
    alert('Popup blocked! Please allow popups for this site.')
    return null
  }
  win.document.write(html)
  win.document.close()
  return win
}

// ─── Single-card print ────────────────────────────────────────────────────────
function printSingleCard(domId) {
  const el = document.getElementById(domId)
  if (!el) return
  openPrintPopup(`
    <html><head><title>Student ID Card</title>
    <style>
      ${PRINT_STYLE}
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #f0f4f8;
      }
      @media print { body { background: white; min-height: unset; } }
    </style></head>
    <body>
      ${el.outerHTML}
      <script>
        window.onload = function() { setTimeout(function(){ window.print(); }, 400); };
      <\/script>
    </body></html>
  `)
}

// ─── Bulk A4 print ────────────────────────────────────────────────────────────
// Card size for print: 85mm wide × 120mm tall (fits 2×3 on A4 with margins)
const BULK_CARD_PRINT_CSS = `
  .a4-page {
    width: 210mm;
    height: 297mm;               /* fixed height — not min-height */
    padding: 8mm;
    display: grid;
    grid-template-columns: repeat(2, 85mm);
    gap: 5mm;
    align-content: start;
    page-break-after: always;
    break-after: page;
    overflow: hidden;            /* hard stop — nothing bleeds past the page */
    box-sizing: border-box;
  }
  .card-wrap {
    page-break-inside: avoid;   /* never cut a card mid-print */
    break-inside: avoid;
    overflow: hidden;
  }
  @media print {
    html, body { margin: 0; padding: 0; }
    .a4-page { page-break-after: always; break-after: page; overflow: hidden; }
    .card-wrap { page-break-inside: avoid; break-inside: avoid; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`

function printBulkCards(el) {
  if (!el) return
  openPrintPopup(`
    <html><head><title>Student ID Cards</title>
    <style>
      ${PRINT_STYLE}
      ${BULK_CARD_PRINT_CSS}
    </style></head>
    <body>
      ${el.innerHTML}
      <script>
        window.onload = function() {
          var imgs = Array.from(document.images);
          if (imgs.length === 0) { setTimeout(function(){ window.print(); }, 400); return; }
          var loaded = 0;
          function tryPrint() {
            loaded++;
            if (loaded >= imgs.length) { setTimeout(function(){ window.print(); }, 300); }
          }
          imgs.forEach(function(img) {
            if (img.complete) { tryPrint(); }
            else { img.onload = tryPrint; img.onerror = tryPrint; }
          });
        };
      <\/script>
    </body></html>
  `)
}

// ─── Card Preview Modal ───────────────────────────────────────────────────────
function CardPreviewModal({ student, schoolName, onClose, schoolLogo }) {
  const cardId = `preview-card-${student._id}`

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl">
        <div className="flex justify-between items-center w-full">
          <span className="font-semibold text-gray-700">ID Card Preview</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-lg leading-none font-bold"
          >
            ✕
          </button>
        </div>

        <div id={cardId}>
          <IDCard student={student} schoolName={schoolName} schoolLogo={schoolLogo} />
        </div>

        <button
          onClick={() => printSingleCard(cardId)}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-white font-semibold text-sm"
          style={{ background: `linear-gradient(135deg, ${TEAL}, #1a5fd4)` }}
        >
          <Printer size={15} /> Print / Save as PDF
        </button>
      </div>
    </div>
  )
}

// ─── Hidden Bulk Sheet ────────────────────────────────────────────────────────
// Must be visible (even off-screen) so browser loads <img> srcs.
// opacity:0 + visibility:hidden blocks image loading in some browsers.
function HiddenBulkSheet({ students, schoolName, schoolLogo, containerRef }) {
  if (!students.length) return null

  const pages = []
  for (let i = 0; i < students.length; i += CARDS_PER_A4)
    pages.push(students.slice(i, i + CARDS_PER_A4))

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: -9999,
        top: 0,
        // DO NOT use opacity:0 or visibility:hidden — browsers skip image loading
        // Use clip instead so it's off-screen but still "rendered"
        clip: 'rect(0,0,0,0)',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {pages.map((page, pi) => (
        <div
          key={pi}
          className="print-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 220px)',
            gap: 16,
            padding: 16,
            width: 'auto',
          }}
        >
          {page.map((stu) => (
            <div key={stu._id} className="card-wrap">
              {' '}
              {/* ← add this wrapper */}
              <IDCard student={stu} schoolName={schoolName} schoolLogo={schoolLogo} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentIDCard() {
  const { currentSession } = useContext(SessionContext)
  const { tenantDetails } = useContext(AppContext)

  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [schoolName, setSchoolName] = useState(tenantDetails?.schoolName || 'SCHOOL NAME')

  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)

  const [selectedIds, setSelectedIds] = useState(new Set())
  const [previewStudent, setPreviewStudent] = useState(null)

  const [draftClass, setDraftClass] = useState(null)
  const [draftSection, setDraftSection] = useState(null)

  const bulkRef = useRef(null)

  const selectedStudents = students.filter((s) => selectedIds.has(s._id))
  const allSelected = students.length > 0 && students.every((s) => selectedIds.has(s._id))

  // ── Load classes ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest('classes?isPagination=false')
      .then((res) => {
        console.log('classes fetched response', res)

        setClasses(res?.data?.data?.classes || [])
      })
      .catch(() => {})
  }, [currentSession])

  // ── Load sections ───────────────────────────────────────────────────────────
  useEffect(() => {
    setSections([])
    setDraftSection(null)
    if (!draftClass) return
    getRequest(`sections?classId=${draftClass}&isPagination=false`)
      .then((res) => setSections(res?.data?.data?.sections || []))
      .catch(() => {})
  }, [draftClass])

  // ── Load students ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSession?._id) return
    setLoading(true)
    const params = new URLSearchParams({ search: searchTerm, page, limit })
    if (selectedClass) params.set('currentClass', selectedClass)
    if (selectedSection) params.set('currentSection', selectedSection)

    const handleReset = () => {
      setDraftClass(null)
      setDraftSection(null)
      setSelectedClass(null)
      setSelectedSection(null)
      setSearchTerm('')
      setPage(1)
    }

    const filtersActive = !!(
      selectedClass ||
      selectedSection ||
      searchTerm ||
      draftClass ||
      draftSection
    )

    getRequest(`studentEnrollment?session=${currentSession._id}&${params.toString()}`)
      .then((res) => {
        const raw = res?.data?.data
        const list = (raw?.students || []).map((stu) => ({
          ...stu,
          // pre-compute display fields for the table
          studentName: `${stu.firstName} ${stu.middleName || ''} ${stu.lastName}`
            .replace(/\s+/g, ' ')
            .trim(),
          expectedClass: stu.currentClass?.name || '-',
          section: stu.currentSection?.name || '-',
        }))
        setStudents(list)
        setTotal(raw?.totalStudents || 0)
        setSelectedIds(new Set())
      })
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, selectedClass, selectedSection, currentSession])

  // ── Selection helpers ───────────────────────────────────────────────────────
  const toggleOne = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(students.map((s) => s._id)))

  const handleReset = () => {
    setSelectedClass(null)
    setSelectedSection(null)
    setSearchTerm('')
    setPage(1)
  }

  const filtersActive = !!(selectedClass || selectedSection || searchTerm)

  return (
    <div className="min-h-screen">
      {/* Hidden bulk print DOM – passed raw student objects, IDCard handles mapping */}
      <HiddenBulkSheet
        students={selectedStudents}
        schoolName={schoolName}
        schoolLogo={tenantDetails?.logo}
        containerRef={bulkRef}
      />

      {/* Preview modal */}
      {previewStudent && (
        <CardPreviewModal
          student={previewStudent}
          schoolName={schoolName}
          schoolLogo={tenantDetails?.logo}
          onClose={() => setPreviewStudent(null)}
        />
      )}

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="text-black px-4 py-3 mb-6 bg-white rounded-lg border border-blue-100">
        <div className="mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <IdCard className="text-[#e24028]" size={32} />
              Student ID Card Generator
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 mb-0">
              Select students and generate / print ID cards
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                School Name
              </label>
              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter school name"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-teal-400 w-48"
              />
            </div>

            <button
              disabled={selectedIds.size === 0}
              onClick={() => printBulkCards(bulkRef.current)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-auto"
              style={{
                background:
                  selectedIds.size > 0 ? `linear-gradient(135deg, ${TEAL}, #1a5fd4)` : '#9ca3af',
              }}
            >
              <Printer size={15} />
              Print Selected
              {selectedIds.size > 0 && (
                <span className="bg-white text-blue-700 rounded-full text-xs font-bold px-1.5 py-0.5 leading-none ml-1">
                  {selectedIds.size}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-blue-100 rounded-lg px-4 py-3 mb-4 flex flex-wrap items-end gap-3">
        {/* Class */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Class
          </label>
          <Select
            allowClear
            placeholder="All Classes"
            value={draftClass}
            onChange={(v) => setDraftClass(v ?? null)}
            style={{ minWidth: 160 }}
            size="middle"
          >
            {classes.map((c) => (
              <Option key={c._id} value={c._id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Section */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Section
          </label>
          <Select
            allowClear
            placeholder="All Sections"
            value={draftSection}
            onChange={(v) => setDraftSection(v ?? null)}
            disabled={!draftClass}
            style={{ minWidth: 160 }}
            size="middle"
          >
            {sections.map((s) => (
              <Option key={s._id} value={s._id}>
                {s.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Search — fires immediately on change */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Search
          </label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              placeholder="Search by name, ID, roll…"
              className="pl-9 pr-3 py-[7px] border border-gray-300 rounded-lg text-sm w-full outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Apply button */}
        <button
          onClick={() => {
            setSelectedClass(draftClass)
            setSelectedSection(draftSection)
            setPage(1)
          }}
          className="px-4 py-[7px] rounded-lg text-sm  text-white transition-all"
          style={{ background: TEAL }}
        >
          Apply
        </button>

        {/* Reset button — only shown when anything is active */}
        {filtersActive && (
          <button
            onClick={handleReset}
            className="px-4 py-[7px] bg-gray-400 rounded-lg border border-gray-300 text-sm text-white hover:bg-gray-300 font-medium "
          >
            Reset
          </button>
        )}

        {/* Selection badge */}
        {selectedIds.size > 0 && (
          <div
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold"
            style={{ background: `${TEAL}1a`, color: TEAL, border: `1px solid ${TEAL}40` }}
          >
            {selectedIds.size} selected
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs underline opacity-60 hover:opacity-100 ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center gap-1">
            <Loader />
            <span className="text-sm text-gray-500 mt-1">Loading students…</span>
          </div>
        )}

        <table className="min-w-max border-collapse w-full">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th
                className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-center"
                style={{ minWidth: 48 }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 accent-teal-500 cursor-pointer"
                  title="Select all on this page"
                />
              </th>
              <th
                className="sticky left-[48px] z-20 bg-gray-200 px-3 py-2 text-sm text-center"
                style={{ minWidth: 60 }}
              >
                Sr. No.
              </th>
              <th className="bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 120 }}>
                Student ID
              </th>
              <th className="bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 90 }}>
                Roll No
              </th>
              <th className="bg-gray-200 px-3 py-2 text-sm text-left" style={{ minWidth: 200 }}>
                Student Name
              </th>
              <th className="bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 110 }}>
                Class
              </th>
              <th className="bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 110 }}>
                Section
              </th>
              <th className="bg-gray-200 px-3 py-2 text-sm text-left" style={{ minWidth: 190 }}>
                Father Name
              </th>
              <th className="bg-gray-200 px-3 py-2 text-sm text-center" style={{ minWidth: 100 }}>
                Gender
              </th>
              <th
                className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center"
                style={{ minWidth: 110 }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {!loading && students.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
                    <Empty description="No students found. Select a class or adjust your filters." />
                  </div>
                </td>
              </tr>
            ) : (
              students.map((stu, idx) => {
                const checked = selectedIds.has(stu._id)
                return (
                  <tr
                    key={stu._id}
                    className={`border-t transition-colors cursor-pointer ${
                      checked ? 'bg-teal-50' : 'hover:bg-gray-50 bg-white'
                    }`}
                    onClick={() => toggleOne(stu._id)}
                  >
                    <td
                      className="sticky left-0 z-10 px-3 py-2 text-center"
                      style={{ minWidth: 48, background: checked ? '#f0fdfa' : 'white' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(stu._id)}
                        className="w-4 h-4 accent-teal-500 cursor-pointer"
                      />
                    </td>
                    <td
                      className="sticky left-[48px] z-10 px-3 py-2 text-sm text-center"
                      style={{ minWidth: 60, background: checked ? '#f0fdfa' : 'white' }}
                    >
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td
                      className="px-3 py-2 text-sm text-center truncate"
                      style={{ minWidth: 120, maxWidth: 120 }}
                      title={stu.studentId}
                    >
                      {stu.studentId || '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-center" style={{ minWidth: 90 }}>
                      {stu.rollNumber || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-sm font-medium text-left truncate"
                      style={{ minWidth: 200, maxWidth: 200 }}
                      title={stu.studentName}
                    >
                      {stu.studentName}
                    </td>
                    <td className="px-3 py-2 text-sm text-center" style={{ minWidth: 110 }}>
                      {stu.expectedClass}
                    </td>
                    <td className="px-3 py-2 text-sm text-center" style={{ minWidth: 110 }}>
                      {stu.section}
                    </td>
                    <td
                      className="px-3 py-2 text-sm text-left truncate"
                      style={{ minWidth: 190, maxWidth: 190 }}
                      title={stu.fatherName}
                    >
                      {stu.fatherName || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-sm text-center capitalize"
                      style={{ minWidth: 100 }}
                    >
                      {stu.gender || '-'}
                    </td>

                    {/* Actions */}
                    <td
                      className="sticky right-0 z-10 px-3 py-2 text-center"
                      style={{ minWidth: 110, background: checked ? '#f0fdfa' : 'white' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center gap-2">
                        {/* Preview */}
                        <button
                          title="Preview ID Card"
                          onClick={() => setPreviewStudent(stu)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-green-600 hover:text-white hover:bg-green-600 transition-colors"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Direct print – no modal, uses a temp off-screen div */}
                        <button
                          title="Print ID Card"
                          onClick={() => {
                            // Create a temporary off-screen container with the card
                            const tempId = `__temp-print-${stu._id}`
                            let container = document.getElementById(tempId)
                            if (!container) {
                              container = document.createElement('div')
                              container.id = tempId
                              container.style.cssText = 'position:fixed;left:-9999px;top:0;'
                              document.body.appendChild(container)
                            }
                            // The card is already rendered in the HiddenBulkSheet if selected,
                            // but for a direct print we just grab the outerHTML from the preview
                            // modal approach. Simplest: open modal then auto-print.
                            setPreviewStudent(stu)
                            // Auto-trigger print after modal + card mount
                            setTimeout(() => {
                              printSingleCard(`preview-card-${stu._id}`)
                            }, 300)
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-blue-600 hover:text-white hover:bg-blue-600 transition-colors"
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      <div className="mt-4 flex justify-end">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          showSizeChanger
          pageSizeOptions={['5', '10', '20', '50']}
          onChange={setPage}
          onShowSizeChange={(_, s) => {
            setLimit(s)
            setPage(1)
          }}
        />
      </div>
    </div>
  )
}
