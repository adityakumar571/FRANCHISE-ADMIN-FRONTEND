/* eslint-disable prettier/prettier */
import { useNavigate } from 'react-router-dom'
import { BarChart2 } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   DATA — mirrors the exact dropdown from the image
   Each top-level object = one category panel
   Inside reports: groups separated by dividers
─────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    label: 'Fee Reports',
    color: '#1a3c6e',          // dark navy header like the image
    groups: [
      [
        { name: 'Defaulter List (Summary)',         path: '/reports/defaulterfees' },
        { name: 'Class-SectionWise Defaulter List', path: '/reports/class-section-defaulter' },
      ],
      [
        { name: 'Defaulter List (Detailed)',           path: '/reports/defaulter-detailed' },
        { name: 'Defaulter List Detailed (MonthWise)', path: '/reports/defaulter-monthwise' },
      ],
      [
        { name: 'Registration Fee Statement', path: '/reports/registration-fee-statement' },
        { name: 'Student Ledger',             path: '/reports/studentLedger' },
      ],
      [
        { name: 'Fee Register (Detailed)', path: '/reports/fee-register-detailed' },
        { name: 'Fee Transaction Report',  path: '/fee/feesreport' },
      ],
      [
        { name: 'Registration Fee Statement (Class Wise)', path: '/reports/registration-fee-classwise' },

        { name: 'Fee Deposit Summary (Class Wise)',        path: '/reports/fee-deposit-summary-classwise' },

        { name: 'Fee Deposited Statement (Detailed)',      path: '/reports/fee-deposited-detailed' },
        { name: 'Student Fee Details (Class Wise)',        path: '/reports/student-fee-details-classwise' },

      ],
      [
        { name: 'Fee Collection',                   path: '/fee/feesreport' },
        { name: 'Outstanding Fees',                 path: '/reports/outstandingfees' },
        { name: 'Fee Head Report',                  path: '/reports/feeheadreport' },
        { name: 'Late Fee Waiver Report',           path: '/reports/late-fee-waiver' },
        { name: 'Additional Fee Waiver Report',     path: '/reports/additional-fee-waiver' },
      ],
    ],
  },
  {
    label: 'Student Reports',
    color: '#1a3c6e',
    groups: [
      [
        { name: 'Student List',      path: '/student/StudentList' },
        { name: 'Attendance Report', path: '/attendance' },
        { name: 'Transport List',    path: '/transport/reports' },
      ],
    ],
  },
  {
    label: 'Exam Reports',
    color: '#1a3c6e',
    groups: [
      [
        { name: 'Exam Report',        path: '/reports/examreport' },
        { name: 'Marksheet',          path: '/marks' },
        { name: 'Performance Report', path: '/perfomacereport' },
      ],
    ],
  },
]

/* ─────────────────────────────────────────────────────────────
   DROPDOWN PANEL — looks exactly like the image dropdown
─────────────────────────────────────────────────────────────── */
function DropdownPanel({ category, navigate }) {
  const total = category.groups.reduce((s, g) => s + g.length, 0)

  return (
    <div
      className="rounded overflow-hidden shadow-md border border-gray-300"
      style={{ minWidth: 260 }}
    >
      {/* ── Header bar (dark navy like image) ── */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ background: category.color }}
      >
        <span className="text-white font-semibold text-sm tracking-wide">
          {category.label}
        </span>
        <span className="text-white/70 text-xs">{total} reports</span>
      </div>

      {/* ── Report list with group dividers ── */}
      <div className="bg-white">
        {category.groups.map((group, gi) => (
          <div key={gi}>
            {/* horizontal divider between groups — exactly like the image */}
            {gi > 0 && <div className="border-t border-gray-300 mx-0" />}

            {group.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="w-full text-left px-4 py-[7px] text-sm text-gray-800
                           hover:bg-[#e8f0fe] hover:text-[#1a3c6e] transition-colors
                           flex items-center gap-2 group"
              >
                {/* small bullet dot like the image */}
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-[#1a3c6e] shrink-0" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
─────────────────────────────────────────────────────────────── */
export default function ReportsHub() {
  const navigate = useNavigate()

  const total = CATEGORIES.reduce(
    (s, c) => s + c.groups.reduce((gs, g) => gs + g.length, 0),
    0,
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Page title */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="w-6 h-6 text-[#1a3c6e]" />
        <div>
          <h1 className="text-xl font-bold text-gray-800">Reports Center</h1>
          <p className="text-sm text-gray-500">{total} reports available</p>
        </div>
      </div>

      {/* Panels — side by side like a menu bar submenu layout */}
      <div className="flex flex-wrap gap-6 items-start">
        {CATEGORIES.map((cat) => (
          <DropdownPanel key={cat.label} category={cat} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}
