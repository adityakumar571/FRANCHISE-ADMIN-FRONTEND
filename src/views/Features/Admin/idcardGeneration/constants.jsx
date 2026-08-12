import { useContext } from 'react'
import AppContent from '../../../../components/AppContent'
import { AppContext } from '../../../../Context/AppContext'

// ─── Theme ────────────────────────────────────────────────────────────────────
export const TEAL = '#072b79'
export const ORANGE = '#F7941D'

// ─── Shared styles ────────────────────────────────────────────────────────────
export const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#555',
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

export const primaryBtn = {
  background: `linear-gradient(135deg, ${TEAL}, #2aa89e)`,
  color: 'white',
  border: 'none',
  borderRadius: 9,
  padding: '11px 24px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  boxShadow: `0 4px 14px ${TEAL}55`,
  letterSpacing: 0.3,
}

export const secondaryBtn = {
  background: 'white',
  color: TEAL,
  border: `2px solid ${TEAL}`,
  borderRadius: 9,
  padding: '9px 22px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  letterSpacing: 0.3,
}

// ─── Demo data ────────────────────────────────────────────────────────────────
export const defaultStudents = [
  {
    id: 'MPS-M-001',
    name: 'Jonthan Dow',
    fatherName: 'Michale Hashi',
    className: 'STANDARD IV',
    classRoll: '0125',
    photo: null,
  },
  {
    id: 'MPS-M-002',
    name: 'Priya Sharma',
    fatherName: 'Rajesh Sharma',
    className: 'STANDARD V',
    classRoll: '0232',
    photo: null,
  },
  {
    id: 'MPS-M-003',
    name: 'Aryan Mehta',
    fatherName: 'Suresh Mehta',
    className: 'STANDARD III',
    classRoll: '0318',
    photo: null,
  },
  {
    id: 'MPS-M-004',
    name: 'Sneha Verma',
    fatherName: 'Anil Verma',
    className: 'STANDARD VI',
    classRoll: '0441',
    photo: null,
  },
  {
    id: 'MPS-M-005',
    name: 'Rohit Singh',
    fatherName: 'Vikram Singh',
    className: 'STANDARD II',
    classRoll: '0509',
    photo: null,
  },
  {
    id: 'MPS-M-006',
    name: 'Ananya Gupta',
    fatherName: 'Deepak Gupta',
    className: 'STANDARD IV',
    classRoll: '0627',
    photo: null,
  },
]

// ─── Reusable micro-components ────────────────────────────────────────────────
export function SchoolLogo() {
  const { tenantDetails } = useContext(AppContext)
  const logoUrl = tenantDetails?.logo // adjust key name if different in your API response

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="School Logo"
        style={{
          width: 50,
          height: 50,
          objectFit: 'contain',
          borderRadius: '50%',
          background: 'white',
          border: `2px solid ${TEAL}`,
          display: 'block',
        }}
      />
    )
  }

  // Fallback SVG when no logo is set
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="25" r="24" fill="white" stroke={TEAL} strokeWidth="2" />
      <rect x="12" y="26" width="26" height="15" rx="2" fill={TEAL} />
      <polygon points="25,10 12,26 38,26" fill={ORANGE} />
      <rect x="18" y="29" width="14" height="14" rx="1" fill="white" />
    </svg>
  )
}

export function FormField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          borderRadius: 8,
          border: '1.5px solid #d0ece9',
          padding: '9px 12px',
          fontSize: 14,
          outline: 'none',
          transition: 'border 0.2s',
          boxSizing: 'border-box',
          color: '#222',
          background: '#fafffe',
        }}
        onFocus={(e) => (e.target.style.border = `1.5px solid ${TEAL}`)}
        onBlur={(e) => (e.target.style.border = '1.5px solid #d0ece9')}
      />
    </div>
  )
}
