/* eslint-disable prettier/prettier */
/**
 * StatusBadge — colored status pill
 */
const STATUS_MAP = {
  active:     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Active' },
  inactive:   { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', label: 'Inactive' },
  pending:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pending' },
  completed:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Completed' },
  cancelled:  { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', label: 'Cancelled' },
  dispatched: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Dispatched' },
  expired:    { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', label: 'Expired' },
  warning:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Warning' },
  low:        { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', label: 'Low Stock' },
  draft:      { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', label: 'Draft' },
  accepted:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Accepted' },
  rejected:   { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', label: 'Rejected' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status?.toLowerCase()] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', label: status }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  )
}

export default StatusBadge
